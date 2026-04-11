import { useState, useRef, useEffect } from 'react'

// 4x6 sheet at 300 DPI
const SHEET_W = 1800   // 6 inches (landscape feels better for 4 cols)
const SHEET_H = 1200   // 4 inches

// Each passport photo at 300 DPI
const PHOTO_W = 413    // 35mm
const PHOTO_H = 531    // 45mm

// Layout: 4 columns x 2 rows = 8 photos
const COLS = 4
const ROWS = 2
const GAP = 20         // small gap between photos in pixels

function SheetPreview({ croppedImage, onBack }) {
  const [sheetImage, setSheetImage] = useState(null)
  const [isGenerating, setIsGenerating] = useState(true)
  const canvasRef = useRef(null)

  useEffect(() => {
    if (croppedImage) generateSheet()
  }, [croppedImage])

  const generateSheet = () => {
    setIsGenerating(true)

    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current

      // Canvas size = photos + gaps only (tight layout)
      const totalW = COLS * PHOTO_W + (COLS - 1) * GAP
      const totalH = ROWS * PHOTO_H + (ROWS - 1) * GAP

      canvas.width = totalW
      canvas.height = totalH

      const ctx = canvas.getContext('2d')

      // White background
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, totalW, totalH)

      // Draw 8 photos — 4 cols x 2 rows
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const x = col * (PHOTO_W + GAP)
          const y = row * (PHOTO_H + GAP)
          ctx.drawImage(img, x, y, PHOTO_W, PHOTO_H)
        }
      }

      const result = canvas.toDataURL('image/jpeg', 0.97)
      setSheetImage(result)
      setIsGenerating(false)
    }
    img.src = croppedImage
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.download = 'passport-photos-4x6.jpg'
    link.href = sheetImage
    link.click()
  }

  return (
    <div className="flex flex-col items-center gap-6">

      {/* Generating */}
      {isGenerating && (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">🖨️ Generating your sheet...</p>
        </div>
      )}

      {/* Sheet Preview */}
      {sheetImage && !isGenerating && (
        <div className="flex flex-col items-center gap-5 w-full">

          {/* Preview */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
              Print Sheet Preview
            </p>
            <div className="border border-gray-200 rounded-lg shadow-md overflow-hidden">
              <img
                src={sheetImage}
                alt="Passport sheet"
                className="w-full max-w-sm"
              />
            </div>
            <p className="text-xs text-gray-400">
              8 photos • 4×2 layout • Print ready
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-3 text-center flex-wrap justify-center">
            <div className="bg-blue-50 rounded-xl px-4 py-2">
              <p className="text-xs text-gray-400">Each Photo</p>
              <p className="text-sm font-semibold text-blue-600">35×45 mm</p>
            </div>
            <div className="bg-blue-50 rounded-xl px-4 py-2">
              <p className="text-xs text-gray-400">Layout</p>
              <p className="text-sm font-semibold text-blue-600">4 × 2 grid</p>
            </div>
            <div className="bg-blue-50 rounded-xl px-4 py-2">
              <p className="text-xs text-gray-400">Resolution</p>
              <p className="text-sm font-semibold text-blue-600">300 DPI</p>
            </div>
          </div>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="w-full py-4 bg-green-500 text-white font-bold text-lg rounded-xl hover:bg-green-600 transition shadow-lg"
          >
            ⬇️ Download Sheet
          </button>

          {/* Start Over */}
          <button
            onClick={onBack}
            className="text-gray-400 text-sm hover:text-gray-600 underline"
          >
            🔄 Start over with new photo
          </button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

export default SheetPreview