import { formatCurrency } from '../utils/calculations'

const T = {
  bg: '#1a1d27',
  border: '#2a2d3a',
  divider: '#1e2130',
  inputBg: '#12151e',
  cardBg: '#12151e',
  text: '#e8e8e8',
  muted: '#6b7280',
  dim: '#374151',
  blue: '#60a5fa',
  green: '#4ade80',
  teal: '#34d399',
  red: '#f87171',
  amber: '#f59e0b',
  mono: 'ui-monospace, SFMono-Regular, monospace',
}

const inputStyle = {
  background: T.inputBg,
  border: `1px solid ${T.border}`,
  color: T.text,
  borderRadius: 8,
  padding: '5px 8px',
  fontSize: 12,
  outline: 'none',
  width: '100%',
  fontFamily: 'system-ui, sans-serif',
}

let nextGoalId = 500

function monthsUntil(targetDate) {
  if (!targetDate) return null
  const now = new Date()
  const target = new Date(targetDate)
  const months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
  return Math.max(1, months)
}

function GoalCard({ goal, onUpdate, onRemove }) {
  const current = parseFloat(goal.current) || 0
  const target = parseFloat(goal.target) || 0
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0
  const remaining = Math.max(0, target - current)
  const months = monthsUntil(goal.targetDate)
  const monthlyNeeded = months && remaining > 0 ? remaining / months : 0
  const isComplete = pct >= 100

  const barColor = isComplete ? T.green : pct > 60 ? T.teal : pct > 30 ? T.amber : T.red

  return (
    <div
      style={{ background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: 10, padding: '14px 16px', transition: 'border-color 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = T.teal + '50'}
      onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
    >
      {/* Goal name row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          value={goal.name}
          onChange={e => onUpdate(goal.id, 'name', e.target.value)}
          placeholder="Goal name..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            borderBottom: `1px solid ${T.border}`,
            color: T.text,
            fontSize: 13,
            fontWeight: 600,
            outline: 'none',
            paddingBottom: 4,
            transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = T.teal}
          onBlur={e => e.target.style.borderColor = T.border}
        />
        <button
          onClick={() => onRemove(goal.id)}
          style={{ background: 'none', border: 'none', color: T.dim, cursor: 'pointer', flexShrink: 0, padding: 2, transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = T.red}
          onMouseLeave={e => e.currentTarget.style.color = T.dim}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Inputs grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
        <div>
          <label style={{ fontFamily: T.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, display: 'block', marginBottom: 4 }}>Target</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 7, top: '50%', transform: 'translateY(-50%)', color: T.muted, fontSize: 12, pointerEvents: 'none' }}>$</span>
            <input
              type="number"
              value={goal.target}
              onChange={e => onUpdate(goal.id, 'target', e.target.value)}
              placeholder="0"
              min="0"
              style={{ ...inputStyle, paddingLeft: 18, fontFamily: T.mono }}
              onFocus={e => e.target.style.borderColor = T.teal}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>
        </div>
        <div>
          <label style={{ fontFamily: T.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, display: 'block', marginBottom: 4 }}>Saved</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 7, top: '50%', transform: 'translateY(-50%)', color: T.muted, fontSize: 12, pointerEvents: 'none' }}>$</span>
            <input
              type="number"
              value={goal.current}
              onChange={e => onUpdate(goal.id, 'current', e.target.value)}
              placeholder="0"
              min="0"
              style={{ ...inputStyle, paddingLeft: 18, fontFamily: T.mono }}
              onFocus={e => e.target.style.borderColor = T.teal}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>
        </div>
        <div>
          <label style={{ fontFamily: T.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, display: 'block', marginBottom: 4 }}>Target Date</label>
          <input
            type="date"
            value={goal.targetDate}
            onChange={e => onUpdate(goal.id, 'targetDate', e.target.value)}
            style={{ ...inputStyle, fontSize: 11 }}
            onFocus={e => e.target.style.borderColor = T.teal}
            onBlur={e => e.target.style.borderColor = T.border}
          />
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>{formatCurrency(current)} saved</span>
          <span style={{ fontFamily: T.mono, fontSize: 10, color: isComplete ? T.green : T.muted, fontWeight: isComplete ? 700 : 400 }}>
            {pct.toFixed(1)}% {isComplete ? '✓ COMPLETE' : `of ${formatCurrency(target)}`}
          </span>
        </div>
        <div style={{ height: 4, background: T.border, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: barColor,
            borderRadius: 2,
            transition: 'width 0.4s ease',
            boxShadow: `0 0 8px ${barColor}60`,
          }} />
        </div>
      </div>

      {/* Monthly needed */}
      {!isComplete && monthlyNeeded > 0 && (
        <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>
          Save <span style={{ color: T.teal, fontWeight: 600 }}>{formatCurrency(monthlyNeeded)}/mo</span>
          {months && <span> over {months} month{months !== 1 ? 's' : ''}</span>} to hit this goal
        </p>
      )}
    </div>
  )
}

export default function SavingsGoals({ goals, onChange }) {
  const addGoal = () => {
    onChange([...goals, { id: ++nextGoalId, name: '', target: '', current: '', targetDate: '' }])
  }

  const updateGoal = (id, field, value) => {
    onChange(goals.map(g => g.id === id ? { ...g, [field]: value } : g))
  }

  const removeGoal = (id) => {
    onChange(goals.filter(g => g.id !== id))
  }

  return (
    <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${T.divider}` }}>
        <div>
          <p style={{ fontFamily: T.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.muted, marginBottom: 3 }}>Savings Goals</p>
          <p style={{ fontSize: 11, color: '#4b5563' }}>Track your progress toward financial goals</p>
        </div>
        <button
          onClick={addGoal}
          style={{
            background: 'rgba(52,211,153,0.08)',
            border: '1px solid rgba(52,211,153,0.2)',
            color: T.teal,
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
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(52,211,153,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(52,211,153,0.08)'}
        >
          + ADD GOAL
        </button>
      </div>

      {goals.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', border: `1px dashed ${T.border}`, borderRadius: 10 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.dim} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 10 }}>
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          <p style={{ fontFamily: T.mono, fontSize: 12, color: T.muted }}>No goals yet. Add one to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} onUpdate={updateGoal} onRemove={removeGoal} />
          ))}
        </div>
      )}
    </div>
  )
}
