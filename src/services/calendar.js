import { supabase } from '../lib/supabaseClient'

// Fetch calendar events for a specific year/month and optional temple name.
// Expects a 'calendar_events' table with columns:
// id, temple_id, title, details, start_at (timestamptz), end_at (timestamptz), level (text)
// Joins temple name via 'temples' to return { id, date(YYYY-MM-DD), title, description, temple, level }
export async function getCalendarEvents({ year, month, templeName }) {
  // Compute month range [start, end)
  const start = new Date(Date.UTC(year, month - 1, 1))
  const end = new Date(Date.UTC(year, month, 1))

  // base query
  let query = supabase
    .from('calendar_events')
    .select('id, title, details, start_at, level, temples(name)')
    .gte('start_at', start.toISOString())
    .lt('start_at', end.toISOString())
    .order('start_at', { ascending: true })

  if (templeName && templeName !== 'All') {
    // filter by temple via a case-insensitive match on joined temples.name
    // Supabase doesn't filter on joined columns directly; we can do a subquery by first fetching temple id(s)
    const { data: temples, error: terr } = await supabase
      .from('temples')
      .select('id, name')
      .ilike('name', `%${templeName}%`)
    if (terr) throw terr
    const ids = (temples || []).map(t => t.id)
    if (ids.length === 0) return []
    query = query.in('temple_id', ids)
  }

  const { data, error } = await query
  if (error) throw error

  // map rows -> UI shape
  return (data || []).map(r => ({
    id: r.id,
    date: (r.start_at || '').slice(0, 10),
    title: r.title,
    description: r.details,
    temple: r.temples?.name || 'All',
    level: r.level || 'low',
  }))
}
