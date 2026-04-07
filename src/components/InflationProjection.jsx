import { useState } from 'react'
import { EXPENSE_CATEGORIES } from '../data/constants'
import { calcCategoryTotal, formatCurrency } from '../utils/calculations'

const T = {
  bg: '#1a1d27',
  border: '#2a2d3a',
  divider: '#1e2130',
  inputBg: '#12151e',
  text: '#e8e8e8',
  muted: '#6b7280',
  dim: '#374151',
  blue: '#60a5fa',
  green: '#4ade80',
  red: '#f87171',
  amber: '#f59e0b',
  mono: 'ui-monospace, SFMono-Regular, monospace',
}

function inflated(amount, rate, years) {
  return amount * Math.pow(1 + rate / 100, years)
}

function DeltaBadge({ base, projected }) {
  const diff = projected - base
  const pct = base > 0 ? ((diff / base) * 100).toFixed(1) : '0.0'
  const isUp = diff > 0
  return (
    <span style={{
      fontFamily: T.mono, fontSize: 10,
      color: isUp ? T.red : T.green,
      marginLeft: 4,
    }}>
      {isUp ? '+' : ''}{pct}%
    </span>
  )
}

export default function InflationProjection({ expenses, effectiveRate }) {
  const [open, setOpen] = useState(false)
  const [rate, setRate] = useState(3)

  const catData = EXPENSE_CATEGORIES.map(cat => {
    const total = calcCategoryTotal(expenses[cat.id] || [])
    return { cat, total }
  }).filter(d => d.total > 0)

  const totalBase = catData.reduce((s, d) => s + d.total, 0)
  const y1 = inflated(totalBase, rate, 1)
  const y2 = inflated(totalBase, rate, 2)
  const y3 = inflated(totalBase, rate, 3)

  // Additional gross income needed to cover year-3 expense increase
  // (accounting for taxes: grossNeeded = expenseIncrease / (1 - effectiveRate/100))
  const taxMultiplier = effectiveRate > 0 ? 1 / (1 - effectiveRate / 100) : 1
  const additionalExpenses3 = y3 - totalBase
  const additionalGrossNeeded = additionalExpenses3 * taxMultiplier

  return (
    <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, marginBottom: 16, overflow: 'hidden' }}>
      {/* Toggle header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: open ? `1px solid ${T.divider}` : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.amber} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
          <span style={{ fontFamily: T.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.muted }}>
            Inflation Projection
          </span>
          {totalBase > 0 && (
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.amber, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 4, padding: '1px 7px' }}>
              +{rate}%/yr → {formatCurrency(y3)}/mo in 3yr
            </span>
          )}
        </div>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{ padding: '16px 20px' }}>
          {/* Rate slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            <span style={{ fontFamily: T.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, flexShrink: 0 }}>
              Annual Inflation Rate
            </span>
            <input
              type="range"
              min={1} max={6} step={0.5}
              value={rate}
              onChange={e => setRate(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: T.amber, cursor: 'pointer' }}
            />
            <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: T.amber, minWidth: 36, textAlign: 'right' }}>
              {rate}%
            </span>
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, flexShrink: 0 }}>
              (default 3% = historical avg)
            </span>
          </div>

          {catData.length === 0 ? (
            <p style={{ fontFamily: T.mono, fontSize: 12, color: T.muted, textAlign: 'center', padding: '20px 0' }}>
              Add expenses to see inflation projections.
            </p>
          ) : (
            <>
              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${T.divider}` }}>
                      {['Category', 'Now /mo', '+1 Year', '+2 Years', '+3 Years'].map((h, i) => (
                        <th key={h} style={{
                          fontFamily: T.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.07em',
                          color: T.muted, paddingBottom: 8, textAlign: i === 0 ? 'left' : 'right',
                          paddingRight: i < 4 ? 16 : 0,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {catData.map(({ cat, total }) => {
                      const r1 = inflated(total, rate, 1)
                      const r2 = inflated(total, rate, 2)
                      const r3 = inflated(total, rate, 3)
                      return (
                        <tr key={cat.id} style={{ borderBottom: `1px solid ${T.divider}` }}
                          onMouseEnter={e => e.currentTarget.style.background = T.inputBg}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '7px 16px 7px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                              <span style={{ color: T.text }}>{cat.label}</span>
                            </div>
                          </td>
                          <td style={{ padding: '7px 16px 7px 0', textAlign: 'right', fontFamily: T.mono, color: T.muted }}>
                            {formatCurrency(total)}
                          </td>
                          <td style={{ padding: '7px 16px 7px 0', textAlign: 'right', fontFamily: T.mono, color: T.text }}>
                            {formatCurrency(r1)}
                            <DeltaBadge base={total} projected={r1} />
                          </td>
                          <td style={{ padding: '7px 16px 7px 0', textAlign: 'right', fontFamily: T.mono, color: T.text }}>
                            {formatCurrency(r2)}
                            <DeltaBadge base={total} projected={r2} />
                          </td>
                          <td style={{ padding: '7px 0', textAlign: 'right', fontFamily: T.mono, color: T.amber }}>
                            {formatCurrency(r3)}
                            <DeltaBadge base={total} projected={r3} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: 'rgba(245,158,11,0.05)', borderTop: `1px solid rgba(245,158,11,0.2)` }}>
                      <td style={{ padding: '8px 16px 8px 0', fontFamily: T.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted }}>Total</td>
                      <td style={{ padding: '8px 16px 8px 0', textAlign: 'right', fontFamily: T.mono, fontWeight: 700, color: T.muted }}>{formatCurrency(totalBase)}</td>
                      <td style={{ padding: '8px 16px 8px 0', textAlign: 'right', fontFamily: T.mono, fontWeight: 700, color: T.text }}>{formatCurrency(y1)}</td>
                      <td style={{ padding: '8px 16px 8px 0', textAlign: 'right', fontFamily: T.mono, fontWeight: 700, color: T.text }}>{formatCurrency(y2)}</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', fontFamily: T.mono, fontWeight: 700, color: T.amber }}>{formatCurrency(y3)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Summary callout */}
              <div style={{
                marginTop: 14,
                padding: '12px 16px',
                background: T.inputBg,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
              }}>
                <div>
                  <p style={{ fontFamily: T.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, marginBottom: 4 }}>
                    Additional Expenses in 3yr
                  </p>
                  <p style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700, color: T.red }}>
                    +{formatCurrency(additionalExpenses3)}/mo
                  </p>
                </div>
                <div>
                  <p style={{ fontFamily: T.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, marginBottom: 4 }}>
                    Est. Additional Gross Income Needed
                  </p>
                  <p style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700, color: T.amber }}>
                    +{formatCurrency(additionalGrossNeeded)}/mo
                  </p>
                  <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 2 }}>
                    (accounts for your effective tax rate)
                  </p>
                </div>
                <div>
                  <p style={{ fontFamily: T.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, marginBottom: 4 }}>
                    Total Lifestyle Cost in 3yr
                  </p>
                  <p style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700, color: T.amber }}>
                    {formatCurrency(y3)}/mo
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
