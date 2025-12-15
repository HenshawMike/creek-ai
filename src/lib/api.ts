/**
 * API Client Module
 *
 * This module provides a centralized interface for all backend API interactions.
 * It handles configuration, error handling, and request/response formatting.
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface SermonMetadata {
  title?: string;
  speaker?: string;
  location?: string;
  date?: string;
  series?: string;
  bible_passage?: string;
  service_type?: string;
}

export interface HealthCheckResponse {
  status: string;
  version: string;
  timestamp: string;
}

export interface StartRecordingResponse {
  session_id: string;
  status: string;
  file_path: string;
}

export interface StopRecordingResponse {
  session_id: string;
  status: string;
  file_path: string;
  duration: number;
}

export interface Recording {
  name: string;
  path: string;
  size: number;
  created: number;
  modified: number;
}

export interface TranscribeResponse {
  transcript: string;
  formatted: Record<string, unknown>;
  metadata: SermonMetadata;
}

export type ConfigResponse = Record<string, unknown>;

export interface ApiError extends Error {
  status?: number;
  detail?: string;
}

// ============================================================================
// Configuration
// ============================================================================

const getApiBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_URL || '';
  // Remove trailing slash for consistency
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

// ============================================================================
// Error Handling
// ============================================================================

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    let errorData: Record<string, unknown> = {};

    try {
      if (contentType?.includes('application/audio')) {
        errorData = await response.json();
      } else {
        errorData = { detail: await response.text() };
      }
    } catch {
      errorData = { detail: `HTTP ${response.status}` };
    }

    const error: ApiError = new Error(
      (errorData?.detail as string) || (errorData?.message as string) || `HTTP ${response.status}`
    );
    error.status = response.status;
    error.detail = errorData?.detail as string;

    throw error;
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/audio')) {
    return response.json();
  }

  return response.text() as unknown as T;
}

// ============================================================================
// API Methods
// ============================================================================

/**
 * Health Check
 * GET /api/health
 */
export async function checkHealth(): Promise<HealthCheckResponse> {
  const url = `${getApiBaseUrl()}/api/health`;
  const response = await fetch(url);
  return handleResponse<HealthCheckResponse>(response);
}

/**
 * Get Configuration
 * GET /api/config
 */
export async function getConfig(): Promise<ConfigResponse> {
  const url = `${getApiBaseUrl()}/api/config`;
  const response = await fetch(url);
  return handleResponse<ConfigResponse>(response);
}

/**
 * Start Recording Session
 * POST /api/recordings/start
 */
export async function startRecording(
  metadata?: SermonMetadata
): Promise<StartRecordingResponse> {
  const url = `${getApiBaseUrl()}/api/recordings/start`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metadata || {}),
  });
  return handleResponse<StartRecordingResponse>(response);
}

/**
 * Stop Recording Session
 * POST /api/recordings/{sessionId}/stop
 */
export async function stopRecording(
  sessionId: string
): Promise<StopRecordingResponse> {
  const url = `${getApiBaseUrl()}/api/recordings/${sessionId}/stop`;
  const response = await fetch(url, { method: 'POST' });
  return handleResponse<StopRecordingResponse>(response);
}

/**
 * List All Recordings
 * GET /api/recordings
 */
export async function listRecordings(): Promise<Recording[]> {
  const url = `${getApiBaseUrl()}/api/recordings`;
  const response = await fetch(url);
  return handleResponse<Recording[]>(response);
}

/**
 * Get a Specific Recording File
 * GET /api/recordings/{filename}
 */
export async function getRecording(filename: string): Promise<Blob> {
  const url = `${getApiBaseUrl()}/api/recordings/${filename}`;
  const response = await fetch(url);
  if (!response.ok) {
    await handleResponse<never>(response);
  }
  return response.blob();
}

/**
 * Transcribe Audio File
 * POST /api/transcribe
 *
 * Uploads an audio file (as a Blob) to the backend for transcription.
 * The backend will return a transcript and formatted output.
 */
export async function transcribeAudio(
  audioBlob: Blob,
  filename: string = `recording_${Date.now()}.webm`,
  metadata?: SermonMetadata
): Promise<TranscribeResponse> {
  const url = `${getApiBaseUrl()}/api/transcribe`;

  const form = new FormData();
  form.append('file', audioBlob, filename);

  if (metadata) {
    form.append('metadata', JSON.stringify(metadata));
  }

  const response = await fetch(url, {
    method: 'POST',
    body: form,
  });

  return handleResponse<TranscribeResponse>(response);
}

// ============================================================================
// Exports
// ============================================================================

export const api = {
  checkHealth,
  getConfig,
  startRecording,
  stopRecording,
  listRecordings,
  getRecording,
  transcribeAudio,
};

export default api;
