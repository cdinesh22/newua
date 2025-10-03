import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import AdminTabs from '../components/AdminTabs'
import api from '../api/client'
import CountUp from '../components/CountUp'
import { Skeleton, SkeletonText } from '../components/Skeleton'

// Minimal India-themed charts
function Sparkline({ values=[] }) {
  const width = 520, height = 160, pad = 8
  const max = Math.max(1, ...values)
  const step = values.length > 1 ? (width - 2*pad) / (values.length - 1) : 0
  const x = i => pad + i * step
  const y = v => height - pad - (v/max) * (height - 2*pad)
  const path = values.map((v,i)=>`${i?'L':'M'} ${x(i)} ${y(v)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[180px]">
      <rect x="0" y="0" width={width} height={height} fill="white" />
      {[0.25,0.5,0.75].map((g,i)=>(<line key={i} x1={pad} x2={width-pad} y1={pad+g*(height-2*pad)} y2={pad+g*(height-2*pad)} stroke="#eee" />))}
      <path d={path} fill="none" stroke="#FF9933" strokeWidth="2.5" />
      {values.map((v,i)=>(<circle key={i} cx={x(i)} cy={y(v)} r="2.5" fill="#FF9933" />))}
    </svg>
  )
}

function BarMini({ labels=[], values=[] }) {
  const width = 520, height = 200, pad = 20
  const max = Math.max(1, ...values)
  const bw = values.length ? (width - 2*pad) / values.length - 8 : 16
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[220px]">
      <rect x="0" y="0" width={width} height={height} fill="white" />
      {values.map((v,i)=>{
        const h = (v/max) * (height - 2*pad)
        const x = pad + i*(bw+8)
        const y = height - pad - h
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={h} fill="#138808" rx="3" />
          </g>
        )
      })}
    </svg>
  )}

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [overview, setOverview] = useState(null)
  const [temples, setTemples] = useState([])
  const [selectedTemple, setSelectedTemple] = useState('')
  const [simInput, setSimInput] = useState({ hour: new Date().getHours(), expectedVisitors: 100, actualVisitors: 80 })

  useEffect(() => {
    api.get('/api/admin/dashboard').then(res => setDashboard(res.data.data))
    api.get('/api/analytics/overview?period=month').then(res => setOverview(res.data.data))
    api.get('/api/temples').then(res => setTemples(res.data.data.temples))
  }, [])

  const updateSimulation = async () => {
    if (!selectedTemple) return alert('Select a temple')
    await api.post(`/api/simulation/${selectedTemple}/update`, simInput)
    alert('Simulation updated!')
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6 animate-slide-up">
        <div className="text-xl font-semibold">Admin Dashboard</div>

        {dashboard ? (
          <div className="grid md:grid-cols-4 gap-4">
            {Object.entries({
              'Temples': dashboard.stats.totalTemples,
              'Pilgrims': dashboard.stats.totalUsers,
              'Today Bookings': dashboard.stats.todayBookings,
              'Active Slots': dashboard.stats.activeSlots,
            }).map(([k,v]) => (
              <div key={k} className="glass-card ind-gradient-border p-4 rounded">
                <div className="text-sm text-gray-600">{k}</div>
                <div className="text-2xl font-bold"><CountUp to={v} duration={800} /></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-4 gap-4">
            {Array.from({length:4}).map((_,i)=>(
              <div key={i} className="glass-card ind-gradient-border p-4 rounded">
                <Skeleton className="h-4 w-1/3 mb-3" />
                <Skeleton className="h-7 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {overview ? (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass-card ind-gradient-border p-4 rounded ind-card">
              <div className="font-semibold mb-2">Bookings Trend</div>
              <Sparkline values={overview.bookingTrends.map(t=>t.bookings)} />
            </div>
            <div className="glass-card ind-gradient-border p-4 rounded ind-card">
              <div className="font-semibold mb-2">Revenue by Temple</div>
              <BarMini labels={(overview.revenueByTemple||[]).map(r=>r.templeName)} values={(overview.revenueByTemple||[]).map(r=>r.revenue)} />
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass-card ind-gradient-border p-4 rounded">
              <div className="font-semibold mb-2">Bookings Trend</div>
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="glass-card ind-gradient-border p-4 rounded">
              <div className="font-semibold mb-2">Revenue by Temple</div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        )}

        <div className="glass-card ind-gradient-border p-4 rounded grid md:grid-cols-5 gap-3 items-end">
          <div className="md:col-span-2">
            <div className="font-semibold mb-2">Crowd Simulation</div>
            <select className="w-full p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans" value={selectedTemple} onChange={e=>setSelectedTemple(e.target.value)}>
              <option value="">Select Temple</option>
              {temples.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            {(() => {
              const sel = temples.find(t => t._id === selectedTemple)
              const url = sel?.externalSources?.websiteUrl
              return url ? (
                <div className="mt-2 text-right">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-saffron-700 hover:underline text-sm">Official Website</a>
                </div>
              ) : null
            })()}
          </div>
          <input className="p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans" type="number" placeholder="Hour" value={simInput.hour} onChange={e=>setSimInput({...simInput, hour: parseInt(e.target.value)})} />
          <input className="p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans" type="number" placeholder="Expected" value={simInput.expectedVisitors} onChange={e=>setSimInput({...simInput, expectedVisitors: parseInt(e.target.value)})} />
          <input className="p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans" type="number" placeholder="Actual" value={simInput.actualVisitors} onChange={e=>setSimInput({...simInput, actualVisitors: parseInt(e.target.value)})} />
          <button className="btn-india ind-gradient-border" onClick={updateSimulation}>Update</button>
        </div>
      </div>
    </Layout>
  )
}
