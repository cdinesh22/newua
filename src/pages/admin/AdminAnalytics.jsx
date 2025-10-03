import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import AdminTabs from '../../components/AdminTabs'
import api from '../../api/client'
import { Skeleton } from '../../components/Skeleton'

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

function BarMini({ values=[] }) {
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
        return (<rect key={i} x={x} y={y} width={bw} height={h} fill="#138808" rx="3" />)
      })}
    </svg>
  )
}

export default function AdminAnalytics() {
  const [period, setPeriod] = useState('week')
  const [temples, setTemples] = useState([])
  const [temple, setTemple] = useState('')
  const [data, setData] = useState(null)

  const fetchData = async () => {
    const res = await api.get('/api/admin/analytics/bookings', { params: { period, temple } })
    setData(res.data.data)
  }

  useEffect(() => { api.get('/api/temples').then(r=>setTemples(r.data.data.temples)) }, [])
  useEffect(() => { fetchData() }, [period, temple])

  const labels = (data?.analytics||[]).map((d,i)=>`P${i+1}`)
  const bookings = (data?.analytics||[]).map(d=>d.bookings)
  const visitors = (data?.analytics||[]).map(d=>d.visitors)
  const revenue = (data?.analytics||[]).map(d=>d.revenue)

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-4 animate-slide-up">
        <AdminTabs />
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold">Analytics</div>
          <div className="flex items-center gap-2">
            <select className="p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans" value={period} onChange={e=>setPeriod(e.target.value)}>
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
            <select className="p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans" value={temple} onChange={e=>setTemple(e.target.value)}>
              <option value="">All Temples</option>
              {temples.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        {!data ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass-card ind-gradient-border p-4 rounded ind-card">
              <div className="font-semibold mb-2">Bookings</div>
              <Sparkline values={bookings} />
            </div>
            <div className="glass-card ind-gradient-border p-4 rounded ind-card">
              <div className="font-semibold mb-2">Visitors</div>
              <Sparkline values={visitors} />
            </div>
            <div className="glass-card ind-gradient-border p-4 rounded ind-card md:col-span-2">
              <div className="font-semibold mb-2">Revenue</div>
              <BarMini values={revenue} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
