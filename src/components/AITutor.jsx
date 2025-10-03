import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Floating AI Tutor widget that talks to backend `/api/assistant` routes.
// Uses SSE streaming when available and falls back to a simple POST.
// Frontend-only fallback version without backend calls.
export default function AITutor({ templeId, lang }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I\'m your ॐ ChatBot. Ask me anything about booking, slots, timings, heatmaps, or using this site.' }
  ])
  const scrollRef = useRef(null)

  // No auto-open: the launcher button remains visible and constant.

  useEffect(() => {
    if (!open) return
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [open, messages])

  function localAnswer(question) {
    const q = question.toLowerCase()
    // Very lightweight intent rules
    if (q.includes('book') || q.includes('darshan')) {
      return 'To book a slot, go to the Book page and choose your temple. We link to official portals when available.'
    }
    if (q.includes('time') || q.includes('timing') || q.includes('open')) {
      return 'Temples list their Open/Close and Slot duration in the temple details panel on Simulation and Book pages.'
    }
    if (q.includes('wait') || q.includes('queue') || q.includes('crowd')) {
      return 'The waiting time is estimated from current visitors and capacity. Check Simulation for live trends and heatmap.'
    }
    if (q.includes('map') || q.includes('heatmap')) {
      return 'Use the Simulation page to view the live heatmap, areas, and facilities. You can toggle layers in the legend.'
    }
    if (q.includes('language') || q.includes('hindi') || q.includes('english')) {
      return 'Use the language selector in the header to switch languages across the site.'
    }
    if (q.includes('contact') || q.includes('help')) {
      return 'Use the Contact page to send us a message. For emergencies, please use the temple\'s listed contacts.'
    }
    return 'I\'m here to help with bookings, timings, waiting time, and navigation tips. Try asking about "booking", "waiting time", or "heatmap".'
  }

  async function ask(question) {
    if (!question?.trim()) return

    // Push user message
    setMessages(prev => [...prev, { role: 'user', text: question }, { role: 'assistant', text: '' }])
    setBusy(true)
    // Local instant response (no backend)
    const answer = localAnswer(question)
    setMessages(prev => {
      const clone = [...prev]
      const lastIdx = clone.length - 1
      if (lastIdx >= 0 && clone[lastIdx].role === 'assistant') {
        clone[lastIdx] = { role: 'assistant', text: answer }
      }
      return clone
    })
    setBusy(false)
  }

  function onSubmit(e) {
    e.preventDefault()
    const q = input
    setInput('')
    ask(q)
  }

  return (
    <>
      {createPortal(
        <>
          {/* Floating button (top-right) */}
          <button
            onClick={() => setOpen(v => !v)}
            className="fixed z-[9999] rounded-full bg-[color:var(--india-saffron)] hover:opacity-90 text-white shadow-lg w-14 h-14 md:w-16 md:h-16 flex items-center justify-center focus:outline-none"
            style={{
              right: 'calc(env(safe-area-inset-right, 0px) + 1rem)',
              top: '75vh',
              transform: 'translateY(-50%)'
            }}
            aria-label="Open ॐ ChatBot"
          >
            {/* Om symbol icon */}
            <span className="text-3xl md:text-4xl leading-none" aria-hidden>ॐ</span>
          </button>

          {/* Panel aligned near the launcher (right edge, ~75% from top) */}
          {open && (
            <div
              className="fixed z-[9999] w-96 max-w-[95vw] bg-white border border-gray-200 rounded-xl shadow-2xl flex flex-col overflow-hidden"
              style={{
                right: 'calc(env(safe-area-inset-right, 0px) + 1rem)',
                top: '75vh',
                transform: 'translateY(-50%)'
              }}
            >
              <div className="px-4 py-3 bg-[color:var(--india-saffron)] text-white flex items-center justify-between">
                <div className="font-semibold">ॐ ChatBot</div>
                <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white" aria-label="Close">
                  ✕
                </button>
              </div>

              <div ref={scrollRef} className="px-3 py-3 h-80 overflow-y-auto space-y-3 bg-gray-50">
                {messages.map((m, idx) => (
                  <div key={idx} className={m.role === 'assistant' ? 'text-sm text-gray-800' : 'text-sm text-gray-900 text-right'}>
                    <div className={
                      'inline-block px-3 py-2 rounded-lg ' +
                      (m.role === 'assistant' ? 'bg-white border border-gray-200' : 'bg-[color:var(--india-saffron)] text-white')
                    }>
                      {m.text}
                    </div>
                  </div>
                ))}
                {busy && (
                  <div className="text-xs text-gray-500">Generating…</div>
                )}
              </div>

              <form onSubmit={onSubmit} className="p-3 bg-white border-t border-gray-200 flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about bookings, timings, heatmap…"
                  className="flex-1 h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)]"
                />
                <button type="submit" disabled={busy || !input.trim()} className="h-10 px-4 rounded-lg bg-[color:var(--india-saffron)] text-white disabled:opacity-50">
                  Send
                </button>
              </form>
            </div>
          )}
        </>,
        document.body
      )}
    </>
  )
}
