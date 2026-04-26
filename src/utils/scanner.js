/**
 * Utility functions for document scanning.
 * Switched to a fast, clean rectangular crop instead of OpenCV auto-detection.
 */

export const detectDocumentEdges = async (imageElement) => {
    // Return a default centered rectangle instead of auto-detecting.
    const w = imageElement.width
    const h = imageElement.height
    let cW = w * 0.8
    let cH = cW / 1.58
    if (cH > h * 0.8) {
        cH = h * 0.8
        cW = cH * 1.58
    }
    const cx = (w - cW) / 2
    const cy = (h - cH) / 2
    
    // Points: TL, TR, BL, BR
    return [
        { x: cx, y: cy },
        { x: cx + cW, y: cy },
        { x: cx, y: cy + cH },
        { x: cx + cW, y: cy + cH }
    ]
}

export const warpPerspective = async (imageElement, pts, outWidth, outHeight) => {
    // Fast Canvas Bounding Box Crop (No OpenCV needed)
    let minX = Math.min(pts[0].x, pts[1].x, pts[2].x, pts[3].x)
    let maxX = Math.max(pts[0].x, pts[1].x, pts[2].x, pts[3].x)
    let minY = Math.min(pts[0].y, pts[1].y, pts[2].y, pts[3].y)
    let maxY = Math.max(pts[0].y, pts[1].y, pts[2].y, pts[3].y)

    const sx = minX
    const sy = minY
    const sw = maxX - minX
    const sh = maxY - minY

    const canvasImg = document.createElement('canvas')
    canvasImg.width = outWidth
    canvasImg.height = outHeight
    const ctx = canvasImg.getContext('2d')

    // Fill white background just in case
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, outWidth, outHeight)

    // Draw the cropped region
    ctx.drawImage(
        imageElement,
        sx, sy, sw, sh,
        0, 0, outWidth, outHeight
    )

    return canvasImg.toDataURL('image/jpeg', 0.95)
}
