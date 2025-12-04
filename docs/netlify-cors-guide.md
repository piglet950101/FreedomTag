## Netlify / CORS troubleshooting for FreedomDemo client

This page explains common causes of CORS errors and how to fix them for the `client` app when deploying to Netlify.

1) Build-time environment variable (recommended)
----------------------------------------------
- Set `VITE_BACKEND_URL` to the public backend base url in the Netlify site settings (Settings → Build & deploy → Environment). Example value: `https://api.example.com`.
- This will have the client build use the correct backend URL for runtime fetch requests.

2) Use Netlify redirects to proxy `/api/*` (avoids CORS entirely)
----------------------------------------------------------------
- In `netlify.toml` we already added a redirect that proxies `/api/*` to a backend. Example:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://api.example.com/:splat"
  status = 200
  force = true
```
- This makes browser requests to `/api/*` hit Netlify and be proxied to the backend. You can then keep client code using relative `/api/..` paths and don't need to set `VITE_BACKEND_URL`.

3) Server-side CORS
-------------------
- If you cannot proxy or you want client to talk directly to backend domain, configure CORS on the backend.
- Typical Express configuration using the `cors` package:

```js
import cors from 'cors';
const origins = [
  'https://your-site.netlify.app',
  'https://www.your-custom-domain.com',
  'http://localhost:5173',
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow same origin, server-to-server
    if (origins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));
```

Notes:
- If the client sends credentials (cookies or Authorization headers), you must set `Access-Control-Allow-Credentials: true` and cannot use wildcard `*` for `Access-Control-Allow-Origin`.
- If using preflight `OPTIONS` requests, make sure your backend handles `OPTIONS` and responds with correct headers.

4) Debugging tips
-----------------
- Inspect the network tab in the browser devtools: check the `Request URL` and `Response` headers for `Access-Control-Allow-*` values.
- If `Request URL` is still `http://localhost:3000` in production, update `VITE_BACKEND_URL` or use the Netlify redirect described above.
- Watch for `CORS` errors caused by `fetch` with `credentials: 'include'` when the server doesn't allow credentials.

5) Other options
----------------
- Use runtime override `window.__BACKEND_URL__` to set backend URL after boot (useful for per-deploy runtime config).
- Keep using proxy during local development via `vite.config.ts` as you already do.
