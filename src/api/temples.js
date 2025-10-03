import api from './client'

export async function getTempleRealtime(id) {
  const { data } = await api.get(`/api/temples/${id}/realtime`)
  return data
}
