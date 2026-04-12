import { useState, useEffect, useRef } from 'react'

const PRESET_COLORS = [
  { name: 'White',      value: '#FFFFFF', border: '#e2e8f0' },
  { name: 'Sky Blue',   value: '#87CEEB', border: '#87CEEB' },
  { name: 'Light Blue', value: '#A8C5E8', border: '#A8C5E8' },
  { name: 'Light Grey', value: '#D3D3D3', border: '#D3D3D3' },
  { name: 'Red',        value: '#FF0000', border: '#FF0000' },
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

      {/* Preset Colors */}
      <div style={{ width: '100%' }}>
        <p style={{ margin: '0 0 12px', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
          Official Passport Colors:
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {PRESET_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => { setSelectedColor(color.value); setIsCustom(false) }}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '6px',
                padding: '10px 12px', borderRadius: '14px',
                background: '#e8edf5',
                border: selectedColor === color.value && !isCustom
                  ? '2px solid #3b82f6'
                  : '2px solid transparent',
                boxShadow: selectedColor === color.value && !isCustom
                  ? '3px 3px 8px #c5cad4, -3px -3px 8px #ffffff, 0 0 0 3px #dbeafe'
                  : '3px 3px 8px #c5cad4, -3px -3px 8px #ffffff',
                cursor: 'pointer',
                transform: selectedColor === color.value && !isCustom ? 'scale(1.08)' : 'scale(1)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: color.value,
                border: `1px solid ${color.border}`,
                boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.1)'
              }} />
              <span style={{ fontSize: '0.65rem', color: '#475569', fontWeight: 500 }}>
                {color.name}
              </span>
              {selectedColor === color.value && !isCustom && (
                <span style={{ fontSize: '0.65rem', color: '#3b82f6' }}>✓</span>
              )}
            </button>
          ))}

          {/* Custom Color */}
          <button
            onClick={() => setIsCustom(true)}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '6px',
              padding: '10px 12px', borderRadius: '14px',
              background: '#e8edf5',
              border: isCustom ? '2px solid #3b82f6' : '2px solid transparent',
              boxShadow: isCustom
                ? '3px 3px 8px #c5cad4, -3px -3px 8px #ffffff, 0 0 0 3px #dbeafe'
                : '3px 3px 8px #c5cad4, -3px -3px 8px #ffffff',
              cursor: 'pointer',
              transform: isCustom ? 'scale(1.08)' : 'scale(1)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
              boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.1)'
            }} />
            <span style={{ fontSize: '0.65rem', color: '#475569', fontWeight: 500 }}>Custom</span>
            {isCustom && <span style={{ fontSize: '0.65rem', color: '#3b82f6' }}>✓</span>}
          </button>
        </div>
      </div>

      {/* Custom Color Wheel */}
      {isCustom && (
        <div style={{
          width: '100%', padding: '16px',
          background: '#e8edf5',
          borderRadius: '16px',
          boxShadow: 'inset 3px 3px 8px #c5cad4, inset -3px -3px 8px #ffffff',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
        }}>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
            Pick any color:
          </p>
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            style={{
              width: '80px', height: '80px',
              borderRadius: '50%', border: 'none',
              cursor: 'pointer', padding: '4px',
              background: 'none'
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: selectedColor,
              border: '1px solid #e2e8f0',
              boxShadow: '2px 2px 6px rgba(0,0,0,0.1)'
            }} />
            <span style={{ fontSize: '0.8rem', color: '#475569', fontFamily: 'monospace', fontWeight: 600 }}>
              {selectedColor.toUpperCase()}
            </span>
          </div>
        </div>
      )}

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