import { useState, useRef } from 'react'

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
    const [selBox, setSelBox] = useState(null)
    const [dragStart, setDragStart] = useState(null)
    const [imgScale, setImgScale] = useState(1)

    const canvasRef = useRef(null)
    const selCanvasRef = useRef(null)
    const imgRef = useRef(null)

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
        setSelBox(null)

        setTimeout(() => {
            const canvas = selCanvasRef.current
            if (!canvas || !imgRef.current) return
            const img = imgRef.current
            const maxW = 340
            const scale = maxW / img.naturalWidth
            setImgScale(scale)
            canvas.width = maxW
            canvas.height = img.naturalHeight * scale
            drawSelCanvas(null, scale)
        }, 100)
    }

    const drawSelCanvas = (box, scale) => {
        const canvas = selCanvasRef.current
        if (!canvas || !imgRef.current) return
        const ctx = canvas.getContext('2d')
        ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height)

        if (box) {
            ctx.fillStyle = 'rgba(59,130,246,0.15)'
            ctx.fillRect(box.x, box.y, box.w, box.h)
            ctx.strokeStyle = '#3b82f6'
            ctx.lineWidth = 2
            ctx.setLineDash([6, 3])
            ctx.strokeRect(box.x, box.y, box.w, box.h)
            ctx.setLineDash([])

            // Label
            ctx.fillStyle = '#3b82f6'
            ctx.font = 'bold 13px Inter, sans-serif'
            ctx.fillText(selecting === 'front' ? '▶ FRONT' : '▶ BACK', box.x + 6, box.y + 18)
        }
    }

    const getPos = (e, canvas) => {
        const rect = canvas.getBoundingClientRect()
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const clientY = e.touches ? e.touches[0].clientY : e.clientY
        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height)
        }
    }

    const handleSelStart = (e) => {
        e.preventDefault()
        const pos = getPos(e, selCanvasRef.current)
        setDragStart(pos)
        setSelBox({ x: pos.x, y: pos.y, w: 0, h: 0 })
    }

    const handleSelMove = (e) => {
        e.preventDefault()
        if (!dragStart) return
        const pos = getPos(e, selCanvasRef.current)
        const box = {
            x: Math.min(dragStart.x, pos.x),
            y: Math.min(dragStart.y, pos.y),
            w: Math.abs(pos.x - dragStart.x),
            h: Math.abs(pos.y - dragStart.y)
        }
        setSelBox(box)
        drawSelCanvas(box, imgScale)
    }

    const handleSelEnd = () => setDragStart(null)

    const confirmSelection = () => {
        if (!selBox || selBox.w < 20 || selBox.h < 20) {
            alert('Please select a larger area!')
            return
        }

        const canvas = document.createElement('canvas')
        const img = imgRef.current
        canvas.width = selBox.w / imgScale
        canvas.height = selBox.h / imgScale
        const ctx = canvas.getContext('2d')

        ctx.drawImage(img,
            selBox.x / imgScale, selBox.y / imgScale,
            canvas.width, canvas.height,
            0, 0, canvas.width, canvas.height
        )

        const result = canvas.toDataURL('image/jpeg', 0.95)

        if (selecting === 'front') {
            setFrontCard(result)
        } else {
            setBackCard(result)
        }
        setSelecting(null)
        setSelBox(null)
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

                    {/* Hidden reference image */}
                    <img ref={imgRef} src={previewUrl} alt="Aadhaar"
                        style={{ display: 'none' }} />

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
                                Drag to select the {selecting} of the card:
                            </p>
                            <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '4px 4px 10px #c5cad4' }}>
                                <canvas ref={selCanvasRef}
                                    onMouseDown={handleSelStart}
                                    onMouseMove={handleSelMove}
                                    onMouseUp={handleSelEnd}
                                    onTouchStart={handleSelStart}
                                    onTouchMove={handleSelMove}
                                    onTouchEnd={handleSelEnd}
                                    style={{ display: 'block', maxWidth: '100%', cursor: 'crosshair', touchAction: 'none' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button className="neo-btn-ghost" style={{ flex: 1 }}
                                    onClick={() => { setSelecting(null); setSelBox(null) }}>
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