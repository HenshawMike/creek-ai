import os
import wave
import time
import threading
import queue
import sounddevice as sd
import numpy as np
from pathlib import Path
from typing import Optional, Callable
from datetime import datetime

from config import config

class AudioRecorder:
    def __init__(self, sample_rate: int = None, channels: int = None, chunk_size: int = None):
        """Initialize the audio recorder with configuration."""
        self.sample_rate = sample_rate or config.get('recording', 'sample_rate')
        self.channels = channels or config.get('recording', 'channels')
        self.chunk_size = chunk_size or config.get('recording', 'chunk_size')
        self.max_duration = config.get('recording', 'max_duration_minutes') * 60  # Convert to seconds
        
        self.recording = False
        self.audio_queue = queue.Queue()
        self.frames = []
        self.start_time = None
        self.recording_thread = None
        self.processing_thread = None
        self.callback = None
        
        # Ensure output directory exists
        self.output_dir = Path(config.get('recording', 'save_directory'))
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def _audio_callback(self, indata, frames, time_info, status):
        """Callback for audio stream."""
        if status:
            print(f"Audio status: {status}")
        self.audio_queue.put(indata.copy())

    def _process_audio(self):
        """Process audio data from the queue and save to frames."""
        while self.recording or not self.audio_queue.empty():
            try:
                data = self.audio_queue.get(timeout=0.5)
                self.frames.append(data)
                
                # Call the progress callback if provided
                if self.callback:
                    duration = (len(self.frames) * self.chunk_size) / self.sample_rate
                    self.callback(duration, len(data))
                    
            except queue.Empty:
                continue

    def start_recording(self, callback: Optional[Callable] = None) -> str:
        """Start recording audio.
        
        Args:
            callback: Function to call with progress updates (duration_seconds, chunk_size)
            
        Returns:
            str: Path to the saved audio file
        """
        if self.recording:
            raise RuntimeError("Recording is already in progress")
            
        self.callback = callback
        self.recording = True
        self.frames = []
        self.start_time = time.time()
        
        # Start the audio stream
        self.stream = sd.InputStream(
            samplerate=self.sample_rate,
            channels=self.channels,
            callback=self._audio_callback,
            blocksize=self.chunk_size,
            dtype='float32'
        )
        
        # Start processing thread
        self.processing_thread = threading.Thread(target=self._process_audio)
        self.processing_thread.start()
        
        # Start the stream
        self.stream.start()
        
        # Generate output filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.output_file = self.output_dir / f"recording_{timestamp}.wav"
        
        return str(self.output_file)

    def stop_recording(self) -> str:
        """Stop recording and save the audio file.
        
        Returns:
            str: Path to the saved audio file
        """
        if not self.recording:
            raise RuntimeError("No recording in progress")
            
        # Stop the stream
        self.stream.stop()
        self.stream.close()
        self.recording = False
        
        # Wait for processing to finish
        if self.processing_thread:
            self.processing_thread.join()
        
        # Save the recording
        if self.frames:
            audio_data = np.concatenate(self.frames, axis=0)
            self._save_wav(audio_data, self.output_file)
            
        return str(self.output_file)
    
    def _save_wav(self, audio_data: np.ndarray, filepath: Path) -> None:
        """Save audio data to a WAV file."""
        # Convert to 16-bit PCM
        audio_data = (audio_data * 32767).astype(np.int16)
        
        with wave.open(str(filepath), 'wb') as wf:
            wf.setnchannels(self.channels)
            wf.setsampwidth(2)  # 16-bit
            wf.setframerate(self.sample_rate)
            wf.writeframes(audio_data.tobytes())
    
    def record(self, duration: Optional[float] = None, callback: Optional[Callable] = None) -> str:
        """Record audio for a specified duration.
        
        Args:
            duration: Duration to record in seconds. If None, uses max_duration from config.
            callback: Function to call with progress updates (duration_seconds, chunk_size)
            
        Returns:
            str: Path to the saved audio file
        """
        if duration is None:
            duration = self.max_duration
            
        output_file = self.start_recording(callback)
        
        try:
            # Wait for the specified duration or until interrupted
            time.sleep(duration)
        except KeyboardInterrupt:
            print("\nRecording stopped by user")
        finally:
            return self.stop_recording()
