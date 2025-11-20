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
          details: "Audio exhibits natural human speech patterns with organic breathing sounds, natural pauses, and consistent vocal characteristics. Spectral analysis shows typical frequency distribution of genuine human voice. No artifacts commonly associated with text-to-speech or voice synthesis detected.",
          sourceAttribution: {
            type: "Human Voice",
            vendor: "N/A",
            likelihood: 94.3
          },
          acousticEnvironment: {
            qualityScore: 8.7,
            backgroundNoise: "Minimal ambient noise detected",
            artifacts: [],
            manipulationPoints: []
          },
          spectralData: [
            { frequency: 0, amplitude: 20 },
            { frequency: 1000, amplitude: 45 },
            { frequency: 2000, amplitude: 60 },
            { frequency: 3000, amplitude: 55 },
            { frequency: 4000, amplitude: 40 },
            { frequency: 5000, amplitude: 30 },
            { frequency: 6000, amplitude: 25 },
            { frequency: 7000, amplitude: 20 },
            { frequency: 8000, amplitude: 15 }
          ],
          temporalData: [
            { time: 0, energy: 30 },
            { time: 0.5, energy: 65 },
            { time: 1, energy: 70 },
            { time: 1.5, energy: 55 },
            { time: 2, energy: 60 },
            { time: 2.5, energy: 45 },
            { time: 3, energy: 50 }
          ]
        },
        {
          isAuthentic: false,
          confidence: 87.6,
          details: "Analysis detected multiple synthetic voice markers including unnatural pitch consistency, absence of micro-variations in tone, and digital artifacts in the high-frequency spectrum. Voice characteristics suggest AI-generated speech with probable text-to-speech origin.",
          sourceAttribution: {
            type: "Text-to-Speech",
            vendor: "Google WaveNet (probable)",
            likelihood: 87.6
          },
          acousticEnvironment: {
            qualityScore: 4.2,
            backgroundNoise: "Artificially clean signal",
            artifacts: [
              "Digital clipping at 2.3s",
              "Unnatural silence gaps",
              "Frequency band anomaly (4-6kHz)"
            ],
            manipulationPoints: [
              "Potential splice detected at 1.8s",
              "Pitch normalization artifact at 2.1s"
            ]
          },
          spectralData: [
            { frequency: 0, amplitude: 25 },
            { frequency: 1000, amplitude: 55 },
            { frequency: 2000, amplitude: 70 },
            { frequency: 3000, amplitude: 68 },
            { frequency: 4000, amplitude: 85 },
            { frequency: 5000, amplitude: 82 },
            { frequency: 6000, amplitude: 78 },
            { frequency: 7000, amplitude: 30 },
            { frequency: 8000, amplitude: 20 }
          ],
          temporalData: [
            { time: 0, energy: 45 },
            { time: 0.5, energy: 70 },
            { time: 1, energy: 72 },
            { time: 1.5, energy: 71 },
            { time: 2, energy: 70 },
            { time: 2.5, energy: 68 },
            { time: 3, energy: 69 }
          ]
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
