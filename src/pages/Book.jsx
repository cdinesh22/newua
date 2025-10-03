import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getTemples } from '../services/temples'

export default function Book() {
  const [temples, setTemples] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const list = await getTemples()
        if (!cancelled) setTemples(list)
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load temples')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const openOfficial = (t) => {
    const url = t?.externalSources?.websiteUrl
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      alert('Official website not available for this temple yet.')
    }
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-4 ind-anim-fade-up animate-slide-up">
        <header className="glass-card ind-gradient-border rounded-lg p-5 ind-card">
          <h1 className="text-2xl font-semibold text-saffron-800">Book Darshan</h1>
          <p className="text-gray-600">Select your temple to go to the official booking website. We recommend verifying timings and notices before booking.</p>
        </header>

        {loading ? (
          <div className="glass-card ind-gradient-border rounded-lg p-5 ind-card">
            <div className="text-gray-600">Loading temples...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded p-4">{String(error)}</div>
        ) : (
          <section className="grid md:grid-cols-2 gap-4">
            {temples.map((t) => (
              <article key={t._id} className="glass-card ind-gradient-border rounded-lg p-4 ind-card ind-anim-fade-up">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-saffron-800">{t.name}</h2>
                    <div className="text-sm text-gray-600">{t.location?.city}, {t.location?.state}</div>
                  </div>
                  {!!t.images?.length && (
                    // eslint-disable-next-line jsx-a11y/img-redundant-alt
                    <img src={t.images[0].url} alt={t.images[0].caption || t.name} className="w-20 h-16 object-cover rounded-xl border ind-gradient-border" />
                  )}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-gray-700">
                  <div>
                    <div className="text-gray-500">Open</div>
                    <div className="font-medium">{t.timings?.openTime || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Close</div>
                    <div className="font-medium">{t.timings?.closeTime || '-'}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <button onClick={() => openOfficial(t)} className="btn-india ind-gradient-border">Go to Official Website</button>
                  {t.externalSources?.websiteUrl ? (
                    <a className="text-[color:var(--india-saffron)] hover:underline" href={t.externalSources.websiteUrl} target="_blank" rel="noopener noreferrer">{new URL(t.externalSources.websiteUrl).hostname}</a>
                  ) : (
                    <span className="text-gray-500">No website listed</span>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </Layout>
  )
}
