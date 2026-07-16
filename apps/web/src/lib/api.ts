import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Request interceptor: attach auth token from headers (set via setAuthToken)
api.interceptors.request.use(async (config) => {
  return config
})

// Response interceptor: normalize errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error ?? error.message ?? 'An error occurred'
    return Promise.reject(new Error(message))
  }
)

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

// ─── QR Codes ──────────────────────────────────────────────────────────────
export const qrApi = {
  list: (params?: Record<string, unknown>) => api.get('/qrcodes', { params }),
  get: (id: string) => api.get(`/qrcodes/${id}`),
  create: (data: unknown) => api.post('/qrcodes', data),
  update: (id: string, data: unknown) => api.patch(`/qrcodes/${id}`, data),
  delete: (id: string) => api.delete(`/qrcodes/${id}`),
  duplicate: (id: string) => api.post(`/qrcodes/${id}/duplicate`),
  download: (id: string, format: 'png' | 'svg') =>
    api.get(`/qrcodes/${id}/download?format=${format}`, { responseType: 'blob' }),
  bulkDelete: (ids: string[]) => api.delete('/qrcodes/bulk/delete', { data: { ids } }),
}

// ─── Analytics ─────────────────────────────────────────────────────────────
export const analyticsApi = {
  overview: (organizationId: string, days = 30) =>
    api.get('/analytics/overview', { params: { organizationId, days } }),
  timeSeries: (organizationId: string, days = 30) =>
    api.get('/analytics/timeseries', { params: { organizationId, days } }),
  geo: (organizationId: string, days = 30) =>
    api.get('/analytics/geo', { params: { organizationId, days } }),
  devices: (organizationId: string, days = 30) =>
    api.get('/analytics/devices', { params: { organizationId, days } }),
  qrAnalytics: (id: string, days = 30) =>
    api.get(`/analytics/qrcodes/${id}`, { params: { days } }),
  scanFeed: (params?: Record<string, unknown>) =>
    api.get('/analytics/scans', { params }),
}

// ─── Organizations ─────────────────────────────────────────────────────────
export const orgApi = {
  list: () => api.get('/organizations'),
  get: (id: string) => api.get(`/organizations/${id}`),
  create: (data: unknown) => api.post('/organizations', data),
  update: (id: string, data: unknown) => api.patch(`/organizations/${id}`, data),
  delete: (id: string) => api.delete(`/organizations/${id}`),
  members: (id: string) => api.get(`/organizations/${id}/members`),
  inviteMember: (id: string, data: unknown) => api.post(`/organizations/${id}/members`, data),
  updateMemberRole: (id: string, userId: string, role: string) =>
    api.patch(`/organizations/${id}/members/${userId}`, { role }),
  removeMember: (id: string, userId: string) =>
    api.delete(`/organizations/${id}/members/${userId}`),
}

// ─── Folders ───────────────────────────────────────────────────────────────
export const folderApi = {
  list: (organizationId?: string) => api.get('/folders', { params: { organizationId } }),
  create: (data: unknown) => api.post('/folders', data),
  update: (id: string, data: unknown) => api.patch(`/folders/${id}`, data),
  delete: (id: string) => api.delete(`/folders/${id}`),
}

// ─── API Keys ──────────────────────────────────────────────────────────────
export const apiKeyApi = {
  list: (organizationId: string) => api.get('/apikeys', { params: { organizationId } }),
  create: (data: unknown) => api.post('/apikeys', data),
  revoke: (id: string) => api.delete(`/apikeys/${id}`),
}

// ─── Admin ─────────────────────────────────────────────────────────────────
export const adminApi = {
  stats: () => api.get('/admin/stats'),
  users: (params?: Record<string, unknown>) => api.get('/admin/users', { params }),
  orgs: (params?: Record<string, unknown>) => api.get('/admin/organizations', { params }),
  auditLogs: (params?: Record<string, unknown>) => api.get('/admin/audit-logs', { params }),
  updateUserRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }),
}
