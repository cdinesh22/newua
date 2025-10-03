import { useEffect, useMemo, useState } from 'react'
import Layout from '../../components/Layout'
import AdminTabs from '../../components/AdminTabs'
import api from '../../api/client'
import { Skeleton, SkeletonText } from '../../components/Skeleton'

export default function AdminBookings() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ bookings: [], page: 1, pages: 1, total: 0 })
  const [filters, setFilters] = useState({ search: '', status: '', temple: '', date: '' })
  const [temples, setTemples] = useState([])

  const fetchData = async (page = 1) => {
    setLoading(true)
    try {
      const res = await api.get('/api/admin/bookings', { params: { ...filters, page, limit: 10 } })
      setData({ ...res.data, bookings: res.data.data.bookings })
    } finally { setLoading(false) }
  }

  useEffect(() => { api.get('/api/temples').then(r=>setTemples(r.data.data.temples)) }, [])
  useEffect(() => { fetchData(1) }, [filters.status, filters.temple, filters.date])

  const setFilter = (k,v)=>setFilters(prev=>({ ...prev, [k]: v }))

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-4 animate-slide-up">
        <AdminTabs />
        <div className="text-xl font-semibold">Bookings</div>

        <div className="glass-card ind-gradient-border p-3 rounded grid md:grid-cols-5 gap-2">
          <input className="p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur md:col-span-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans" placeholder="Search by Booking ID" value={filters.search} onChange={e=>setFilter('search', e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') fetchData(1) }} />
          <select className="p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans" value={filters.status} onChange={e=>setFilter('status', e.target.value)}>
            <option value="">All status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select className="p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans" value={filters.temple} onChange={e=>setFilter('temple', e.target.value)}>
            <option value="">All temples</option>
            {temples.map(t=> <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
          <input type="date" className="p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans" value={filters.date} onChange={e=>setFilter('date', e.target.value)} />
        </div>

        <div className="glass-card ind-gradient-border rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600">
                  <th className="px-3 py-2">Booking ID</th>
                  <th className="px-3 py-2">Temple</th>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Visitors</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Payment</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({length:6}).map((_,i)=> (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-2" colSpan={7}><Skeleton className="h-5 w-full" /></td>
                    </tr>
                  ))
                ) : (
                  data.bookings.map(b => (
                    <tr key={b._id} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono text-xs">{b.bookingId}</td>
                      <td className="px-3 py-2">{b.temple?.name}</td>
                      <td className="px-3 py-2">{b.user?.name}</td>
                      <td className="px-3 py-2">{new Date(b.slot?.date).toDateString()} {b.slot?.startTime}</td>
                      <td className="px-3 py-2">{b.visitorsCount}</td>
                      <td className="px-3 py-2"><span className={`px-2 py-1 rounded text-xs ${b.status==='cancelled'?'bg-red-100 text-red-700':b.status==='confirmed'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{b.status}</span></td>
                      <td className="px-3 py-2"><span className={`px-2 py-1 rounded text-xs ${b.paymentStatus==='completed'?'bg-green-100 text-green-700':b.paymentStatus==='pending'?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-700'}`}>{b.paymentStatus||'n/a'}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-3 border-t text-sm">
            <div>Page {data.page} of {data.pages} · Total {data.total}</div>
            <div className="space-x-2">
              <button className="glass-btn px-3 py-1 rounded disabled:opacity-50" disabled={data.page<=1} onClick={()=>fetchData(data.page-1)}>Prev</button>
              <button className="glass-btn px-3 py-1 rounded disabled:opacity-50" disabled={data.page>=data.pages} onClick={()=>fetchData(data.page+1)}>Next</button>
              <button className="glass-btn px-3 py-1 rounded" onClick={()=>fetchData(data.page)}>Refresh</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
