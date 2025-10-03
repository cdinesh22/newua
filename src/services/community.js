import { supabase } from '../lib/supabaseClient'

function mapPost(row) {
  return {
    id: row.id,
    userId: row.user_id,
    author: row.author || 'Devotee', // optional if you add author/display_name
    text: row.body || row.text || '',
    mediaUrl: row.media_url || '',
    mediaType: row.media_type || 'image',
    lang: row.lang || 'all',
    createdAt: row.created_at,
    likes: row.likes_count || 0,
    comments: [], // load separately
  }
}

export async function listPosts({ lang = 'all' }) {
  let q = supabase.from('community_posts').select('*').order('created_at', { ascending: false })
  if (lang && lang !== 'all') q = q.eq('lang', lang)
  const { data, error } = await q
  if (error) throw error
  return (data || []).map(mapPost)
}

export async function createPost({ text, mediaUrl, mediaType = 'image', lang = 'all' }) {
  const { data, error } = await supabase.from('community_posts').insert({
    body: text,
    media_url: mediaUrl || null,
    media_type: mediaType,
    lang,
  }).select('*').single()
  if (error) throw error
  return mapPost(data)
}

export async function likePost(postId) {
  // insert like; if already liked, ignore
  const user = (await supabase.auth.getUser()).data.user
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('community_likes').insert({ user_id: user.id, post_id: postId })
  if (error && error.code !== '23505') throw error // ignore unique violation
  return true
}

export async function commentOnPost(postId, text) {
  const user = (await supabase.auth.getUser()).data.user
  if (!user) throw new Error('Not authenticated')
  const { data, error } = await supabase.from('community_comments').insert({ user_id: user.id, post_id: postId, text }).select('*').single()
  if (error) throw error
  return data
}

export async function deletePost(postId) {
  const { error } = await supabase.from('community_posts').delete().eq('id', postId)
  if (error) throw error
  return true
}

export async function getComments(postId) {
  const { data, error } = await supabase
    .from('community_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data || []).map(c => ({
    id: c.id,
    userId: c.user_id,
    author: 'Devotee',
    text: c.text,
    createdAt: c.created_at,
  }))
}
