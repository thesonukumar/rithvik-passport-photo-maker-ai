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

      <div style={{ display: 'flex', gap: '16px', width: '100%' }}>

        {/* Passport Mode */}
        <button
          onClick={() => onSelectMode('passport')}
          style={{
            flex: 1, padding: '36px 16px',
            background: '#e8edf5',
            borderRadius: '24px',
            boxShadow: '8px 8px 16px #c5cad4, -8px -8px 16px #ffffff',
            border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '16px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0px)'}
        >
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.2rem',
            boxShadow: '4px 4px 12px #93c5fd, -2px -2px 8px #ffffff60'
          }}>📘</div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 800, color: '#1e293b', fontSize: '1.05rem' }}>
              Passport Photo
            </p>
            <p style={{ margin: '6px 0 0', fontSize: '0.73rem', color: '#64748b', lineHeight: 1.6 }}>
              Remove BG<br />
              Auto Crop<br />
              8 Photos • 4×6 Sheet
            </p>
          </div>

          <div style={{
            padding: '8px 20px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white', fontSize: '0.78rem', fontWeight: 700,
            boxShadow: '3px 3px 8px #93c5fd',
            letterSpacing: '0.3px'
          }}>
            Start →
          </div>
        </button>

        {/* Aadhaar Mode */}
        <button
          onClick={() => onSelectMode('aadhaar')}
          style={{
            flex: 1, padding: '36px 16px',
            background: '#e8edf5',
            borderRadius: '24px',
            boxShadow: '8px 8px 16px #c5cad4, -8px -8px 16px #ffffff',
            border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '16px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0px)'}
        >
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #22c55e, #15803d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.2rem',
            boxShadow: '4px 4px 12px #86efac, -2px -2px 8px #ffffff60'
          }}>🪪</div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 800, color: '#1e293b', fontSize: '1.05rem' }}>
              Aadhaar Card
            </p>
            <p style={{ margin: '6px 0 0', fontSize: '0.73rem', color: '#64748b', lineHeight: 1.6 }}>
              PDF or Image<br />
              Front + Back<br />
              Fold Ready • 4×6 Sheet
            </p>
          </div>

          <div style={{
            padding: '8px 20px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #22c55e, #15803d)',
            color: 'white', fontSize: '0.78rem', fontWeight: 700,
            boxShadow: '3px 3px 8px #86efac',
            letterSpacing: '0.3px'
          }}>
            Start →
          </div>
        </button>
      </div>
    </div>
  )
}

export default Home