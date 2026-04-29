import { useState } from 'react'
import './index.css'
import Home from './components/Home'
import Uploader from './components/Uploader'
import BgRemover from './components/BgRemover'
import ColorPicker from './components/ColorPicker'
import PassportCropper from './components/PassportCropper'
import SheetPreview from './components/SheetPreview'
import AadharFlow from './components/AadharFlow'
import AadharPrintFlow from './components/AadharPrintFlow'
import BioDataFlow from './components/BioDataFlow'

const PASSPORT_STEPS = [
  { id: 1, label: 'Upload',    icon: '📤' },
  { id: 2, label: 'Remove BG', icon: '✨' },
  { id: 3, label: 'Color',     icon: '🎨' },
  { id: 4, label: 'Crop',      icon: '✂️' },
  { id: 5, label: 'Download',  icon: '🖨️' },
]

const BADGE_COLORS = {
  1: '#dbeafe', 2: '#ede9fe',
  3: '#fce7f3', 4: '#fef9c3', 5: '#dcfce7'
}

export default function App() {
  const [mode, setMode] = useState(null) // null | 'passport' | 'aadhaar'
  const [uploadedImage,     setUploadedImage]     = useState(null)
  const [bgRemovedImage,    setBgRemovedImage]     = useState(null)
  const [colorAppliedImage, setColorAppliedImage] = useState(null)
  const [croppedImage,      setCroppedImage]      = useState(null)
  const [currentStep,       setCurrentStep]       = useState(1)

  const handleReset = () => {
    setMode(null)
    setUploadedImage(null)
    setBgRemovedImage(null)
    setColorAppliedImage(null)
    setCroppedImage(null)
    setCurrentStep(1)
  }

  const currentStepData = PASSPORT_STEPS[currentStep - 1]

  const STEP_TITLES = {
    1: { title: 'Upload Your Photo',       sub: 'Clear front-facing photo works best' },
    2: { title: 'Remove Background',       sub: 'AI powered — fully in your browser' },
    3: { title: 'Choose Background Color', sub: 'Pick a passport-approved background' },
    4: { title: mode === 'single-photo' ? 'Postcard Size Crop' : 'Passport Size Crop',      sub: 'Auto crop with manual fine-tuning' },
    5: { title: mode === 'single-photo' ? 'Download Your Photo' : 'Download Your Sheet',     sub: mode === 'single-photo' ? '1 photo on a 4×6 print-ready sheet' : '8 photos on a 4×2 print-ready sheet' },
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e8edf5 0%, #dce6f5 100%)' }}>

      {/* Header */}
      <header className="header-gradient" style={{ padding: '20px 24px' }}>
        <div style={{ maxWidth: !mode ? '768px' : '520px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'max-width 0.3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #a78bfa, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem',
              boxShadow: '0 0 16px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}>📸</div>
            <div>
              <h1 style={{ color: 'white', fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                Rithvik Photo Studio
              </h1>
              <p style={{ color: '#bfdbfe', fontSize: '0.68rem', margin: 0, letterSpacing: '2px', textTransform: 'uppercase' }}>
                Professional • Instant
              </p>
            </div>
          </div>

          {/* Back to home button */}
          {mode && (
            <button
              onClick={handleReset}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none', borderRadius: '10px',
                color: 'white', padding: '8px 14px',
                fontSize: '0.78rem', fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🏠 Home
            </button>
          )}
        </div>
      </header>

      <main style={{ maxWidth: !mode ? '768px' : '520px', margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '18px', transition: 'max-width 0.3s ease' }}>

        {/* HOME SCREEN */}
        {!mode && (
          <div className="neo-card" style={{ padding: '28px 24px' }}>
            <Home onSelectMode={(m) => { setMode(m); setCurrentStep(1) }} />
          </div>
        )}

        {/* PASSPORT & SINGLE PHOTO FLOW */}
        {(mode === 'passport' || mode === 'single-photo') && (
          <>
            {/* Step Indicator */}
            <div className="neo-card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {PASSPORT_STEPS.map((step, i) => (
                  <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                      <div className={`step-bubble ${currentStep > step.id ? 'done' : currentStep === step.id ? 'active' : ''}`}>
                        {currentStep > step.id ? '✓' : step.icon}
                      </div>
                      <span style={{
                        fontSize: '0.62rem', fontWeight: 600,
                        color: currentStep === step.id ? '#3b82f6' : '#94a3b8'
                      }}>
                        {step.label}
                      </span>
                    </div>
                    {i < PASSPORT_STEPS.length - 1 && (
                      <div style={{
                        height: '3px', width: '24px', margin: '0 3px 16px',
                        borderRadius: '10px',
                        background: currentStep > step.id
                          ? 'linear-gradient(90deg, #22c55e, #86efac)'
                          : '#dde3ed'
                      }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Card */}
            <div className="neo-card" style={{ padding: '26px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <div className="icon-badge" style={{ background: BADGE_COLORS[currentStep] }}>
                  {currentStepData.icon}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
                    {STEP_TITLES[currentStep].title}
                  </h2>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                    {STEP_TITLES[currentStep].sub}
                  </p>
                </div>
              </div>

              <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #d1d9e6, transparent)', marginBottom: '22px' }} />

              {currentStep === 1 && (
                <>
                  <Uploader onImageUpload={setUploadedImage} />
                  {uploadedImage && (
                    <button className="neo-btn" style={{ marginTop: '18px' }}
                      onClick={() => setCurrentStep(2)}>
                      Continue: Remove Background →
                    </button>
                  )}
                </>
              )}

              {currentStep === 2 && (
                <>
                  <BgRemover originalImage={uploadedImage}
                    onBgRemoved={(img) => { if (img) { setBgRemovedImage(img); setCurrentStep(3) } }} />
                  <button className="neo-btn-ghost" style={{ marginTop: '14px', width: '100%' }}
                    onClick={() => setCurrentStep(1)}>← Back</button>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <ColorPicker bgRemovedImage={bgRemovedImage}
                    onColorApplied={(img) => { setColorAppliedImage(img); setCurrentStep(4) }} />
                  <button className="neo-btn-ghost" style={{ marginTop: '14px', width: '100%' }}
                    onClick={() => setCurrentStep(2)}>← Back</button>
                </>
              )}

              {currentStep === 4 && (
                <>
                  <PassportCropper colorAppliedImage={colorAppliedImage}
                    format={mode === 'single-photo' ? 'postcard' : 'passport'}
                    onCropDone={(img) => { setCroppedImage(img); setCurrentStep(5) }} />
                  <button className="neo-btn-ghost" style={{ marginTop: '14px', width: '100%' }}
                    onClick={() => setCurrentStep(3)}>← Back</button>
                </>
              )}

              {currentStep === 5 && (
                <SheetPreview croppedImage={croppedImage} format={mode === 'single-photo' ? 'postcard' : 'passport'} onBack={handleReset} />
              )}
            </div>
          </>
        )}

        {mode === 'aadhaar' && (
          <AadharFlow onBack={handleReset} />
        )}

        {/* AADHAAR A4 PRINT */}
        {mode === 'aadhaar-a4' && (
          <AadharPrintFlow onBack={handleReset} />
        )}

        {/* BIO DATA MAKER */}
        {mode === 'biodata' && (
          <BioDataFlow onBack={handleReset} />
        )}

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#94a3b8', paddingBottom: '16px' }}>
          Made with ❤️ by Rithvik
        </p>
      </main>
    </div>
  )
}