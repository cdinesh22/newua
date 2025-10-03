import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import api from '../api/client'

// Floating AI Tutor widget that talks to backend `/api/assistant` routes.
// Uses SSE streaming when available and falls back to a simple POST.
export default function AITutor({ templeId, lang }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I\'m your ॐ ChatBot. Ask me anything about booking, slots, timings, heatmaps, or using this site.' }
  ])
  const scrollRef = useRef(null)

  const baseURL = useMemo(() => {
    // Ensure trailing slash not duplicated
    const url = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '')
    return url
  }, [])

  // No auto-open: the launcher button remains visible and constant.

  useEffect(() => {
    if (!open) return
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [open, messages])

  async function ask(question) {
    if (!question?.trim()) return

    // Push user message
    setMessages(prev => [...prev, { role: 'user', text: question }, { role: 'assistant', text: '' }])
    setBusy(true)

    const q = encodeURIComponent(question)
    const t = templeId ? `&templeId=${encodeURIComponent(String(templeId))}` : ''
    const l = lang ? `&lang=${encodeURIComponent(String(lang))}` : ''

    // Try SSE streaming first
    let es
    try {
      const streamUrl = `${baseURL}/api/assistant/stream?question=${q}${t}${l}`
      es = new EventSource(streamUrl)

      es.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data || '{}')
          const text = data?.text || ''
          if (text) {
            setMessages(prev => {
              const clone = [...prev]
              // append to the last assistant chunk
              const lastIdx = clone.length - 1
              if (lastIdx >= 0 && clone[lastIdx].role === 'assistant') {
                clone[lastIdx] = { role: 'assistant', text: (clone[lastIdx].text || '') + text }
              }
              return clone
            })
          }
        } catch (_) {}
      }

      es.addEventListener('done', () => {
        es.close()
        setBusy(false)
      })

      es.onerror = () => {
        try { es.close() } catch (_) {}
        // fallback to POST if SSE fails
        fallbackPost(question)
      }
    } catch (_) {
      try { es && es.close() } catch (_) {}
      // Fallback to POST
      fallbackPost(question)
    }
  }

  async function fallbackPost(question) {
    try {
      const { data } = await api.post('/assistant', { question, templeId, lang })
      const text = data?.text || 'Sorry, no response.'
      setMessages(prev => {
        const clone = [...prev]
        const lastIdx = clone.length - 1
        if (lastIdx >= 0 && clone[lastIdx].role === 'assistant') {
          clone[lastIdx] = { role: 'assistant', text }
        }
        return clone
      })
    } catch (err) {
      setMessages(prev => {
        const clone = [...prev]
        const lastIdx = clone.length - 1
        if (lastIdx >= 0 && clone[lastIdx].role === 'assistant') {
          clone[lastIdx] = { role: 'assistant', text: 'Assistant error. Please try again later.' }
        }
        return clone
      })
    } finally {
      setBusy(false)
    }
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
