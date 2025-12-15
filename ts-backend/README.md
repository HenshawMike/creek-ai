# TypeScript Backend Proxy

A lightweight Express/TypeScript proxy server that forwards API requests from the frontend to the Python FastAPI backend. This keeps all API logic off the client and provides a clean separation of concerns.

## Architecture

```
Frontend (React/TypeScript)
    ↓
Proxy (ts-backend) - Express/TS on localhost:4000
    ↓
Python Backend (FastAPI) - localhost:8000
```

The frontend calls the TypeScript proxy using the `@/lib/api.ts` client module, which is configured via `VITE_API_URL` environment variable.

## Setup

### Prerequisites

- Node.js 16+ (for the proxy server)
- Python 3.8+ (for the FastAPI backend)

### Installation

1. **Install proxy dependencies:**

   ```bash
   cd ts-backend
   npm install
   ```

2. **Configure environment:**

   Copy `.env.example` to `.env` and adjust as needed:

   ```bash
   cp .env.example .env
   ```

   Key variables:

   - `BACKEND_URL` — URL of the Python FastAPI backend (default: `http://localhost:8000`)
   - `PORT` — Port for the TS proxy (default: `4000`)
   - `FRONTEND_URL` — CORS origin for the frontend (default: `*` for development)

### Running

**Development mode** (with hot reload):

```bash
npm run dev
```

**Production build & start:**

```bash
npm run build
npm start
```

The proxy will listen on the configured `PORT` (default `4000`) and forward all `/api/*` requests to the Python backend.

## API Features

The proxy handles:

- **Health checks** (`GET /api/health`)
- **Configuration** (`GET /api/config`)
- **Recording lifecycle** (start/stop sessions)
- **Recording management** (list, retrieve files)
- **File uploads** (`POST /api/transcribe` with multipart form data)
- **Generic proxying** for other endpoints

## Frontend Configuration

In the frontend root, set `VITE_API_URL` in `.env`:

```bash
VITE_API_URL=http://localhost:4000
```

Then use the `api` client from `@/lib/api.ts`:

```tsx
import { api } from '@/lib/api';

// Transcribe audio
const result = await api.transcribeAudio(audioBlob, filename, metadata);
```

See `@/lib/api.ts` for all available methods and type definitions.

## Extending

Add new proxy routes in `src/index.ts`. For example:

```ts
app.post('/api/custom', async (req, res) => {
  try {
    const resp = await axios.post(`${BACKEND_URL}/api/custom`, req.body);
    res.status(resp.status).json(resp.data);
  } catch (err) {
    // error handling
  }
});
```

Then update `@/lib/api.ts` with a corresponding TypeScript client method.

## Development

- **Hot reload:** The dev server watches for changes and restarts automatically.
- **Logs:** All proxy requests and errors are logged to the console.
- **Error handling:** Upstream errors are forwarded with appropriate HTTP status codes.

## Notes

- CORS is configured to allow the frontend origin (see `FRONTEND_URL` in `.env`).
- In production, lock down `FRONTEND_URL` to your actual domain.
- The proxy transparently forwards all headers and body data.
