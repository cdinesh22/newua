import { useEffect, useState } from 'react'
import api from '../api/client'
import { getTemples } from '../services/temples'

export default function SlotBookingForm({ onBooked }) {
  const [temples, setTemples] = useState([])
  const [templeId, setTempleId] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10))
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [visitorsCount, setVisitorsCount] = useState(1)
  const [visitors, setVisitors] = useState([{ name: '', age: 25, gender: 'male' }])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getTemples().then(list => setTemples(list)).catch(()=>{})
  }, [])

  useEffect(() => {
    if (!templeId) return
    api.getSlots(templeId, date).then(rows => {
      // Map DB rows to UI shape expected by buttons
      const list = (rows || []).map(r => ({
        id: r.id,
        date: r.date,
        startTime: r.start_time,
        endTime: r.end_time,
        availableSpots: (r.available_spots ?? r.available) || 0,
        isBookable: r.is_available !== false,
      }))
      setSlots(list)
    }).catch(()=> setSlots([]))
  }, [templeId, date])

  const setVisitorField = (i, field, value) => {
    setVisitors(v => v.map((p, idx) => idx===i ? { ...p, [field]: value } : p))
  }

  const adjustVisitors = (n) => {
    setVisitorsCount(n)
    setVisitors(prev => {
      const copy = [...prev]
      while (copy.length < n) copy.push({ name: '', age: 25, gender: 'male' })
      return copy.slice(0, n)
    })
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!selectedSlot) return
    setLoading(true)
    try {
      const payload = {
        slot_id: selectedSlot.id,
        temple_id: templeId,
        visitors_count: visitorsCount,
        visitors
      }
      const booking = await api.createBooking(payload)
      onBooked?.(booking)
      alert('Booking successful!')
    } catch (e) {
      alert(e?.message || 'Booking failed')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4 animate-slide-up">
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm mb-1">Temple</label>
          <select value={templeId} onChange={e=>setTempleId(e.target.value)} className="w-full p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans">
            <option value="">Select temple</option>
            {temples.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Date</label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans" />
        </div>
        <div>
          <label className="block text-sm mb-1">Visitors</label>
          <input type="number" min={1} max={10} value={visitorsCount} onChange={e=>adjustVisitors(parseInt(e.target.value||'1'))} className="w-full p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans" />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Available Slots</label>
        <div className="grid md:grid-cols-4 gap-2">
          {slots.map(s => (
            <button type="button" key={`${s.date}-${s.startTime}`} onClick={()=>setSelectedSlot(s)}
              className={`p-2 rounded-lg border ind-gradient-border glass-card ${selectedSlot?.id===s.id ? 'bg-white/30' : 'bg-white/20'} ${!s.isBookable ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!s.isBookable}>
              <div className="font-medium">{s.startTime} - {s.endTime}</div>
              <div className="text-xs text-gray-500">{s.availableSpots} spots</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="font-semibold">Visitor Details</div>
        {Array.from({ length: visitorsCount }).map((_, i) => (
          <div key={i} className="grid md:grid-cols-3 gap-2">
            <input placeholder="Name" className="p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans" value={visitors[i]?.name||''} onChange={e=>setVisitorField(i,'name', e.target.value)} />
            <input placeholder="Age" type="number" className="p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans" value={visitors[i]?.age||''} onChange={e=>setVisitorField(i,'age', parseInt(e.target.value||'0'))} />
            <select className="p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans" value={visitors[i]?.gender||'male'} onChange={e=>setVisitorField(i,'gender', e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        ))}
      </div>

      <button type="submit" disabled={loading || !selectedSlot} className="glass-btn px-4 py-2 ind-gradient-border disabled:opacity-50">{loading ? 'Booking...' : 'Book Slot'}</button>
    </form>
  )
}
