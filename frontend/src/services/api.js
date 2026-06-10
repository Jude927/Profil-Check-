/**
 * Client HTTP centralisé pour ProfilCheck
 * - Ajoute automatiquement le token JWT à chaque requête
 * - Redirige vers /login si le token expire (401)
 * - Gère les erreurs de manière uniforme
 */

const BASE = '/api/v1'

// ── Token JWT ────────────────────────────────────────────────────────────────
export const getToken   = ()     => localStorage.getItem('profilcheck_token')
export const saveToken  = (tok)  => localStorage.setItem('profilcheck_token', tok)
export const clearToken = ()     => localStorage.removeItem('profilcheck_token')

export const saveUser   = (user) => localStorage.setItem('profilcheck_user', JSON.stringify(user))
export const getUser    = ()     => {
  try { return JSON.parse(localStorage.getItem('profilcheck_user')) } catch { return null }
}
export const clearUser  = ()     => localStorage.removeItem('profilcheck_user')

// ── Requête de base ──────────────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  })

  // Token expiré ou invalide → déconnexion automatique
  if (res.status === 401) {
    clearToken()
    clearUser()
    window.location.href = '/login'
    throw new Error('Session expirée. Veuillez vous reconnecter.')
  }

  // Accès refusé
  if (res.status === 403) {
    window.location.href = '/403'
    throw new Error('Accès refusé.')
  }

  // Pas de contenu
  if (res.status === 204) return null

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.message || data?.error || `Erreur serveur (${res.status})`)
  }

  return data
}

// ── Méthodes HTTP ────────────────────────────────────────────────────────────
export const api = {
  get:    (path)        => request(path),
  post:   (path, body)  => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body)  => request(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  (path, body)  => request(path, { method: 'PATCH',  body: body ? JSON.stringify(body) : undefined }),
  delete: (path)        => request(path, { method: 'DELETE' }),

  // Téléchargement binaire (PDF)
  download: async (path, filename) => {
    const token = getToken()
    const res = await fetch(`${BASE}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) throw new Error(`Erreur téléchargement (${res.status})`)
    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  },
}

// ── Endpoints organisés par domaine ─────────────────────────────────────────

export const authApi = {
  login:         (email, password)  => api.post('/auth/login', { email, password }),
  resetPassword: (email)            => api.post('/auth/reset-password', { email }),
}

export const employeesApi = {
  list:          (params = {})      => {
    const q = new URLSearchParams(params).toString()
    return api.get(`/employees${q ? '?' + q : ''}`)
  },
  getById:       (id)               => api.get(`/employees/${id}`),
  create:        (data)             => api.post('/employees', data),
}

export const dashboardApi = {
  rh:            ()                 => api.get('/dashboard/rh'),
  dg:            ()                 => api.get('/dashboard/dg'),
}

export const testsApi = {
  launch:        (employeeId, jobId, campaignId) =>
                   api.post('/tests/launch', { employeeId, jobId, ...(campaignId ? { campaignId } : {}) }),
  verifyToken:   (token)            => api.post('/exam/verify', { token }),
  getQuestions:  (token)            => api.get(`/exam/${token}`),
  submit:        (token, answers)   => api.post(`/exam/${token}/submit`, { answers }),
}

export const directivesApi = {
  previewPlan:   (reportId)         => api.get(`/directives/previsualize-plan/${reportId}`),
  create:        (data)             => api.post('/directives', data),
  updateStatus:  (id, status)       => api.patch(`/directives/${id}/status?status=${status}`),
}

export const pdfApi = {
  downloadReport: (reportId)        => api.download(`/pdf/report/${reportId}`, `Rapport_${reportId}.pdf`),
}
