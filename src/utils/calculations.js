import { FEDERAL_BRACKETS, STANDARD_DEDUCTIONS, STATE_TAX_RATES } from '../data/constants'

export function toMonthly(amount, frequency) {
  const n = parseFloat(amount) || 0
  switch (frequency) {
    case 'weekly': return (n * 52) / 12
    case 'biweekly': return (n * 26) / 12
    case 'monthly': return n
    case 'annual': return n / 12
    default: return n
  }
}

export function calcFederalTax(annualIncome, filingStatus) {
  const deduction = STANDARD_DEDUCTIONS[filingStatus] || STANDARD_DEDUCTIONS.single
  const taxable = Math.max(0, annualIncome - deduction)
  const brackets = FEDERAL_BRACKETS[filingStatus] || FEDERAL_BRACKETS.single
  let tax = 0
  for (const bracket of brackets) {
    if (taxable <= bracket.min) break
    const taxableInBracket = Math.min(taxable, bracket.max) - bracket.min
    tax += taxableInBracket * bracket.rate
  }
  return tax
}

export function calcStateTax(annualIncome, state) {
  const rate = STATE_TAX_RATES[state] ?? 0
  return annualIncome * (rate / 100)
}

export function calcFICA(annualIncome) {
  const ssCap = 168600
  const ss = Math.min(annualIncome, ssCap) * 0.062
  const medicare = annualIncome * 0.0145
  return ss + medicare
}

export function calcTaxes(annualGross, filingStatus, state) {
  const federal = calcFederalTax(annualGross, filingStatus)
  const stateTax = calcStateTax(annualGross, state)
  const fica = calcFICA(annualGross)
  const total = federal + stateTax + fica
  const effectiveRate = annualGross > 0 ? (total / annualGross) * 100 : 0
  const annualTakeHome = annualGross - total
  return {
    federal,
    state: stateTax,
    fica,
    total,
    effectiveRate,
    annualTakeHome,
    monthlyTakeHome: annualTakeHome / 12,
    monthlyTax: total / 12,
  }
}

export function calcExpenseTotal(expenses) {
  let total = 0
  for (const cat of Object.values(expenses)) {
    for (const item of cat) {
      total += parseFloat(item.amount) || 0
    }
  }
  return total
}

export function calcCategoryTotal(items) {
  return items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
}

export function formatCurrency(n) {
  if (n === undefined || n === null || isNaN(n)) return '$0.00'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export function formatPercent(n) {
  if (isNaN(n)) return '0.0%'
  return n.toFixed(1) + '%'
}
