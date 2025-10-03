import { useEffect, useRef, useState } from 'react'

export default function CountUp({ from = 0, to = 0, duration = 800, className = '' }) {
  const [value, setValue] = useState(from)
  const start = useRef(null)

  useEffect(() => {
    let raf
    const animate = (t) => {
      if (!start.current) start.current = t
      const progress = Math.min(1, (t - start.current) / duration)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      setValue(Math.round(from + (to - from) * eased))
      if (progress < 1) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [from, to, duration])

  return <span className={className}>{value}</span>
}
