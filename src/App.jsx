import { useState, useEffect, useCallback, useRef } from 'react'
import Header from './components/Header'
import SummaryDashboard from './components/SummaryDashboard'
import IncomeSection from './components/IncomeSection'
import TaxCalculator from './components/TaxCalculator'
import ExpenseTracker from './components/ExpenseTracker'
import InflationProjection from './components/InflationProjection'
import SavingsGoals from './components/SavingsGoals'
import { toMonthly, calcTaxes, calcCategoryTotal } from './utils/calculations'
import { saveData, loadData } from './utils/storage'
import { EXPENSE_CATEGORIES } from './data/constants'

function buildDefaultExpenses() {
  const expenses = {}
  let id = 1
  for (const cat of EXPENSE_CATEGORIES) {
    expenses[cat.id] = cat.items.map(item => ({
      id: id++,
      name: item.name,
      amount: '',
      notes: '',
    }))
  }
  return expenses
}

const DEFAULT_STATE = {
  earners: [{ id: 1, name: '', gross: '', frequency: 'monthly' }],
  filingStatus: 'single',
  selectedState: 'Texas',
  taxYear: 2025,
  expenses: buildDefaultExpenses(),
  goals: [],
}

function mergeExpenses(saved, defaults) {
  const merged = {}
  for (const cat of EXPENSE_CATEGORIES) {
    merged[cat.id] = saved[cat.id] || defaults[cat.id]
  }
  return merged
}

export default function App() {
  const [data, setData] = useState(() => {
    const saved = loadData()
    if (!saved) return DEFAULT_STATE
    const defaults = buildDefaultExpenses()
    return {
      earners: saved.earners || DEFAULT_STATE.earners,
      filingStatus: saved.filingStatus || 'single',
      selectedState: saved.selectedState || 'Texas',
      taxYear: saved.taxYear || 2025,
      expenses: saved.expenses ? mergeExpenses(saved.expenses, defaults) : defaults,
      goals: saved.goals || [],
    }
  })

  const [lastSaved, setLastSaved] = useState(() => loadData()?.savedAt || null)
  const [saveIndicator, setSaveIndicator] = useState(false)
  const saveTimer = useRef(null)

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      const ts = saveData(data)
      if (ts) {
        setLastSaved(ts)
        setSaveIndicator(true)
        setTimeout(() => setSaveIndicator(false), 2000)
      }
    }, 300)
    return () => clearTimeout(saveTimer.current)
  }, [data])

  const setEarners   = useCallback(earners   => setData(d => ({ ...d, earners })),   [])
  const setExpenses  = useCallback(expenses  => setData(d => ({ ...d, expenses })),  [])
  const setGoals     = useCallback(goals     => setData(d => ({ ...d, goals })),      [])
  const setTaxField  = useCallback((field, value) => setData(d => ({ ...d, [field]: value })), [])

  const monthlyGross   = data.earners.reduce((sum, e) => sum + toMonthly(e.gross, e.frequency), 0)
  const annualGross    = monthlyGross * 12
  const taxes          = calcTaxes(annualGross, data.filingStatus, data.selectedState, data.taxYear)
  const monthlyExpenses = Object.values(data.expenses).reduce(
    (sum, items) => sum + calcCategoryTotal(items), 0
  )

  const handleExport = () => {
    const rows = [['Category', 'Item', 'Monthly Amount', 'Annual Amount', 'Notes']]
    for (const cat of EXPENSE_CATEGORIES) {
      for (const item of (data.expenses[cat.id] || [])) {
        if (item.amount) {
          const m = parseFloat(item.amount) || 0
          rows.push([cat.label, item.name, m.toFixed(2), (m * 12).toFixed(2), item.notes || ''])
        }
      }
    }
    rows.push([])
    rows.push(['--- Income ---', '', '', '', ''])
    for (const e of data.earners) {
      const m = toMonthly(e.gross, e.frequency)
      rows.push(['Income', e.name || 'Earner', m.toFixed(2), (m * 12).toFixed(2), e.frequency])
    }
    rows.push([])
    rows.push(['--- Summary ---', '', '', '', ''])
    rows.push(['', 'Tax Year', data.taxYear, '', ''])
    rows.push(['', 'Monthly Gross', monthlyGross.toFixed(2), '', ''])
    rows.push(['', 'Monthly Tax', taxes.monthlyTax.toFixed(2), '', ''])
    rows.push(['', 'Monthly Take-Home', taxes.monthlyTakeHome.toFixed(2), '', ''])
    rows.push(['', 'Monthly Expenses', monthlyExpenses.toFixed(2), '', ''])
    rows.push(['', 'Monthly Remaining', (taxes.monthlyTakeHome - monthlyExpenses).toFixed(2), '', ''])
    rows.push(['', 'Effective Tax Rate', taxes.effectiveRate.toFixed(2) + '%', '', ''])

    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `family-budget-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen" style={{ background: '#0f1117' }}>
      <Header
        lastSaved={lastSaved}
        onExport={handleExport}
        selectedState={data.selectedState}
        filingStatus={data.filingStatus}
        taxYear={data.taxYear}
        remaining={taxes.monthlyTakeHome - monthlyExpenses}
      />

      <main className="max-w-screen-xl mx-auto px-4 py-5">
        {/* Save toast */}
        <div
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-xl"
          style={{
            background: '#1a1d27',
            border: '1px solid #2a2d3a',
            color: '#e8e8e8',
            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            fontSize: 11,
            letterSpacing: '0.04em',
            opacity: saveIndicator ? 1 : 0,
            transform: saveIndicator ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
            pointerEvents: 'none',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          All changes saved
        </div>

        <SummaryDashboard
          monthlyGross={monthlyGross}
          taxes={taxes}
          monthlyExpenses={monthlyExpenses}
          expenses={data.expenses}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 16 }}>
          <IncomeSection earners={data.earners} onChange={setEarners} />
          <TaxCalculator
            filingStatus={data.filingStatus}
            selectedState={data.selectedState}
            annualGross={annualGross}
            taxYear={data.taxYear}
            onChange={setTaxField}
          />
        </div>

        <ExpenseTracker expenses={data.expenses} onChange={setExpenses} />

        <InflationProjection
          expenses={data.expenses}
          effectiveRate={taxes.effectiveRate}
        />

        <SavingsGoals goals={data.goals} onChange={setGoals} />
      </main>
    </div>
  )
}
