import { supabase } from '../lib/supabaseClient'

// Map DB rows to the shape the UI expects (compat with existing components)
function mapTemple(row) {
  // Assuming your Supabase table 'temples' columns include:
  // id (uuid), name (text), location (jsonb), timings (jsonb), images (jsonb), externalSources (jsonb)
  return {
    _id: row.id,
    name: row.name,
    location: row.location || {},
    timings: row.timings || {},
    images: row.images || [],
    externalSources: row.externalSources || {},
  }
}

export async function getTemples() {
  const { data, error } = await supabase
    .from('temples')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw error
  return (data || []).map(mapTemple)
}

export async function getTempleById(id) {
  const { data, error } = await supabase
    .from('temples')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return mapTemple(data)
}
