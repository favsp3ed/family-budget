import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatPercent } from '../utils/calculations'
import { EXPENSE_CATEGORIES } from '../data/constants'

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

function StatCard({ label, sub, value, color, extra }) {
  return (
    <div style={{
      background: T.bg,
      border: `1px solid ${T.border}`,
      borderTop: `3px solid ${color}`,
      borderRadius: 12,
      padding: '16px 20px',
      flex: 1,
      minWidth: 0,
    }}>
      <p style={{ fontFamily: T.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.muted, marginBottom: 8 }}>
        {label}
      </p>
      <p style={{ fontFamily: T.mono, fontSize: 28, fontWeight: 700, color, lineHeight: 1, marginBottom: 4 }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>{sub}</p>
      )}
      {extra && (
        <p style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, marginTop: 2 }}>{extra}</p>
      )}
    </div>
  )
}

function ExpenseTableRow({ category, total, pct }) {
  return (
    <div
      style={{ padding: '7px 10px', borderRadius: 6, transition: 'background 0.1s', cursor: 'default' }}
      onMouseEnter={e => e.currentTarget.style.background = '#12151e'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: category.color, flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 12, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {category.label}
        </span>
        <span style={{ fontFamily: T.mono, fontSize: 12, color: T.text, flexShrink: 0 }}>
          {formatCurrency(total)}
        </span>
        <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, width: 36, textAlign: 'right', flexShrink: 0 }}>
          {pct.toFixed(1)}%
        </span>
      </div>
      {/* Mini bar */}
      <div style={{ marginLeft: 15, marginTop: 4, height: 2, background: T.divider, borderRadius: 1 }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, pct * 2)}%`,
          background: category.color,
          borderRadius: 1,
          opacity: 0.65,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  )
}

export default function SummaryDashboard({ monthlyGross, taxes, monthlyExpenses, expenses }) {
  const monthlyTakeHome = taxes.monthlyTakeHome || 0
  const monthlyTax = taxes.monthlyTax || 0
  const remaining = monthlyTakeHome - monthlyExpenses
  const annualRemaining = remaining * 12
  const savingsItems = expenses.savings || []
  const monthlySavings = savingsItems.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)
  const savingsRate = monthlyTakeHome > 0 ? (monthlySavings / monthlyTakeHome) * 100 : 0

  const catData = EXPENSE_CATEGORIES.map(cat => {
    const total = (expenses[cat.id] || []).reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)
    return { cat, total }
  }).filter(d => d.total > 0)

  const pieData = catData.map(({ cat, total }) => ({ name: cat.label, value: total, color: cat.color }))
  const totalExpenses = catData.reduce((s, d) => s + d.total, 0)

  return (
    <div style={{ marginBottom: 20 }}>
      {/* 3 stat cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <StatCard
          label="Monthly Take-Home"
          value={formatCurrency(monthlyTakeHome)}
          color={T.blue}
          sub={`Gross ${formatCurrency(monthlyGross)}`}
          extra={`Tax ${formatCurrency(monthlyTax)} · ${formatPercent(taxes.effectiveRate)} effective`}
        />
        <StatCard
          label="Total Monthly Expenses"
          value={formatCurrency(monthlyExpenses)}
          color={T.red}
          sub={`Annual ${formatCurrency(monthlyExpenses * 12)}`}
          extra={monthlyTakeHome > 0 ? `${formatPercent((monthlyExpenses / monthlyTakeHome) * 100)} of take-home` : undefined}
        />
        <StatCard
          label={remaining >= 0 ? 'Monthly Surplus' : 'Monthly Deficit'}
          value={(remaining >= 0 ? '+' : '') + formatCurrency(remaining)}
          color={remaining >= 0 ? T.green : T.red}
          sub={`Annual ${(annualRemaining >= 0 ? '+' : '') + formatCurrency(annualRemaining)}`}
          extra={`Savings rate ${formatPercent(savingsRate)}`}
        />
      </div>

      {/* Two-column: table left, donut right */}
      {catData.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="grid-cols-1 lg:grid-cols-2">

          {/* Left: expense breakdown table */}
          <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 12px' }}>
            <p style={{ fontFamily: T.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.muted, marginBottom: 12, padding: '0 8px', paddingBottom: 10, borderBottom: `1px solid ${T.divider}` }}>
              Expense Breakdown
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {catData.map(({ cat, total }) => {
                const pct = monthlyTakeHome > 0 ? (total / monthlyTakeHome) * 100 : 0
                return <ExpenseTableRow key={cat.id} category={cat} total={total} pct={pct} />
              })}
            </div>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.divider}`, display: 'flex', justifyContent: 'space-between', padding: '10px 10px 0' }}>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</span>
              <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.red }}>{formatCurrency(totalExpenses)}</span>
            </div>
          </div>

          {/* Right: donut chart */}
          <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 12px' }}>
            <p style={{ fontFamily: T.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.muted, marginBottom: 12, padding: '0 8px', paddingBottom: 10, borderBottom: `1px solid ${T.divider}` }}>
              Allocation Chart
            </p>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="85%"
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    stroke="#1a1d27"
                    strokeWidth={2}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="#1a1d27" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [formatCurrency(val), name]}
                    contentStyle={{
                      background: '#1a1d27',
                      border: '1px solid #2a2d3a',
                      borderRadius: 8,
                      fontSize: 11,
                      fontFamily: T.mono,
                      color: T.text,
                    }}
                    itemStyle={{ color: T.text }}
                    labelStyle={{ color: T.muted }}
                    cursor={false}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px', marginTop: 8 }}>
              {pieData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.name}
                  </span>
                  <span style={{ fontFamily: T.mono, fontSize: 10, color: T.text, flexShrink: 0 }}>
                    {totalExpenses > 0 ? ((d.value / totalExpenses) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: '32px 16px', textAlign: 'center' }}>
          <p style={{ fontFamily: T.mono, fontSize: 12, color: T.muted }}>Add expenses to see the breakdown</p>
        </div>
      )}
    </div>
  )
}
