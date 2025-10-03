import { useEffect } from 'react'

export default function OmClickEffect() {
  useEffect(() => {
    const handleClick = (e) => {
      // Respect reduced motion
      const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const count = prefersReduced ? 1 : Math.floor(Math.random() * 2) + 3 // 3-4 normally, 1 if reduced motion

      for (let i = 0; i < count; i++) {
        const span = document.createElement('span')
        span.className = 'om-emit'
        span.textContent = 'ॐ'
        span.style.left = `${e.clientX}px`
        span.style.top = `${e.clientY}px`
        // randomize size and motion slightly
        const scale = 0.9 + Math.random() * 0.4 // 0.9 - 1.3
        const dx = (Math.random() * 2 - 1) * 26 // -26px to 26px sideways drift
        const rot = (Math.random() * 2 - 1) * 10 // -10 to 10 deg initial tilt
        const spin = (Math.random() * 2 - 1) * 30 // -30 to 30 deg added spin
        const dur = 800 + Math.random() * 400 // 800 - 1200ms
        const size = 14 + Math.floor(Math.random() * 5) // 14 - 18px
        span.style.setProperty('--scale', String(scale))
        span.style.setProperty('--dx', `${dx}px`)
        span.style.setProperty('--rot', `${rot}deg`)
        span.style.setProperty('--spin', `${spin}deg`)
        span.style.setProperty('--dur', `${dur}ms`)
        span.style.fontSize = `${size}px`
        document.body.appendChild(span)
        const cleanup = () => {
          span.removeEventListener('animationend', cleanup)
          span.remove()
        }
        span.addEventListener('animationend', cleanup)
      }
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  return null
}
