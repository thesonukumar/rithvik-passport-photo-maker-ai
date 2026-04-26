import { useState, useRef, useEffect } from 'react'

const AADHAAR_W = 1011 // at 300 DPI (85.6mm)
const AADHAAR_H = 639  // at 300 DPI (54mm)
const ASPECT_RATIO = AADHAAR_W / AADHAAR_H

function AadharCropper({ image, title, onCropDone, onBack }) {
  const [mode, setMode] = useState('auto') // 'auto' | 'manual'
  const [croppedImage, setCroppedImage] = useState(null)
  const [rotation, setRotation] = useState(0)
  
  // Manual crop state
  const [imgSize, setImgSize] = useState({ w: 0, h: 0, scale: 1 })
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, w: 200, h: 200 / ASPECT_RATIO })
  const [dragging, setDragging] = useState(null) // null | 'move' | 'tl'|'tr'|'bl'|'br'
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const canvasRef = useRef(null)
  const manualCanvasRef = useRef(null)
  const imgRef = useRef(null)
  const rotatedImgCanvasRef = useRef(document.createElement('canvas'))

  useEffect(() => {
    if (image) {
      const img = new Image()
      img.onload = () => {
        imgRef.current = img
        updateRotatedImage()
        if (mode === 'auto') {
          autoCrop(rotatedImgCanvasRef.current)
        } else {
          initManualMode()
        }
      }
      img.src = image
    }
  }, [image])

  useEffect(() => {
    if (imgRef.current) {
      updateRotatedImage()
      if (mode === 'manual') drawManualCanvas()
      else if (mode === 'auto') autoCrop(rotatedImgCanvasRef.current)
    }
  }, [rotation])

  useEffect(() => {
    if (mode === 'manual' && imgRef.current) {
      drawManualCanvas()
    }
  }, [mode, cropBox])

  const updateRotatedImage = () => {
    const img = imgRef.current
    if (!img) return
    const canvas = rotatedImgCanvasRef.current
    const ctx = canvas.getContext('2d')
    
    const rad = (rotation * Math.PI) / 180
    const sin = Math.abs(Math.sin(rad))
    const cos = Math.abs(Math.cos(rad))
    const newW = img.width * cos + img.height * sin
    const newH = img.width * sin + img.height * cos
    
    canvas.width = newW
    canvas.height = newH
    
    ctx.translate(newW / 2, newH / 2)
    ctx.rotate(rad)
    ctx.drawImage(img, -img.width / 2, -img.height / 2)
  }

  const autoCrop = (img) => {
    // Basic auto crop: assumes image is already mostly the Aadhaar card
    // We center a box of the correct aspect ratio that fills the image as much as possible
    const imgRatio = img.width / img.height
    let cW, cH
    if (imgRatio > ASPECT_RATIO) {
      cH = img.height
      cW = cH * ASPECT_RATIO
    } else {
      cW = img.width
      cH = cW / ASPECT_RATIO
    }
    
    // Scale down a bit just in case
    cW *= 0.95
    cH *= 0.95
    
    const cX = (img.width - cW) / 2
    const cY = (img.height - cH) / 2
    
    performCrop(img, cX, cY, cW, cH)
  }

  const performCrop = (img, x, y, w, h) => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = AADHAAR_W
    canvas.height = AADHAAR_H
    const ctx = canvas.getContext('2d')
    
    ctx.drawImage(img, x, y, w, h, 0, 0, AADHAAR_W, AADHAAR_H)
    setCroppedImage(canvas.toDataURL('image/jpeg', 0.95))
  }

  // Manual crop canvas drawing
  const drawManualCanvas = () => {
    const canvas = manualCanvasRef.current
    if (!canvas || !imgRef.current) return
    const ctx = canvas.getContext('2d')
    const img = rotatedImgCanvasRef.current

    // Scale image to fit canvas display
    const maxW = 340
    const scale = maxW / img.width
    canvas.width = maxW
    canvas.height = img.height * scale

    setImgSize({ w: canvas.width, h: canvas.height, scale })

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    // Darken outside crop
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Clear crop area
    ctx.clearRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h)
    ctx.drawImage(img,
      cropBox.x / scale, cropBox.y / scale,
      cropBox.w / scale, cropBox.h / scale,
      cropBox.x, cropBox.y, cropBox.w, cropBox.h
    )

    // Crop border
    ctx.strokeStyle = '#4ade80'
    ctx.lineWidth = 2
    ctx.setLineDash([6, 3])
    ctx.strokeRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h)
    ctx.setLineDash([])

    // Corner handles
    const handles = getHandles()
    handles.forEach(h => {
      ctx.fillStyle = '#4ade80'
      ctx.beginPath()
      ctx.arc(h.x, h.y, 7, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.arc(h.x, h.y, 4, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  const getHandles = () => [
    { x: cropBox.x,              y: cropBox.y,               id: 'tl' },
    { x: cropBox.x + cropBox.w,  y: cropBox.y,               id: 'tr' },
    { x: cropBox.x,              y: cropBox.y + cropBox.h,   id: 'bl' },
    { x: cropBox.x + cropBox.w,  y: cropBox.y + cropBox.h,   id: 'br' },
  ]

  const getEventPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    }
  }

  const handleManualMouseDown = (e) => {
    e.preventDefault()
    const canvas = manualCanvasRef.current
    const pos = getEventPos(e, canvas)

    // Check corner handles first
    const handles = getHandles()
    for (const h of handles) {
      if (Math.hypot(pos.x - h.x, pos.y - h.y) < 14) {
        setDragging(h.id)
        setDragStart(pos)
        return
      }
    }

    // Check if inside crop box — move
    if (pos.x > cropBox.x && pos.x < cropBox.x + cropBox.w &&
        pos.y > cropBox.y && pos.y < cropBox.y + cropBox.h) {
      setDragging('move')
      setDragStart(pos)
    }
  }

  const handleManualMouseMove = (e) => {
    e.preventDefault()
    if (!dragging) return
    const canvas = manualCanvasRef.current
    const pos = getEventPos(e, canvas)
    const dx = pos.x - dragStart.x
    const dy = pos.y - dragStart.y

    setCropBox(prev => {
      let { x, y, w, h } = prev
      const minSize = 60

      if (dragging === 'move') {
        x = Math.max(0, Math.min(canvas.width - w, x + dx))
        y = Math.max(0, Math.min(canvas.height - h, y + dy))
      } else if (dragging === 'br') {
        w = Math.max(minSize, w + dx)
        h = w / ASPECT_RATIO
      } else if (dragging === 'tr') {
        w = Math.max(minSize, w + dx)
        h = w / ASPECT_RATIO
        y = prev.y + prev.h - h
      } else if (dragging === 'bl') {
        w = Math.max(minSize, w - dx)
        h = w / ASPECT_RATIO
        x = prev.x + prev.w - w
      } else if (dragging === 'tl') {
        w = Math.max(minSize, w - dx)
        h = w / ASPECT_RATIO
        x = prev.x + prev.w - w
        y = prev.y + prev.h - h
      }
      
      // Keep within bounds
      if (x < 0) x = 0
      if (y < 0) y = 0
      if (x + w > canvas.width) w = canvas.width - x
      if (y + h > canvas.height) h = canvas.height - y

      // Recalculate based on ratio if bounds altered it
      if (w / h > ASPECT_RATIO) {
        w = h * ASPECT_RATIO
      } else {
        h = w / ASPECT_RATIO
      }

      return { x, y, w, h }
    })
    setDragStart(pos)
  }

  const handleManualMouseUp = () => setDragging(null)

  const applyManualCrop = () => {
    const scale = imgSize.scale
    performCrop(
      rotatedImgCanvasRef.current,
      cropBox.x / scale, 
      cropBox.y / scale,
      cropBox.w / scale, 
      cropBox.h / scale
    )
  }

  const initManualMode = () => {
    if (!rotatedImgCanvasRef.current || rotatedImgCanvasRef.current.width === 0) return
    const img = rotatedImgCanvasRef.current
    const scale = 340 / img.width
    const cW = 340
    const cH = img.height * scale
    
    // Fit an aspect ratio box inside
    let bW = cW * 0.8
    let bH = bW / ASPECT_RATIO
    if (bH > cH * 0.8) {
      bH = cH * 0.8
      bW = bH * ASPECT_RATIO
    }
    
    setCropBox({
      x: (cW - bW) / 2,
      y: (cH - bH) / 2,
      w: bW, h: bH
    })
    setMode('manual')
    setCroppedImage(null) // clear previous
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', width: '100%' }}>
      
      <div style={{ textAlign: 'center', width: '100%' }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: '#1e293b' }}>{title}</h3>
      </div>

      {/* Mode Toggle */}
      <div style={{
        display: 'flex', gap: '0',
        background: '#e8edf5',
        borderRadius: '14px',
        padding: '4px',
        boxShadow: 'inset 3px 3px 8px #c5cad4, inset -3px -3px 8px #ffffff',
        width: '100%'
      }}>
        {['auto', 'manual'].map(m => (
          <button key={m}
            onClick={() => {
              if (m === 'manual') initManualMode()
              else if (imgRef.current) autoCrop(rotatedImgCanvasRef.current)
              setMode(m)
            }}
            style={{
              flex: 1, padding: '10px',
              borderRadius: '10px', border: 'none',
              cursor: 'pointer', fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'all 0.2s ease',
              background: mode === m
                ? 'linear-gradient(135deg, #4ade80, #16a34a)'
                : 'transparent',
              color: mode === m ? 'white' : '#94a3b8',
              boxShadow: mode === m ? '2px 2px 8px #86efac' : 'none'
            }}>
            {m === 'auto' ? '🤖 Auto Capture' : '✋ Manual Crop'}
          </button>
        ))}
      </div>

      {/* AUTO MODE */}
      {mode === 'auto' && croppedImage && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
          <img src={croppedImage} alt="Auto Crop"
            style={{ width: '100%', maxWidth: '300px', borderRadius: '8px', boxShadow: '4px 4px 10px #c5cad4' }} />
          
          <button className="neo-btn neo-btn-green" onClick={() => onCropDone(croppedImage)} style={{ width: '100%' }}>
            ✅ Confirm Crop
          </button>
        </div>
      )}

      {/* MANUAL MODE */}
      {mode === 'manual' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>
          
          <div style={{ width: '100%', background: '#e8edf5', padding: '12px 16px', borderRadius: '12px', boxShadow: 'inset 3px 3px 8px #c5cad4, inset -3px -3px 8px #ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Straighten (Rotate)</span>
              <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 700 }}>{rotation}°</span>
            </div>
            <input type="range" min="-45" max="45" value={rotation} onChange={e => setRotation(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', textAlign: 'center' }}>
            Drag corners to resize • Drag inside to move
          </p>

          <div style={{
            borderRadius: '12px', overflow: 'hidden',
            boxShadow: '6px 6px 14px #c5cad4, -6px -6px 14px #ffffff',
            touchAction: 'none'
          }}>
            <canvas
              ref={manualCanvasRef}
              onMouseDown={handleManualMouseDown}
              onMouseMove={handleManualMouseMove}
              onMouseUp={handleManualMouseUp}
              onMouseLeave={handleManualMouseUp}
              onTouchStart={handleManualMouseDown}
              onTouchMove={handleManualMouseMove}
              onTouchEnd={handleManualMouseUp}
              style={{ display: 'block', maxWidth: '100%', cursor: dragging ? 'grabbing' : 'crosshair' }}
            />
          </div>

          <button className="neo-btn-ghost" onClick={applyManualCrop} style={{ width: '100%', background: '#e8edf5' }}>
            ✂️ Preview Crop
          </button>

          {croppedImage && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', marginTop: '10px' }}>
              <img src={croppedImage} alt="Manual crop result"
                style={{ width: '100%', maxWidth: '300px', borderRadius: '8px', boxShadow: '4px 4px 10px #86efac', border: '2px solid #bbf7d0' }} />
              <button className="neo-btn neo-btn-green" onClick={() => onCropDone(croppedImage)} style={{ width: '100%' }}>
                ✅ Confirm Crop
              </button>
            </div>
          )}
        </div>
      )}

      <button className="neo-btn-ghost" onClick={onBack} style={{ width: '100%' }}>
        ← Back
      </button>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

export default AadharCropper
