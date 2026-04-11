import { useState, useRef, useEffect } from 'react'
import { detectFaceAndCrop } from '../utils/faceDetect'

const PASSPORT_W = 413   // 35mm at 300dpi
const PASSPORT_H = 531   // 45mm at 300dpi

function PassportCropper({ colorAppliedImage, onCropDone }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [croppedImage, setCroppedImage] = useState(null)
  const [error, setError] = useState(null)

  // Manual adjustment sliders
  const [offsetY, setOffsetY] = useState(0)      // move crop up/down
  const [zoomLevel, setZoomLevel] = useState(1)  // zoom in/out

  const canvasRef = useRef(null)
  const imgRef = useRef(null)

  useEffect(() => {
    if (colorAppliedImage) {
      const img = new Image()
      img.onload = () => {
        imgRef.current = img
        cropImage(img, offsetY, zoomLevel)
      }
      img.src = colorAppliedImage
    }
  }, [colorAppliedImage])

  // Re-crop when sliders change
  useEffect(() => {
    if (imgRef.current) {
      cropImage(imgRef.current, offsetY, zoomLevel)
    }
  }, [offsetY, zoomLevel])

  const cropImage = async (img, yOffset, zoom) => {
    setIsProcessing(true)
    setError(null)

    try {
      const cropBox = await detectFaceAndCrop(img)

      const canvas = canvasRef.current
      canvas.width = PASSPORT_W
      canvas.height = PASSPORT_H
      const ctx = canvas.getContext('2d')

      // Apply zoom and offset adjustments
      const adjustedW = cropBox.width / zoom
      const adjustedH = cropBox.height / zoom
      const adjustedX = cropBox.x + (cropBox.width - adjustedW) / 2
      const adjustedY = cropBox.y + (cropBox.height - adjustedH) / 2 + yOffset

      ctx.drawImage(
        img,
        adjustedX, adjustedY,
        adjustedW, adjustedH,
        0, 0,
        PASSPORT_W, PASSPORT_H
      )

      const result = canvas.toDataURL('image/jpeg', 0.95)
      setCroppedImage(result)
      setIsProcessing(false)

    } catch (err) {
      console.error(err)
      setError('Crop failed. Try adjusting sliders.')
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-5">

      {/* Processing */}
      {isProcessing && (
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Cropping to passport size...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center w-full">
          <p className="text-red-500 text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* Result + Adjustments */}
      {croppedImage && !isProcessing && (
        <div className="flex flex-col items-center gap-5 w-full">

          {/* Before / After */}
          <div className="flex gap-4 items-start justify-center">
            <div className="flex flex-col items-center gap-1">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Original</p>
              <img src={colorAppliedImage} alt="Before"
                className="w-28 h-36 object-cover rounded-lg border-2 border-gray-200 shadow" />
            </div>
            <div className="flex items-center h-36 text-2xl text-gray-300">→</div>
            <div className="flex flex-col items-center gap-1">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Passport</p>
              <img src={croppedImage} alt="Cropped"
                className="w-28 h-36 object-cover rounded-lg border-2 border-blue-300 shadow-md" />
            </div>
          </div>

          {/* Fine-tune sliders */}
          <div className="w-full bg-gray-50 rounded-xl p-4 flex flex-col gap-4">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide text-center">
              🎛️ Fine-tune Crop
            </p>

            {/* Move Up/Down */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Move Up/Down</span>
                <span>{offsetY > 0 ? `+${offsetY}` : offsetY}px</span>
              </div>
              <input type="range" min="-100" max="100" value={offsetY}
                onChange={(e) => setOffsetY(Number(e.target.value))}
                className="w-full accent-blue-500" />
              <div className="flex justify-between text-xs text-gray-300">
                <span>↑ Move Up</span>
                <span>Move Down ↓</span>
              </div>
            </div>

            {/* Zoom */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Zoom</span>
                <span>{zoomLevel.toFixed(2)}x</span>
              </div>
              <input type="range" min="0.7" max="1.5" step="0.01" value={zoomLevel}
                onChange={(e) => setZoomLevel(Number(e.target.value))}
                className="w-full accent-blue-500" />
              <div className="flex justify-between text-xs text-gray-300">
                <span>Zoom Out</span>
                <span>Zoom In</span>
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() => { setOffsetY(0); setZoomLevel(1) }}
              className="text-xs text-blue-400 hover:text-blue-600 underline text-center"
            >
              Reset to default
            </button>
          </div>

          <p className="text-xs text-gray-400">✅ 35mm × 45mm passport standard</p>

          {/* Next Button */}
          <button
            onClick={() => onCropDone(croppedImage)}
            className="w-full px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-md"
          >
            Next: Generate Sheet →
          </button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

export default PassportCropper