import { useState, useRef } from 'react'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

const SHEET_W = 1240
const SHEET_H = 1748

function AadharFlow({ onBack }) {
    const [step, setStep] = useState(1)
    const [uploadedFile, setUploadedFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [frontCard, setFrontCard] = useState(null)
    const [backCard, setBackCard] = useState(null)
    const [sheetImage, setSheetImage] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)

    // Manual selection state
    const [selecting, setSelecting] = useState(null) // 'front' | 'back'
    const [crop, setCrop] = useState(null)
    const [dragPos, setDragPos] = useState(null)

    const canvasRef = useRef(null)
    const imgRef = useRef(null)
    const zoomCanvasRef = useRef(null)

    const handleFileUpload = (file) => {
        if (!file) return

        if (file.type === 'application/pdf') {
            handlePDF(file)
        } else {
            const reader = new FileReader()
            reader.onload = (e) => {
                setPreviewUrl(e.target.result)
                setUploadedFile(file)
                setStep(2)
            }
            reader.readAsDataURL(file)
        }
    }
    const handlePDF = async (file) => {
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
            setPreviewUrl(dataUrl)
            setUploadedFile(file)
            setStep(2)
        } catch (e) {
            console.error('PDF error:', e)
            alert('PDF loading failed! Please try converting to JPG/PNG first.')
        }
        setIsProcessing(false)
    }

    const initSelectionCanvas = (type) => {
        setSelecting(type)
        setCrop(undefined)
    }

    const updateMagnifier = (e) => {
        const img = imgRef.current
        if (!img) return

        const rect = img.getBoundingClientRect()
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const clientY = e.touches ? e.touches[0].clientY : e.clientY

        const x = clientX - rect.left
        const y = clientY - rect.top

        if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
           setDragPos(null)
           return
        }

        setDragPos({ x, y })
        drawZoomLens(x, y, rect.width, rect.height)
    }

    const drawZoomLens = (x, y, dispW, dispH) => {
        const canvas = zoomCanvasRef.current
        const img = imgRef.current
        if (!canvas || !img) return

        const ctx = canvas.getContext('2d')
        const zoomSize = 160 // Increased from 120 to show more area
        const zoomFactor = 0.8 // Slightly zoomed out to show even more context

        canvas.width = zoomSize
        canvas.height = zoomSize

        ctx.clearRect(0, 0, zoomSize, zoomSize)

        ctx.beginPath()
        ctx.arc(zoomSize / 2, zoomSize / 2, zoomSize / 2, 0, Math.PI * 2)
        ctx.clip()

        const natX = (x / dispW) * img.naturalWidth
        const natY = (y / dispH) * img.naturalHeight

        ctx.drawImage(
          img,
          natX - (zoomSize / 2) / zoomFactor,
          natY - (zoomSize / 2) / zoomFactor,
          zoomSize / zoomFactor,
          zoomSize / zoomFactor,
          0, 0, zoomSize, zoomSize
        )

        ctx.strokeStyle = 'rgba(74, 222, 128, 0.8)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(zoomSize / 2, 0)
        ctx.lineTo(zoomSize / 2, zoomSize)
        ctx.moveTo(0, zoomSize / 2)
        ctx.lineTo(zoomSize, zoomSize / 2)
        ctx.stroke()
    }

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget
        const w = width * 0.8
        const h = w / 1.58
        setCrop({
            unit: 'px',
            width: w,
            height: h,
            x: (width - w) / 2,
            y: (height - h) / 2
        })
    }

    const confirmSelection = () => {
        if (!crop || crop.width < 20 || crop.height < 20) {
            alert('Please select a larger area!')
            return
        }

        const canvas = document.createElement('canvas')
        const img = imgRef.current

        const scaleX = img.naturalWidth / img.width
        const scaleY = img.naturalHeight / img.height

        const sx = crop.x * scaleX
        const sy = crop.y * scaleY
        const sw = crop.width * scaleX
        const sh = crop.height * scaleY

        canvas.width = sw
        canvas.height = sh
        const ctx = canvas.getContext('2d')

        ctx.drawImage(img,
            sx, sy,
            sw, sh,
            0, 0, sw, sh
        )

        const result = canvas.toDataURL('image/jpeg', 0.95)

        if (selecting === 'front') {
            setFrontCard(result)
        } else {
            setBackCard(result)
        }
        setSelecting(null)
        setCrop(null)
    }

    const generateSheet = () => {
        if (!frontCard || !backCard) {
            alert('Please select both front and back!')
            return
        }

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

                const padding = 60
                const cardW = SHEET_W - padding * 2
                const cardH = (SHEET_H / 2) - padding * 1.5

                // Front card — top half, normal
                ctx.drawImage(frontImg, padding, padding, cardW, cardH)

                // Dotted fold line
                ctx.strokeStyle = '#94a3b8'
                ctx.lineWidth = 3
                ctx.setLineDash([12, 8])
                ctx.beginPath()
                ctx.moveTo(padding * 0.5, SHEET_H / 2)
                ctx.lineTo(SHEET_W - padding * 0.5, SHEET_H / 2)
                ctx.stroke()
                ctx.setLineDash([])

                // Fold label
                ctx.fillStyle = '#94a3b8'
                ctx.font = '22px Inter, sans-serif'
                ctx.textAlign = 'center'
                ctx.fillText('✂ fold here', SHEET_W / 2, SHEET_H / 2 - 10)

                // Back card — bottom half, FLIPPED 180°
                ctx.save()
                ctx.translate(SHEET_W / 2, SHEET_H * 3 / 4)
                ctx.rotate(Math.PI)
                ctx.drawImage(backImg, -cardW / 2, -cardH / 2, cardW, cardH)
                ctx.restore()

                // Second set — repeat both
                // (2 sets total — front top + back bottom, twice side by side)

                const result = canvas.toDataURL('image/jpeg', 0.97)
                setSheetImage(result)
                setStep(3)
                setIsProcessing(false)
            }
            backImg.src = backCard
        }
        frontImg.src = frontCard
    }

    const handleDownload = () => {
        const link = document.createElement('a')
        link.download = 'aadhaar-card-sheet.jpg'
        link.href = sheetImage
        link.click()
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Step 1 — Upload */}
            {step === 1 && (
                <div className="neo-card" style={{ padding: '28px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                        <div className="icon-badge" style={{ background: '#dcfce7' }}>🪪</div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
                                Upload Aadhaar
                            </h2>
                            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                                PDF or Image (JPG/PNG)
                            </p>
                        </div>
                    </div>

                    <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #d1d9e6, transparent)', marginBottom: '22px' }} />

                    {isProcessing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '30px' }}>
                            <div style={{
                                width: '40px', height: '40px',
                                border: '4px solid #dcfce7', borderTop: '4px solid #22c55e',
                                borderRadius: '50%', animation: 'spin 0.8s linear infinite'
                            }} />
                            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Processing PDF...</p>
                            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                        </div>
                    ) : (
                        <div
                            className="drop-zone"
                            onClick={() => document.getElementById('aadhaar-input').click()}
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => { e.preventDefault(); handleFileUpload(e.dataTransfer.files[0]) }}
                        >
                            <span style={{ fontSize: '2.5rem' }}>📄</span>
                            <p style={{ color: '#475569', fontWeight: 600, margin: 0 }}>
                                Drop your Aadhaar PDF or Image
                            </p>
                            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>
                                or click to browse
                            </p>
                            <p style={{ color: '#cbd5e1', fontSize: '0.72rem', margin: 0 }}>
                                PDF • JPG • PNG
                            </p>
                        </div>
                    )}

                    <input id="aadhaar-input" type="file" accept="image/*,.pdf"
                        style={{ display: 'none' }}
                        onChange={e => handleFileUpload(e.target.files[0])} />
                </div>
            )}

            {/* Step 2 — Select Front & Back */}
            {step === 2 && (
                <div className="neo-card" style={{ padding: '28px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                        <div className="icon-badge" style={{ background: '#fef9c3' }}>✂️</div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
                                Select Card Regions
                            </h2>
                            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                                Drag to select front then back of card
                            </p>
                        </div>
                    </div>

                    <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #d1d9e6, transparent)', marginBottom: '22px' }} />



                    {/* Status */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                        {['front', 'back'].map(type => (
                            <div key={type} style={{
                                flex: 1, padding: '10px', borderRadius: '12px', textAlign: 'center',
                                background: (type === 'front' ? frontCard : backCard)
                                    ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)'
                                    : '#e8edf5',
                                boxShadow: '3px 3px 8px #c5cad4, -3px -3px 8px #ffffff'
                            }}>
                                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>
                                    {(type === 'front' ? frontCard : backCard) ? '✅' : '⏳'} {type === 'front' ? 'Front' : 'Back'}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Selection canvas */}
                    {selecting && (
                        <div style={{ marginBottom: '14px' }}>
                            <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600, textAlign: 'center' }}>
                                Drag to perfectly frame the {selecting} of the card:
                            </p>
                            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', boxShadow: '4px 4px 10px #c5cad4', background: '#f8fafc' }}
                                onPointerDownCapture={updateMagnifier}
                                onPointerMoveCapture={(e) => { if (e.buttons > 0 || e.pointerType === 'touch') updateMagnifier(e) }}
                                onPointerUpCapture={() => setDragPos(null)}
                                onPointerCancelCapture={() => setDragPos(null)}
                                onTouchStartCapture={updateMagnifier}
                                onTouchMoveCapture={updateMagnifier}
                                onTouchEndCapture={() => setDragPos(null)}
                                onTouchCancelCapture={() => setDragPos(null)}
                            >
                                <ReactCrop 
                                    crop={crop} 
                                    onChange={c => setCrop(c)}
                                    style={{ maxWidth: '100%', maxHeight: '60vh' }}
                                >
                                    <img 
                                        ref={imgRef} 
                                        src={previewUrl} 
                                        onLoad={onImageLoad} 
                                        style={{ display: 'block', maxWidth: '100%', height: 'auto' }} 
                                        alt="Aadhaar to crop"
                                    />
                                </ReactCrop>
                                
                                {/* Magnifying Glass Overlay */}
                                <canvas
                                  ref={zoomCanvasRef}
                                  style={{
                                    position: 'absolute',
                                    top: '10px',
                                    left: '10px',
                                    width: '160px',
                                    height: '160px',
                                    borderRadius: '50%',
                                    border: '3px solid #ffffff',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                    display: dragPos ? 'block' : 'none',
                                    pointerEvents: 'none',
                                    zIndex: 10,
                                    background: 'white'
                                  }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button className="neo-btn-ghost" style={{ flex: 1 }}
                                    onClick={() => { setSelecting(null); setCrop(null) }}>
                                    Cancel
                                </button>
                                <button className="neo-btn" style={{ flex: 2 }} onClick={confirmSelection}>
                                    ✅ Confirm {selecting === 'front' ? 'Front' : 'Back'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Preview selected cards */}
                    {(frontCard || backCard) && (
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                            {frontCard && (
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <p style={{ margin: '0 0 6px', fontSize: '0.7rem', color: '#94a3b8' }}>FRONT</p>
                                    <img src={frontCard} alt="Front"
                                        style={{ width: '100%', borderRadius: '8px', boxShadow: '3px 3px 8px #c5cad4' }} />
                                </div>
                            )}
                            {backCard && (
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <p style={{ margin: '0 0 6px', fontSize: '0.7rem', color: '#94a3b8' }}>BACK (will be flipped)</p>
                                    <img src={backCard} alt="Back"
                                        style={{ width: '100%', borderRadius: '8px', boxShadow: '3px 3px 8px #c5cad4' }} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Select buttons */}
                    {!selecting && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button className="neo-btn-ghost"
                                onClick={() => initSelectionCanvas('front')}
                                style={{ width: '100%' }}>
                                {frontCard ? '🔄 Reselect Front' : '📋 Select Front of Card'}
                            </button>
                            <button className="neo-btn-ghost"
                                onClick={() => initSelectionCanvas('back')}
                                style={{ width: '100%' }}>
                                {backCard ? '🔄 Reselect Back' : '📋 Select Back of Card'}
                            </button>

                            {frontCard && backCard && (
                                <button className="neo-btn" onClick={generateSheet}
                                    style={{ marginTop: '6px' }}>
                                    {isProcessing ? '⏳ Generating...' : '🖨️ Generate Print Sheet →'}
                                </button>
                            )}
                        </div>
                    )}

                    <button className="neo-btn-ghost" style={{ marginTop: '14px', width: '100%' }}
                        onClick={() => setStep(1)}>
                        ← Back
                    </button>
                </div>
            )}

            {/* Step 3 — Download */}
            {step === 3 && sheetImage && (
                <div className="neo-card" style={{ padding: '28px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                        <div className="icon-badge" style={{ background: '#dcfce7' }}>🖨️</div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
                                Ready to Print!
                            </h2>
                            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                                Front + Back (flipped) on 4×6 sheet
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

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {[
                                { label: 'Sheet', value: 'A4 / 4×6' },
                                { label: 'Layout', value: 'Front + Back' },
                                { label: 'Fold', value: 'Middle line' },
                            ].map(s => (
                                <div key={s.label} style={{
                                    padding: '8px 16px', borderRadius: '12px',
                                    background: '#e8edf5',
                                    boxShadow: '3px 3px 8px #c5cad4, -3px -3px 8px #ffffff',
                                    textAlign: 'center'
                                }}>
                                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8' }}>{s.label}</p>
                                    <p style={{ margin: '2px 0 0', fontSize: '0.82rem', fontWeight: 700, color: '#3b82f6' }}>{s.value}</p>
                                </div>
                            ))}
                        </div>

                        <button className="neo-btn neo-btn-green" style={{
                            width: '100%', padding: '16px',
                            background: 'linear-gradient(135deg, #22c55e, #15803d)',
                            boxShadow: '4px 4px 12px #86efac'
                        }} onClick={handleDownload}>
                            ⬇️ Download Print Sheet
                        </button>

                        <button className="neo-btn-ghost" style={{ width: '100%' }} onClick={onBack}>
                            🔄 Start Over
                        </button>
                    </div>
                </div>
            )}

            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    )
}

export default AadharFlow