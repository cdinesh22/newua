import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import AdminTabs from '../../components/AdminTabs'
import api from '../../api/client'
import { Skeleton } from '../../components/Skeleton'

export default function AdminUsers() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ users: [], page: 1, pages: 1, total: 0 })
  const [filters, setFilters] = useState({ search: '', role: '' })

  const fetchData = async (page = 1) => {
    setLoading(true)
    try {
      const res = await api.get('/api/admin/users', { params: { ...filters, page, limit: 10 } })
      setData({ ...res.data, users: res.data.data.users })
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData(1) }, [filters.role])

  const setFilter = (k,v)=>setFilters(prev=>({ ...prev, [k]: v }))

  const toggleVerify = async (user) => {
    await api.put(`/api/admin/users/${user._id}/status`, { isVerified: !user.isVerified })
    fetchData(data.page)
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-4 animate-slide-up">
        <AdminTabs />
        <div className="text-xl font-semibold">Users</div>

        <div className="glass-card ind-gradient-border p-3 rounded grid md:grid-cols-3 gap-2">
          <input className="p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur md:col-span-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans" placeholder="Search name/email/phone" value={filters.search} onChange={e=>setFilter('search', e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') fetchData(1) }} />
          <select className="p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans" value={filters.role} onChange={e=>setFilter('role', e.target.value)}>
            <option value="">All roles</option>
            <option value="pilgrim">Pilgrim</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="glass-card ind-gradient-border rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Verified</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({length:6}).map((_,i)=> (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-2" colSpan={6}><Skeleton className="h-5 w-full" /></td>
                    </tr>
                  ))
                ) : (
                  data.users.map(u => (
                    <tr key={u._id} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-2">{u.name}</td>
                      <td className="px-3 py-2">{u.email}</td>
                      <td className="px-3 py-2">{u.phone}</td>
                      <td className="px-3 py-2 capitalize">{u.role}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${u.isVerified?'bg-green-100 text-green-700':'bg-gray-100 text-gray-700'}`}>{u.isVerified?'Verified':'Unverified'}</span>
                      </td>
                      <td className="px-3 py-2">
                        <button className="glass-btn px-3 py-1 rounded" onClick={()=>toggleVerify(u)}>{u.isVerified?'Unverify':'Verify'}</button>
                      </td>
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
