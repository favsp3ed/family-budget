import { useState } from 'react'
import { EXPENSE_CATEGORIES } from '../data/constants'
import { calcCategoryTotal, formatCurrency } from '../utils/calculations'

const T = {
  bg: '#1a1d27',
  border: '#2a2d3a',
  divider: '#1e2130',
  inputBg: '#12151e',
  rowHover: '#12151e',
  text: '#e8e8e8',
  muted: '#6b7280',
  dim: '#374151',
  red: '#f87171',
  blue: '#60a5fa',
  mono: 'ui-monospace, SFMono-Regular, monospace',
}

const ghostInput = {
  background: 'transparent',
  border: '1px solid transparent',
  color: T.text,
  borderRadius: 6,
  padding: '3px 6px',
  fontSize: 12,
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.15s, background 0.15s',
}

function CategorySection({ category, items, onUpdate, onAddRow, onRemoveRow }) {
  const [collapsed, setCollapsed] = useState(false)
  const subtotal = calcCategoryTotal(items)

  return (
    <div style={{ marginBottom: 4 }}>
      {/* Category header row */}
      <div
        onClick={() => setCollapsed(c => !c)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: category.color + '12',
          borderLeft: `3px solid ${category.color}`,
          borderRadius: collapsed ? 8 : '8px 8px 0 0',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <svg
          width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.15s', flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: category.color, flexShrink: 0 }} />
        <span style={{ fontFamily: T.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: category.color, flex: 1 }}>
          {category.label}
        </span>
        {subtotal > 0 && (
          <>
            <span style={{ fontFamily: T.mono, fontSize: 12, color: T.text, fontWeight: 600 }}>
              {formatCurrency(subtotal)}<span style={{ color: T.muted, fontWeight: 400 }}>/mo</span>
            </span>
            <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, width: 72, textAlign: 'right' }}>
              {formatCurrency(subtotal * 12)}/yr
            </span>
          </>
        )}
      </div>

      {!collapsed && (
        <div style={{ border: `1px solid ${T.border}`, borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <colgroup>
              <col style={{ width: '35%' }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 95 }} />
              <col />
              <col style={{ width: 26 }} />
            </colgroup>
            <thead>
              <tr style={{ background: '#0f1117', borderBottom: `1px solid ${T.divider}` }}>
                {['Item', 'Monthly', 'Annual', 'Notes', ''].map((h, i) => (
                  <th key={i} style={{
                    fontFamily: T.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.07em',
                    color: T.dim, padding: '6px 8px', textAlign: i === 1 || i === 2 ? 'right' : 'left',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const monthly = parseFloat(item.amount) || 0
                return (
                  <tr
                    key={item.id}
                    style={{ borderBottom: `1px solid ${T.divider}` }}
                    className="expense-row"
                    onMouseEnter={e => {
                      e.currentTarget.style.background = T.rowHover
                      const btn = e.currentTarget.querySelector('.del-btn')
                      if (btn) btn.style.opacity = '1'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                      const btn = e.currentTarget.querySelector('.del-btn')
                      if (btn) btn.style.opacity = '0'
                    }}
                  >
                    <td style={{ padding: '4px 8px' }}>
                      <input
                        type="text"
                        value={item.name}
                        onChange={e => onUpdate(category.id, item.id, 'name', e.target.value)}
                        style={ghostInput}
                        onFocus={e => { e.target.style.borderColor = T.border; e.target.style.background = '#0f1117' }}
                        onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'transparent' }}
                      />
                    </td>
                    <td style={{ padding: '4px 8px' }}>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 7, top: '50%', transform: 'translateY(-50%)', color: T.dim, fontSize: 12, pointerEvents: 'none' }}>$</span>
                        <input
                          type="number"
                          value={item.amount}
                          onChange={e => onUpdate(category.id, item.id, 'amount', e.target.value)}
                          placeholder="0"
                          min="0"
                          style={{ ...ghostInput, paddingLeft: 18, textAlign: 'right', fontFamily: T.mono }}
                          onFocus={e => { e.target.style.borderColor = T.border; e.target.style.background = '#0f1117' }}
                          onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'transparent' }}
                        />
                      </div>
                    </td>
                    <td style={{ padding: '4px 8px', textAlign: 'right', fontFamily: T.mono, color: monthly > 0 ? T.muted : T.dim, fontSize: 12 }}>
                      {monthly > 0 ? formatCurrency(monthly * 12) : '—'}
                    </td>
                    <td style={{ padding: '4px 8px' }}>
                      <input
                        type="text"
                        value={item.notes}
                        onChange={e => onUpdate(category.id, item.id, 'notes', e.target.value)}
                        placeholder="Notes..."
                        style={{ ...ghostInput, color: T.muted }}
                        onFocus={e => { e.target.style.borderColor = T.border; e.target.style.background = '#0f1117' }}
                        onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'transparent' }}
                      />
                    </td>
                    <td style={{ padding: '4px 4px' }}>
                      <button
                        className="del-btn"
                        onClick={() => onRemoveRow(category.id, item.id)}
                        style={{ opacity: 0, background: 'none', border: 'none', color: T.dim, cursor: 'pointer', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, transition: 'color 0.15s, opacity 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = T.red}
                        onMouseLeave={e => e.currentTarget.style.color = T.dim}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} style={{ padding: '6px 8px' }}>
                  <button
                    onClick={() => onAddRow(category.id)}
                    style={{ background: 'none', border: 'none', color: category.color, cursor: 'pointer', fontSize: 11, fontFamily: T.mono, padding: 0, display: 'flex', alignItems: 'center', gap: 4, opacity: 0.75, transition: 'opacity 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.75'}
                  >
                    + ADD ROW
                  </button>
                </td>
              </tr>
              {subtotal > 0 && (
                <tr style={{ background: category.color + '0a', borderTop: `1px solid ${category.color}25` }}>
                  <td style={{ padding: '6px 8px', fontFamily: T.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: category.color }}>Subtotal</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: T.mono, fontWeight: 700, color: category.color, fontSize: 12 }}>{formatCurrency(subtotal)}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: T.mono, color: category.color, fontSize: 12 }}>{formatCurrency(subtotal * 12)}</td>
                  <td colSpan={2} />
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

let nextRowId = 1000

export default function ExpenseTracker({ expenses, onChange }) {
  const totalMonthly = Object.values(expenses).reduce(
    (sum, items) => sum + calcCategoryTotal(items), 0
  )

  const updateItem = (catId, itemId, field, value) => {
    const updated = { ...expenses }
    updated[catId] = updated[catId].map(item =>
      item.id === itemId ? { ...item, [field]: value } : item
    )
    onChange(updated)
  }

  const addRow = (catId) => {
    const updated = { ...expenses }
    updated[catId] = [...updated[catId], { id: ++nextRowId, name: '', amount: '', notes: '' }]
    onChange(updated)
  }

  const removeRow = (catId, itemId) => {
    const updated = { ...expenses }
    if (updated[catId].length <= 1) return
    updated[catId] = updated[catId].filter(item => item.id !== itemId)
    onChange(updated)
  }

  return (
    <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${T.divider}` }}>
        <div>
          <p style={{ fontFamily: T.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.muted, marginBottom: 3 }}>Expense Tracker</p>
          <p style={{ fontSize: 11, color: '#4b5563' }}>Click any field to edit · hover a row to delete</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontFamily: T.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, marginBottom: 3 }}>Total Monthly</p>
          <p style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700, color: T.red }}>{formatCurrency(totalMonthly)}</p>
          <p style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>{formatCurrency(totalMonthly * 12)}/yr</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {EXPENSE_CATEGORIES.map(cat => (
          <CategorySection
            key={cat.id}
            category={cat}
            items={expenses[cat.id] || []}
            onUpdate={updateItem}
            onAddRow={addRow}
            onRemoveRow={removeRow}
          />
        ))}
      </div>

      {/* Grand total bar */}
      <div style={{ marginTop: 12, padding: '10px 14px', background: '#0f1117', border: `1px solid ${T.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: T.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.muted }}>Grand Total</span>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: T.red }}>{formatCurrency(totalMonthly)}</span>
          <span style={{ fontFamily: T.mono, fontSize: 12, color: T.dim, marginLeft: 6 }}>/mo</span>
          <p style={{ fontFamily: T.mono, fontSize: 11, color: T.dim }}>{formatCurrency(totalMonthly * 12)}/yr</p>
        </div>
      </div>
    </div>
  )
}
