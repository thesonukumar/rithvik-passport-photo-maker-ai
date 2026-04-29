const FEATURES = [
  {
    id: 'passport',
    icon: '📘',
    title: 'Passport Photo',
    desc: 'Remove BG • Auto Crop\n8 Photos • 4×6 Sheet',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    glow: '#60a5fa',
  },
  {
    id: 'aadhaar',
    icon: '🪪',
    title: 'Aadhaar Card',
    desc: 'PDF or Image\nFront + Back • 4×6 Sheet',
    gradient: 'linear-gradient(135deg, #4ade80, #22c55e)',
    glow: '#86efac',
  },
  {
    id: 'single-photo',
    icon: '🖼️',
    title: 'Single Photo',
    desc: '1 photo into 4×6 sheet',
    gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
    glow: '#f472b6',
  },
  {
    id: 'aadhaar-a4',
    icon: '🖨️',
    title: 'Print Aadhaar',
    desc: 'Fit Aadhaar on A4\nReady to Print',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    glow: '#fcd34d',
  },
  {
    id: 'biodata',
    icon: '📝',
    title: 'Bio Data Maker',
    desc: 'Create Professional\nBio Data Instantly',
    gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)',
    glow: '#c4b5fd',
  },
  {
    id: 'coming-soon',
    icon: '🚀',
    title: 'Coming Soon',
    desc: 'More tools are\non the way!',
    gradient: 'linear-gradient(135deg, #94a3b8, #64748b)',
    glow: '#cbd5e1',
    disabled: true,
  },
]

function Home({ onSelectMode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '10px 0' }}>

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>
          What would you like to create?
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
          Choose a mode to get started
        </p>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px',
        width: '100%',
      }}>
        {FEATURES.map((f, index) => (
          <button
            key={f.id}
            onClick={() => {
              if (!f.disabled) onSelectMode(f.id)
            }}
            style={{
              position: 'relative',
              padding: '24px 12px 20px',
              background: '#e8edf5',
              borderRadius: '22px',
              boxShadow: '6px 6px 14px #c5cad4, -6px -6px 14px #ffffff',
              border: 'none', 
              cursor: f.disabled ? 'not-allowed' : 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '12px',
              transition: 'all 0.25s ease',
              opacity: f.disabled ? 0.7 : 1,
            }}
            onMouseEnter={e => {
              if (f.disabled) return;
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = `8px 8px 20px #c0c5cf, -8px -8px 20px #ffffff, 0 4px 20px ${f.glow}50`
            }}
            onMouseLeave={e => {
              if (f.disabled) return;
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '6px 6px 14px #c5cad4, -6px -6px 14px #ffffff'
            }}
          >
            {/* Number Badge */}
            <div style={{
              position: 'absolute',
              top: '12px', left: '12px',
              width: '24px', height: '24px',
              borderRadius: '50%',
              background: 'rgba(148, 163, 184, 0.2)',
              color: '#64748b',
              fontSize: '0.7rem',
              fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {index + 1}
            </div>

            {/* Icon */}
            <div style={{
              width: '58px', height: '58px', borderRadius: '18px',
              background: f.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem',
              boxShadow: `3px 3px 10px ${f.glow}, -2px -2px 6px #ffffff60`,
            }}>{f.icon}</div>

            {/* Text */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: 800, color: '#1e293b', fontSize: '0.92rem' }}>
                {f.title}
              </p>
              <p style={{
                margin: '5px 0 0', fontSize: '0.68rem', color: '#64748b',
                lineHeight: 1.5, whiteSpace: 'pre-line',
              }}>
                {f.desc}
              </p>
            </div>

            {/* CTA pill */}
            <div style={{
              padding: '6px 18px', borderRadius: '18px',
              background: f.disabled ? 'transparent' : f.gradient,
              color: f.disabled ? '#94a3b8' : 'white', 
              fontSize: '0.72rem', fontWeight: 700,
              boxShadow: f.disabled ? 'none' : `2px 2px 6px ${f.glow}`,
              letterSpacing: '0.3px',
              marginTop: '4px'
            }}>
              {f.disabled ? 'Soon' : 'Start →'}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default Home