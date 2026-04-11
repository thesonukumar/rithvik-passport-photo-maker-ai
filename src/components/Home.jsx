function Home({ onSelectMode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '10px 0' }}>

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
          What would you like to create?
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
          Choose a mode to get started
        </p>
      </div>

      <div style={{ display: 'flex', gap: '16px', width: '100%' }}>

        {/* Passport Mode */}
        <button
          onClick={() => onSelectMode('passport')}
          style={{
            flex: 1, padding: '28px 16px',
            background: '#e8edf5',
            borderRadius: '20px',
            boxShadow: '6px 6px 14px #c5cad4, -6px -6px 14px #ffffff',
            border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '12px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0px)'}
        >
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem',
            boxShadow: '3px 3px 8px #c5cad4, -3px -3px 8px #ffffff'
          }}>📘</div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
              Passport Photo
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4 }}>
              Remove BG • Crop • 8 photos on 4×6 sheet
            </p>
          </div>
          <div style={{
            padding: '6px 16px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white', fontSize: '0.75rem', fontWeight: 600
          }}>
            Start →
          </div>
        </button>

        {/* Aadhaar Mode */}
        <button
          onClick={() => onSelectMode('aadhaar')}
          style={{
            flex: 1, padding: '28px 16px',
            background: '#e8edf5',
            borderRadius: '20px',
            boxShadow: '6px 6px 14px #c5cad4, -6px -6px 14px #ffffff',
            border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '12px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0px)'}
        >
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem',
            boxShadow: '3px 3px 8px #c5cad4, -3px -3px 8px #ffffff'
          }}>🪪</div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
              Aadhaar Card
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4 }}>
              Upload PDF/Image • Print ready 4×6 sheet
            </p>
          </div>
          <div style={{
            padding: '6px 16px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #22c55e, #15803d)',
            color: 'white', fontSize: '0.75rem', fontWeight: 600
          }}>
            Start →
          </div>
        </button>
      </div>

      {/* Features */}
      <div style={{
        width: '100%', padding: '16px 20px',
        background: '#e8edf5',
        borderRadius: '16px',
        boxShadow: 'inset 3px 3px 8px #c5cad4, inset -3px -3px 8px #ffffff'
      }}>
        <p style={{ margin: '0 0 10px', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>
          ✨ Features
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            '🤖 AI Background Removal',
            '✂️ Auto + Manual Cropping',
            '🎨 Custom Color Picker',
            '👤 Auto Face Centering',
            '📸 Studio Enhancement',
            '🖨️ Print Ready Output',
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: '#475569' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home