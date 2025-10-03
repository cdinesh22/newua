import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getTemples } from '../services/temples'
import TempleRealtimePanel from '../components/TempleRealtimePanel'
import { useLang } from '../context/LanguageContext'
// Removed page-level LanguageSwitcher; global one remains in Layout

export default function Home() {
  const [temples, setTemples] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const { t } = useLang()

  useEffect(() => {
    let cancelled = false
    getTemples().then(list => {
      if (cancelled) return
      setTemples(list)
      // auto-select first temple for quick demo
      if (list.length && !selectedId) setSelectedId(list[0]._id)
    }).catch(()=>{})
    return () => { cancelled = true }
  }, [])

  const performTempleSearch = () => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) { setSearchResults([]); return }
    const results = (temples || []).filter(t => {
      const name = (t.name || '').toLowerCase()
      const city = (t.location?.city || '').toLowerCase()
      const state = (t.location?.state || '').toLowerCase()
      return name.includes(q) || city.includes(q) || state.includes(q)
    })
    setSearchResults(results.slice(0, 8))
    if (results.length === 1) setSelectedId(results[0]._id)
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto animate-slide-up">
        <div className="relative overflow-hidden p-8 rounded-xl glass-card ind-gradient-border mb-6 ind-anim-fade-up"
             style={{ background: 'linear-gradient(90deg, rgba(255,153,51,0.10) 0%, rgba(255,255,255,0.12) 50%, rgba(19,136,8,0.10) 100%)' }}>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/30 rounded-full blur-2xl animate-float" />
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-saffron-800 mb-2 animate-slide-up">{t('hero_title')}</h1>
              <p className="text-gray-700 animate-slide-up" style={{animationDelay:'80ms'}}>{t('hero_sub')}</p>
              <div className="mt-4 animate-slide-up" style={{animationDelay:'160ms'}}>
                <Link to="/book" className="btn-india ind-gradient-border">
                  {t('hero_btn_book')}
                </Link>
              </div>
            </div>
            {/* Removed page-level LanguageSwitcher */}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 ind-anim-fade-up" style={{animationDelay:'120ms'}}>
          <div className="glass-card ind-gradient-border p-5 transition hover:shadow-lg animate-slide-up ind-card" style={{animationDelay:'120ms'}}>
            <div className="font-semibold mb-2">{t('feat_pilgrims_title')}</div>
            <ul className="list-disc ml-5 text-gray-700 space-y-1">
              <li>{t('feat_pilgrims_item1')}</li>
              <li>{t('feat_pilgrims_item2')}</li>
              <li>{t('feat_pilgrims_item3')}</li>
              <li>{t('feat_pilgrims_item4')}</li>
              <li>{t('feat_pilgrims_item5')}</li>
              <li>{t('feat_pilgrims_item6')}</li>
              <li>{t('feat_pilgrims_item7')}</li>
            </ul>
          </div>
          <div className="glass-card ind-gradient-border p-5 transition hover:shadow-lg animate-slide-up ind-card" style={{animationDelay:'220ms'}}>
            <div className="font-semibold mb-2">{t('feat_admin_title')}</div>
            <ul className="list-disc ml-5 text-gray-700 space-y-1">
              <li>{t('feat_admin_item1')}</li>
              <li>{t('feat_admin_item2')}</li>
              <li>{t('feat_admin_item3')}</li>
            </ul>
          </div>
        </div>

        {/* Compact Realtime Widget */}
        <div className="mt-6 glass-card ind-gradient-border p-5 ind-card ind-anim-fade-up">
          <div className="flex items-center justify-between gap-3 flex-wrap relative">
            <div>
              <div className="text-lg font-semibold text-saffron-800">{t('live_widget_title')}</div>
              <div className="text-sm text-gray-600">{t('live_widget_sub')}</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={t('search_temples')}
                className="p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans"
                value={searchTerm}
                onChange={(e)=> setSearchTerm(e.target.value)}
                onKeyDown={(e)=> { if (e.key === 'Enter') performTempleSearch() }}
              />
              <button
                type="button"
                className="px-3 py-2 rounded-lg bg-[color:var(--india-saffron)] text-white hover:opacity-90 ind-trans"
                onClick={performTempleSearch}
                aria-label="Search temples"
              >
                {t('search')}
              </button>
              <select className="p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans" value={selectedId} onChange={e=>setSelectedId(e.target.value)}>
                {temples.length === 0 ? <option value="">Loading temples...</option> : null}
                {temples.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
              {/* Results dropdown */}
              {searchResults && searchResults.length > 0 ? (
                <div className="absolute right-5 top-full mt-1 w-72 max-w-[80vw] z-10 bg-white border rounded-lg shadow-lg overflow-hidden">
                  <ul className="max-h-64 overflow-auto">
                    {searchResults.map(r => (
                      <li key={r._id}>
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-gray-50"
                          onClick={() => { setSelectedId(r._id); setSearchResults([]) }}
                        >
                          <div className="font-medium">{r.name}</div>
                          <div className="text-xs text-gray-500">{r.location?.city}{r.location?.state ? `, ${r.location.state}` : ''}</div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {(() => {
                const sel = temples.find(t => t._id === selectedId)
                const url = sel?.externalSources?.websiteUrl
                return url ? (
                  <div className="mt-2 text-right">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-saffron-700 hover:underline text-sm">Official Website</a>
                  </div>
                ) : null
              })()}
            </div>
          </div>
          <div className="mt-3">
            {selectedId ? (
              <TempleRealtimePanel templeId={selectedId} />
            ) : (
              <div className="text-gray-600 text-sm">Select a temple to view realtime information.</div>
            )}
          </div>
        </div>

        {/* Removed Explore Temples thumbnail grid section as requested */}
      </div>
    </Layout>
  )
}
