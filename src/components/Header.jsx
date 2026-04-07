import { formatCurrency } from '../utils/calculations'

const FILING_LABELS = {
  single: 'Single',
  married: 'Married Joint',
  hoh: 'Head of Household',
}

const T = {
  bg: '#1a1d27',
  border: '#2a2d3a',
  muted: '#6b7280',
  text: '#e8e8e8',
  green: '#4ade80',
  red: '#f87171',
  inputBg: '#12151e',
}

export default function Header({ lastSaved, onExport, selectedState, filingStatus, taxYear, remaining }) {
  const fmtTime = (d) => {
    if (!d) return '--:--'
    const date = typeof d === 'string' ? new Date(d) : d
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const isPositive = remaining >= 0
  const surplusColor = isPositive ? T.green : T.red

  return (
    <header
      style={{ background: T.bg, borderBottom: `1px solid ${T.border}`, position: 'sticky', top: 0, zIndex: 50 }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

        {/* Left: title + subtitle */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
            <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: '0.06em' }}>
              FAMILY BUDGET PLANNER
            </span>
          </div>
          <p style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: 10, color: T.muted, marginTop: 2, letterSpacing: '0.04em' }}>
            {selectedState || 'Select State'} · {FILING_LABELS[filingStatus] || filingStatus} · {taxYear || 2025} TAX YEAR
          </p>
        </div>

        {/* Right: save time, surplus badge, export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

          {/* Save time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }} className="hidden sm:flex">
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.green, display: 'inline-block', boxShadow: `0 0 6px ${T.green}` }} />
            <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: 10, color: T.muted }}>
              {fmtTime(lastSaved)}
            </span>
          </div>

          {/* Surplus badge */}
          <div style={{
            background: isPositive ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
            border: `1px solid ${isPositive ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
            borderRadius: 8,
            padding: '5px 12px',
            textAlign: 'right',
          }}>
            <p style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: 9, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 1 }}>
              {isPositive ? 'Surplus' : 'Deficit'} / mo
            </p>
            <p style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: 15, fontWeight: 700, color: surplusColor, lineHeight: 1 }}>
              {isPositive ? '+' : ''}{formatCurrency(remaining)}
            </p>
          </div>

          {/* Export */}
          <button
            onClick={onExport}
            style={{
              background: T.inputBg,
              border: `1px solid ${T.border}`,
              color: T.muted,
              borderRadius: 8,
              padding: '7px 12px',
              fontSize: 11,
              fontFamily: 'ui-monospace, SFMono-Regular, monospace',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              letterSpacing: '0.04em',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#60a5fa'; e.currentTarget.style.color = '#60a5fa' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            EXPORT CSV
          </button>
        </div>
      </div>
    </header>
  )
}
