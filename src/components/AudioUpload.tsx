import { useCallback, useState } from "react";
import { Upload, FileAudio, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AudioUploadProps {
  onFileSelect: (file: File) => void;
}

const AudioUpload = ({ onFileSelect }: AudioUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): boolean => {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/wave'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav)$/i)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an MP3 or WAV file.",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 50MB.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect, toast]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300
          ${isDragging 
            ? 'border-primary bg-primary/10 shadow-glow' 
            : 'border-border hover:border-primary/50 bg-card/50'
          }
        `}
      >
        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 text-primary">
              <FileAudio className="w-8 h-8" />
              <span className="text-lg font-medium">{selectedFile.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <>
            <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              Drop your audio file here
            </h3>
            <p className="text-muted-foreground mb-6">
              or click to browse (MP3, WAV - max 50MB)
            </p>
            <input
              type="file"
              accept="audio/mpeg,audio/wav,audio/mp3"
              onChange={handleFileInput}
              className="hidden"
              id="audio-upload"
            />
            <label htmlFor="audio-upload">
              <Button variant="hero" asChild>
                <span>Select File</span>
              </Button>
            </label>
          </>
        )}
      </div>
    </div>
  );
};

export default AudioUpload;
