import { API_BASE_URL } from './config';

let accessToken = null;
let refreshFn = null;
let onUnauthorized = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const setRefreshHandler = (fn) => {
  refreshFn = fn;
};

export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

export class ApiError extends Error {
  constructor(status, body, message) {
    super(message || `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

const buildUrl = (path) => {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/api/')) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

const parseBody = async (response) => {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const performRequest = async (url, options) => {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
};

export const request = async (path, options = {}) => {
  const url = buildUrl(path);
  const init = { ...options };
  if (init.body && typeof init.body !== 'string' && !(init.body instanceof FormData)) {
    init.body = JSON.stringify(init.body);
  }

  let response = await performRequest(url, init);

  if (response.status === 401 && !init._retry && refreshFn) {
    const refreshed = await refreshFn();
    if (refreshed) {
      response = await performRequest(url, { ...init, _retry: true });
    } else if (onUnauthorized) {
      onUnauthorized();
    }
  }

  const body = await parseBody(response);

  if (!response.ok) {
    throw new ApiError(response.status, body, body?.detail || body?.message);
  }

  return body;
};

export const httpClient = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
