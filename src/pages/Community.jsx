import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { listPosts, createPost, likePost as likePostSvc, commentOnPost, deletePost as deletePostSvc, getComments } from '../services/community'
import { useLang } from '../context/LanguageContext'

export default function Community() {
  const { lang, t } = useLang()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filterLang, setFilterLang] = useState('all')
  const [composer, setComposer] = useState({ text: '', mediaUrl: '', mediaType: 'image' })
  const [sending, setSending] = useState(false)

  const load = () => {
    setLoading(true)
    setError('')
    listPosts({ lang: filterLang })
      .then(async list => {
        // Load comments for each post (shallow) to preserve UI
        const withComments = await Promise.all(list.map(async p => {
          try { const cs = await getComments(p.id); return { ...p, comments: cs } } catch { return p }
        }))
        setPosts(withComments)
      })
      .catch(e => { console.error(e); setError('Failed to load community posts') })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filterLang])

  const submitPost = async () => {
    const { text, mediaUrl, mediaType } = composer
    if (!text.trim() && !mediaUrl.trim()) return
    setSending(true)
    try {
      await createPost({
        text: text.trim(),
        mediaUrl: mediaUrl.trim(),
        mediaType: mediaType || 'image',
        lang,
      })
      setComposer({ text: '', mediaUrl: '', mediaType: 'image' })
      load()
    } catch (e) {
      console.error(e)
      alert('Could not post. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const likePost = async (id) => {
    try {
      await likePostSvc(id)
      setPosts(ps => ps.map(p => p.id === id ? { ...p, likes: (p.likes||0)+1 } : p))
    } catch (e) { console.error(e) }
  }

  const commentPost = async (id, text) => {
    if (!text.trim()) return
    try {
      await commentOnPost(id, text)
      load()
    } catch (e) { console.error(e) }
  }

  const deletePost = async (id) => {
    if (!confirm('Delete this post?')) return
    try {
      await deletePostSvc(id)
      load()
    } catch (e) { console.error(e) }
  }

  const sharePost = async (p) => {
    const shareData = { title: 'Devotional Post', text: p.text, url: window.location.href }
    try {
      if (navigator.share) await navigator.share(shareData)
      else {
        await navigator.clipboard.writeText(`${p.text}\n${window.location.href}`)
        alert('Link copied to clipboard')
      }
    } catch (_) {}
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto animate-slide-up">
        {/* Intro */}
        <div className="glass-card ind-gradient-border p-4 mb-4">
          <div className="text-lg font-semibold text-saffron-800">Community</div>
          <div className="text-sm text-gray-700">A devotional wall to share travel stories, spiritual experiences, and photos/videos. Be respectful. 🙏</div>
        </div>

        {/* Composer */}
        <div className="glass-card ind-gradient-border p-4 mb-6">
          <div className="text-sm text-gray-700 mb-2">Share your experience</div>
          <textarea
            value={composer.text}
            onChange={e=>setComposer(c=>({...c, text:e.target.value}))}
            placeholder="Write a short story, blessing, or experience..."
            className="w-full p-3 rounded-lg border border-white/50 bg-white/60 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] mb-2"
            rows={3}
          />
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <input
              value={composer.mediaUrl}
              onChange={e=>setComposer(c=>({...c, mediaUrl:e.target.value}))}
              placeholder="Optional image/video URL"
              className="flex-1 p-2 rounded-lg border border-white/50 bg-white/60 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)]"
            />
            <select
              value={composer.mediaType}
              onChange={e=>setComposer(c=>({...c, mediaType:e.target.value}))}
              className="p-2 rounded-lg border border-white/50 bg-white/60 backdrop-blur focus:outline-none"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
            <button disabled={sending} onClick={submitPost} className="glass-btn px-4 py-2 disabled:opacity-60">{sending ? 'Posting…' : 'Post'}</button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="glass-card ind-gradient-border p-3 mb-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm text-gray-700">Explore the devotional community wall. Like, comment, and share.</div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Language</label>
            <select value={filterLang} onChange={e=>setFilterLang(e.target.value)} className="p-2 rounded-lg border border-white/50 bg-white/60 backdrop-blur">
              <option value="all">All</option>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="gu">Gujarati</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
              <option value="bn">Bengali</option>
            </select>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {loading && <div className="glass-card p-4">Loading posts…</div>}
          {error && <div className="glass-card p-4 text-red-700 bg-red-50 border border-red-200">{error}</div>}
          {!loading && posts.length === 0 && <div className="glass-card p-4">No posts yet. Be the first to share!</div>}
          {posts.map(p => (
            <article key={p.id} className="glass-card ind-gradient-border p-4">
              <header className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-semibold text-saffron-800">{p.author || 'Devotee'}</div>
                  <div className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-sm text-gray-600 hover:underline" onClick={()=>sharePost(p)}>Share</button>
                  <button className="text-sm text-red-700 hover:underline" onClick={()=>deletePost(p.id)}>Moderate</button>
                </div>
              </header>
              <div className="prose max-w-none text-gray-800 text-sm whitespace-pre-wrap">{p.text}</div>
              {p.mediaUrl && (
                p.mediaType === 'video' ? (
                  <div className="mt-2">
                    <video className="w-full rounded" controls src={p.mediaUrl} />
                  </div>
                ) : (
                  <div className="mt-2">
                    <img className="w-full rounded" src={p.mediaUrl} alt="shared" />
                  </div>
                )
              )}
              <footer className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button className="glass-btn px-3 py-1" onClick={()=>likePost(p.id)}>❤️ {p.likes || 0}</button>
                </div>
              </footer>
              {/* Comments */}
              <CommentBox postId={p.id} onAdd={commentPost} comments={p.comments || []} />
            </article>
          ))}
        </div>
      </div>
    </Layout>
  )
}

function CommentBox({ postId, comments, onAdd }) {
  const [text, setText] = useState('')
  return (
    <div className="mt-3">
      <div className="space-y-2">
        {(comments||[]).map(c => (
          <div key={c.id} className="text-sm bg-white/70 rounded p-2 border">
            <div className="font-medium text-gray-800">{c.author || 'Devotee'}</div>
            <div className="text-gray-700 whitespace-pre-wrap">{c.text}</div>
            <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <input
          value={text}
          onChange={e=>setText(e.target.value)}
          placeholder="Write a comment…"
          className="flex-1 p-2 rounded-lg border border-white/50 bg-white/60 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)]"
        />
        <button className="glass-btn px-3 py-2" onClick={()=>{ onAdd(postId, text); setText('') }}>Comment</button>
      </div>
    </div>
  )
}
