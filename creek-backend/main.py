import os, time, json, shutil, asyncio
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional, List

from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

from config import config, ConfigManager
from audio.recorder import AudioRecorder
from processing.formatter import SermonFormatter

# Initialize FastAPI app
app = FastAPI(
    title="Sermon Transcription API",
    description="API for recording, transcribing, and processing sermons",
    version="1.0.0"
)

# CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
recorder = AudioRecorder()
formatter = SermonFormatter()

# Active recordings and transcriptions
active_recordings = {}

# Models
class SermonMetadata(BaseModel):
    title: Optional[str] = None
    speaker: Optional[str] = None
    location: Optional[str] = None
    date: Optional[str] = None
    series: Optional[str] = None
    bible_passage: Optional[str] = None
    service_type: Optional[str] = None

class RecordingStatus(BaseModel):
    recording: bool
    duration: float
    file_path: Optional[str] = None
    error: Optional[str] = None

# WebSocket manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# API Endpoints
@app.get("/api/health")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/config")
async def get_config() -> Dict[str, Any]:
    """Get current configuration"""
    return config.config

@app.websocket("/ws/recording")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming WebSocket messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/api/recordings/start")
async def start_recording(metadata: SermonMetadata = None):
    if metadata is None:
        metadata = SermonMetadata()
    """Start a new recording session"""
    if recorder.recording:
        raise HTTPException(status_code=400, detail="Recording already in progress")
    
    try:
        # Generate a unique ID for this recording session
        session_id = str(int(time.time()))
        
        # Start recording
        file_path = recorder.start_recording()
        
        # Store recording info
        active_recordings[session_id] = {
            "start_time": time.time(),
            "file_path": file_path,
            "metadata": metadata.dict()
        }
        
        return {
            "session_id": session_id,
            "status": "recording_started",
            "file_path": file_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recordings/{session_id}/stop")
async def stop_recording(session_id: str):
    """Stop an active recording session"""
    if session_id not in active_recordings:
        raise HTTPException(status_code=404, detail="Recording session not found")
    
    try:
        # Stop recording
        file_path = recorder.stop_recording()
        
        # Update recording info
        recording = active_recordings[session_id]
        recording.update({
            "end_time": time.time(),
            "status": "completed",
            "file_path": file_path
        })
        
        # Process the recording in the background
        return {
            "session_id": session_id,
            "status": "recording_stopped",
            "file_path": file_path,
            "duration": recording["end_time"] - recording["start_time"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/recordings")
async def list_recordings():
    """List all recordings"""
    recordings_dir = Path(config.get('recording', 'save_directory'))
    if not recordings_dir.exists():
        return []
    
    recordings = []
    for file in recordings_dir.glob("*.wav"):
        stats = file.stat()
        recordings.append({
            "name": file.name,
            "path": str(file),
            "size": stats.st_size,
            "created": stats.st_ctime,
            "modified": stats.st_mtime
        })
    
    return sorted(recordings, key=lambda x: x["modified"], reverse=True)

@app.post("/api/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    metadata: Optional[str] = None
):
    """Transcribe an audio file"""
    # Save the uploaded file
    temp_file = Path("temp_" + file.filename)
    try:
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # TODO: Implement transcription using your model
        # This is a placeholder - you'll need to integrate with your actual model
        transcript = "This is a placeholder for the transcribed text."
        
        # Format the transcript
        metadata_dict = json.loads(metadata) if metadata else {}
        formatted = formatter.format_sermon(transcript, metadata_dict)
        
        return {
            "transcript": transcript,
            "formatted": formatted,
            "metadata": metadata_dict
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temporary file
        if temp_file.exists():
            temp_file.unlink()

@app.get("/api/recordings/{filename}")
async def get_recording(filename: str):
    """Get a recording file"""
    file_path = Path(config.get('recording', 'save_directory')) / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

# Background task for processing recordings
async def process_recording(session_id: str):
    """Process a recording in the background"""
    try:
        recording = active_recordings.get(session_id)
        if not recording:
            return
        
        # Update status
        recording["status"] = "processing"
        
        # TODO: Implement transcription and processing
        # This is where you would call your transcription model
        await asyncio.sleep(1)  # Simulate processing
        
        # Update status
        recording["status"] = "completed"
        recording["transcript"] = "This is a placeholder for the transcribed text."
        
    except Exception as e:
        if session_id in active_recordings:
            active_recordings[session_id]["status"] = "error"
            active_recordings[session_id]["error"] = str(e)

if __name__ == "__main__":
    import uvicorn
    
    # Create necessary directories
    for directory in [
        config.get('recording', 'save_directory'),
        *[fmt['save_directory'] for fmt in config.get('output', 'formats')]
    ]:
        Path(directory).mkdir(parents=True, exist_ok=True)
    
    # Start the server
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("DEBUG", "true").lower() == "true"
    )
