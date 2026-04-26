import { useState, useRef } from 'react'

const INITIAL_FORM = {
  name: '',
  birthdate: '',
  birthTime: '',
  birthPlace: '',
  religion: '',
  caste: '',
  height: '',
  bloodGroup: '',
  complexion: '',
  education: '',
  occupation: '',
  fatherName: '',
  fatherOccupation: '',
  motherName: '',
  sisters: '',
  brothers: '',
  contact: '',
  address: '',
  photo: null,
}

const FIELD_GROUPS = [
  {
    label: 'Personal Information',
    icon: '👤',
    fields: [
      { key: 'name',        label: 'Full Name',         type: 'text',   placeholder: 'e.g. Rithvik Kumar' },
      { key: 'birthdate',   label: 'Date of Birth',     type: 'date' },
      { key: 'birthTime',   label: 'Birth Time',        type: 'text',   placeholder: 'e.g. 06:52 AM' },
      { key: 'birthPlace',  label: 'Birth Place',       type: 'text',   placeholder: 'e.g. Mumbai' },
      { key: 'religion',    label: 'Religion',          type: 'text',   placeholder: 'e.g. Hindu' },
      { key: 'caste',       label: 'Caste',             type: 'text',   placeholder: 'e.g. Maratha' },
      { key: 'height',      label: 'Height',            type: 'text',   placeholder: 'e.g. 5 ft. 8 in.' },
      { key: 'bloodGroup',  label: 'Blood Group',       type: 'text',   placeholder: 'e.g. B+' },
      { key: 'complexion',  label: 'Complexion',        type: 'text',   placeholder: 'e.g. Wheatish' },
      { key: 'education',   label: 'Education',         type: 'text',   placeholder: 'e.g. Bachelor of Computer Applications' },
      { key: 'occupation',  label: 'Occupation',        type: 'text',   placeholder: 'e.g. Test Engineer – TCS' },
    ],
  },
  {
    label: 'Family Information',
    icon: '👨‍👩‍👦',
    fields: [
      { key: 'fatherName',       label: "Father's Name",       type: 'text',     placeholder: 'e.g. Kumar Swadip Dhaiya' },
      { key: 'fatherOccupation', label: "Father's Occupation", type: 'text',     placeholder: 'e.g. Farmer' },
      { key: 'motherName',       label: "Mother's Name",       type: 'text',     placeholder: 'e.g. Swapnali Kumar Dhaiya' },
      { key: 'sisters',          label: 'Sisters',             type: 'text',     placeholder: 'e.g. 2/1 Married' },
      { key: 'brothers',         label: 'Brothers',            type: 'text',     placeholder: 'e.g. 1/1 Married' },
      { key: 'contact',          label: 'Contact No.',         type: 'tel',      placeholder: 'e.g. +91 98765 43210' },
      { key: 'address',          label: 'Address',             type: 'textarea', placeholder: 'e.g. 751, Astra Apartment, Pune' },
    ],
  },
]

// ─── Format date nicely ────────────────────────────────────────────────────────
function formatDate(str) {
  if (!str) return ''
  const d = new Date(str)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

// ─── A4 Bio Data Preview ───────────────────────────────────────────────────────
function BiodataPreview({ data }) {
  const personalRows = [
    ['Name',        data.name],
    ['Birthdate',   formatDate(data.birthdate)],
    ['Birth Time',  data.birthTime],
    ['Birth Place', data.birthPlace],
    ['Religion',    data.religion],
    ['Caste',       data.caste],
    ['Height',      data.height],
    ['Blood Group', data.bloodGroup],
    ['Complexion',  data.complexion],
    ['Education',   data.education],
    ['Occupation',  data.occupation],
  ].filter(([, v]) => v && v.trim())

  const familyRows = [
    ['Father Name',  data.fatherName],
    ['Occupation',   data.fatherOccupation],
    ['Mother Name',  data.motherName],
    ['Sisters',      data.sisters],
    ['Brothers',     data.brothers],
    ['Contact No.',  data.contact],
    ['Address',      data.address],
  ].filter(([, v]) => v && v.trim())

  const ROW = {
    display: 'grid',
    gridTemplateColumns: '130px 18px 1fr',
    padding: '7px 12px',
    fontSize: '13px',
    lineHeight: '1.6',
    fontFamily: "'Times New Roman', Georgia, serif",
  }

  return (
    <div id="biodata-sheet" style={{
      width: '210mm',
      minHeight: '297mm',
      background: '#faf7f2',
      margin: '0 auto',
      fontFamily: "'Times New Roman', Georgia, serif",
      color: '#1a1a1a',
      position: 'relative',
      boxShadow: '0 12px 50px rgba(0,0,0,0.25)',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>

      {/* ── Top accent bar ── */}
      <div style={{ height: '10px', background: '#1a1a1a' }} />

      <div style={{ padding: '28px 40px 36px' }}>

        {/* ── Main Title ── */}
        <div style={{ textAlign: 'center', marginBottom: '2px' }}>
          <h1 style={{
            fontSize: '26px', fontWeight: 900, letterSpacing: '8px',
            textTransform: 'uppercase', margin: 0, color: '#111',
            fontFamily: "'Times New Roman', Georgia, serif",
          }}>
            Biodata
          </h1>
          {/* Double rule under title */}
          <div style={{ margin: '6px auto 0', width: '180px' }}>
            <div style={{ height: '2px', background: '#1a1a1a' }} />
            <div style={{ height: '3px' }} />
            <div style={{ height: '1px', background: '#1a1a1a' }} />
          </div>
        </div>

        {/* ── PERSONAL INFORMATION ── */}
        <div style={{ textAlign: 'center', margin: '16px 0 12px' }}>
          <h2 style={{
            fontSize: '14px', fontWeight: 800, letterSpacing: '3px',
            textTransform: 'uppercase', margin: 0, color: '#111',
            display: 'inline-block',
            borderBottom: '2px solid #111',
            paddingBottom: '3px',
            fontFamily: "'Times New Roman', Georgia, serif",
          }}>
            Personal Information
          </h2>
        </div>

        {/* ── Personal rows + Photo ── */}
        <div style={{ display: 'flex', gap: '24px' }}>

          {/* Rows */}
          <div style={{ flex: 1, border: '1px solid #ccc' }}>
            {personalRows.map(([label, value], i) => (
              <div key={label} style={{
                ...ROW,
                background: i % 2 === 0 ? '#faf7f2' : '#f0ece3',
                borderBottom: i < personalRows.length - 1 ? '1px solid #ddd' : 'none',
              }}>
                <span style={{ fontWeight: 700, color: '#222' }}>{label}</span>
                <span style={{ fontWeight: 900, color: '#444', textAlign: 'center' }}>:</span>
                <span style={{ color: '#1a1a1a' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Photo */}
          <div style={{ flexShrink: 0, paddingTop: '2px' }}>
            <div style={{
              width: '108px', height: '136px',
              border: '2px solid #333',
              overflow: 'hidden',
              background: '#d6d0c4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {data.photo
                ? <img src={data.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <svg width="58" height="72" viewBox="0 0 58 72" fill="none">
                    <circle cx="29" cy="22" r="14" fill="#666" />
                    <ellipse cx="29" cy="60" rx="22" ry="14" fill="#666" />
                  </svg>
              }
            </div>
            <p style={{
              textAlign: 'center', fontSize: '10px', margin: '4px 0 0',
              color: '#666', fontStyle: 'italic',
            }}>Photo</p>
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ margin: '18px 0 0' }}>
          <div style={{ height: '2px', background: '#1a1a1a' }} />
          <div style={{ height: '3px' }} />
          <div style={{ height: '1px', background: '#1a1a1a' }} />
        </div>

        {/* ── FAMILY INFORMATION ── */}
        <div style={{ textAlign: 'center', margin: '14px 0 12px' }}>
          <h2 style={{
            fontSize: '14px', fontWeight: 800, letterSpacing: '3px',
            textTransform: 'uppercase', margin: 0, color: '#111',
            display: 'inline-block',
            borderBottom: '2px solid #111',
            paddingBottom: '3px',
            fontFamily: "'Times New Roman', Georgia, serif",
          }}>
            Family Information
          </h2>
        </div>

        <div style={{ border: '1px solid #ccc' }}>
          {familyRows.map(([label, value], i) => (
            <div key={label} style={{
              ...ROW,
              background: i % 2 === 0 ? '#faf7f2' : '#f0ece3',
              borderBottom: i < familyRows.length - 1 ? '1px solid #ddd' : 'none',
            }}>
              <span style={{ fontWeight: 700, color: '#222' }}>{label}</span>
              <span style={{ fontWeight: 900, color: '#444', textAlign: 'center' }}>:</span>
              <span style={{ color: '#1a1a1a' }}>{value}</span>
            </div>
          ))}
        </div>

      </div>

      {/* ── Bottom accent bar ── */}
      <div style={{ height: '10px', background: '#1a1a1a', position: 'absolute', bottom: 0, left: 0, right: 0 }} />
    </div>
  )
}

// ─── Main Flow ─────────────────────────────────────────────────────────────────
function BioDataFlow({ onBack }) {
  const [step, setStep] = useState(1) // 1: form, 2: preview
  const [form, setForm] = useState(INITIAL_FORM)
  const photoInputRef = useRef(null)

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handlePhotoUpload = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => handleChange('photo', e.target.result)
    reader.readAsDataURL(file)
  }

  const handlePrint = () => window.print()

  // ── STEP 2: Preview ──
  if (step === 2) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── Action bar — hidden on print ── */}
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {/* Info strip */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '14px 18px',
            background: '#e8edf5',
            borderRadius: '16px',
            boxShadow: '6px 6px 14px #c5cad4, -6px -6px 14px #ffffff',
          }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.3rem', boxShadow: '2px 2px 8px #c4b5fd',
            }}>📄</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>
                {form.name || 'Bio Data'} — Preview
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                Looks good? Hit print to save as PDF
              </p>
            </div>
            {/* Status pill */}
            <div style={{
              padding: '4px 10px', borderRadius: '20px',
              background: 'linear-gradient(135deg, #22c55e22, #16a34a22)',
              border: '1px solid #86efac', fontSize: '0.68rem',
              fontWeight: 700, color: '#15803d',
            }}>
              ✓ Ready
            </div>
          </div>

          {/* Print button */}
          <button
            onClick={handlePrint}
            style={{
              width: '100%', padding: '15px', border: 'none', borderRadius: '14px', cursor: 'pointer',
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              color: 'white', fontWeight: 700, fontSize: '0.97rem',
              boxShadow: '4px 4px 14px #c4b5fd60, -2px -2px 8px #ffffff30',
              transition: 'all 0.2s ease', letterSpacing: '0.3px',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '6px 6px 20px #c4b5fd80' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '4px 4px 14px #c4b5fd60, -2px -2px 8px #ffffff30' }}
          >
            🖨️ &nbsp;Print / Save as PDF
          </button>

          {/* Secondary actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="neo-btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>
              ✏️ Edit
            </button>
            <button className="neo-btn-ghost" style={{ flex: 1 }} onClick={onBack}>
              🏠 Home
            </button>
          </div>
        </div>

        {/* ── Bio data sheet (scrollable on screen) ── */}
        <div style={{ overflowX: 'auto', borderRadius: '8px' }}>
          <BiodataPreview data={form} />
        </div>
      </div>
    )
  }


  // ── STEP 1: Form ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div className="neo-card" style={{ padding: '22px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
            background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', boxShadow: '3px 3px 10px #c4b5fd',
          }}>📝</div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>Bio Data Maker</h2>
            <p style={{ margin: '3px 0 0', fontSize: '0.74rem', color: '#94a3b8' }}>Fill in your details to generate a print-ready bio data</p>
          </div>
        </div>
      </div>

      {/* Photo upload */}
      <div className="neo-card" style={{ padding: '20px' }}>
        <p style={{ margin: '0 0 14px', fontWeight: 700, fontSize: '0.88rem', color: '#4c1d95' }}>
          📸 Profile Photo <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Optional)</span>
        </p>
        <div
          onClick={() => photoInputRef.current.click()}
          style={{
            display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer',
            padding: '14px 16px', borderRadius: '14px',
            background: '#e8edf5',
            boxShadow: 'inset 4px 4px 10px #c5cad4, inset -4px -4px 10px #ffffff',
            border: form.photo ? '2px solid #a855f7' : '2px dashed #cbd5e1',
            transition: 'border 0.2s',
          }}
        >
          <div style={{
            width: '64px', height: '76px', borderRadius: '10px', flexShrink: 0,
            overflow: 'hidden', background: '#ddd6fe',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #c4b5fd',
          }}>
            {form.photo
              ? <img src={form.photo} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '1.8rem' }}>👤</span>
            }
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>
              {form.photo ? '✅ Photo selected' : 'Tap to upload photo'}
            </p>
            <p style={{ margin: '3px 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>JPG, PNG supported</p>
          </div>
        </div>
        <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => handlePhotoUpload(e.target.files[0])} />
      </div>

      {/* Field groups */}
      {FIELD_GROUPS.map(group => (
        <div key={group.label} className="neo-card" style={{ padding: '20px' }}>
          <p style={{ margin: '0 0 14px', fontWeight: 700, fontSize: '0.88rem', color: '#4c1d95' }}>
            {group.icon} {group.label}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {group.fields.map(field => (
              <div key={field.key}>
                <label style={{
                  display: 'block', marginBottom: '6px',
                  fontSize: '0.76rem', fontWeight: 600, color: '#64748b',
                }}>
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    rows={2}
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={e => handleChange(field.key, e.target.value)}
                    style={inputStyle}
                  />
                ) : (
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={e => handleChange(field.key, e.target.value)}
                    style={inputStyle}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Generate button */}
      <button
        onClick={() => {
          if (!form.name.trim()) { alert('Please enter Full Name to continue.'); return }
          setStep(2)
        }}
        style={{
          width: '100%', padding: '16px', border: 'none', borderRadius: '14px', cursor: 'pointer',
          background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
          color: 'white', fontWeight: 700, fontSize: '1rem',
          boxShadow: '4px 4px 12px #c4b5fd, -2px -2px 8px #ffffff30',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        ✨ Generate Bio Data →
      </button>

      <button className="neo-btn-ghost" style={{ width: '100%' }} onClick={onBack}>
        ← Back to Home
      </button>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '11px 14px',
  borderRadius: '12px', border: 'none', outline: 'none',
  background: '#e8edf5',
  boxShadow: 'inset 3px 3px 8px #c5cad4, inset -3px -3px 8px #ffffff',
  fontSize: '0.84rem', color: '#1e293b', fontFamily: "'Inter', sans-serif",
  resize: 'vertical',
  boxSizing: 'border-box',
}

export default BioDataFlow
