import { useState, useEffect, useRef } from 'react'

const COLORS = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Light Blue', value: '#A8C5E8' },
  { name: 'Sky Blue', value: '#4A90D9' },
  { name: 'Off White', value: '#F5F0E8' },
  { name: 'Red', value: '#f00d0d' },
  { name: 'Cream', value: '#FFF8DC' },
]

function ColorPicker({ bgRemovedImage, onColorApplied }) {
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value)
  const [resultImage, setResultImage] = useState(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    if (bgRemovedImage) {
      applyBackground(selectedColor)
    }
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

      const result = canvas.toDataURL('image/jpeg', 0.95)
      setResultImage(result)
    }
    img.src = bgRemovedImage
  }

  const handleNext = () => {
    if (resultImage) {
      onColorApplied(resultImage)  // only moves to next step when button clicked
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">

      {/* Color Grid */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-gray-600 font-medium">Choose Background Color:</p>
        <div className="grid grid-cols-3 gap-3">
          {COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => setSelectedColor(color.value)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition
                ${selectedColor === color.value
                  ? 'border-blue-500 shadow-md scale-105'
                  : 'border-gray-200 hover:border-gray-400'
                }`}
            >
              <div
                className="w-10 h-10 rounded-lg shadow-inner border border-gray-200"
                style={{ backgroundColor: color.value }}
              />
              <span className="text-xs text-gray-600 font-medium">{color.name}</span>
              {selectedColor === color.value && (
                <span className="text-blue-500 text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Preview */}
      {resultImage && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Preview</p>
          <img
            src={resultImage}
            alt="With background"
            className="w-40 h-40 object-cover rounded-xl border-2 border-gray-200 shadow-md"
          />
          <p className="text-xs text-gray-400">
            Selected: <span className="font-semibold text-gray-600">
              {COLORS.find(c => c.value === selectedColor)?.name}
            </span>
          </p>
        </div>
      )}

      {/* Next Button */}
      {resultImage && (
        <button
          onClick={handleNext}
          className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-md"
        >
          Next: Crop to Passport Size →
        </button>
      )}
    </div>
  )
}

export default ColorPicker