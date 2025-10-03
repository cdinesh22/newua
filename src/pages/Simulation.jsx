import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/client'
import HeatmapMap from '../components/HeatmapMap'
import AlertsBanner from '../components/AlertsBanner'
import { Skeleton, SkeletonText } from '../components/Skeleton'
import CrowdProgress from '../components/CrowdProgress'
import TempleRealtimePanel from '../components/TempleRealtimePanel'
import { useLang } from '../context/LanguageContext'
// Minimal inline SVG trend (sparkline) replaces heavy charting libs

function MiniTrend({ hourly }) {
  const width = 420
  const height = 120
  const padding = 8
  const [hover, setHover] = useState(null) // { x, y, i, exp, act }
  const points = (hourly || []).map((h, i) => ({ i, hour: h.hour, exp: h.expectedVisitors || 0, act: h.actualVisitors || 0 }))
  const maxVal = Math.max(1, ...points.flatMap(p => [p.exp, p.act]))
  const xStep = points.length > 1 ? (width - 2 * padding) / (points.length - 1) : 0
  const y = v => height - padding - ((v / maxVal) * (height - 2 * padding))
  const x = i => padding + i * xStep
  const toPath = (arr, key) => arr.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${x(p.i)} ${y(p[key])}`).join(' ')
  const expectedPath = toPath(points, 'exp')
  const actualPath = toPath(points, 'act')

  const handleMove = (evt) => {
    const rect = evt.currentTarget.getBoundingClientRect()
    const px = evt.clientX - rect.left
    const rel = Math.max(padding, Math.min(width - padding, px))
    const idx = xStep ? Math.round((rel - padding) / xStep) : 0
    const p = points[Math.max(0, Math.min(points.length - 1, idx))]
    if (!p) return
    setHover({
      x: x(p.i),
      y: y(p.act),
      i: p.i,
      hour: p.hour,
      exp: p.exp,
      act: p.act,
    })
  }

  return (
    <div className="w-full h-[180px] relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-[160px]"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        <rect x="0" y="0" width={width} height={height} fill="white" />
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((g, idx) => (
          <line key={idx} x1={padding} x2={width - padding} y1={padding + g * (height - 2 * padding)} y2={padding + g * (height - 2 * padding)} stroke="#eee" strokeWidth="1" />
        ))}
        {/* Expected */}
        <path d={expectedPath} fill="none" stroke="#fb923c" strokeWidth="2" />
        {/* Actual */}
        <path d={actualPath} fill="none" stroke="#ef4444" strokeWidth="2.5" />
        {/* Points */}
        {points.map(p => (
          <>
            <circle key={`e-${p.i}`} cx={x(p.i)} cy={y(p.exp)} r="2" fill="#fb923c" />
            <circle key={`a-${p.i}`} cx={x(p.i)} cy={y(p.act)} r="2.5" fill="#ef4444" />
          </>
        ))}
        {/* Hover guide */}
        {hover ? (
          <g>
            <line x1={hover.x} x2={hover.x} y1={padding} y2={height - padding} stroke="#ddd" strokeDasharray="4 4" />
          </g>
        ) : null}
      </svg>
      {/* Tooltip */}
      {hover ? (
        <div
          className="absolute bg-white border rounded shadow px-2 py-1 text-xs pointer-events-none"
          style={{ left: `calc(${(hover.x / width) * 100}% + 8px)`, top: 6 }}
        >
          <div className="font-medium mb-0.5">H{hover.hour ?? hover.i}</div>
          <div className="text-orange-600">Expected: {hover.exp}</div>
          <div className="text-red-600">Actual: {hover.act}</div>
        </div>
      ) : null}
      <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
        <span className="inline-flex items-center gap-2"><span className="w-3 h-0.5 bg-[#fb923c] inline-block"></span> Expected</span>
        <span className="inline-flex items-center gap-2"><span className="w-3 h-0.5 bg-[#ef4444] inline-block"></span> Actual</span>
      </div>
    </div>
  )
}

export default function Simulation() {
  const { t } = useLang()
  const [temples, setTemples] = useState([])
  const [selectedTemple, setSelectedTemple] = useState(null)
  const [data, setData] = useState(null)
  const [templeDetails, setTempleDetails] = useState(null)
  // Date is internal-only. Use today's date; UI date picker removed.
  const [selectedDate] = useState(() => new Date().toISOString().split('T')[0])
  const [showAllRules, setShowAllRules] = useState(false)
  const [showAllFacilities, setShowAllFacilities] = useState(false)
  const [imgIndex, setImgIndex] = useState(0)
  const [facilityFilters, setFacilityFilters] = useState({})
  // Map layer toggles
  const [showAreas, setShowAreas] = useState(true)
  const [showFacilities, setShowFacilities] = useState(true)
  const [showTempleMarker, setShowTempleMarker] = useState(true)
  // Waiting time estimate
  const [waitEstimate, setWaitEstimate] = useState(null)
  // Search state for temples
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])

  const performTempleSearch = () => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) { setSearchResults([]); return }
    const results = (temples || []).filter(t => {
      const name = (t.name || '').toLowerCase()
      const city = (t.location?.city || '').toLowerCase()
      const state = (t.location?.state || '').toLowerCase()
      return name.includes(q) || city.includes(q) || state.includes(q)
    })
    setSearchResults(results.slice(0, 8))
    if (results.length === 1) {
      setSelectedTemple(results[0])
    }
  }

  useEffect(() => {
    api.get('/api/temples').then(res => {
      const list = res.data.data.temples || []
      setTemples(list)
      // Restore last selected temple if available
      const savedId = localStorage.getItem('sim_selectedTempleId')
      const match = savedId ? list.find(t => t._id === savedId) : null
      if (match) {
        setSelectedTemple(match)
      } else if (list.length) {
        setSelectedTemple(list[0])
      }
    })
  }, [])

  useEffect(() => {
    if (!selectedTemple) return
    let cancelled = false
    const fetchData = () => {
      // Always pass ISO format to backend
      const isoDate = (() => {
        try {
          // selectedDate is expected to be YYYY-MM-DD; new Date handles it
          const d = new Date(selectedDate)
          if (!isNaN(d)) return d.toISOString().split('T')[0]
        } catch (_) {}
        return selectedDate
      })()
      api.get(`/api/simulation/${selectedTemple._id}`, { params: { date: isoDate } }).then(res => {
        if (!cancelled) setData(res.data.data)
      }).catch(()=>{})
    }
    fetchData()
    const id = setInterval(fetchData, 10000)
    return () => { cancelled = true; clearInterval(id) }
  }, [selectedTemple, selectedDate])

  // Subscribe to real-time status updates via SSE when a temple is selected
  useEffect(() => {
    if (!selectedTemple) return
    const baseURL = api?.defaults?.baseURL?.replace(/\/$/, '') || ''
    const url = `${baseURL}/api/temples/${selectedTemple._id}/stream`
    let es
    try {
      es = new EventSource(url, { withCredentials: false })
      es.addEventListener('status', (evt) => {
        try {
          const status = JSON.parse(evt.data)
          setData((prev) => {
            if (!prev) return prev
            return {
              ...prev,
              currentStatus: {
                ...prev.currentStatus,
                ...status,
              },
            }
          })
        } catch (_) { /* ignore bad payload */ }
      })
    } catch (_) {
      // Ignore EventSource init errors (fallback is polling above)
    }

    return () => {
      try { es && es.close() } catch (_) { /* ignore */ }
    }
  }, [selectedTemple])

  // Fetch full temple details when selection changes (description, timings, rules, contacts, facilities)
  useEffect(() => {
    if (!selectedTemple) { setTempleDetails(null); return }
    let cancelled = false
    // Persist selected temple
    localStorage.setItem('sim_selectedTempleId', selectedTemple._id)
    api.get(`/api/temples/${selectedTemple._id}`).then(res => {
      if (!cancelled) setTempleDetails(res.data.data.temple)
    }).catch(()=>{})
    return () => { cancelled = true }
  }, [selectedTemple])

  // No date persistence; always use today

  // Compute or fetch waiting time when data updates
  useEffect(() => {
    if (!data) { setWaitEstimate(null); return }
    const current = data.currentStatus || {}
    const capacity = data.temple?.capacity?.maxVisitorsPerSlot || 0
    const slotDuration = data.temple?.timings?.slotDuration || 30
    const payload = {
      currentVisitors: Number(current.actualVisitors ?? current.expectedVisitors ?? 0),
      capacityPerSlot: Number(capacity),
      slotDurationMinutes: Number(slotDuration),
      lanes: 2,
    }
    api.post('/api/waiting-times/estimate', payload).then(res => {
      setWaitEstimate(res?.data?.data || null)
    }).catch(()=> setWaitEstimate(null))
  }, [data])

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-4 animate-slide-up">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xl font-semibold">Simulation & Visualization</div>
          <div className="flex items-center gap-2 relative">
            {/* Temple search */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={t('search_temples')}
                className="p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans"
                value={searchTerm}
                onChange={(e)=> setSearchTerm(e.target.value)}
                onKeyDown={(e)=> { if (e.key === 'Enter') performTempleSearch() }}
              />
              <button
                type="button"
                className="px-3 py-2 rounded-lg bg-[color:var(--india-saffron)] text-white hover:opacity-90 ind-trans"
                onClick={performTempleSearch}
                aria-label="Search temples"
              >
                {t('search')}
              </button>
            </div>
            <select className="p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans" value={selectedTemple?._id||''} onChange={e=>setSelectedTemple(temples.find(t=>t._id===e.target.value))}>
              <option value="">Select Temple</option>
              {temples.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            {/* Results dropdown */}
            {searchResults && searchResults.length > 0 ? (
              <div className="absolute right-0 top-full mt-1 w-72 max-w-[80vw] z-10 bg-white border rounded-lg shadow-lg overflow-hidden">
                <ul className="max-h-64 overflow-auto">
                  {searchResults.map(r => (
                    <li key={r._id}>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-gray-50"
                        onClick={() => { setSelectedTemple(r); setSearchResults([]) }}
                      >
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-gray-500">{r.location?.city}{r.location?.state ? `, ${r.location.state}` : ''}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        {/* Temple Information Panel */}
        {selectedTemple ? (
          <div className="glass-card ind-gradient-border p-4 grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="font-semibold mb-1">{selectedTemple.name}</div>
              <div className="text-sm text-gray-600">
                {selectedTemple.location?.city}, {selectedTemple.location?.state}
              </div>
              {(() => {
                const url = templeDetails?.externalSources?.websiteUrl || selectedTemple?.externalSources?.websiteUrl
                return url ? (
                  <div className="mt-1 text-sm">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-saffron-700 hover:underline"
                    >
                      Official Website
                    </a>
                  </div>
                ) : null
              })()}
              {/* Image carousel */}
              {templeDetails?.images?.length ? (
                <div className="mt-3">
                  <div className="relative w-full h-48 md:h-56 rounded-xl overflow-hidden border ind-gradient-border glass-card">
                    {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                    <img
                      src={templeDetails.images[imgIndex]?.url}
                      alt={templeDetails.images[imgIndex]?.caption || 'Temple image'}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute left-2 top-1/2 -translate-y-1/2 glass-btn w-8 h-8 rounded-full"
                      onClick={() => setImgIndex((prev) => (prev - 1 + templeDetails.images.length) % templeDetails.images.length)}
                      aria-label="Previous image"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 glass-btn w-8 h-8 rounded-full"
                      onClick={() => setImgIndex((prev) => (prev + 1) % templeDetails.images.length)}
                      aria-label="Next image"
                    >
                      ›
                    </button>
                    {templeDetails.images[imgIndex]?.caption ? (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs px-2 py-1">
                        {templeDetails.images[imgIndex]?.caption}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
              {templeDetails?.description ? (
                <p className="mt-2 text-gray-700 text-sm">{templeDetails.description}</p>
              ) : null}
              {/* Navigation assistance */}
              {data?.temple?.location?.coordinates ? (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <a
                    className="glass-btn px-3 py-1.5"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${data.temple.location.coordinates.latitude},${data.temple.location.coordinates.longitude}`}
                    target="_blank" rel="noopener noreferrer"
                  >Navigate to Temple</a>
                </div>
              ) : null}
              {/* Facility filters */}
              {templeDetails?.facilities?.length ? (
                <div className="mt-3">
                  <div className="font-medium text-sm mb-1">Filter Facilities</div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(templeDetails.facilities.map(f=>f.type||'other'))).map((type)=>{
                      const checked = facilityFilters[type] ?? true
                      return (
                        <label key={type} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-white/50 bg-white/40 backdrop-blur ind-trans">
                          <input type="checkbox" checked={checked} onChange={e=>setFacilityFilters(prev=>({ ...prev, [type]: e.target.checked }))} />
                          <span className="capitalize">{type}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ) : null}
              {templeDetails?.rules?.length ? (
                <div className="mt-3">
                  <div className="font-medium text-sm mb-1">Visitor Guidelines</div>
                  <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                    {(showAllRules ? templeDetails.rules : templeDetails.rules.slice(0,5)).map((r,i)=>(<li key={i}>{r}</li>))}
                  </ul>
                  {templeDetails.rules.length > 5 ? (
                    <button
                      type="button"
                      className="mt-2 text-saffron-700 hover:underline text-sm"
                      onClick={() => setShowAllRules(v=>!v)}
                    >
                      {showAllRules ? 'Show less' : 'Show more'}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="space-y-2 text-sm text-gray-700 md:sticky md:top-4 self-start">
              <div>
                <div className="font-medium">Timings</div>
                <div>Open: {templeDetails?.timings?.openTime || selectedTemple.timings?.openTime || '-'}</div>
                <div>Close: {templeDetails?.timings?.closeTime || selectedTemple.timings?.closeTime || '-'}</div>
                <div>Slot: {templeDetails?.timings?.slotDuration || selectedTemple.timings?.slotDuration || 30} mins</div>
              </div>
              <div>
                <div className="font-medium">Capacity</div>
                <div>Per Slot: {templeDetails?.capacity?.maxVisitorsPerSlot || selectedTemple.capacity?.maxVisitorsPerSlot || 0}</div>
                <div>Daily: {templeDetails?.capacity?.totalDailyCapacity || selectedTemple.capacity?.totalDailyCapacity || 0}</div>
              </div>
              {templeDetails?.emergencyContacts?.length ? (
                <div>
                  <div className="font-medium">Emergency Contacts</div>
                  <ul className="list-disc ml-5">
                    {templeDetails.emergencyContacts.slice(0,2).map((c,i)=>(
                      <li key={i}>{c.name}: {c.phone}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {templeDetails?.facilities?.length ? (
                <div>
                  <div className="font-medium">Facilities</div>
                  <div className="flex flex-wrap gap-2">
                    {(showAllFacilities ? templeDetails.facilities : templeDetails.facilities.slice(0,6)).map((f,i)=>(
                      <span key={i} className="px-2 py-0.5 rounded-lg border border-white/50 bg-white/40 backdrop-blur text-saffron-700 text-xs">
                        {f.type || f.name}
                      </span>
                    ))}
                  </div>
                  {templeDetails.facilities.length > 6 ? (
                    <button
                      type="button"
                      className="mt-2 text-saffron-700 hover:underline text-sm"
                      onClick={() => setShowAllFacilities(v=>!v)}
                    >
                      {showAllFacilities ? 'Show less' : 'Show more'}
                    </button>
                  ) : null}
                </div>
              ) : null}
              {/* Realtime panel */}
              <div className="mt-3">
                <div className="font-medium mb-1">Realtime Updates</div>
                <TempleRealtimePanel templeId={selectedTemple?._id} />
              </div>
            </div>
          </div>
        ) : null}

        {data ? (
          <div className="space-y-4">
            {/* Key stats */}
            <div className="grid md:grid-cols-4 gap-4">
              {(() => {
                const current = data.currentStatus || {}
                const capacity = data.temple?.capacity?.maxVisitorsPerSlot || 0
                const expected = current.expectedVisitors ?? 0
                const actual = current.actualVisitors ?? 0
                const occ = capacity ? Math.min(100, Math.round((actual / capacity) * 100)) : 0
                const critical = (data.areas||[]).filter(a=>a.density==='critical').length
                const high = (data.areas||[]).filter(a=>a.density==='high').length
                const facilitiesCount = (data.facilities||[]).length
                return (
                  <>
                    <div className="glass-card ind-gradient-border p-4">
                      <div className="text-sm text-gray-600">Expected Visitors</div>
                      <div className="text-2xl font-semibold">{expected}</div>
                    </div>
                    <div className="glass-card ind-gradient-border p-4">
                      <div className="text-sm text-gray-600">Actual Visitors</div>
                      <div className="text-2xl font-semibold">{actual}</div>
                    </div>
                    <div className="glass-card ind-gradient-border p-4">
                      <div className="text-sm text-gray-600 mb-1">Occupancy</div>
                      <CrowdProgress percentage={occ} />
                    </div>
                    <div className="glass-card ind-gradient-border p-4">
                      <div className="text-sm text-gray-600">Hotspots</div>
                      <div className="text-2xl font-semibold">{critical} <span className="text-sm font-normal text-gray-500">critical</span> / {high} <span className="text-sm font-normal text-gray-500">high</span></div>
                    </div>
                    <div className="glass-card ind-gradient-border p-4">
                      <div className="text-sm text-gray-600">Waiting Time (est.)</div>
                      <div className="text-2xl font-semibold">{waitEstimate?.minutes != null ? `${waitEstimate.minutes} min` : '-'}</div>
                      <div className="text-xs text-gray-500">Level: {waitEstimate?.level || '-'}</div>
                    </div>
                  </>
                )
              })()}
            </div>

            {/* Weather and Trend */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="glass-card ind-gradient-border p-4">
                <div className="font-semibold mb-1">Weather Impact</div>
                <div className="text-sm text-gray-700">Condition: {data.weatherImpact?.condition || '-'}</div>
                <div className="text-sm text-gray-700">Temperature: {data.weatherImpact?.temperature ?? '-'}°C</div>
                <div className="text-sm text-gray-700">Impact: {data.weatherImpact?.impactLevel || 'none'}</div>
              </div>
              <div className="md:col-span-2 glass-card ind-gradient-border p-4">
                <div className="font-semibold mb-2">Hourly Trend (Minimal)</div>
                <MiniTrend hourly={data.hourlyData||[]} />
              </div>
            </div>

            {/* Density legend */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-medium">Legend:</span>
              <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded bg-green-500 inline-block"></span> Low</span>
              <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded bg-yellow-500 inline-block"></span> Medium</span>
              <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-600 inline-block"></span> High</span>
              <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-800 inline-block"></span> Critical</span>
              {/* Layer toggles */}
              <span className="ml-auto inline-flex items-center gap-2">
                <label className="inline-flex items-center gap-1"><input type="checkbox" checked={showAreas} onChange={e=>setShowAreas(e.target.checked)} /> Crowd overlay</label>
                <label className="inline-flex items-center gap-1"><input type="checkbox" checked={showFacilities} onChange={e=>setShowFacilities(e.target.checked)} /> Facilities</label>
                <label className="inline-flex items-center gap-1"><input type="checkbox" checked={showTempleMarker} onChange={e=>setShowTempleMarker(e.target.checked)} /> Temple marker</label>
              </span>
            </div>

            {/* Map */}
            {(() => {
              const enabledTypes = facilityFilters && Object.keys(facilityFilters).length
                ? Object.entries(facilityFilters).filter(([,v])=>v).map(([k])=>k)
                : Array.from(new Set((templeDetails?.facilities||[]).map(f=>f.type||'other')))
              const filteredFacilities = (data.facilities||[]).filter(f => enabledTypes.includes(f.type||'other'))
              return (
                <HeatmapMap
                  center={data.temple.location.coordinates}
                  areas={data.areas}
                  facilities={filteredFacilities}
                  showAreas={showAreas}
                  showFacilities={showFacilities}
                  showTempleMarker={showTempleMarker}
                  templeName={selectedTemple?.name}
                />
              )
            })()}

            {/* Top busy areas */}
            <div className="glass-card ind-gradient-border p-4">
              <div className="font-semibold mb-2">Busiest Areas</div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="py-2 pr-4">Area</th>
                      <th className="py-2 pr-4">Occupancy</th>
                      <th className="py-2 pr-4">Capacity</th>
                      <th className="py-2 pr-4">% Filled</th>
                      <th className="py-2 pr-4">Density</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.areas||[])
                      .slice()
                      .sort((a,b)=>(b.occupancyPercentage||0)-(a.occupancyPercentage||0))
                      .slice(0,8)
                      .map((a,i)=>(
                        <tr key={i} className="border-t">
                          <td className="py-2 pr-4">{a.name}</td>
                          <td className="py-2 pr-4">{a.occupancy}</td>
                          <td className="py-2 pr-4">{a.capacity}</td>
                          <td className="py-2 pr-4">{a.occupancyPercentage}%</td>
                          <td className="py-2 pr-4 capitalize">{a.density}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Alerts */}
            <AlertsBanner alerts={data.alerts} />
          </div>
        ) : selectedTemple ? (
          <div className="space-y-4">
            <Skeleton className="h-96 w-full" />
            <SkeletonText lines={3} />
          </div>
        ) : null}
      </div>
    </Layout>
  )
}
