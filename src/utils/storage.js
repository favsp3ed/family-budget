const KEY = 'familyBudgetData_v1'

export function saveData(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...data, savedAt: new Date().toISOString() }))
    return new Date()
  } catch {
    return null
  }
}

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
