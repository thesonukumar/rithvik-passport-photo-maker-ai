import { useState, useRef } from 'react'

function Uploader({ onImageUpload }) {
  const [preview, setPreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG or PNG)')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
      onImageUpload(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

      {!preview ? (
        <div
          className={`drop-zone ${isDragging ? 'dragging' : ''}`}
          style={{ width: '100%' }}
          onClick={() => inputRef.current.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
        >
          <span style={{ fontSize: '3rem' }}>🖼️</span>
          <p style={{ color: '#475569', fontWeight: 600, fontSize: '1rem', margin: 0 }}>
            Drag & Drop your photo
          </p>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
            or click to browse
          </p>
          <p style={{ color: '#cbd5e1', fontSize: '0.75rem', margin: 0 }}>
            JPG • PNG supported
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>
          {/* Preview box — fixed size */}
          <div className="neo-inset" style={{
            width: '100%',
            height: '260px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            padding: '10px'
          }}>
            <img
              src={preview}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '240px',
                objectFit: 'contain',
                borderRadius: '12px',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <button
              className="neo-btn-ghost"
              style={{ flex: 1 }}
              onClick={() => { setPreview(null); onImageUpload(null) }}
            >
              🔄 Change Photo
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files[0])}
        style={{ display: 'none' }}
      />
    </div>
  )
}

export default Uploader