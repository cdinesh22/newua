import { useEffect, useRef, useState } from 'react'
import api from '../api/client'
import { useLang } from '../context/LanguageContext'

export default function AssistantWidget({ placement = 'sidebar', defaultOpen = false, mode = 'widget' }) {
  const { lang, t } = useLang()
  const [open, setOpen] = useState(defaultOpen)
  const [messages, setMessages] = useState([{ role: 'bot', text: t('assistant_greeting') }])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [fallbackShown, setFallbackShown] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, open])

  // Health check + retry logic
  useEffect(() => {
    let cancelled = false
    let timerId

    const check = async () => {
      try {
        setReconnecting(true)
        const res = await api.get('/api/health', { timeout: 4000 })
        if (cancelled) return
        if (res?.data?.status === 'OK') {
          setIsOnline(true)
          setReconnecting(false)
          setFallbackShown(false) // allow future fallback if it goes down again
        } else {
          setIsOnline(false)
        }
      } catch (_) {
        if (cancelled) return
        setIsOnline(false)
      } finally {
        if (!cancelled) setReconnecting(false)
      }
    }

    // initial check
    check()
    // periodic retry every 7s
    timerId = setInterval(check, 7000)
    return () => { cancelled = true; if (timerId) clearInterval(timerId) }
  }, [])

  const send = async () => {
    const q = input.trim()
    if (!q || sending) return
    if (!isOnline) return // prevent spamming while offline
    setMessages(m => [...m, { role: 'user', text: q }])
    setInput('')
    setSending(true)
    try {
      const resp = await api.post('/api/assistant', { question: q, lang })
      const text = resp?.data?.text || 'Sorry, I could not generate a response.'
      setMessages(m => [...m, { role: 'bot', text }])
    } catch (e) {
      // Surface error to devtools for quicker debugging (CORS, network, 5xx, etc.)
      console.error('Assistant send error:', e?.response?.data || e.message)
      setIsOnline(false)
      // Add a single friendly fallback once per offline period
      setMessages(m => {
        if (fallbackShown) return m
        setFallbackShown(true)
        return [...m, { role: 'bot', text: '🙏 Sorry, I’m facing some technical issues. Please try again shortly.' }]
      })
    } finally {
      setSending(false)
    }
  }

  const isPage = placement === 'page' || mode === 'page'

  return (
    <div>
      {placement === 'sidebar' && (
        <button type="button" onClick={() => setOpen(o => !o)} className="mt-4 w-full btn-india h-10">
          {t('assistant_title')}
        </button>
      )}

      {(isPage || open) && (
        <div className={
          isPage
            ? 'relative z-[1] w-full max-w-3xl mx-auto bg-white/95 backdrop-blur rounded-xl shadow border border-orange-200 flex flex-col overflow-hidden'
            : 'fixed z-[9999] right-4 bottom-24 w-[92vw] max-w-md bg-white/95 backdrop-blur rounded-xl shadow-2xl border border-orange-200 flex flex-col overflow-hidden animate-slide-up'
        } style={isPage ? { minHeight: '60vh' } : { bottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)' }}>
          <div className="px-4 py-3 border-b flex items-center justify-between bg-gradient-to-r from-orange-50 to-white">
            <div className="font-semibold text-saffron-800">{t('assistant_title')}</div>
            {!isPage && (
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700 h-8 w-8 flex items-center justify-center rounded" aria-label="Close">✕</button>
            )}
          </div>
          {/* Connectivity status */}
          {!isOnline && (
            <div className="px-4 py-2 text-sm text-amber-800 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" aria-hidden />
              {reconnecting ? 'Reconnecting to assistant…' : 'Assistant is offline. Retrying…'}
            </div>
          )}
          <div ref={listRef} className="flex-1 overflow-auto px-3 py-2 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={'inline-block max-w-[85%] px-3 py-2 rounded-lg ' + (m.role === 'user' ? 'bg-saffron-700 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none')}>
                  <div className="whitespace-pre-wrap text-sm">{m.text}</div>
                </div>
              </div>
            ))}
          </div>
          <form
            className="p-2 border-t bg-white flex gap-2 items-center"
            onSubmit={(e) => { e.preventDefault(); send(); }}
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={isOnline ? t('assistant_input_placeholder') : 'Assistant offline…'}
              className="flex-1 h-10 px-3 rounded-lg border border-white/50 bg-white/70 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans"
              autoFocus
            />
            <button type="submit" disabled={sending || !isOnline} className="h-10 px-4 rounded-lg bg-[color:var(--india-saffron)] text-white hover:opacity-90 ind-trans disabled:opacity-60">
              {sending ? t('assistant_sending') : (!isOnline ? 'Offline' : t('assistant_send'))}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
