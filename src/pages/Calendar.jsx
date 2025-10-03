import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { getCalendarEvents } from '../services/calendar'
import { getTemples } from '../services/temples'

// Events are loaded from backend

// Temples will be loaded from backend; include 'All'
const DEFAULT_TEMPLE_OPTIONS = ['All']

const levelColor = {
  low: 'bg-green-500',
  medium: 'bg-yellow-400',
  high: 'bg-red-500',
}

// Normalize temple names to improve matching across variations like
// "Somnath" vs "Somnath Temple" or different casing/punctuation.
function normName(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')       // drop punctuation
    .replace(/\b(temple|mandir)\b/g, '') // drop common suffixes
    .replace(/\s+/g, ' ')               // collapse spaces
    .trim()
}

// Map normalized selection to canonical names used by backend events
function toApiTempleName(sel) {
  const n = normName(sel)
  if (!n) return undefined
  if (n === 'somnath') return 'Somnath'
  if (n === 'dwarka' || n === 'dwarkadhish' || n === 'dwarkadhish temple') return 'Dwarka'
  if (n === 'ambaji') return 'Ambaji'
  if (n === 'pavagadh' || n === 'pavagadh mahakali' || n === 'mahakali') return 'Pavagadh'
  // Fallback: return original selection to let server try matching, or undefined
  return sel
}

function toDateParts(iso) {
  const d = new Date(iso + 'T00:00:00')
  return { y: d.getFullYear(), m: d.getMonth(), day: d.getDate() }
}

function isoFor(y, m, d) {
  const mm = String(m + 1).padStart(2, '0')
  const dd = String(d).padStart(2, '0')
  return `${y}-${mm}-${dd}`
}

function monthMatrix(year, month) {
  // returns weeks array with dates (or null for padding)
  const first = new Date(year, month, 1)
  const startDay = first.getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

function buildGoogleCalUrl(e) {
  // https://calendar.google.com/calendar/render?action=TEMPLATE&text=...&dates=YYYYMMDD/YYYYMMDD&details=...&location=...
  const start = e.date.replaceAll('-', '')
  const end = start // same-day all-day
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: `${start}/${end}`,
    details: `${e.description || ''}\nTemple: ${e.temple}`,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function buildICS(e) {
  const dt = e.date.replaceAll('-', '')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Pilgrimage Calendar//IN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${e.id}@pilgrimage`,
    `DTSTAMP:${dt}T000000Z`,
    `DTSTART;VALUE=DATE:${dt}`,
    `DTEND;VALUE=DATE:${dt}`,
    `SUMMARY:${e.title}`,
    `DESCRIPTION:${(e.description || '').replace(/\n/g, '\\n')}\\nTemple: ${e.temple}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export default function CalendarPage() {
  const today = new Date()
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() })
  const [temple, setTemple] = useState('All')
  const [temples, setTemples] = useState(DEFAULT_TEMPLE_OPTIONS)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch events whenever month or selected temple changes
  useEffect(() => {
    const { y, m } = cursor
    setLoading(true)
    setError('')
    const selTemple = temple === 'All' ? undefined : toApiTempleName(temple)
    getCalendarEvents({ year: y, month: m + 1, templeName: selTemple })
      .then(list => setEvents(list))
      .catch(e => {
        console.error('Calendar fetch error:', e?.message)
        setError('Failed to load events. Please try again later.')
        setEvents([])
      })
      .finally(() => setLoading(false))
  }, [cursor, temple])

  // Load temples for dropdown
  useEffect(() => {
    let cancelled = false
    getTemples()
      .then(list => {
        if (cancelled) return
        const names = list.map(t => t.name).filter(Boolean)
        const unique = Array.from(new Set(['All', ...names]))
        setTemples(unique)
      })
      .catch(() => {
        // Keep default 'All' if fails
      })
    return () => { cancelled = true }
  }, [])
  const { y, m } = cursor
  const weeks = useMemo(() => monthMatrix(y, m), [y, m])

  // All temples map for baseline crowd computation
  const allEventsByDate = useMemo(() => {
    const map = new Map()
    events.forEach(e => {
      const list = map.get(e.date) || []
      list.push(e)
      map.set(e.date, list)
    })
    return map
  }, [events])

  // Filtered-by-temple map for event listing
  const eventsByDate = useMemo(() => {
    const map = new Map()
    const tSelNorm = normName(temple)
    const filtered = events.filter(e => {
      if (temple === 'All') return true
      const eTempleNorm = normName(e.temple)
      // Include global events and close matches (exact or contains either way)
      return eTempleNorm === 'all' || eTempleNorm === tSelNorm || tSelNorm.includes(eTempleNorm) || eTempleNorm.includes(tSelNorm)
    })
    filtered.forEach(e => {
      const list = map.get(e.date) || []
      list.push(e)
      map.set(e.date, list)
    })
    return map
  }, [events, temple])

  // Determine baseline crowd level for any given date
  const levelRank = { low: 1, medium: 2, high: 3 }
  function mergeLevels(levels) {
    let best = 'low'
    for (const lv of levels) {
      if (levelRank[lv] > levelRank[best]) best = lv
    }
    return best
  }
  function baselineLevelFor(iso) {
    // If a specific temple is selected, baseline should reflect that temple only.
    // If 'All' is selected, baseline aggregates all temples.
    const map = temple === 'All' ? allEventsByDate : eventsByDate
    const evs = map.get(iso) || []
    if (evs.length) return mergeLevels(evs.map(e => e.level || 'low'))
    // Heuristic: weekends = medium, weekdays = low
    const d = new Date(iso + 'T00:00:00')
    const dow = d.getDay() // 0=Sun,6=Sat
    if (dow === 0 || dow === 6) return 'medium'
    return 'low'
  }

  const monthLabel = new Date(y, m, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  const changeMonth = (delta) => {
    const date = new Date(y, m + delta, 1)
    setCursor({ y: date.getFullYear(), m: date.getMonth() })
  }

  const downloadICS = (e) => {
    const blob = new Blob([buildICS(e)], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${e.title.replace(/[^a-z0-9]+/gi,'_').toLowerCase()}_${e.date}.ics`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto animate-slide-up">
        <div className="glass-card ind-gradient-border p-4 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button className="glass-btn px-3 py-1.5" onClick={() => changeMonth(-1)} aria-label="Prev month">◀</button>
              <div className="text-lg font-semibold text-saffron-800 min-w-[12ch] text-center">{monthLabel}</div>
              <button className="glass-btn px-3 py-1.5" onClick={() => changeMonth(1)} aria-label="Next month">▶</button>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Temple</label>
              <select value={temple} onChange={e=>setTemple(e.target.value)} className="p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans">
                {temples.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-green-500"/> Low crowd</div>
            <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-yellow-400"/> Medium crowd</div>
            <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-red-500"/> High crowd</div>
          </div>
          {loading && (
            <div className="mt-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2">Loading events…</div>
          )}
          {error && (
            <div className="mt-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
          )}
        </div>

        {/* Calendar grid */}
        <div className="glass-card ind-gradient-border p-0 overflow-hidden">
          <div className="grid grid-cols-7 text-xs bg-white/60 border-b">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="px-2 py-2 text-center font-medium text-gray-700">{d}</div>
            ))}
          </div>
          <div className="divide-y">
            {weeks.map((w, wi) => (
              <div key={wi} className="grid grid-cols-7">
                {w.map((d, di) => {
                  const iso = d ? isoFor(y, m, d) : ''
                  const dayEvents = d ? (eventsByDate.get(iso) || []) : []
                  const dayLevel = d ? baselineLevelFor(iso) : null
                  return (
                    <div key={di} className="min-h-[88px] border-r last:border-r-0 bg-white/50 p-1">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span className="invisible">•</span>
                        <span>{d || ''}</span>
                        {dayLevel && (
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${levelColor[dayLevel]}`} title={`Baseline: ${dayLevel}`} aria-label={`Baseline: ${dayLevel}`}></span>
                        )}
                      </div>
                      <div className="mt-1 space-y-1">
                        {dayEvents.map(ev => (
                          <div key={ev.id} className="text-[11px] leading-tight p-1 rounded border flex items-start gap-1 bg-white/80">
                            <span className={`inline-block w-2 h-2 rounded-full mt-0.5 ${levelColor[ev.level] || 'bg-gray-400'}`} aria-hidden />
                            <div className="flex-1">
                              <div className="font-medium text-gray-800 truncate" title={ev.title}>{ev.title}</div>
                              <div className="text-gray-600 truncate">{ev.temple}</div>
                              <div className="text-[10px] text-gray-500 line-clamp-2">{ev.description}</div>
                              <div className="flex gap-2 mt-1">
                                <a className="text-[10px] text-saffron-700 hover:underline" href={buildGoogleCalUrl(ev)} target="_blank" rel="noopener noreferrer">Add to Google</a>
                                <button className="text-[10px] text-saffron-700 hover:underline" onClick={() => downloadICS(ev)}>Download .ics</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* About section */}
        <div className="mt-4 glass-card ind-gradient-border p-4 text-sm text-gray-700">
          This calendar highlights temple festivals, national holidays, and auspicious days to help devotees plan their visit.
          Filters allow focusing on specific temples like Somnath, Dwarka, Ambaji, and Pavagadh. Color codes: Green = Low,
          Yellow = Medium, Red = High.
        </div>
      </div>
    </Layout>
  )
}
