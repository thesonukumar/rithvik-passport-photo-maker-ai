import { useState } from 'react'
import { removeBackground } from '@imgly/background-removal'

function BgRemover({ originalImage, onBgRemoved }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [resultImage, setResultImage] = useState(null)

  const handleRemoveBackground = async () => {
    if (!originalImage) return

    setIsProcessing(true)
    setProgress(0)

    try {
      // Convert base64 to blob (the library needs a blob/file)
      const response = await fetch(originalImage)
      const blob = await response.blob()

      // Run AI background removal
      const resultBlob = await removeBackground(blob, {
        progress: (key, current, total) => {
          // This updates our progress bar
          const percent = Math.round((current / total) * 100)
          setProgress(percent)
        }
      })

      // Convert result blob back to base64 URL for display
      const reader = new FileReader()
      reader.onload = (e) => {
        setResultImage(e.target.result)
        onBgRemoved(e.target.result)   // send result up to App.jsx
        setIsProcessing(false)
      }
      reader.readAsDataURL(resultBlob)

    } catch (error) {
      console.error('Background removal failed:', error)
      alert('Something went wrong. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Before / After Preview */}
      <div className="flex gap-6 items-start">
        {/* Original */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Original</p>
          <img
            src={originalImage}
            alt="Original"
            className="w-36 h-36 object-cover rounded-xl border-2 border-gray-200 shadow"
          />
        </div>

        {/* Arrow */}
        <div className="flex items-center h-36 text-3xl text-gray-300">→</div>

        {/* Result */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">No Background</p>
          <div className="w-36 h-36 rounded-xl border-2 border-gray-200 shadow overflow-hidden"
            style={{
              backgroundImage: 'repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%)',
              backgroundSize: '16px 16px'
            }}>
            {resultImage ? (
              <img src={resultImage} alt="Result" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                Preview here
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar - shows during processing */}
      {isProcessing && (
        <div className="w-full flex flex-col gap-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>🤖 AI is removing background...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 text-center">
            First time may take ~30 sec (downloads AI model once)
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {!resultImage ? (
        <button
          onClick={handleRemoveBackground}
          disabled={isProcessing}
          className={`px-8 py-3 rounded-xl font-semibold text-white transition shadow-md
            ${isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
            }`}
        >
          {isProcessing ? '⏳ Processing...' : '✨ Remove Background'}
        </button>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={() => { setResultImage(null); onBgRemoved(null) }}
            className="px-5 py-2 rounded-xl border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition"
          >
            🔄 Redo
          </button>
          <button
            onClick={() => onBgRemoved(resultImage)}
            className="px-8 py-3 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition shadow-md"
          >
            Next: Choose Color →
          </button>
        </div>
      )}
    </div>
  )
}

export default BgRemover