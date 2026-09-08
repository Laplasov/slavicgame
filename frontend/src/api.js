/**
 * Клиент REST API SlavicGame.
 * Хранит токен, ник и epoch текущей сессии в localStorage.
 * Каждый PUT /api/save/ несёт X-Save-Epoch — сервер сверяет его со своим
 * и отклоняет 409, если сессия устарела (zombie-запрос).
 */
const TOKEN_KEY = 'slavic_token';
const NICK_KEY = 'slavic_nick';
const EPOCH_KEY = 'slavic_epoch';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function firstError(data, fallback) {
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (data.error) return data.error;
  if (data.detail) return String(data.detail);
  for (const key of Object.keys(data)) {
    const value = data[key];
    if (Array.isArray(value) && value.length) return String(value[0]);
    if (typeof value === 'string') return value;
  }
  return fallback;
}

export class ApiClient {
  static getToken() { return window.localStorage.getItem(TOKEN_KEY) || ''; }
  static setToken(t) { window.localStorage.setItem(TOKEN_KEY, t); }
  static getNick() { return window.localStorage.getItem(NICK_KEY) || ''; }
  static setNick(n) { window.localStorage.setItem(NICK_KEY, n); }
  static getEpoch() { return window.localStorage.getItem(EPOCH_KEY) || ''; }
  static setEpoch(e) { window.localStorage.setItem(EPOCH_KEY, e || ''); }

  static clear() {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(NICK_KEY);
    window.localStorage.removeItem(EPOCH_KEY);
  }

  static async request(path, { method = 'GET', body, keepalive = false } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    // Epoch в PUT save — защита от zombie-сессий
    if (method === 'PUT' && path.includes('/api/save/')) {
      const ep = this.getEpoch();
      if (ep) headers['X-Save-Epoch'] = ep;
      if (body && typeof body === 'object') body.epoch = ep;
    }
    const res = await fetch(path, {
      method, headers,
      body: body ? JSON.stringify(body) : undefined,
      keepalive,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new ApiError(firstError(data, `Ошибка сервера (${res.status})`), res.status, data);
    }
    return data;
  }

  static register(nickname, password, password2) {
    return this.request('/api/auth/register/', { method: 'POST', body: { nickname, password, password2 } });
  }
  static login(nickname, password) {
    return this.request('/api/auth/login/', { method: 'POST', body: { nickname, password } });
  }
  static logout() {
    return this.request('/api/auth/logout/', { method: 'POST' });
  }
  static getSave() {
    return this.request('/api/save/');
  }
  static putSave(payload, keepalive = false) {
    return this.request('/api/save/', { method: 'PUT', body: payload, keepalive });
  }
  static leaderboard() {
    return this.request('/api/leaderboard/');
  }
}
