# Creek AI Backend

A FastAPI backend that processes audio files, transcribes them using Whisper, and generates structured summaries using GPT-4.

## Features

- Audio file upload and processing
- Speech-to-text transcription using OpenAI's Whisper
- AI-powered summary generation
- RESTful API endpoints
- CORS enabled
- No authentication required (for development)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the project root with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Running the Server

```bash
uvicorn main:app --reload
```

The server will start at `http://localhost:8000`

## API Endpoints

### Health Check
- **GET** `/health` - Check if the server is running

### Upload Audio
- **POST** `/upload-audio` - Upload an audio file for processing
  - **Content-Type**: `multipart/form-data`
  - **Body**: `file` (audio file in mp3, wav, m4a, or ogg format)
  - **Response**: JSON with transcript and structured summary

## Example Response

```json
{
  "transcript": "Full transcription text here...",
  "summary": {
    "title": "The Power of Faith",
    "scriptures": ["Hebrews 11:1", "Matthew 17:20"],
    "key_points": [
      "Faith is the substance of things hoped for",
      "Even small faith can move mountains"
    ],
    "summary": "This sermon explored the nature of faith..."
  }
}
```

## Development

- Python 3.8+
- FastAPI
- OpenAI API key required for Whisper and GPT-4

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)
