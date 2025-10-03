import { useEffect, useState } from 'react'
import { getTempleRealtime } from '../api/temples'
import Spinner from './Spinner'

export default function TempleRealtimePanel({ templeId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const res = await getTempleRealtime(templeId)
        if (mounted) setData(res?.data || res)
      } catch (e) {
        if (mounted) setError(e?.response?.data?.message || e.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (templeId) {
      load()
      const interval = setInterval(load, 90_000) // refresh every 90s
      return () => { mounted = false; clearInterval(interval) }
    }
  }, [templeId])

  if (!templeId) return null

  if (loading) return (
    <div className="p-4 border rounded bg-white shadow flex items-center">
      <Spinner size={20} />
      <span className="ml-2 text-gray-600">Loading realtime info...</span>
    </div>
  )

  if (error) return (
    <div className="p-4 border rounded bg-red-50 text-red-700">
      Failed to load realtime info: {String(error)}
    </div>
  )

  const rt = data || {}
  const crowd = rt.crowd || {}
  const slot = rt.slotAvailability || {}
  const timings = rt.darshanTimings || {}

  const crowdBadge = (
    <span className={`px-2 py-1 rounded text-xs ${
      crowd.crowdLevel === 'high' ? 'bg-red-100 text-red-700' :
      crowd.crowdLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
      crowd.crowdLevel === 'low' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
    }`}>
      {crowd.crowdLevel || 'unknown'}
    </span>
  )

  const availabilityBadge = (
    <span className={`px-2 py-1 rounded text-xs ${
      slot.status === 'full' ? 'bg-red-100 text-red-700' :
      slot.status === 'limited' ? 'bg-yellow-100 text-yellow-700' :
      slot.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
    }`}>
      {slot.status || 'unknown'}{slot.remaining != null ? ` · ${slot.remaining} spots` : ''}
    </span>
  )

  return (
    <div className="p-4 border rounded bg-white shadow space-y-3 ind-card ind-anim-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Darshan Timings</div>
          <div className="font-medium">
            {timings?.openTime && timings?.closeTime ? `${timings.openTime} – ${timings.closeTime}` : '—'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Crowd Level</div>
          <div className="font-medium">{crowdBadge}</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Open Now</div>
          <div className="font-medium">{crowd.isOpen ? 'Yes' : 'No'}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Slot Availability</div>
          <div className="font-medium">{availabilityBadge}</div>
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-500">Latest Notices</div>
        {Array.isArray(rt.notices) && rt.notices.length > 0 ? (
          <ul className="mt-1 space-y-1 list-disc list-inside text-sm">
            {rt.notices.slice(0, 5).map((n, idx) => (
              <li key={idx}>
                {n.link ? <a className="text-blue-600 hover:underline" href={n.link} target="_blank" rel="noopener noreferrer">{n.title || n.source || 'Notice'}</a> : (n.title || n.source || 'Notice')}
                {n.pubDate ? <span className="text-gray-400 ml-1">({new Date(n.pubDate).toLocaleDateString()})</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500 text-sm">No recent notices</div>
        )}
      </div>

      <div className="text-xs text-gray-400">Updated at {rt.fetchedAt ? new Date(rt.fetchedAt).toLocaleTimeString() : '—'}</div>
    </div>
  )
}
