import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import { getTemples } from '../services/temples'
import CrowdProgress from '../components/CrowdProgress'
import AlertsBanner from '../components/AlertsBanner'
import HeatmapMap from '../components/HeatmapMap'
import SlotBookingForm from '../components/SlotBookingForm'
import QRCode from 'qrcode.react'
import { Skeleton, SkeletonText } from '../components/Skeleton'

export default function UserDashboard() {
  const { user } = useAuth()
  const [temples, setTemples] = useState([])
  const [selectedTemple, setSelectedTemple] = useState(null)
  const [simulation, setSimulation] = useState(null)
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    getTemples().then(list => setTemples(list)).catch(()=>{})
  }, [])

  useEffect(() => {
    if (!selectedTemple) return
    api.get(`/api/simulation/${selectedTemple._id}`).then(res => setSimulation(res.data.data))
  }, [selectedTemple])

  useEffect(() => {
    api.get('/api/bookings').then(res => setBookings(res.data.data.bookings))
  }, [])

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6 animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold">Welcome, {user?.name}</div>
            <div className="text-sm text-gray-500">Plan your darshan and view live crowd updates</div>
          </div>
          <select className="p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans" value={selectedTemple?._id||''} onChange={e=>setSelectedTemple(temples.find(t=>t._id===e.target.value))}>
            <option value="">Select Temple</option>
            {temples.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        </div>
        {selectedTemple?.externalSources?.websiteUrl ? (
          <div className="text-right -mt-2">
            <a href={selectedTemple.externalSources.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-saffron-700 hover:underline text-sm">Official Website</a>
          </div>
        ) : null}

        {simulation ? (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="glass-card ind-gradient-border p-4 rounded md:col-span-2">
              <div className="font-semibold mb-2">Live Crowd Heatmap</div>
              <HeatmapMap center={simulation.temple.location.coordinates} areas={simulation.areas} facilities={simulation.facilities} />
            </div>
            <div className="glass-card ind-gradient-border p-4 rounded space-y-3">
              <div className="font-semibold">Current Status</div>
              <CrowdProgress percentage={Math.min(100, Math.round((simulation.currentStatus.actualVisitors / simulation.temple.capacity.maxVisitorsPerSlot) * 100))} />
              <div className="text-sm text-gray-600">Expected: {simulation.currentStatus.expectedVisitors} | Actual: {simulation.currentStatus.actualVisitors}</div>
              <AlertsBanner alerts={simulation.alerts} />
            </div>
          </div>
        ) : selectedTemple ? (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="glass-card ind-gradient-border p-4 rounded md:col-span-2">
              <div className="font-semibold mb-2">Live Crowd Heatmap</div>
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="glass-card ind-gradient-border p-4 rounded space-y-3">
              <div className="font-semibold">Current Status</div>
              <Skeleton className="h-3 w-full" />
              <SkeletonText lines={3} />
            </div>
          </div>
        ) : null}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass-card ind-gradient-border p-4 rounded">
            <div className="font-semibold mb-3">Book a Slot</div>
            <SlotBookingForm onBooked={(b)=>setBookings(prev=>[b,...prev])} />
          </div>
          <div className="glass-card ind-gradient-border p-4 rounded">
            <div className="font-semibold mb-3">Your Bookings</div>
            <div className="space-y-3">
              {bookings.length ? bookings.map(b => (
                <div key={b._id} className="border border-white/50 bg-white/40 backdrop-blur rounded p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{b.temple?.name}</div>
                    <div className="text-sm text-gray-600">{new Date(b.slot?.date).toDateString()} {b.slot?.startTime} - {b.slot?.endTime}</div>
                    <div className="text-xs">Visitors: {b.visitorsCount} | Status: {b.status}</div>
                  </div>
                  <div className="hidden md:block">
                    <QRCode value={b.qrCode || b.bookingId} size={64} />
                  </div>
                </div>
              )) : (
                Array.from({length:3}).map((_,i)=>(
                  <div key={i} className="border border-white/50 bg-white/40 backdrop-blur rounded p-3">
                    <Skeleton className="h-4 w-1/3 mb-2" />
                    <Skeleton className="h-3 w-2/3 mb-1" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
