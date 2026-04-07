import { STATE_TAX_RATES, BRACKET_COLORS } from '../data/constants'
import { calcTaxes, getMarginalBracket, getBrackets, getDeduction, formatCurrency, formatPercent } from '../utils/calculations'

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
  { value: 'single',  label: 'Single' },
  { value: 'married', label: 'Married Filing Jointly' },
  { value: 'hoh',     label: 'Head of Household' },
]

const TAX_YEARS = [
  { value: 2023, label: '2023' },
  { value: 2024, label: '2024' },
  { value: 2025, label: '2025 (Current)' },
]

function MiniStat({ label, value, color }) {
  return (
    <div style={{ background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 12px' }}>
      <p style={{ fontFamily: T.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700, color: color || T.text }}>{value}</p>
    </div>
  )
}

function BracketVisualization({ annualGross, filingStatus, taxYear }) {
  const brackets = getBrackets(filingStatus, taxYear)
  const deduction = getDeduction(filingStatus, taxYear)
  const taxableIncome = Math.max(0, annualGross - deduction)
  const marginalRate = getMarginalBracket(annualGross, filingStatus, taxYear)
  const marginalColor = BRACKET_COLORS[marginalRate] || T.muted

  // Cap visualization at top of 35% bracket for the current filing status
  const cap35 = brackets.find(b => b.rate === 0.35)?.max ?? 600000
  const vizCap = Math.min(cap35, Math.max(taxableIncome * 1.3, 100000))

  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.divider}` }}>
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{ fontFamily: T.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.muted }}>
          Tax Bracket Visualization
        </p>
        <p style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>
          You are in the{' '}
          <span style={{ color: marginalColor, fontWeight: 700 }}>
            {(marginalRate * 100).toFixed(0)}%
          </span>
          {' '}marginal bracket
        </p>
      </div>

      {/* Bracket pills row */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
        {brackets.map(bracket => {
          const isActive = marginalRate === bracket.rate
          const color = BRACKET_COLORS[bracket.rate]
          return (
            <div
              key={bracket.rate}
              style={{
                fontFamily: T.mono,
                fontSize: isActive ? 12 : 10,
                fontWeight: isActive ? 700 : 400,
                color: isActive ? '#0f1117' : color,
                background: isActive ? color : color + '18',
                border: `1px solid ${color}${isActive ? '' : '40'}`,
                borderRadius: 6,
                padding: isActive ? '4px 10px' : '3px 8px',
                transition: 'all 0.2s',
                boxShadow: isActive ? `0 0 10px ${color}50` : 'none',
              }}
            >
              {(bracket.rate * 100).toFixed(0)}%
              {isActive && ' ◀'}
            </div>
          )
        })}
      </div>

      {/* Bar */}
      <div style={{ position: 'relative', height: 8, borderRadius: 4, overflow: 'hidden', background: T.inputBg, marginBottom: 6 }}>
        {/* Bracket segments */}
        {brackets.map(bracket => {
          const segStart = Math.min(bracket.min, vizCap)
          const segEnd = Math.min(bracket.max === Infinity ? vizCap : bracket.max, vizCap)
          const leftPct = (segStart / vizCap) * 100
          const widthPct = ((segEnd - segStart) / vizCap) * 100
          if (widthPct <= 0) return null
          const color = BRACKET_COLORS[bracket.rate]
          const isActive = marginalRate === bracket.rate
          return (
            <div key={bracket.rate} style={{
              position: 'absolute',
              left: `${leftPct}%`,
              width: `${widthPct}%`,
              height: '100%',
              background: color,
              opacity: isActive ? 1 : 0.3,
            }} />
          )
        })}
        {/* Income marker */}
        {taxableIncome > 0 && taxableIncome <= vizCap && (
          <div style={{
            position: 'absolute',
            left: `${Math.min(98, (taxableIncome / vizCap) * 100)}%`,
            top: -2,
            width: 2,
            height: 12,
            background: '#fff',
            borderRadius: 1,
            boxShadow: '0 0 4px rgba(255,255,255,0.6)',
          }} />
        )}
      </div>

      {/* Axis labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>$0</span>
        {taxableIncome > 0 && taxableIncome < vizCap && (
          <span style={{ fontFamily: T.mono, fontSize: 9, color: '#fff' }}>
            ↑ ${Math.round(taxableIncome / 1000)}k taxable
          </span>
        )}
        <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>${Math.round(vizCap / 1000)}k+</span>
      </div>
    </div>
  )
}

export default function TaxCalculator({ filingStatus, selectedState, annualGross, taxYear, onChange }) {
  const taxes = calcTaxes(annualGross, filingStatus, selectedState, taxYear)

  return (
    <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${T.divider}` }}>
        <p style={{ fontFamily: T.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.muted }}>Tax Calculator</p>
      </div>

      {/* Selectors row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 6 }}>
        <div>
          <label style={{ fontFamily: T.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, display: 'block', marginBottom: 5 }}>
            Tax Year
          </label>
          <select
            value={taxYear}
            onChange={e => onChange('taxYear', Number(e.target.value))}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = T.blue}
            onBlur={e => e.target.style.borderColor = T.border}
          >
            {TAX_YEARS.map(y => (
              <option key={y.value} value={y.value}>{y.label}</option>
            ))}
          </select>
        </div>
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
            State
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

      {/* 2026 note */}
      <p style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 14, padding: '5px 8px', background: T.inputBg, borderRadius: 6, border: `1px solid ${T.border}` }}>
        ℹ️  2026 brackets will be added when released by the IRS (typically Nov 2026)
      </p>

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
            { label: 'Federal Income Tax',        annual: taxes.federal,    monthly: taxes.federal / 12 },
            { label: `${selectedState} State Tax`, annual: taxes.state,      monthly: taxes.state / 12 },
            { label: 'FICA (7.65%)',               annual: taxes.fica,       monthly: taxes.fica / 12 },
          ].map(row => (
            <tr key={row.label} style={{ borderBottom: `1px solid ${T.divider}` }}
              onMouseEnter={e => e.currentTarget.style.background = T.inputBg}
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
        <MiniStat label="Annual Gross"     value={formatCurrency(annualGross)}            color={T.muted} />
        <MiniStat label="Annual Tax"       value={formatCurrency(taxes.total)}             color={T.red} />
        <MiniStat label="Effective Rate"   value={formatPercent(taxes.effectiveRate)}       color={T.muted} />
        <MiniStat label="Annual Take-Home" value={formatCurrency(taxes.annualTakeHome)}     color={T.green} />
        <MiniStat label="Monthly Take-Home"value={formatCurrency(taxes.monthlyTakeHome)}    color={T.blue} />
        <MiniStat label="Monthly Tax"      value={formatCurrency(taxes.monthlyTax)}         color={T.red} />
      </div>

      {/* Bracket visualization */}
      <BracketVisualization
        annualGross={annualGross}
        filingStatus={filingStatus}
        taxYear={taxYear}
      />
    </div>
  )
}
