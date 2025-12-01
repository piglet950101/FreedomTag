# Client — Vite + React

Installation and run:

- Install dependencies: `npm install`
- Start the dev server: `npm run dev` (runs at http://localhost:5173)
- Build for production: `npm run build`

The dev server proxies `/api` requests to the backend URL configured in `client/.env` via the `VITE_BACKEND_URL` variable.
Set `VITE_BACKEND_URL` to the backend address (for example `http://localhost:3000`).
Adjust `client/vite.config.ts` only if you need a different proxy behavior.
