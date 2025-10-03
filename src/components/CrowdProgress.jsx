import { useEffect, useRef, useState } from 'react'

export default function CrowdProgress({ percentage }) {
  const color = percentage < 30 ? 'bg-green-600' : percentage < 70 ? 'bg-saffron-500' : 'bg-red-600'
  const prev = useRef(percentage)
  const [trendClass, setTrendClass] = useState('')

  useEffect(() => {
    const increasing = percentage > prev.current
    if (increasing) {
      setTrendClass('increase')
      const id = setTimeout(() => setTrendClass(''), 600)
      return () => clearTimeout(id)
    }
    prev.current = percentage
  }, [percentage])

  useEffect(() => { prev.current = percentage }, [])

  const highClass = percentage >= 70 ? 'high' : ''

  return (
    <div className={`tcm-progress ${trendClass} ${highClass}`}>
      <div className="flex justify-between text-sm mb-1">
        <span>Occupancy</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-3 bg-white/40 backdrop-blur border border-white/50 rounded overflow-hidden">
        <div
          className={`tcm-progress-bar h-3 ${color} rounded ${percentage>=90 ? 'animate-pulse' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
