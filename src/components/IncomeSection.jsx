import { toMonthly, formatCurrency } from '../utils/calculations'

const T = {
  bg: '#1a1d27',
  border: '#2a2d3a',
  divider: '#1e2130',
  inputBg: '#12151e',
  text: '#e8e8e8',
  muted: '#6b7280',
  blue: '#60a5fa',
  red: '#f87171',
  mono: 'ui-monospace, SFMono-Regular, monospace',
}

const inputStyle = {
  background: T.inputBg,
  border: `1px solid ${T.border}`,
  color: T.text,
  borderRadius: 8,
  padding: '5px 8px',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  fontFamily: 'system-ui, sans-serif',
}

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
}

const FREQ_LABELS = {
  weekly: 'Weekly',
  biweekly: 'Bi-Weekly',
  monthly: 'Monthly',
  annual: 'Annual',
}

let nextId = 100

export default function IncomeSection({ earners, onChange }) {
  const addEarner = () => {
    onChange([...earners, { id: ++nextId, name: '', gross: '', frequency: 'monthly' }])
  }

  const removeEarner = (id) => {
    onChange(earners.filter(e => e.id !== id))
  }

  const updateEarner = (id, field, value) => {
    onChange(earners.map(e => e.id === id ? { ...e, [field]: value } : e))
  }

  const totalMonthly = earners.reduce((sum, e) => sum + toMonthly(e.gross, e.frequency), 0)

  return (
    <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${T.divider}` }}>
        <div>
          <p style={{ fontFamily: T.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.muted, marginBottom: 3 }}>Income</p>
          <p style={{ fontSize: 11, color: '#4b5563' }}>Auto-converted to monthly</p>
        </div>
        <button
          onClick={addEarner}
          style={{
            background: 'rgba(96,165,250,0.1)',
            border: '1px solid rgba(96,165,250,0.25)',
            color: T.blue,
            borderRadius: 8,
            padding: '5px 12px',
            fontSize: 11,
            fontFamily: T.mono,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            letterSpacing: '0.04em',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(96,165,250,0.18)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(96,165,250,0.1)'}
        >
          + ADD EARNER
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.divider}` }}>
              {['Name', 'Gross', 'Frequency', 'Monthly', 'Annual', ''].map((h, i) => (
                <th key={i} style={{
                  fontFamily: T.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: T.muted, paddingBottom: 8, textAlign: i >= 3 ? 'right' : 'left',
                  paddingRight: i < 5 ? 12 : 0,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {earners.map(earner => {
              const monthly = toMonthly(earner.gross, earner.frequency)
              return (
                <tr key={earner.id} style={{ borderBottom: `1px solid ${T.divider}` }}
                  onMouseEnter={e => e.currentTarget.style.background = '#12151e'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '7px 12px 7px 0' }}>
                    <input
                      type="text"
                      value={earner.name}
                      onChange={e => updateEarner(earner.id, 'name', e.target.value)}
                      placeholder="e.g. John"
                      style={{ ...inputStyle, minWidth: 90 }}
                      onFocus={e => e.target.style.borderColor = T.blue}
                      onBlur={e => e.target.style.borderColor = T.border}
                    />
                  </td>
                  <td style={{ padding: '7px 12px 7px 0' }}>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: T.muted, fontSize: 13, pointerEvents: 'none' }}>$</span>
                      <input
                        type="number"
                        value={earner.gross}
                        onChange={e => updateEarner(earner.id, 'gross', e.target.value)}
                        placeholder="0"
                        min="0"
                        style={{ ...inputStyle, paddingLeft: 20, minWidth: 110, fontFamily: T.mono }}
                        onFocus={e => e.target.style.borderColor = T.blue}
                        onBlur={e => e.target.style.borderColor = T.border}
                      />
                    </div>
                  </td>
                  <td style={{ padding: '7px 12px 7px 0' }}>
                    <select
                      value={earner.frequency}
                      onChange={e => updateEarner(earner.id, 'frequency', e.target.value)}
                      style={{ ...selectStyle, minWidth: 110 }}
                      onFocus={e => e.target.style.borderColor = T.blue}
                      onBlur={e => e.target.style.borderColor = T.border}
                    >
                      {Object.entries(FREQ_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '7px 12px 7px 0', textAlign: 'right', fontFamily: T.mono, color: T.blue, fontWeight: 600 }}>
                    {formatCurrency(monthly)}
                  </td>
                  <td style={{ padding: '7px 12px 7px 0', textAlign: 'right', fontFamily: T.mono, color: T.muted }}>
                    {formatCurrency(monthly * 12)}
                  </td>
                  <td style={{ padding: '7px 0', width: 24 }}>
                    {earners.length > 1 && (
                      <button
                        onClick={() => removeEarner(earner.id)}
                        style={{ background: 'none', border: 'none', color: '#374151', cursor: 'pointer', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = T.red}
                        onMouseLeave={e => e.currentTarget.style.color = '#374151'}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: 'rgba(96,165,250,0.05)', borderTop: `1px solid rgba(96,165,250,0.15)` }}>
              <td colSpan={3} style={{ padding: '8px 12px 8px 0', fontFamily: T.mono, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: T.muted }}>
                Combined Monthly
              </td>
              <td style={{ textAlign: 'right', fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: T.blue, paddingRight: 12 }}>
                {formatCurrency(totalMonthly)}
              </td>
              <td style={{ textAlign: 'right', fontFamily: T.mono, fontSize: 13, color: T.muted, paddingRight: 12 }}>
                {formatCurrency(totalMonthly * 12)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
