import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import AdminTabs from '../../components/AdminTabs'
import api from '../../api/client'
import { Skeleton } from '../../components/Skeleton'

export default function AdminReports() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10))
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchReport = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/admin/reports/daily', { params: { date } })
      setReport(res.data.data.report)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchReport() }, [])

  const downloadCSV = () => {
    if (!report) return
    const rows = [
      ['Metric','Value'],
      ['Date', report.date],
      ['Total Bookings', report.summary.totalBookings],
      ['Total Visitors', report.summary.totalVisitors],
      ['Total Revenue', report.summary.totalRevenue]
    ]
    const csv = rows.map(r=>r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `daily_report_${report.date}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-4 animate-slide-up">
        <AdminTabs />
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold">Daily Reports</div>
          <div className="flex items-center gap-2">
            <input type="date" className="p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans" value={date} onChange={e=>setDate(e.target.value)} />
            <button className="glass-btn px-3 py-2 rounded" onClick={fetchReport}>Load</button>
            <button className="btn-india ind-gradient-border px-3 py-2 rounded disabled:opacity-50" disabled={!report} onClick={downloadCSV}>Download CSV</button>
          </div>
        </div>

        <div className="glass-card ind-gradient-border p-4 rounded">
          {!report || loading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Total Bookings</div>
                <div className="text-2xl font-semibold">{report.summary.totalBookings}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Visitors</div>
                <div className="text-2xl font-semibold">{report.summary.totalVisitors}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Revenue</div>
                <div className="text-2xl font-semibold">{report.summary.totalRevenue}</div>
              </div>
            </div>
          )}
        </div>

        {report && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass-card ind-gradient-border p-4 rounded">
              <div className="font-semibold mb-2">Booking Status</div>
              <div className="space-y-2 text-sm">
                {report.bookingStats.map((s,i)=> (
                  <div key={i} className="flex items-center justify-between">
                    <div className="capitalize">{s._id}</div>
                    <div>{s.count} bookings · {s.visitors} visitors</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card ind-gradient-border p-4 rounded">
              <div className="font-semibold mb-2">Revenue by Temple</div>
              <div className="space-y-2 text-sm">
                {report.revenueStats.map((r,i)=> (
                  <div key={i} className="flex items-center justify-between">
                    <div>{r.templeName}</div>
                    <div>{r.revenue} · {r.bookings} bookings</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
