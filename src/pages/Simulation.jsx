import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getTemplesList, getTempleDetails, getSimulation, estimateWaitingTime } from '../services/simulation'
import HeatmapMap from '../components/HeatmapMap'
import AlertsBanner from '../components/AlertsBanner'
import { Skeleton, SkeletonText } from '../components/Skeleton'
import CrowdProgress from '../components/CrowdProgress'
import TempleRealtimePanel from '../components/TempleRealtimePanel'
import { useLang } from '../context/LanguageContext'

function MiniTrend({ hourly }) {
  const width = 420
  const height = 120
  const padding = 8
  const [hover, setHover] = useState(null)
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
        {[0.25, 0.5, 0.75].map((g, idx) => (
          <line key={idx} x1={padding} x2={width - padding} y1={padding + g * (height - 2 * padding)} y2={padding + g * (height - 2 * padding)} stroke="#eee" strokeWidth="1" />
        ))}
        <path d={expectedPath} fill="none" stroke="#fb923c" strokeWidth="2" />
        <path d={actualPath} fill="none" stroke="#ef4444" strokeWidth="2.5" />
        {points.map(p => (
          <>
            <circle key={`e-${p.i}`} cx={x(p.i)} cy={y(p.exp)} r="2" fill="#fb923c" />
            <circle key={`a-${p.i}`} cx={x(p.i)} cy={y(p.act)} r="2.5" fill="#ef4444" />
          </>
        ))}
        {hover ? (
          <g>
            <line x1={hover.x} x2={hover.x} y1={padding} y2={height - padding} stroke="#ddd" strokeDasharray="4 4" />
          </g>
        ) : null}
      </svg>
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
  const [selectedDate] = useState(() => new Date().toISOString().split('T')[0])
  const [facilityFilters, setFacilityFilters] = useState({})
  const [waitEstimate, setWaitEstimate] = useState(null)
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
    getTemplesList().then(list => {
      setTemples(list)
      const savedId = localStorage.getItem('sim_selectedTempleId')
      const match = savedId ? list.find(t => t._id === savedId) : null
      if (match) setSelectedTemple(match)
      else if (list.length) setSelectedTemple(list[0])
    }).catch(()=>{})
  }, [])

  useEffect(() => {
    if (!selectedTemple) return
    let cancelled = false
    const fetchData = () => {
      const isoDate = (() => {
        try {
          const d = new Date(selectedDate)
          if (!isNaN(d)) return d.toISOString().split('T')[0]
        } catch (_) {}
        return selectedDate
      })()
      getSimulation(selectedTemple._id, isoDate).then(sim => {
        if (!cancelled) setData(sim)
      }).catch(()=>{})
    }
    fetchData()
    const id = setInterval(fetchData, 10000)
    return () => { cancelled = true; clearInterval(id) }
  }, [selectedTemple, selectedDate])

  useEffect(() => {
    if (!selectedTemple) { setTempleDetails(null); return }
    let cancelled = false
    localStorage.setItem('sim_selectedTempleId', selectedTemple._id)
    getTempleDetails(selectedTemple._id).then(res => {
      if (!cancelled) setTempleDetails(res)
    }).catch(()=>{})
    return () => { cancelled = true }
  }, [selectedTemple])

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
    const est = estimateWaitingTime(payload)
    setWaitEstimate(est)
  }, [data])

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-4 animate-slide-up p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-2xl font-semibold text-gray-800">Simulation & Visualization</div>
          <div className="flex items-center gap-2 relative">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={t('search_temples')}
                className="p-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchTerm}
                onChange={(e)=> setSearchTerm(e.target.value)}
                onKeyDown={(e)=> { if (e.key === 'Enter') performTempleSearch() }}
              />
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                onClick={performTempleSearch}
                aria-label="Search temples"
              >
                {t('search')}
              </button>
            </div>
            <select className="p-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500" value={selectedTemple?._id||''} onChange={e=>setSelectedTemple(temples.find(t=>t._id===e.target.value))}>
              <option value="">Select Temple</option>
              {temples.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
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

        {selectedTemple ? (
          <div className="bg-white rounded-xl shadow-lg p-6 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <h2 className="text-xl font-bold text-gray-800">{selectedTemple.name}</h2>
              <p className="text-sm text-gray-600">{selectedTemple.location?.city}, {selectedTemple.location?.state}</p>
              {(() => {
                const url = templeDetails?.externalSources?.websiteUrl || selectedTemple?.externalSources?.websiteUrl
                return url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline font-semibold text-sm">
                    Official Website
                  </a>
                ) : null
              })()}
              <p className="text-sm text-gray-700">{templeDetails?.description}</p>
              {data?.temple?.location?.coordinates ? (
                <a
                  className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
                  href={`https://www.google.com/maps/dir/?api=1&destination=${data.temple.location.coordinates.latitude},${data.temple.location.coordinates.longitude}`}
                  target="_blank" rel="noopener noreferrer"
                >
                  Navigate to Temple
                </a>
              ) : null}
              
              {templeDetails?.facilities?.length ? (
                <div>
                  <h3 className="font-semibold text-md mb-2">Filter Facilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(templeDetails.facilities.map(f=>f.type||'other'))).map((type)=>{
                      const checked = facilityFilters[type] ?? true
                      return (
                        <label key={type} className="inline-flex items-center gap-2 text-sm">
                          <input type="checkbox" className="form-checkbox h-4 w-4 text-orange-600" checked={checked} onChange={e=>setFacilityFilters(prev=>({ ...prev, [type]: e.target.checked }))} />
                          <span className="capitalize">{type}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              {templeDetails?.rules?.length ? (
                <div>
                  <h3 className="font-semibold text-md mb-2">Visitor Guidelines</h3>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {templeDetails.rules.map((r,i)=>(<li key={i}>{r}</li>))}
                  </ul>
                </div>
              ) : null}
            </div>
            
            <div className="md:col-span-2 bg-green-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700">Timings</h4>
                  <p className="text-sm">Open: {templeDetails?.timings?.openTime || '-'}</p>
                  <p className="text-sm">Close: {templeDetails?.timings?.closeTime || '-'}</p>
                  <p className="text-sm">Slot: {templeDetails?.timings?.slotDuration || 30} mins</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Capacity</h4>
                  <p className="text-sm">Per Slot: {templeDetails?.capacity?.maxVisitorsPerSlot || 0}</p>
                  <p className="text-sm">Daily: {templeDetails?.capacity?.totalDailyCapacity || 0}</p>
                </div>
                {templeDetails?.emergencyContacts?.length ? (
                  <div>
                    <h4 className="font-semibold text-gray-700">Emergency Contacts</h4>
                    <ul className="list-disc list-inside text-sm">
                      {templeDetails.emergencyContacts.map((c,i)=>(
                        <li key={i}>{c.name}: {c.phone}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {templeDetails?.facilities?.length ? (
                  <div>
                    <h4 className="font-semibold text-gray-700">Facilities</h4>
                    <div className="flex flex-wrap gap-2">
                      {templeDetails.facilities.map((f,i)=>(
                        <span key={i} className="px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-medium">
                          {f.type || f.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              
              <div className="pt-4 border-t border-green-200">
                <h4 className="font-semibold text-gray-700 mb-2">Realtime Updates</h4>
                <TempleRealtimePanel templeId={selectedTemple?._id} />
              </div>
            </div>
          </div>
        ) : null}

        {data ? (
          <div className="grid md:grid-cols-5 gap-4">
            <div className="md:col-span-5 grid md:grid-cols-5 gap-4">
              <StatCard title="Expected Visitors" value={data.currentStatus?.expectedVisitors ?? 0} />
              <StatCard title="Actual Visitors" value={data.currentStatus?.actualVisitors ?? 0} />
              <div className="bg-green-50 rounded-lg p-4 shadow">
                <h5 className="text-sm text-gray-600 mb-1">Occupancy</h5>
                <CrowdProgress percentage={
                  data.temple?.capacity?.maxVisitorsPerSlot ? 
                  Math.min(100, Math.round(((data.currentStatus?.actualVisitors ?? 0) / data.temple.capacity.maxVisitorsPerSlot) * 100)) : 0
                } />
              </div>
              <StatCard title="Hotspots" value={`${(data.areas||[]).filter(a=>a.density==='critical').length} critical / ${(data.areas||[]).filter(a=>a.density==='high').length} high`} />
              <StatCard title="Waiting Time (est.)" value={waitEstimate?.minutes != null ? `${waitEstimate.minutes} min` : '-'} level={waitEstimate?.level} />
            </div>
            
            <div className="md:col-span-3 bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold mb-2">Hourly Trend (Minimal)</h3>
              <MiniTrend hourly={data.hourlyData||[]} />
            </div>

            <div className="md:col-span-2 bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold mb-2">Weather Impact</h3>
              <p className="text-sm">Condition: {data.weatherImpact?.condition || '-'}</p>
              <p className="text-sm">Temperature: {data.weatherImpact?.temperature ?? '-'}°C</p>
              <p className="text-sm">Impact: {data.weatherImpact?.impactLevel || 'none'}</p>
            </div>
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

function StatCard({ title, value, level }) {
  return (
    <div className="bg-green-50 rounded-lg p-4 shadow">
      <h5 className="text-sm text-gray-600">{title}</h5>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
      {level && <div className="text-xs text-gray-500 mt-1">Level: {level}</div>}
    </div>
  )
}
