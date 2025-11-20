import { useState, useRef } from "react";
import { Mic, Square, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

const AudioRecorder = ({ onRecordingComplete }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });
    } catch (error) {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record audio.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const deleteRecording = () => {
    setAudioURL(null);
    setDuration(0);
    audioChunksRef.current = [];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-card/50 border border-border rounded-lg p-8 space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4">
          <Mic className={`w-12 h-12 ${isRecording ? 'text-destructive animate-pulse' : 'text-primary'}`} />
        </div>
        
        <div className="text-4xl font-mono font-bold text-foreground mb-2">
          {formatDuration(duration)}
        </div>
        
        {isRecording && (
          <div className="flex items-center justify-center gap-2 text-destructive">
            <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
            <span className="text-sm font-medium">Recording...</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {!isRecording && !audioURL && (
          <Button variant="hero" size="lg" onClick={startRecording}>
            <Mic className="mr-2 h-5 w-5" />
            Start Recording
          </Button>
        )}

        {isRecording && (
          <Button variant="danger" size="lg" onClick={stopRecording}>
            <Square className="mr-2 h-5 w-5" />
            Stop Recording
          </Button>
        )}

        {audioURL && !isRecording && (
          <>
            <audio src={audioURL} controls className="w-full max-w-md" />
            <Button variant="ghost" size="icon" onClick={deleteRecording}>
              <Trash2 className="h-5 w-5 text-destructive" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
