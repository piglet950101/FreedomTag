// Initializes the frontend to always send API requests to the backend
// URL defined in `VITE_BACKEND_URL` (client/.env). This file monkey-patches
// `window.fetch` so existing code using relative `/api/*` paths will be routed
// to the configured backend URL without changing all call sites.

// Backwards-compatible behavior: the backend URL is provided at build time via
// `VITE_BACKEND_URL`. For Netlify builds you can set it in the site settings.
// During runtime the URL can also be optionally overridden via
// `window.__BACKEND_URL__` if you need to dynamically configure per-deploy.
const BUILD_BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string) || '';
const RUNTIME_BACKEND_URL = (window as any).__BACKEND_URL__ as string | undefined;
const BACKEND_URL = RUNTIME_BACKEND_URL ?? BUILD_BACKEND_URL ?? '';

if (!BACKEND_URL) {
  console.warn(
    `VITE_BACKEND_URL is not set. API requests may fail. Set VITE_BACKEND_URL in the build environment (e.g. Netlify site settings).`,
  );
}

// Helpful diagnostic in production builds: warn if build-time URL is still pointing
// to localhost (common cause of CORS or unreachable backend in production).
if ((import.meta.env.MODE ?? '') === 'production' && BUILD_BACKEND_URL?.includes('localhost')) {
  console.warn(
    `VITE_BACKEND_URL includes 'localhost' in a production build. Make sure to set VITE_BACKEND_URL to your public backend domain in Netlify environment variables or in netlify.toml.`,
  );
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
    return originalFetch(newInput, init as any).then((res) => {
      if (res && res.status === 401) {
        try {
          const isAuthFlow = /\/api\/(philanthropist|beneficiary|charity|merchant|organization)\/login/.test(urlStr) || /\/api\/auth\/(login|signup|change-password)/.test(urlStr);
          if (!isAuthFlow) {
            // Redirect to home on unauthorized for non-auth flows
            window.location.href = '/';
          }
        } catch (_) {}
      }
      return res;
    });
  } catch (err) {
    return originalFetch(input, init as any);
  }
};
