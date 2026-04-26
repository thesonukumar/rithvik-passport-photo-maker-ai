import cvPromise from '@techstark/opencv-js'

/**
 * Utility functions for document scanning using OpenCV.js (Local NPM Package)
 * This guarantees true edge detection and perfect perspective warping.
 */

let cv = null;

const ensureOpenCV = async () => {
    if (cv) return;
    try {
        if (typeof cvPromise === 'function') {
            cv = await cvPromise();
        } else if (cvPromise instanceof Promise) {
            cv = await cvPromise;
        } else {
            cv = cvPromise;
        }
    } catch (e) {
        cv = cvPromise; // Sometimes it's just the object directly
    }
}

const sortPoints = (pts) => {
    // Top-left has smallest sum, bottom-right has largest sum
    // Top-right has smallest diff (y-x), bottom-left has largest diff
    let sum = pts.map(p => p.x + p.y)
    let diff = pts.map(p => p.y - p.x)

    let tl = pts[sum.indexOf(Math.min(...sum))]
    let br = pts[sum.indexOf(Math.max(...sum))]
    let tr = pts[diff.indexOf(Math.min(...diff))]
    let bl = pts[diff.indexOf(Math.max(...diff))]

    return [tl, tr, bl, br] // TL, TR, BL, BR order
}

export const detectDocumentEdges = async (imageElement) => {
    await ensureOpenCV()

    // Draw to canvas to avoid cross-origin / format issues
    const canvas = document.createElement('canvas')
    canvas.width = imageElement.width
    canvas.height = imageElement.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(imageElement, 0, 0)
    
    let src = cv.imread(canvas)
    let gray = new cv.Mat()
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0)
    
    // Morphological close to connect broken edges (like text on card or light background)
    let kernel = cv.Mat.ones(5, 5, cv.CV_8U)
    let closed = new cv.Mat()
    cv.morphologyEx(gray, closed, cv.MORPH_CLOSE, kernel)

    cv.GaussianBlur(closed, closed, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT)
    
    let edges = new cv.Mat()
    // Lower thresholds to catch lighter edges
    cv.Canny(closed, edges, 30, 100)

    let contours = new cv.MatVector()
    let hierarchy = new cv.Mat()
    // Use RETR_EXTERNAL to only get the outer boundary
    cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    let maxArea = 0
    let bestPoints = null
    const minArea = canvas.width * canvas.height * 0.15 // Must be at least 15% of the image

    for (let i = 0; i < contours.size(); ++i) {
        let cnt = contours.get(i)
        let area = cv.contourArea(cnt)
        if (area < minArea) continue; // skip inner faces, QR codes, and tiny noise
        
        // Compute Convex Hull to ignore jagged edges of the card
        let hull = new cv.Mat()
        cv.convexHull(cnt, hull, false, true)

        let approx = new cv.Mat()
        // More relaxed epsilon for approximation
        let epsilon = 0.04 * cv.arcLength(hull, true)
        cv.approxPolyDP(hull, approx, epsilon, true)

        if (approx.rows === 4 && area > maxArea) {
            maxArea = area
            let data = approx.data32S
            bestPoints = [
                { x: data[0], y: data[1] },
                { x: data[2], y: data[3] },
                { x: data[4], y: data[5] },
                { x: data[6], y: data[7] }
            ]
        }
        approx.delete()
        hull.delete()
    }

    const w = src.cols
    const h = src.rows
    
    src.delete(); gray.delete(); closed.delete(); kernel.delete(); edges.delete(); contours.delete(); hierarchy.delete()

    if (bestPoints) {
        return sortPoints(bestPoints)
    }

    // Fallback: If no edges found, return a centered rectangle with 1.58 ratio
    let cW = w * 0.8
    let cH = cW / 1.58
    if (cH > h * 0.8) {
        cH = h * 0.8
        cW = cH * 1.58
    }
    const cx = (w - cW) / 2
    const cy = (h - cH) / 2
    let points = [
        { x: cx, y: cy },
        { x: cx + cW, y: cy },
        { x: cx, y: cy + cH },
        { x: cx + cW, y: cy + cH }
    ]
    return sortPoints(points)
}

export const warpPerspective = async (imageElement, pts, outWidth, outHeight) => {
    await ensureOpenCV()
    const canvasImg = document.createElement('canvas')
    canvasImg.width = imageElement.width
    canvasImg.height = imageElement.height
    const ctx = canvasImg.getContext('2d')
    ctx.drawImage(imageElement, 0, 0)

    let src = cv.imread(canvasImg)
    let dst = new cv.Mat()
    let dsize = new cv.Size(outWidth, outHeight)

    const sortedPts = sortPoints(pts)

    let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
        sortedPts[0].x, sortedPts[0].y,
        sortedPts[1].x, sortedPts[1].y,
        sortedPts[2].x, sortedPts[2].y,
        sortedPts[3].x, sortedPts[3].y
    ])

    let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
        0, 0,
        outWidth, 0,
        0, outHeight,
        outWidth, outHeight
    ])

    let M = cv.getPerspectiveTransform(srcTri, dstTri)
    cv.warpPerspective(src, dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar())

    const canvas = document.createElement('canvas')
    cv.imshow(canvas, dst)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95)

    src.delete(); dst.delete(); M.delete(); srcTri.delete(); dstTri.delete()

    return dataUrl
}
