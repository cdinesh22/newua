import { supabase } from '../lib/supabaseClient'

// Utilities
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)) }

// Map DB temple row to UI shape used across the app
export function mapTemple(row) {
  return {
    _id: row.id,
    name: row.name,
    location: row.location || {},
    timings: row.timings || { slotDuration: 30 },
    capacity: row.capacity || { maxVisitorsPerSlot: 0, totalDailyCapacity: 0 },
    images: row.images || [],
    rules: row.rules || [],
    facilities: row.facilities || [],
    emergencyContacts: row.emergencyContacts || [],
    externalSources: row.externalSources || {},
    description: row.description || '',
  }
}

export async function getTemplesList() {
  const { data, error } = await supabase.from('temples').select('*').order('name', { ascending: true })
  if (error) {
    console.warn("Failed to fetch temples, using mock data. Error:", error.message);
    const mockTemples = [
      { id: 'akshardham-d', name: 'Akshardham Temple (Delhi)', location: { city: 'Delhi', state: 'Delhi' } },
      { id: 'somnath', name: 'Somnath Temple', location: { city: 'Prabhas Patan', state: 'Gujarat' } },
      { id: 'dwarka', name: 'Dwarkadhish Temple', location: { city: 'Dwarka', state: 'Gujarat' } },
      { id: 'ambaji', name: 'Ambaji Temple', location: { city: 'Ambaji', state: 'Gujarat' } },
      { id: 'pavagadh', name: 'Pavagadh Mahakali Temple', location: { city: 'Pavagadh', state: 'Gujarat' } },
      { id: 'kashi', name: 'Kashi Vishwanath Temple', location: { city: 'Varanasi', state: 'Uttar Pradesh' } },
      { id: 'ttd', name: 'Tirumala Tirupati (TTD)', location: { city: 'Tirupati', state: 'Andhra Pradesh' } },
      { id: 'shirdi', name: 'Shirdi Sai Baba Temple', location: { city: 'Shirdi', state: 'Maharashtra' } },
      { id: 'vaishno', name: 'Vaishno Devi Shrine', location: { city: 'Katra', state: 'Jammu and Kashmir' } },
      { id: 'jagannath', name: 'Jagannath Temple (Puri)', location: { city: 'Puri', state: 'Odisha' } },
      { id: 'golden', name: 'Golden Temple (Amritsar)', location: { city: 'Amritsar', state: 'Punjab' } },
      { id: 'siddhi', name: 'Siddhivinayak (Mumbai)', location: { city: 'Mumbai', state: 'Maharashtra' } },
      { id: 'meenakshi', name: 'Meenakshi Amman (Madurai)', location: { city: 'Madurai', state: 'Tamil Nadu' } },
      { id: 'kamakhya', name: 'Kamakhya Temple (Assam)', location: { city: 'Guwahati', state: 'Assam' } },
    ];
    return mockTemples.map(mapTemple);
  }
  return (data || []).map(mapTemple)
}

export async function getTempleDetails(id) {
  const { data, error } = await supabase.from('temples').select('*').eq('id', id).single()
  if (error) throw error
  return mapTemple(data)
}

// Simulation snapshot structure expected by UI
// {
//   temple: { location: { coordinates: { latitude, longitude } }, capacity, timings },
//   currentStatus: { expectedVisitors, actualVisitors },
//   areas: [{ name, occupancy, capacity, occupancyPercentage, density }],
//   facilities: [{ type, name, lat, lng }],
//   alerts: [{ type, message }],
//   weatherImpact: { condition, temperature, impactLevel },
//   hourlyData: [{ hour, expectedVisitors, actualVisitors }]
// }

export async function getSimulation(templeId, isoDate) {
  // Try to read from a table if you create it: 'temple_simulation'
  const { data, error } = await supabase
    .from('temple_simulation')
    .select('*')
    .eq('temple_id', templeId)
    .eq('date', isoDate)
    .maybeSingle()

  // Always ensure we have temple info
  let temple
  try {
    temple = await getTempleDetails(templeId)
  } catch (e) {
    console.error(`Failed to fetch details for temple ${templeId}:`, e)
    // Re-throw or return a specific error structure if the UI should handle this case
    throw new Error(`Could not load temple details. Simulation cannot proceed.`)
  }

  if (error && error.code !== 'PGRST116') { // PGRST116: "The result contains 0 rows"
    console.error(`Error fetching simulation data for temple ${templeId}, date ${isoDate}:`, error)
    // Optional: Decide if you should still synthesize data or throw
  }

  if (!data) {
    // Fallback: synthesize a reasonable snapshot using temple capacity
    const cap = Number(temple?.capacity?.maxVisitorsPerSlot || 0)
    const base = Math.max(50, Math.round(cap * 0.6))
    const nowHour = new Date().getHours()
    const hourlyData = Array.from({ length: 24 }).map((_, h) => ({
      hour: h,
      expectedVisitors: Math.round(base * (0.6 + 0.8 * Math.sin((Math.PI * (h + 6)) / 12)))
    }))
    const currentExp = hourlyData[nowHour]?.expectedVisitors ?? base
    const actualVisitors = clamp(Math.round(currentExp * 0.9 + (Math.random() * 0.2 - 0.1) * currentExp), 0, cap || currentExp)

    const areas = ['Main Hall', 'Queue Lane A', 'Queue Lane B', 'Prasad Counter', 'Entry Gate', 'Exit Gate'].map((name, i) => {
      const aCap = 50 + i * 30
      const occ = Math.round(aCap * (0.5 + Math.random()))
      const pct = Math.round((occ / aCap) * 100)
      const density = pct > 90 ? 'critical' : pct > 70 ? 'high' : pct > 40 ? 'medium' : 'low'
      return { name, occupancy: occ, capacity: aCap, occupancyPercentage: pct, density }
    })

    return {
      temple: {
        location: { coordinates: temple.location?.coordinates || { latitude: 21.0, longitude: 72.0 } },
        capacity: temple.capacity,
        timings: temple.timings,
      },
      currentStatus: { expectedVisitors: currentExp, actualVisitors },
      areas,
      facilities: (temple.facilities || []).map(f => ({ type: f.type || 'other', name: f.name || f.type, lat: f.lat, lng: f.lng })),
      alerts: [],
      weatherImpact: { condition: 'Clear', temperature: 30, impactLevel: 'low' },
      hourlyData,
    }
  }

  // If you do have a row in 'temple_simulation', normalize fields here
  return {
    temple: data.temple || {
      location: { coordinates: temple.location?.coordinates || { latitude: 21.0, longitude: 72.0 } },
      capacity: temple.capacity,
      timings: temple.timings,
    },
    currentStatus: data.current_status || { expectedVisitors: 0, actualVisitors: 0 },
    areas: data.areas || [],
    facilities: data.facilities || [],
    alerts: data.alerts || [],
    weatherImpact: data.weather_impact || { condition: 'Clear', temperature: 30, impactLevel: 'low' },
    hourlyData: data.hourly_data || [],
  }
}

export function estimateWaitingTime({ currentVisitors, capacityPerSlot, slotDurationMinutes = 30, lanes = 2 }) {
  if (!capacityPerSlot || capacityPerSlot <= 0) return null
  const slotsNeeded = currentVisitors / (capacityPerSlot * lanes)
  const minutes = Math.max(0, Math.round(slotsNeeded * slotDurationMinutes))
  let level = 'low'
  if (minutes > 60) level = 'high'
  else if (minutes > 30) level = 'medium'
  return { minutes, level }
}
