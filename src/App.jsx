import { useState } from 'react'
import './index.css'
import Uploader from './components/Uploader'
import BgRemover from './components/BgRemover'
import ColorPicker from './components/ColorPicker'
import PassportCropper from './components/PassportCropper'
import SheetPreview from './components/SheetPreview'

const STEPS = [
  { id: 1, label: 'Upload',    icon: '📤' },
  { id: 2, label: 'Remove BG', icon: '✨' },
  { id: 3, label: 'Color',     icon: '🎨' },
  { id: 4, label: 'Crop',      icon: '✂️' },
  { id: 5, label: 'Download',  icon: '🖨️' },
]

const BADGE_COLORS = {
  1: '#dbeafe',
  2: '#ede9fe',
  3: '#fce7f3',
  4: '#fef9c3',
  5: '#dcfce7',
}

export default function App() {
  const [uploadedImage,     setUploadedImage]     = useState(null)
  const [bgRemovedImage,    setBgRemovedImage]     = useState(null)
  const [colorAppliedImage, setColorAppliedImage] = useState(null)
  const [croppedImage,      setCroppedImage]      = useState(null)
  const [currentStep,       setCurrentStep]       = useState(1)

  const handleReset = () => {
    setUploadedImage(null)
    setBgRemovedImage(null)
    setColorAppliedImage(null)
    setCroppedImage(null)
    setCurrentStep(1)
  }

  const currentStepData = STEPS[currentStep - 1]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e8edf5 0%, #dce6f5 100%)' }}>

      {/* Header */}
      <header className="header-gradient" style={{ padding: '20px 24px' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '16px',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', flexShrink: 0
          }}>
            📸
          </div>
          <div>
            <h1 style={{ color: 'white', fontSize: '1.3rem', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
              Rithvik Passport Photo Maker
            </h1>
            <p style={{ color: '#bfdbfe', fontSize: '0.72rem', margin: 0, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 500 }}>
              Professional • Free • Instant
            </p>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '520px', margin: '0 auto', padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Step Indicator */}
        <div className="neo-card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {STEPS.map((step, i) => (
              <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div className={`step-bubble ${currentStep > step.id ? 'done' : currentStep === step.id ? 'active' : ''}`}>
                    {currentStep > step.id ? '✓' : step.icon}
                  </div>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    color: currentStep === step.id ? '#3b82f6' : '#94a3b8',
                    letterSpacing: '0.3px'
                  }}>
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    height: '3px', width: '28px', margin: '0 4px 18px 4px',
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
        <div className="neo-card" style={{ padding: '28px 24px' }}>

          {/* Card Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <div className="icon-badge" style={{ background: BADGE_COLORS[currentStep] }}>
              {currentStepData.icon}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                {currentStepData.label === 'Upload' && 'Upload Your Photo'}
                {currentStepData.label === 'Remove BG' && 'Remove Background'}
                {currentStepData.label === 'Color' && 'Choose Background Color'}
                {currentStepData.label === 'Crop' && 'Passport Size Crop'}
                {currentStepData.label === 'Download' && 'Download Your Sheet'}
              </h2>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                {currentStepData.label === 'Upload' && 'Clear, front-facing photo works best'}
                {currentStepData.label === 'Remove BG' && 'AI powered — fully in your browser'}
                {currentStepData.label === 'Color' && 'Pick a passport-approved background'}
                {currentStepData.label === 'Crop' && 'Auto crop with manual fine-tuning'}
                {currentStepData.label === 'Download' && '8 photos on a 4×2 print-ready sheet'}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #d1d9e6, transparent)', marginBottom: '24px' }} />

          {/* Step Content */}
          {currentStep === 1 && (
            <>
              <Uploader onImageUpload={setUploadedImage} />
              {uploadedImage && (
                <button className="neo-btn" style={{ marginTop: '20px' }}
                  onClick={() => setCurrentStep(2)}>
                  Continue: Remove Background →
                </button>
              )}
            </>
          )}

          {currentStep === 2 && (
            <>
              <BgRemover
                originalImage={uploadedImage}
                onBgRemoved={(img) => {
                  if (img) { setBgRemovedImage(img); setCurrentStep(3) }
                }}
              />
              <button className="neo-btn-ghost" style={{ marginTop: '16px', width: '100%' }}
                onClick={() => setCurrentStep(1)}>
                ← Back
              </button>
            </>
          )}

          {currentStep === 3 && (
            <>
              <ColorPicker
                bgRemovedImage={bgRemovedImage}
                onColorApplied={(img) => { setColorAppliedImage(img); setCurrentStep(4) }}
              />
              <button className="neo-btn-ghost" style={{ marginTop: '16px', width: '100%' }}
                onClick={() => setCurrentStep(2)}>
                ← Back
              </button>
            </>
          )}

          {currentStep === 4 && (
            <>
              <PassportCropper
                colorAppliedImage={colorAppliedImage}
                onCropDone={(img) => { setCroppedImage(img); setCurrentStep(5) }}
              />
              <button className="neo-btn-ghost" style={{ marginTop: '16px', width: '100%' }}
                onClick={() => setCurrentStep(3)}>
                ← Back
              </button>
            </>
          )}

          {currentStep === 5 && (
            <SheetPreview
              croppedImage={croppedImage}
              onBack={handleReset}
            />
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8', paddingBottom: '20px' }}>
          Made with ❤️ by Rithvik &nbsp;•&nbsp; All processing done locally &nbsp;•&nbsp; No data uploaded
        </p>

      </main>
    </div>
  )
}