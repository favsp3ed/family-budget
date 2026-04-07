import { STATE_TAX_RATES } from '../data/constants'
import { calcTaxes, formatCurrency, formatPercent } from '../utils/calculations'

const T = {
  bg: '#1a1d27',
  border: '#2a2d3a',
  divider: '#1e2130',
  inputBg: '#12151e',
  text: '#e8e8e8',
  muted: '#6b7280',
  blue: '#60a5fa',
  green: '#4ade80',
  red: '#f87171',
  teal: '#34d399',
  mono: 'ui-monospace, SFMono-Regular, monospace',
}

const inputStyle = {
  background: T.inputBg,
  border: `1px solid ${T.border}`,
  color: T.text,
  borderRadius: 8,
  padding: '6px 10px',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  cursor: 'pointer',
}

const FILING_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married Filing Jointly' },
  { value: 'hoh', label: 'Head of Household' },
]

function MiniStat({ label, value, color }) {
  return (
    <div style={{ background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 12px' }}>
      <p style={{ fontFamily: T.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700, color: color || T.text }}>{value}</p>
    </div>
  )
}

export default function TaxCalculator({ filingStatus, selectedState, annualGross, onChange }) {
  const taxes = calcTaxes(annualGross, filingStatus, selectedState)

  return (
    <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${T.divider}` }}>
        <p style={{ fontFamily: T.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.muted }}>Tax Calculator</p>
        <span style={{ fontFamily: T.mono, fontSize: 9, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', color: T.blue, borderRadius: 4, padding: '1px 6px', letterSpacing: '0.05em' }}>
          2024
        </span>
      </div>

      {/* Selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div>
          <label style={{ fontFamily: T.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, display: 'block', marginBottom: 5 }}>
            Filing Status
          </label>
          <select
            value={filingStatus}
            onChange={e => onChange('filingStatus', e.target.value)}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = T.blue}
            onBlur={e => e.target.style.borderColor = T.border}
          >
            {FILING_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontFamily: T.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, display: 'block', marginBottom: 5 }}>
            State of Residence
          </label>
          <select
            value={selectedState}
            onChange={e => onChange('selectedState', e.target.value)}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = T.blue}
            onBlur={e => e.target.style.borderColor = T.border}
          >
            {Object.keys(STATE_TAX_RATES).sort().map(state => (
              <option key={state} value={state}>
                {state} ({STATE_TAX_RATES[state]}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tax breakdown table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 14 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${T.divider}` }}>
            <th style={{ fontFamily: T.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.muted, textAlign: 'left', paddingBottom: 7, paddingRight: 12 }}>Tax Type</th>
            <th style={{ fontFamily: T.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.muted, textAlign: 'right', paddingBottom: 7, paddingRight: 12 }}>Annual</th>
            <th style={{ fontFamily: T.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.muted, textAlign: 'right', paddingBottom: 7 }}>Monthly</th>
          </tr>
        </thead>
        <tbody>
          {[
            { label: 'Federal Income Tax', annual: taxes.federal, monthly: taxes.federal / 12 },
            { label: `${selectedState} State Tax`, annual: taxes.state, monthly: taxes.state / 12 },
            { label: 'FICA (7.65%)', annual: taxes.fica, monthly: taxes.fica / 12 },
          ].map(row => (
            <tr key={row.label} style={{ borderBottom: `1px solid ${T.divider}` }}
              onMouseEnter={e => e.currentTarget.style.background = '#12151e'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <td style={{ padding: '6px 12px 6px 0', color: T.muted, fontSize: 12 }}>{row.label}</td>
              <td style={{ padding: '6px 12px 6px 0', textAlign: 'right', fontFamily: T.mono, color: T.red, fontSize: 12 }}>{formatCurrency(row.annual)}</td>
              <td style={{ padding: '6px 0', textAlign: 'right', fontFamily: T.mono, color: T.red, fontSize: 12 }}>{formatCurrency(row.monthly)}</td>
            </tr>
          ))}
          <tr style={{ background: 'rgba(248,113,113,0.05)', borderTop: `1px solid rgba(248,113,113,0.15)` }}>
            <td style={{ padding: '8px 12px 8px 0', fontFamily: T.mono, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: T.muted }}>Total Tax</td>
            <td style={{ padding: '8px 12px 8px 0', textAlign: 'right', fontFamily: T.mono, fontWeight: 700, color: T.red, fontSize: 13 }}>{formatCurrency(taxes.total)}</td>
            <td style={{ padding: '8px 0', textAlign: 'right', fontFamily: T.mono, fontWeight: 700, color: T.red, fontSize: 13 }}>{formatCurrency(taxes.monthlyTax)}</td>
          </tr>
        </tbody>
      </table>

      {/* Summary mini-stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <MiniStat label="Annual Gross" value={formatCurrency(annualGross)} color={T.muted} />
        <MiniStat label="Annual Tax" value={formatCurrency(taxes.total)} color={T.red} />
        <MiniStat label="Effective Rate" value={formatPercent(taxes.effectiveRate)} color={T.muted} />
        <MiniStat label="Annual Take-Home" value={formatCurrency(taxes.annualTakeHome)} color={T.green} />
        <MiniStat label="Monthly Take-Home" value={formatCurrency(taxes.monthlyTakeHome)} color={T.blue} />
        <MiniStat label="Monthly Tax" value={formatCurrency(taxes.monthlyTax)} color={T.red} />
      </div>
    </div>
  )
}
