import { useState, useRef } from 'react'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { warpPerspective } from '../utils/scanner'

const AADHAAR_W = 1011 // at 300 DPI (85.6mm)
const AADHAAR_H = 639  // at 300 DPI (54mm)

function AadharCropper({ image, title, onCropDone, onBack }) {
  const [crop, setCrop] = useState()
  const [isProcessing, setIsProcessing] = useState(false)
  const [warpPreview, setWarpPreview] = useState(null)
  const [dragPos, setDragPos] = useState(null)
  
  const imgRef = useRef(null)
  const zoomCanvasRef = useRef(null)

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget
    // Default to a 1.58 ratio box in the center
    const w = width * 0.8
    const h = w / 1.58
    setCrop({
      unit: 'px', // Use pixels for easy coordinates mapping
      width: w,
      height: h,
      x: (width - w) / 2,
      y: (height - h) / 2
    })
  }

  const updateMagnifier = (e) => {
    const img = imgRef.current
    if (!img) return

    const rect = img.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    const x = clientX - rect.left
    const y = clientY - rect.top

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
       setDragPos(null)
       return
    }

    setDragPos({ x, y })
    drawZoomLens(x, y, rect.width, rect.height)
  }

  const drawZoomLens = (x, y, dispW, dispH) => {
    const canvas = zoomCanvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return

    const ctx = canvas.getContext('2d')
    const zoomSize = 160 // Increased from 120 to show more area
    const zoomFactor = 0.8 // Slightly zoomed out to show even more context

    canvas.width = zoomSize
    canvas.height = zoomSize

    ctx.clearRect(0, 0, zoomSize, zoomSize)

    ctx.beginPath()
    ctx.arc(zoomSize / 2, zoomSize / 2, zoomSize / 2, 0, Math.PI * 2)
    ctx.clip()

    const natX = (x / dispW) * img.naturalWidth
    const natY = (y / dispH) * img.naturalHeight

    ctx.drawImage(
      img,
      natX - (zoomSize / 2) / zoomFactor,
      natY - (zoomSize / 2) / zoomFactor,
      zoomSize / zoomFactor,
      zoomSize / zoomFactor,
      0, 0, zoomSize, zoomSize
    )

    ctx.strokeStyle = 'rgba(74, 222, 128, 0.8)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(zoomSize / 2, 0)
    ctx.lineTo(zoomSize / 2, zoomSize)
    ctx.moveTo(0, zoomSize / 2)
    ctx.lineTo(zoomSize, zoomSize / 2)
    ctx.stroke()
  }

  const applyCrop = async () => {
    if (!crop || !imgRef.current) return
    setIsProcessing(true)
    try {
      // Map crop coordinates from display size back to natural size
      const img = imgRef.current
      const scaleX = img.naturalWidth / img.width
      const scaleY = img.naturalHeight / img.height

      const cropX = crop.x * scaleX
      const cropY = crop.y * scaleY
      const cropW = crop.width * scaleX
      const cropH = crop.height * scaleY

      // For a rectangle crop, points are top-left, top-right, bottom-right, bottom-left
      const points = [
        { x: cropX, y: cropY },
        { x: cropX + cropW, y: cropY },
        { x: cropX + cropW, y: cropY + cropH },
        { x: cropX, y: cropY + cropH }
      ]

      const resultDataUrl = await warpPerspective(img, points, AADHAAR_W, AADHAAR_H)
      setWarpPreview(resultDataUrl)
    } catch (e) {
      console.error("Cropping failed", e)
      alert("Failed to crop. Please try again.")
    }
    setIsProcessing(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', width: '100%' }}>

      <div style={{ textAlign: 'center', width: '100%' }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: '#1e293b' }}>{title}</h3>
      </div>

      {/* Editor View */}
      {!isProcessing && !warpPreview && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>
          <div style={{
            background: '#e8edf5', padding: '12px', borderRadius: '12px', width: '100%',
            boxShadow: 'inset 2px 2px 5px #c5cad4, inset -2px -2px 5px #ffffff'
          }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#3b82f6', textAlign: 'center', fontWeight: 600 }}>
              Adjust the box to perfectly frame your Aadhaar card!
            </p>
          </div>

          <div style={{
            position: 'relative',
            borderRadius: '12px', overflow: 'hidden',
            boxShadow: '6px 6px 14px #c5cad4, -6px -6px 14px #ffffff',
            maxWidth: '100%',
            background: '#f8fafc'
          }}
            onPointerDownCapture={updateMagnifier}
            onPointerMoveCapture={(e) => { if (e.buttons > 0 || e.pointerType === 'touch') updateMagnifier(e) }}
            onPointerUpCapture={() => setDragPos(null)}
            onPointerCancelCapture={() => setDragPos(null)}
            onTouchStartCapture={updateMagnifier}
            onTouchMoveCapture={updateMagnifier}
            onTouchEndCapture={() => setDragPos(null)}
            onTouchCancelCapture={() => setDragPos(null)}
          >
            <ReactCrop 
              crop={crop} 
              onChange={c => setCrop(c)}
              style={{ maxWidth: '100%', maxHeight: '60vh' }}
            >
              <img 
                ref={imgRef} 
                src={image} 
                onLoad={onImageLoad} 
                style={{ display: 'block', maxWidth: '100%', height: 'auto' }} 
                alt="Aadhaar to crop"
              />
            </ReactCrop>
            
            {/* Magnifying Glass Overlay */}
            <canvas
              ref={zoomCanvasRef}
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                border: '3px solid #ffffff',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                display: dragPos ? 'block' : 'none',
                pointerEvents: 'none',
                zIndex: 10,
                background: 'white'
              }}
            />
          </div>

          <button className="neo-btn" onClick={applyCrop} style={{ width: '100%' }} disabled={isProcessing}>
            ✂️ Crop Card
          </button>
        </div>
      )}

      {/* Result View */}
      {warpPreview && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#10b981', textAlign: 'center', fontWeight: 600 }}>
            Perfect Crop Result:
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
