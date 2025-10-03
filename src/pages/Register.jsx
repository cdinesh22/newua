import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'

export default function Register() {
  const { register } = useAuth()
  const [form, setForm] = useState({ name: 'New User', email: 'new@example.com', phone: '9876543214', password: 'pilgrim123' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (e) {
      alert(e?.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto glass-card ind-gradient-border p-6 rounded animate-slide-up">
        <h2 className="text-xl font-semibold mb-4">Register</h2>
        <form onSubmit={submit} className="space-y-3">
          <input className="w-full p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)]" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
          <input className="w-full p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)]" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} />
          <input className="w-full p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)]" placeholder="Phone" value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} />
          <input className="w-full p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)]" placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} />
          <button type="submit" className="w-full btn-india ind-gradient-border justify-center disabled:opacity-60" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
          <div className="text-sm text-center">Have an account? <Link className="text-[color:var(--india-saffron)] hover:underline" to="/login">Login</Link></div>
        </form>
      </div>
    </Layout>
  )
}
