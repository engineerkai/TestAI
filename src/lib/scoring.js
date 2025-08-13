export function scoreLead (fields) {
  let score = 0
  if (fields.preapproved) score += 20
  if (fields.timeline) {
    const t = String(fields.timeline).toLowerCase()
    if (t.includes('now') || t.includes('0-1') || t.includes('month')) score += 15
    else if (t.includes('3')) score += 10
    else if (t.includes('6')) score += 5
  }
  if (fields.budget) {
    const num = parseInt(String(fields.budget).replace(/[^0-9]/g, ''))
    if (!isNaN(num)) {
      if (num >= 1000000) score += 10
      else if (num >= 700000) score += 7
      else if (num >= 400000) score += 4
    }
  }
  if (fields.consent) score += 5
  return score
}

export function scoreLabel (score) {
  if (score >= 30) return 'Hot'
  if (score >= 15) return 'Warm'
  return 'Cold'
}
