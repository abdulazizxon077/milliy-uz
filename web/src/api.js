export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || `So'rov bajarilmadi (${status})`);
    this.name = 'ApiError';
    this.status = status;
    this.code = body?.error;
  }
}

async function request(method, path, body) {
  const init = { method, credentials: 'same-origin', headers: { accept: 'application/json' } };
  if (body !== undefined) {
    init.headers['content-type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  const res = await fetch(`/api${path}`, init);
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

const enc = encodeURIComponent;

export const api = {
  places: () => request('GET', '/places'),
  place: (id) => request('GET', `/places/${enc(id)}`),
  addReview: (id, review) => request('POST', `/places/${enc(id)}/reviews`, review),
  chat: (message) => request('POST', '/chat', { message }),

  login: (username, password) => request('POST', '/auth/login', { username, password }),
  me: () => request('GET', '/auth/me'),
  logout: () => request('POST', '/auth/logout'),

  admin: {
    stats: () => request('GET', '/admin/stats'),
    createPlace: (data) => request('POST', '/admin/places', data),
    updatePlace: (id, data) => request('PUT', `/admin/places/${enc(id)}`, data),
    deletePlace: (id) => request('DELETE', `/admin/places/${enc(id)}`),
    exportPlaces: () => request('GET', '/admin/places/export'),
    importPlaces: (places) => request('POST', '/admin/places/import', places),
    reviews: (status) => request('GET', `/admin/reviews${status ? `?status=${enc(status)}` : ''}`),
    setReviewStatus: (id, status) => request('PATCH', `/admin/reviews/${enc(id)}`, { status }),
    deleteReview: (id) => request('DELETE', `/admin/reviews/${enc(id)}`),
    chatSettings: () => request('GET', '/admin/settings/chat'),
    saveChatSettings: (systemPrompt) => request('PUT', '/admin/settings/chat', { systemPrompt }),
  },
};
