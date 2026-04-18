import { useState, useEffect, useRef } from 'react'

const PRESET_COLORS = [
  { name: 'White',    value: '#FFFFFF', border: '#d1d5db' },
  { name: 'Off White',value: '#F5F5F0', border: '#d1d5db' },
  { name: 'Sky Blue', value: '#87CEEB', border: '#87CEEB' },
  { name: 'Blue',     value: '#4A90D9', border: '#4A90D9' },
  { name: 'Red',      value: '#FF0000', border: '#FF0000' },
]

function ColorPicker({ bgRemovedImage, onColorApplied }) {
  const [selectedColor, setSelectedColor] = useState('#FFFFFF')
  const [isCustom, setIsCustom] = useState(false)
  const [resultImage, setResultImage] = useState(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    if (bgRemovedImage) applyBackground(selectedColor)
  }, [selectedColor, bgRemovedImage])

  const applyBackground = (color) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.fillStyle = color
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      setResultImage(canvas.toDataURL('image/jpeg', 0.95))
    }
    img.src = bgRemovedImage
  }

  const handleCustomChange = (e) => {
    setSelectedColor(e.target.value)
    setIsCustom(true)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

      {/* Single row — 5 presets + 1 custom */}
      <div style={{ width: '100%' }}>
        <p style={{ margin: '0 0 10px', fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>
          Background Colour:
        </p>

        <div style={{
          display: 'flex', gap: '0',
          borderRadius: '14px', overflow: 'hidden',
          border: '1px solid #cbd5e1',
          boxShadow: '3px 3px 8px #c5cad4, -3px -3px 8px #ffffff',
        }}>
          {PRESET_COLORS.map((c, i) => {
            const isActive = selectedColor === c.value && !isCustom
            return (
              <button
                key={c.value}
                onClick={() => { setSelectedColor(c.value); setIsCustom(false) }}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '5px',
                  padding: '12px 4px 10px', cursor: 'pointer',
                  background: isActive ? '#dbeafe' : '#e8edf5',
                  border: 'none',
                  borderRight: i < PRESET_COLORS.length - 1 ? '1px solid #cbd5e1' : 'none',
                  transition: 'background 0.2s ease',
                }}
              >
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: c.value,
                  border: isActive ? '2.5px solid #3b82f6' : `1.5px solid ${c.border}`,
                  boxShadow: isActive ? '0 0 0 2px #bfdbfe' : '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease',
                }} />
                <span style={{
                  fontSize: '0.58rem', fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#2563eb' : '#64748b',
                  whiteSpace: 'nowrap',
                }}>
                  {c.name}
                </span>
              </button>
            )
          })}

          {/* Custom — native input overlaid on circle for natural popup behavior */}
          <label
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '5px',
              padding: '12px 4px 10px', cursor: 'pointer',
              background: isCustom ? '#dbeafe' : '#e8edf5',
              borderLeft: '1px solid #cbd5e1',
              transition: 'background 0.2s ease',
              position: 'relative',
            }}
          >
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: isCustom
                ? selectedColor
                : 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
              border: isCustom ? '2.5px solid #3b82f6' : '1.5px solid #a78bfa',
              boxShadow: isCustom ? '0 0 0 2px #bfdbfe' : '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
              overflow: 'hidden',
              position: 'relative',
            }}>
              <input
                type="color"
                value={selectedColor}
                onChange={handleCustomChange}
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  opacity: 0, cursor: 'pointer',
                  border: 'none', padding: 0,
                }}
              />
            </div>
            <span style={{
              fontSize: '0.58rem', fontWeight: isCustom ? 700 : 500,
              color: isCustom ? '#2563eb' : '#64748b',
            }}>
              Custom
            </span>
          </label>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Preview */}
      {resultImage && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
          <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Preview
          </p>
          <div style={{
            padding: '10px', borderRadius: '16px',
            background: '#e8edf5',
            boxShadow: 'inset 3px 3px 8px #c5cad4, inset -3px -3px 8px #ffffff'
          }}>
            <img src={resultImage} alt="Preview"
              style={{ width: '120px', height: '150px', objectFit: 'cover', borderRadius: '10px' }} />
          </div>
        </div>
      )}

      {/* Next Button */}
      {resultImage && (
        <button className="neo-btn" onClick={() => onColorApplied(resultImage)}>
          Next: Crop to Passport Size →
        </button>
      )}
    </div>
  )
}

export default ColorPicker