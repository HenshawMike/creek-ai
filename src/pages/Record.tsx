import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Square, Play, Pause, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api, type TranscribeResponse } from "@/lib/api";

const Record = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success("Recording started");
    } catch (error) {
      toast.error("Failed to access microphone");
      console.error(error);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        setIsPaused(false);
        toast.success("Recording resumed");
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) clearInterval(timerRef.current);
        setIsPaused(true);
        toast.success("Recording paused");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
      toast.success("Recording stopped");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleGenerateNotes = async () => {
    if (!audioBlob) {
      toast.error("No recording available");
      return;
    }

    setIsProcessing(true);
    toast.loading("Processing your recording...");

    try {
      const response = await api.transcribeAudio(audioBlob);
      setIsProcessing(false);
      toast.dismiss();
      toast.success("Notes generated successfully!");
      navigate("/result", { 
        state: { 
          transcript: response.transcript, 
          formatted: response.formatted,
          metadata: response.metadata,
          audioBlob 
        } 
      });
    } catch (error) {
      console.error("Transcription error:", error);
      setIsProcessing(false);
      toast.dismiss();
      const message = error instanceof Error ? error.message : "Failed to generate notes";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold">Record Sermon</h1>
          <p className="text-muted-foreground text-lg">
            Click the microphone to start recording
          </p>
        </div>

        <Card className="p-8 md:p-12 space-y-8 shadow-elevated">
          {/* Visualizer */}
          <div className="flex justify-center">
            <div className="relative">
              <div
                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isRecording
                    ? "bg-primary/20 animate-pulse"
                    : "bg-muted"
                }`}
              >
                <Mic className={`h-16 w-16 ${isRecording ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              {isRecording && (
                <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping" />
              )}
            </div>
          </div>

          {/* Timer */}
          <div className="text-center">
            <div className="text-5xl font-bold tabular-nums">
              {formatTime(recordingTime)}
            </div>
            {isRecording && (
              <p className="text-sm text-muted-foreground mt-2">
                {isPaused ? "Paused" : "Recording..."}
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {!isRecording ? (
              <Button
                size="lg"
                onClick={startRecording}
                className="rounded-xl px-8 h-12"
              >
                <Mic className="mr-2 h-5 w-5" />
                Start Recording
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={pauseRecording}
                  className="rounded-xl px-8 h-12"
                >
                  {isPaused ? (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="mr-2 h-5 w-5" />
                      Pause
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={stopRecording}
                  className="rounded-xl px-8 h-12"
                >
                  <Square className="mr-2 h-5 w-5" />
                  Stop
                </Button>
              </>
            )}
          </div>

          {/* Generate Notes Button */}
          {audioBlob && !isRecording && (
            <div className="pt-8 border-t border-border">
              <Button
                size="lg"
                onClick={handleGenerateNotes}
                disabled={isProcessing}
                className="w-full rounded-xl h-12"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Generate Notes"
                )}
              </Button>
              <p className="text-sm text-muted-foreground text-center mt-4">
                AI transcription and summarization will be enabled once you connect to Lovable Cloud
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Record;
