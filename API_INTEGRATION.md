# API Integration Guide

This document explains the API architecture and how to run the full system locally.

## Architecture Overview

The application uses a **two-tier backend approach**:

### Tier 1: TypeScript Proxy Backend (`ts-backend/`)

A lightweight Express server that sits between the frontend and the Python backend. All frontend API calls go through this proxy, which:

- Centralizes API logic (authentication, validation, transforms)
- Handles multipart file uploads for audio transcription
- Proxies requests to the Python FastAPI backend
- Provides consistent error handling and response formatting

**Benefits:**

- Keeps API secrets and logic off the client
- Easier to add middleware (auth, rate limiting, logging)
- Single point of entry for API clients

### Tier 2: Python FastAPI Backend (`creek-backend/`)

The core business logic backend that handles:

- Audio recording and file management
- Transcription processing
- Sermon formatting and summarization
- WebSocket connections for real-time updates

## Running Locally (Full Stack)

### 1. Start the Python Backend

```bash
cd creek-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

The backend will run on `http://localhost:8000`.

### 2. Start the TypeScript Proxy

In a new terminal from the project root:

```bash
cd ts-backend
npm install
cp .env.example .env
npm run dev
```

The proxy will run on `http://localhost:4000` (or the `PORT` configured in `.env`).

### 3. Start the Frontend

In another terminal from the project root:

```bash
cp .env.example .env
# Ensure VITE_API_URL=http://localhost:4000 in .env
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` (or the configured Vite port).

### 4. Test the Integration

1. Open `http://localhost:5173` in your browser
2. Go to the Record page
3. Record a sermon audio clip
4. Click "Generate Notes"
5. The frontend will upload the audio to the TS proxy, which forwards it to the Python backend
6. Results appear on the Result page

## API Client Module (`src/lib/api.ts`)

All frontend API calls use the centralized `api` client module. It provides:

- **Type-safe** TypeScript interfaces for all endpoints
- **Error handling** with proper HTTP status codes and error messages
- **Configuration** via `VITE_API_URL` environment variable
- **Request/response formatting** (JSON, multipart, etc.)

### Available Methods

```typescript
import { api } from '@/lib/api';

// Health check
const health = await api.checkHealth();

// Get configuration
const config = await api.getConfig();

// Start a recording session
const started = await api.startRecording({ title: 'Sermon 1' });

// Stop a recording session
const stopped = await api.stopRecording(sessionId);

// List all recordings
const recordings = await api.listRecordings();

// Get a specific recording file
const blob = await api.getRecording(filename);

// Transcribe audio (main entry point for recording workflow)
const result = await api.transcribeAudio(audioBlob, filename, metadata);
```

See `src/lib/api.ts` for full type definitions and method signatures.

### Using the API in Components

Example from `src/pages/Record.tsx`:

```tsx
import { api } from '@/lib/api';

const handleGenerateNotes = async () => {
  try {
    const response = await api.transcribeAudio(audioBlob);
    navigate("/result", { state: { apiResponse: response } });
  } catch (error) {
    toast.error(error.message);
  }
};
```

## Environment Configuration

### Frontend (`.env`)

```bash
# Base URL for API proxy (no trailing slash)
VITE_API_URL=http://localhost:4000
```

### TypeScript Proxy (`ts-backend/.env`)

```bash
# Upstream Python FastAPI backend
BACKEND_URL=http://localhost:8000

# Port for the proxy server
PORT=4000

# CORS origin (restrict in production)
FRONTEND_URL=http://localhost:5173
```

### Python Backend (`creek-backend/.env`)

See `creek-backend/README.md` for configuration details.

## Type Safety

The API client is fully typed in TypeScript:

```typescript
// Request/response types
export interface SermonMetadata { ... }
export interface TranscribeResponse { ... }
export interface Recording { ... }
// ... and more

// Error handling
export interface ApiError extends Error {
  status?: number;
  detail?: string;
}
```

All methods are fully type-checked at compile time, providing IDE autocomplete and catching errors early.

## Extending the API

### Adding a New Endpoint

1. **Add the backend endpoint** in `creek-backend/main.py`
2. **Add a proxy route** in `ts-backend/src/index.ts`:

   ```typescript
   app.post('/api/new-feature', async (req, res) => {
     try {
       const resp = await axios.post(`${BACKEND_URL}/api/new-feature`, req.body);
       res.status(resp.status).json(resp.data);
     } catch (err) {
       // error handling
     }
   });
   ```

3. **Add a client method** in `src/lib/api.ts`:

   ```typescript
   export interface NewFeatureResponse { ... }

   export async function newFeature(param: string): Promise<NewFeatureResponse> {
     const url = `${getApiBaseUrl()}/api/new-feature`;
     const response = await fetch(url, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ param }),
     });
     return handleResponse<NewFeatureResponse>(response);
   }

   export const api = {
     // ... existing methods
     newFeature,
   };
   ```

4. **Use in components:**

   ```typescript
   import { api } from '@/lib/api';
   const result = await api.newFeature('value');
   ```

## Troubleshooting

### Port Already in Use

If a port is already in use:

- **Frontend:** Change the Vite port in `vite.config.ts` or set `PORT` env var
- **Proxy:** Update `PORT` in `ts-backend/.env`
- **Python:** Update `PORT` env var when running `python main.py`

### CORS Errors

If you see CORS errors in the browser:

1. Check `FRONTEND_URL` in `ts-backend/.env` matches your frontend origin
2. Check Python backend CORS config in `creek-backend/main.py`
3. Check that the proxy is receiving requests (check console logs)

### Connection Refused

If you get connection refused errors:

1. Ensure all three servers are running (Python, TS proxy, frontend)
2. Check that `VITE_API_URL` points to the TS proxy (default `http://localhost:4000`)
3. Check that `BACKEND_URL` in `ts-backend/.env` points to the Python backend
4. Check the console logs on each server for errors

## Next Steps

- Implement actual transcription in `creek-backend/main.py::transcribe_audio`
- Add authentication to the TS proxy
- Add database integration for storing notes
- Implement WebSocket support for real-time progress updates
