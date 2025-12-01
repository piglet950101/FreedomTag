// Initializes the frontend to always send API requests to the backend
// URL defined in `VITE_BACKEND_URL` (client/.env). This file monkey-patches
// `window.fetch` so existing code using relative `/api/*` paths will be routed
// to the configured backend URL without changing all call sites.

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string) || '';

if (!BACKEND_URL) {
  console.warn('VITE_BACKEND_URL is not set. API requests may fail.');
}

const normalizeBase = (u: string) => u.replace(/\/+$/, '');
const base = normalizeBase(BACKEND_URL);

const originalFetch = window.fetch.bind(window);

window.fetch = (input: RequestInfo, init?: RequestInit) => {
  try {
    let urlStr: string;
    if (typeof input === 'string') {
      urlStr = input;
    } else {
      urlStr = input.url;
    }

    // If the request is a relative API path like `/api/...`, prefix with BACKEND_URL
    if (urlStr.startsWith('/api')) {
      if (!base) {
        console.warn('Request to', urlStr, 'but BACKEND_URL is not configured.');
      } else {
        urlStr = base + urlStr;
      }
    }

    const newInput = typeof input === 'string' ? urlStr : new Request(urlStr, input);
    return originalFetch(newInput, init as any);
  } catch (err) {
    return originalFetch(input, init as any);
  }
};
