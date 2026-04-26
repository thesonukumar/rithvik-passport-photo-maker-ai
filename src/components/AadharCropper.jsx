import { useState, useRef, useEffect } from 'react'
import { detectDocumentEdges, warpPerspective } from '../utils/scanner'

const AADHAAR_W = 1011 // at 300 DPI (85.6mm)
const AADHAAR_H = 639  // at 300 DPI (54mm)

function AadharCropper({ image, title, onCropDone, onBack }) {
  const [isProcessing, setIsProcessing] = useState(true)
  const [points, setPoints] = useState(null)
  const [imgSize, setImgSize] = useState({ w: 0, h: 0, scale: 1 })
  const [dragging, setDragging] = useState(null) // index 0-3
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [warpPreview, setWarpPreview] = useState(null)

  const manualCanvasRef = useRef(null)
  const zoomCanvasRef = useRef(null)
  const imgRef = useRef(null)

  useEffect(() => {
    if (image) {
      const img = new Image()
      img.onload = async () => {
        imgRef.current = img
        setIsProcessing(true)
        try {
          const detectedPoints = await detectDocumentEdges(img)
          setPoints(detectedPoints)
        } catch (e) {
          console.error("Edge detection failed", e)
          // Fallback box
          const cx = img.width / 2; const cy = img.height / 2;
          const w = img.width * 0.8 / 2; const h = (img.width * 0.8 / 1.58) / 2;
          setPoints([
            {x: cx - w, y: cy - h},
            {x: cx + w, y: cy - h},
            {x: cx - w, y: cy + h},
            {x: cx + w, y: cy + h}
          ])
        }
        setIsProcessing(false)
      }
      img.src = image
    }
  }, [image])

  useEffect(() => {
    if (imgRef.current && points && !warpPreview) {
      drawCanvas()
      if (dragging !== null) {
        drawZoomLens()
      }
    }
  }, [points, warpPreview, dragging])

  const drawZoomLens = () => {
    const zoomCanvas = zoomCanvasRef.current
    if (!zoomCanvas || !imgRef.current || !points || dragging === null) return
    const zCtx = zoomCanvas.getContext('2d')
    const img = imgRef.current
    const pt = points[dragging]

    const zoomSize = 120 // size of the magnifying glass
    const zoomFactor = 1.5 // how much it magnifies

    zoomCanvas.width = zoomSize
    zoomCanvas.height = zoomSize

    zCtx.clearRect(0, 0, zoomSize, zoomSize)

    // Make it circular
    zCtx.beginPath()
    zCtx.arc(zoomSize/2, zoomSize/2, zoomSize/2, 0, Math.PI*2)
    zCtx.clip()

    // Draw the zoomed image centered at the dragged point
    // We want the point `pt` in the original image to be drawn at the center of the zoomCanvas
    zCtx.drawImage(
      img,
      pt.x - (zoomSize / 2) / zoomFactor, // Source x
      pt.y - (zoomSize / 2) / zoomFactor, // Source y
      zoomSize / zoomFactor, // Source width
      zoomSize / zoomFactor, // Source height
      0, 0, zoomSize, zoomSize // Destination rect
    )

    // Draw crosshairs
    zCtx.strokeStyle = 'rgba(74, 222, 128, 0.8)' // Green crosshair
    zCtx.lineWidth = 2
    zCtx.beginPath()
    zCtx.moveTo(zoomSize/2, 0)
    zCtx.lineTo(zoomSize/2, zoomSize)
    zCtx.moveTo(0, zoomSize/2)
    zCtx.lineTo(zoomSize, zoomSize/2)
    zCtx.stroke()
  }

  const drawCanvas = () => {
    const canvas = manualCanvasRef.current
    if (!canvas || !imgRef.current || !points) return
    const ctx = canvas.getContext('2d')
    const img = imgRef.current

    // Scale image to fit screen width roughly
    const maxW = 340
    const scale = maxW / img.width
    canvas.width = maxW
    canvas.height = img.height * scale

    setImgSize({ w: canvas.width, h: canvas.height, scale })

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    // Darken outside crop
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(points[0].x * scale, points[0].y * scale)
    ctx.lineTo(points[1].x * scale, points[1].y * scale)
    ctx.lineTo(points[3].x * scale, points[3].y * scale)
    ctx.lineTo(points[2].x * scale, points[2].y * scale)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    ctx.restore()

    // Draw Polygon Border
    ctx.strokeStyle = '#4ade80'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(points[0].x * scale, points[0].y * scale)
    ctx.lineTo(points[1].x * scale, points[1].y * scale)
    ctx.lineTo(points[3].x * scale, points[3].y * scale)
    ctx.lineTo(points[2].x * scale, points[2].y * scale)
    ctx.closePath()
    ctx.stroke()

    // Draw handles
    points.forEach((p) => {
      ctx.fillStyle = '#4ade80'
      ctx.beginPath()
      ctx.arc(p.x * scale, p.y * scale, 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.arc(p.x * scale, p.y * scale, 5, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  const getEventPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    }
  }

  const handleMouseDown = (e) => {
    if (warpPreview) return; // Don't drag if showing preview
    e.preventDefault()
    if (!points) return
    const canvas = manualCanvasRef.current
    const pos = getEventPos(e, canvas)
    const scale = imgSize.scale

    for (let i = 0; i < points.length; i++) {
      const hx = points[i].x * scale
      const hy = points[i].y * scale
      if (Math.hypot(pos.x - hx, pos.y - hy) < 25) { // increased touch target
        setDragging(i)
        setDragStart(pos)
        return
      }
    }
  }

  const handleMouseMove = (e) => {
    if (dragging === null || !points || warpPreview) return
    e.preventDefault()
    const canvas = manualCanvasRef.current
    const pos = getEventPos(e, canvas)
    const scale = imgSize.scale
    
    const dx = (pos.x - dragStart.x) / scale
    const dy = (pos.y - dragStart.y) / scale

    setPoints(prev => {
      const newPoints = [...prev]
      newPoints[dragging] = {
        x: Math.max(0, Math.min(imgRef.current.width, newPoints[dragging].x + dx)),
        y: Math.max(0, Math.min(imgRef.current.height, newPoints[dragging].y + dy))
      }
      return newPoints
    })
    setDragStart(pos)
  }

  const handleMouseUp = () => setDragging(null)

  const applyCrop = async () => {
    setIsProcessing(true)
    try {
      const resultDataUrl = await warpPerspective(imgRef.current, points, AADHAAR_W, AADHAAR_H)
      setWarpPreview(resultDataUrl)
    } catch (e) {
      console.error("Perspective warp failed", e)
      alert("Failed to crop. Please adjust the corners so they don't cross.")
    }
    setIsProcessing(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', width: '100%' }}>
      
      <div style={{ textAlign: 'center', width: '100%' }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: '#1e293b' }}>{title}</h3>
      </div>

      {isProcessing && !warpPreview && (
         <div style={{ padding: '20px', color: '#64748b', fontSize: '0.85rem' }}>
           ⏳ Auto-detecting card edges...
         </div>
      )}

      {/* Editor View */}
      {!isProcessing && !warpPreview && points && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>
          <div style={{
            background: '#e8edf5', padding: '12px', borderRadius: '12px', width: '100%',
            boxShadow: 'inset 2px 2px 5px #c5cad4, inset -2px -2px 5px #ffffff'
          }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#3b82f6', textAlign: 'center', fontWeight: 600 }}>
              Adjust the 4 green dots to exactly match the corners of your Aadhaar card!
            </p>
          </div>

          <div style={{
            position: 'relative',
            borderRadius: '12px', overflow: 'hidden',
            boxShadow: '6px 6px 14px #c5cad4, -6px -6px 14px #ffffff',
            touchAction: 'none'
          }}>
            <canvas
              ref={manualCanvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
              style={{ display: 'block', maxWidth: '100%', cursor: dragging !== null ? 'grabbing' : 'crosshair' }}
            />

            {/* Magnifying Glass Overlay */}
            <canvas
              ref={zoomCanvasRef}
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                border: '3px solid #ffffff',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                display: dragging !== null ? 'block' : 'none',
                pointerEvents: 'none',
                zIndex: 10
              }}
            />
          </div>

          <button className="neo-btn" onClick={applyCrop} style={{ width: '100%' }}>
            ✂️ Crop & Flatten Card
          </button>
        </div>
      )}

      {/* Result View */}
      {warpPreview && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#10b981', textAlign: 'center', fontWeight: 600 }}>
            Perfect Xerox Result:
          </p>
          <img src={warpPreview} alt="Warped result"
            style={{ width: '100%', maxWidth: '340px', borderRadius: '8px', boxShadow: '4px 4px 10px #c5cad4', border: '1px solid #cbd5e1' }} />
          
          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <button className="neo-btn-ghost" onClick={() => setWarpPreview(null)} style={{ flex: 1, background: '#f1f5f9' }}>
              ⟲ Retake
            </button>
            <button className="neo-btn neo-btn-green" onClick={() => onCropDone(warpPreview)} style={{ flex: 1 }}>
              ✅ Confirm Print
            </button>
          </div>
        </div>
      )}

      {!warpPreview && (
        <button className="neo-btn-ghost" onClick={onBack} style={{ width: '100%' }} disabled={isProcessing}>
          ← Back
        </button>
      )}
    </div>
  )
}

export default AadharCropper
