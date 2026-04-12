import { useState, useRef, useEffect } from 'react'
import { detectFaceAndCrop } from '../utils/faceDetect'

const PASSPORT_W = 413
const PASSPORT_H = 531

function PassportCropper({ colorAppliedImage, onCropDone }) {
  const [mode, setMode] = useState('auto') // 'auto' | 'manual'
  const [isProcessing, setIsProcessing] = useState(false)
  const [croppedImage, setCroppedImage] = useState(null)
  const [offsetY, setOffsetY] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)

  // Manual crop state
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, w: 200, h: 257 })
  const [dragging, setDragging] = useState(null) // null | 'move' | 'tl'|'tr'|'bl'|'br'
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const canvasRef = useRef(null)
  const manualCanvasRef = useRef(null)
  const imgRef = useRef(null)
  const previewRef = useRef(null)

  useEffect(() => {
    if (colorAppliedImage) {
      const img = new Image()
      img.onload = () => {
        imgRef.current = img
        autoCrop(img)
      }
      img.src = colorAppliedImage
    }
  }, [colorAppliedImage])

  useEffect(() => {
    if (imgRef.current && mode === 'auto') {
      cropImage(imgRef.current, offsetY, zoomLevel)
    }
  }, [offsetY, zoomLevel])

  useEffect(() => {
    if (mode === 'manual' && imgRef.current) {
      drawManualCanvas()
    }
  }, [mode, cropBox])

  const autoCrop = async (img) => {
    setIsProcessing(true)
    try {
      const box = await detectFaceAndCrop(img)
      imgRef.cropBox = box
      cropImage(img, 0, 1)
    } catch (e) {
      cropImage(img, 0, 1)
    }
    setIsProcessing(false)
  }

  const cropImage = async (img, yOffset, zoom) => {
    setIsProcessing(true)
    try {
      const box = imgRef.cropBox || await detectFaceAndCrop(img)
      imgRef.cropBox = box

      const canvas = canvasRef.current
      canvas.width = PASSPORT_W
      canvas.height = PASSPORT_H
      const ctx = canvas.getContext('2d')

      const adjW = box.width / zoom
      const adjH = box.height / zoom
      const adjX = box.x + (box.width - adjW) / 2
      const adjY = box.y + (box.height - adjH) / 2 + yOffset

      ctx.drawImage(img, adjX, adjY, adjW, adjH, 0, 0, PASSPORT_W, PASSPORT_H)

      // Studio enhancement
      applyStudioEffect(ctx, PASSPORT_W, PASSPORT_H)

      setCroppedImage(canvas.toDataURL('image/jpeg', 0.95))
    } catch (e) { console.error(e) }
    setIsProcessing(false)
  }

  const applyStudioEffect = (ctx, w, h) => {
    // Subtle vignette
    const gradient = ctx.createRadialGradient(w/2, h/2, h*0.3, w/2, h/2, h*0.85)
    gradient.addColorStop(0, 'rgba(0,0,0,0)')
    gradient.addColorStop(1, 'rgba(0,0,0,0.08)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)
  }

  // Manual crop canvas drawing
  const drawManualCanvas = () => {
    const canvas = manualCanvasRef.current
    if (!canvas || !imgRef.current) return
    const ctx = canvas.getContext('2d')
    const img = imgRef.current

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
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.setLineDash([6, 3])
    ctx.strokeRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h)
    ctx.setLineDash([])

    // Corner handles
    const handles = getHandles()
    handles.forEach(h => {
      ctx.fillStyle = '#3b82f6'
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
      const passRatio = 35 / 45

      if (dragging === 'move') {
        x = Math.max(0, Math.min(canvas.width - w, x + dx))
        y = Math.max(0, Math.min(canvas.height - h, y + dy))
      } else if (dragging === 'br') {
        w = Math.max(minSize, w + dx)
        h = w / passRatio
      } else if (dragging === 'tr') {
        w = Math.max(minSize, w + dx)
        h = w / passRatio
        y = prev.y + prev.h - h
      } else if (dragging === 'bl') {
        w = Math.max(minSize, w - dx)
        h = w / passRatio
        x = prev.x + prev.w - w
      } else if (dragging === 'tl') {
        w = Math.max(minSize, w - dx)
        h = w / passRatio
        x = prev.x + prev.w - w
        y = prev.y + prev.h - h
      }

      return { x, y, w, h }
    })
    setDragStart(pos)
  }

  const handleManualMouseUp = () => setDragging(null)

  const applyManualCrop = () => {
    const canvas = canvasRef.current
    canvas.width = PASSPORT_W
    canvas.height = PASSPORT_H
    const ctx = canvas.getContext('2d')
    const img = imgRef.current
    const scale = imgSize.scale

    ctx.drawImage(img,
      cropBox.x / scale, cropBox.y / scale,
      cropBox.w / scale, cropBox.h / scale,
      0, 0, PASSPORT_W, PASSPORT_H
    )

    applyStudioEffect(ctx, PASSPORT_W, PASSPORT_H)
    const result = canvas.toDataURL('image/jpeg', 0.95)
    setCroppedImage(result)
  }

  // Init manual crop box centered
  const initManualMode = () => {
    if (!imgRef.current) return
    const scale = 340 / imgRef.current.width
    const cW = 340
    const cH = imgRef.current.height * scale
    const bW = cW * 0.55
    const bH = bW / (35/45)
    setCropBox({
      x: (cW - bW) / 2,
      y: (cH - bH) * 0.2,
      w: bW, h: bH
    })
    setMode('manual')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>

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
            onClick={() => m === 'manual' ? initManualMode() : setMode('auto')}
            style={{
              flex: 1, padding: '10px',
              borderRadius: '10px', border: 'none',
              cursor: 'pointer', fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'all 0.2s ease',
              background: mode === m
                ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                : 'transparent',
              color: mode === m ? 'white' : '#94a3b8',
              boxShadow: mode === m ? '2px 2px 8px #93c5fd' : 'none'
            }}>
            {m === 'auto' ? '🤖 Auto Crop' : '✋ Manual Crop'}
          </button>
        ))}
      </div>

      {/* Processing spinner */}
      {isProcessing && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px' }}>
          <div style={{
            width: '40px', height: '40px',
            border: '4px solid #dbeafe',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
            🔍 Detecting face & centering...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* AUTO MODE */}
      {mode === 'auto' && !isProcessing && croppedImage && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>

          {/* Before After */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <p style={{ margin: 0, fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Original</p>
              <img src={colorAppliedImage} alt="Before"
                style={{ width: '110px', height: '140px', objectFit: 'cover', borderRadius: '12px',
                  boxShadow: '4px 4px 10px #c5cad4, -4px -4px 10px #ffffff' }} />
            </div>
            <span style={{ fontSize: '1.5rem', color: '#cbd5e1' }}>→</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <p style={{ margin: 0, fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Passport</p>
              <img src={croppedImage} alt="Cropped"
                style={{ width: '110px', height: '140px', objectFit: 'cover', borderRadius: '12px',
                  boxShadow: '4px 4px 10px #93c5fd, -4px -4px 10px #ffffff',
                  border: '2px solid #bfdbfe' }} />
            </div>
          </div>

          {/* Sliders */}
          <div style={{
            width: '100%', padding: '16px',
            background: '#e8edf5', borderRadius: '16px',
            boxShadow: 'inset 3px 3px 8px #c5cad4, inset -3px -3px 8px #ffffff'
          }}>
            <p style={{ margin: '0 0 12px', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>
              🎛️ Fine-tune
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Move Up/Down</span>
                  <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>{offsetY}px</span>
                </div>
                <input type="range" min="-120" max="120" value={offsetY}
                  onChange={e => setOffsetY(Number(e.target.value))} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Zoom</span>
                  <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>{zoomLevel.toFixed(2)}x</span>
                </div>
                <input type="range" min="0.6" max="1.8" step="0.01" value={zoomLevel}
                  onChange={e => setZoomLevel(Number(e.target.value))} />
              </div>
            </div>

            <button onClick={() => { setOffsetY(0); setZoomLevel(1) }}
              style={{ marginTop: '10px', background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
              Reset ↺
            </button>
          </div>

          <button className="neo-btn" onClick={() => onCropDone(croppedImage)}>
            Next: Generate Sheet →
          </button>
        </div>
      )}

      {/* MANUAL MODE */}
      {mode === 'manual' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', textAlign: 'center' }}>
            Drag corners to resize • Drag inside to move
          </p>

          <div style={{
            borderRadius: '16px', overflow: 'hidden',
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

          <button className="neo-btn" onClick={applyManualCrop}>
            ✂️ Apply Crop
          </button>

          {croppedImage && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8' }}>Result:</p>
              <img src={croppedImage} alt="Manual crop result"
                style={{ width: '100px', height: '128px', objectFit: 'cover', borderRadius: '10px',
                  boxShadow: '4px 4px 10px #93c5fd', border: '2px solid #bfdbfe' }} />
              <button className="neo-btn" onClick={() => onCropDone(croppedImage)}>
                Next: Generate Sheet →
              </button>
            </div>
          )}
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

export default PassportCropper