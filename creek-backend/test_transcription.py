import sounddevice as sd
import numpy as np
import torch
from espnet2.bin.asr_inference import Speech2Text
import time

def record_audio(duration=5, sample_rate=16000):
    """Record audio from the microphone"""
    print(f"Recording for {duration} seconds...")
    recording = sd.rec(int(duration * sample_rate), 
                      samplerate=sample_rate, 
                      channels=1, 
                      dtype='float32')
    sd.wait()  # Wait until recording is finished
    return recording.flatten()

def load_model():
    """Load the ESPnet ASR model from local path"""
    print("Loading model...")
    local_model_path = "/home/henshawmikel/.cache/huggingface/hub/models--espnet--owsm_v4_small_370M/snapshots/1d855cbc60d16362a281444be4849539e17af077"
    
    speech2text = Speech2Text(
        asr_train_config=f"{local_model_path}/config.yaml",
        asr_model_file=f"{local_model_path}/valid.acc.ave.pth",
        device="cuda" if torch.cuda.is_available() else "cpu",
        minlenratio=0.0,
        maxlenratio=0.0,
        ctc_weight=0.3,
        beam_size=10,
        batch_size=0,
        nbest=1
    )
    return speech2text

def transcribe_audio(speech2text, audio, sample_rate=16000):
    """Transcribe audio using the loaded model"""
    print("Transcribing...")
    # Convert to int16 if needed
    if audio.dtype == np.float32:
        audio = (audio * 32768).astype(np.int16)
    
    # Run inference
    nbests = speech2text(audio)
    text, *_ = nbests[0]
    return text

def main():
    try:
        # Load the model first (this might take a while)
        speech2text = load_model()
        
        while True:
            input("Press Enter to start recording (or Ctrl+C to exit)...")
            
            # Record 5 seconds of audio
            audio = record_audio(duration=5)
            
            # Transcribe the audio
            text = transcribe_audio(speech2text, audio)
            
            print("\nTranscription:", text)
            print("-" * 50)
            
    except KeyboardInterrupt:
        print("\nExiting...")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main()
