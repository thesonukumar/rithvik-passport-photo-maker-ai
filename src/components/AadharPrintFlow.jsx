import { useState, useRef } from 'react'
import AadharCropper from './AadharCropper'

const SHEET_W = 2480 // A4 Width at 300 DPI
const SHEET_H = 3508 // A4 Height at 300 DPI
const AADHAAR_W = 1011 // 85.6mm at 300 DPI
const AADHAAR_H = 639  // 54mm at 300 DPI

function AadharPrintFlow({ onBack }) {
  const [step, setStep] = useState(1)
  
  // Raw uploaded images
  const [frontRaw, setFrontRaw] = useState(null)
  const [backRaw, setBackRaw] = useState(null)
  
  // Cropped results
  const [frontCropped, setFrontCropped] = useState(null)
  const [backCropped, setBackCropped] = useState(null)
  
  const [sheetImage, setSheetImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const canvasRef = useRef(null)

  const handleFileUpload = async (file, type) => {
    if (!file) return

    if (file.type === 'application/pdf') {
      setIsProcessing(true)
      try {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url
        ).toString()

        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        const page = await pdf.getPage(1)
        const viewport = page.getViewport({ scale: 2.5 })

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = viewport.width
        canvas.height = viewport.height

        await page.render({ canvasContext: ctx, viewport }).promise

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
        if (type === 'front') setFrontRaw(dataUrl)
        else setBackRaw(dataUrl)
      } catch (e) {
        console.error('PDF error:', e)
        alert('PDF loading failed! Please try JPG/PNG.')
      }
      setIsProcessing(false)
    } else {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (type === 'front') setFrontRaw(e.target.result)
        else setBackRaw(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleStartCropping = () => {
    if (!frontRaw) {
      alert("Please upload at least the primary image.")
      return
    }
    setStep(2) // Crop Front
  }

  const generateA4Sheet = () => {
    setIsProcessing(true)
    
    const frontImg = new Image()
    const backImg = new Image()

    frontImg.onload = () => {
      backImg.onload = () => {
        const canvas = canvasRef.current
        canvas.width = SHEET_W
        canvas.height = SHEET_H
        const ctx = canvas.getContext('2d')

        // White background
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, SHEET_W, SHEET_H)

        // Calculate positions (Top Center, one below the other)
        const gap = 150
        const startY = 400
        const centerX = (SHEET_W - AADHAAR_W) / 2

        // Front Card
        ctx.drawImage(frontImg, centerX, startY, AADHAAR_W, AADHAAR_H)
        
        // Back Card
        ctx.drawImage(backImg, centerX, startY + AADHAAR_H + gap, AADHAAR_W, AADHAAR_H)

        const result = canvas.toDataURL('image/jpeg', 0.97)
        setSheetImage(result)
        setStep(4) // Download Step
        setIsProcessing(false)
      }
      backImg.src = backCropped || frontCropped // fallback just in case
    }
    frontImg.src = frontCropped
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* STEP 1: UPLOAD */}
      {step === 1 && (
        <div className="neo-card" style={{ padding: '28px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div className="icon-badge" style={{ background: '#fef3c7' }}>🖨️</div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
                Print Aadhaar on A4
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                Upload 1 or 2 images to get started
              </p>
            </div>
          </div>

          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #d1d9e6, transparent)', marginBottom: '22px' }} />

          {isProcessing ? (
            <div style={{ textAlign: 'center', padding: '30px' }}>Loading PDF...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Front / Primary Upload */}
              <div
                className="drop-zone"
                onClick={() => document.getElementById('aadhaar-front').click()}
                style={{ padding: '20px', border: frontRaw ? '2px solid #4ade80' : '2px dashed #cbd5e1' }}
              >
                <span style={{ fontSize: '2rem' }}>{frontRaw ? '✅' : '📄'}</span>
                <p style={{ color: '#475569', fontWeight: 600, margin: '8px 0 0' }}>
                  {frontRaw ? 'Primary Image Selected' : 'Upload Primary Image (Front or Both)'}
                </p>
              </div>
              <input id="aadhaar-front" type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => handleFileUpload(e.target.files[0], 'front')} />

              {/* Back / Secondary Upload */}
              <div
                className="drop-zone"
                onClick={() => document.getElementById('aadhaar-back').click()}
                style={{ padding: '20px', border: backRaw ? '2px solid #4ade80' : '2px dashed #cbd5e1' }}
              >
                <span style={{ fontSize: '2rem' }}>{backRaw ? '✅' : '📄'}</span>
                <p style={{ color: '#475569', fontWeight: 600, margin: '8px 0 0' }}>
                  {backRaw ? 'Secondary Image Selected' : 'Upload Back Image (Optional)'}
                </p>
                {!backRaw && <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '4px 0 0' }}>Skip if you uploaded a single file containing both</p>}
              </div>
              <input id="aadhaar-back" type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => handleFileUpload(e.target.files[0], 'back')} />

              <button className="neo-btn" onClick={handleStartCropping} disabled={!frontRaw} style={{ opacity: frontRaw ? 1 : 0.5 }}>
                Next: Crop Aadhaar →
              </button>
            </div>
          )}
          <button className="neo-btn-ghost" style={{ marginTop: '14px', width: '100%' }} onClick={onBack}>
            ← Back to Home
          </button>
        </div>
      )}

      {/* STEP 2: CROP FRONT */}
      {step === 2 && (
        <div className="neo-card" style={{ padding: '28px 22px' }}>
          <AadharCropper 
            title="Step 1: Crop Front of Aadhaar"
            image={frontRaw} 
            onCropDone={(cropped) => {
              setFrontCropped(cropped)
              setStep(3)
            }}
            onBack={() => setStep(1)}
          />
        </div>
      )}

      {/* STEP 3: CROP BACK */}
      {step === 3 && (
        <div className="neo-card" style={{ padding: '28px 22px' }}>
          <AadharCropper 
            title="Step 2: Crop Back of Aadhaar"
            // If they didn't upload a second image, reuse the first one so they can crop the back from it
            image={backRaw || frontRaw} 
            onCropDone={(cropped) => {
              setBackCropped(cropped)
              // Wait for state to settle then generate (usually React handles this, but we use a useEffect or call directly)
            }}
            onBack={() => setStep(2)}
          />
          
          {/* We add a button here to proceed once back is cropped */}
          {backCropped && (
             <button className="neo-btn" style={{ marginTop: '16px', width: '100%' }} onClick={generateA4Sheet}>
               {isProcessing ? '⏳ Generating...' : '🖨️ Generate A4 Sheet →'}
             </button>
          )}
        </div>
      )}

      {/* STEP 4: DOWNLOAD */}
      {step === 4 && sheetImage && (
        <div className="neo-card" style={{ padding: '28px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div className="icon-badge" style={{ background: '#dcfce7' }}>🖨️</div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
                A4 Sheet Ready!
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                High-quality 300 DPI print sheet
              </p>
            </div>
          </div>

          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #d1d9e6, transparent)', marginBottom: '22px' }} />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{
              padding: '10px', borderRadius: '16px',
              boxShadow: '6px 6px 14px #c5cad4, -6px -6px 14px #ffffff',
              background: '#e8edf5'
            }}>
              <img src={sheetImage} alt="Sheet preview"
                style={{ width: '100%', maxWidth: '300px', borderRadius: '10px', display: 'block' }} />
            </div>

            <button className="neo-btn neo-btn-green" style={{
              width: '100%', padding: '16px',
              background: 'linear-gradient(135deg, #22c55e, #15803d)',
              boxShadow: '4px 4px 12px #86efac'
            }} onClick={() => {
              const link = document.createElement('a')
              link.download = 'aadhaar-a4-print.jpg'
              link.href = sheetImage
              link.click()
            }}>
              ⬇️ Download A4 Print Sheet
            </button>

            <button className="neo-btn-ghost" style={{ width: '100%' }} onClick={() => {
              setStep(1)
              setFrontRaw(null)
              setBackRaw(null)
              setFrontCropped(null)
              setBackCropped(null)
            }}>
              🔄 Create Another
            </button>
            <button className="neo-btn-ghost" style={{ width: '100%' }} onClick={onBack}>
              🏠 Back to Home
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

export default AadharPrintFlow
