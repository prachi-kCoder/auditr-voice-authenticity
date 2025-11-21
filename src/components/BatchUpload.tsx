import { useCallback, useState } from "react";
import { Upload, FileAudio, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface BatchUploadProps {
  onFilesSelect: (files: File[]) => void;
}

const BatchUpload = ({ onFilesSelect }: BatchUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
        description: `${file.name} is not a valid audio file.`,
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `${file.name} exceeds 50MB limit.`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(validateFile);
    if (files.length > 0) {
      const newFiles = [...selectedFiles, ...files];
      setSelectedFiles(newFiles);
      onFilesSelect(newFiles);
    }
  }, [selectedFiles, onFilesSelect, toast]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(validateFile);
    if (files.length > 0) {
      const newFiles = [...selectedFiles, ...files];
      setSelectedFiles(newFiles);
      onFilesSelect(newFiles);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelect(newFiles);
  };

  const clearAll = () => {
    setSelectedFiles([]);
    onFilesSelect([]);
  };

  const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="w-full space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
          ${isDragging 
            ? 'border-primary bg-primary/10 shadow-glow' 
            : 'border-border hover:border-primary/50 bg-card/50'
          }
        `}
      >
        <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2 text-foreground">
          Drop multiple audio files here
        </h3>
        <p className="text-muted-foreground mb-4 text-sm">
          or click to browse (MP3, WAV - max 50MB per file)
        </p>
        <input
          type="file"
          accept="audio/mpeg,audio/wav,audio/mp3"
          onChange={handleFileInput}
          className="hidden"
          id="batch-audio-upload"
          multiple
        />
        <label htmlFor="batch-audio-upload">
          <Button variant="hero" asChild>
            <span>Select Files</span>
          </Button>
        </label>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected ({(totalSize / 1024 / 1024).toFixed(2)} MB total)
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileAudio className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchUpload;
