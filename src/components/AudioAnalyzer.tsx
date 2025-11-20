import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import AudioUpload from "./AudioUpload";
import AudioRecorder from "./AudioRecorder";
import AnalysisResult, { AnalysisData } from "./AnalysisResult";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AudioAnalyzer = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisData | null>(null);
  const [currentFile, setCurrentFile] = useState<File | Blob | null>(null);
  const { toast } = useToast();

  const analyzeAudio = async () => {
    if (!currentFile) {
      toast({
        title: "No audio file",
        description: "Please upload or record audio first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    // Simulate ML analysis (in production, this would call your backend API)
    setTimeout(() => {
      const mockResults: AnalysisData[] = [
        {
          isAuthentic: true,
          confidence: 94.3,
          details: "Audio exhibits natural human speech patterns with organic breathing sounds, natural pauses, and consistent vocal characteristics. Spectral analysis shows typical frequency distribution of genuine human voice. No artifacts commonly associated with text-to-speech or voice synthesis detected."
        },
        {
          isAuthentic: false,
          confidence: 87.6,
          details: "Analysis detected multiple synthetic voice markers including unnatural pitch consistency, absence of micro-variations in tone, and digital artifacts in the high-frequency spectrum. Voice characteristics suggest AI-generated speech with probable text-to-speech origin."
        }
      ];

      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      setResult(randomResult);
      setIsAnalyzing(false);

      toast({
        title: "Analysis complete",
        description: `Audio classified as ${randomResult.isAuthentic ? 'authentic' : 'synthetic'}`,
      });
    }, 3000);
  };

  const handleFileSelect = (file: File) => {
    setCurrentFile(file);
    setResult(null);
  };

  const handleRecordingComplete = (blob: Blob) => {
    setCurrentFile(blob);
    setResult(null);
  };

  return (
    <div id="analyzer" className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Audio Analysis
          </h2>
          <p className="text-lg text-muted-foreground">
            Upload or record audio to detect deepfake manipulation
          </p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="record">Record Audio</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-6">
            <AudioUpload onFileSelect={handleFileSelect} />
          </TabsContent>
          
          <TabsContent value="record" className="space-y-6">
            <AudioRecorder onRecordingComplete={handleRecordingComplete} />
          </TabsContent>
        </Tabs>

        {currentFile && !result && (
          <div className="mt-8 text-center">
            <Button
              variant="hero"
              size="lg"
              onClick={analyzeAudio}
              disabled={isAnalyzing}
              className="min-w-[200px]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Audio'
              )}
            </Button>
          </div>
        )}

        {result && (
          <div className="mt-12">
            <AnalysisResult result={result} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioAnalyzer;
