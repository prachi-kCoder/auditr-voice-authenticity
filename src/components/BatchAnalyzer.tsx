import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BatchUpload from "./BatchUpload";
import BatchSummaryDashboard from "./BatchSummaryDashboard";

export interface BatchAnalysisData {
  fileName: string;
  fileSize: number;
  isAuthentic: boolean;
  confidence: number;
  processingTime: number;
  sourceAttribution: {
    type: string;
    confidence: number;
    vendor: string;
  };
  threatLevel: "low" | "medium" | "high" | "critical";
}

const BatchAnalyzer = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<BatchAnalysisData[]>([]);
  const [currentFiles, setCurrentFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const analyzeBatch = async () => {
    if (currentFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select audio files to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setResults([]);

    const newResults: BatchAnalysisData[] = [];

    for (let i = 0; i < currentFiles.length; i++) {
      const file = currentFiles[i];
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

      const isAuthentic = Math.random() > 0.4;
      const confidence = isAuthentic 
        ? 85 + Math.random() * 14
        : 75 + Math.random() * 20;

      const types = ['Text-to-Speech', 'Voice Cloning', 'Voice Conversion', 'Neural Vocoder'];
      const vendors = ['ElevenLabs', 'Google WaveNet', 'Microsoft Azure', 'Amazon Polly', 'Custom Model'];
      
      const result: BatchAnalysisData = {
        fileName: file.name,
        fileSize: file.size,
        isAuthentic,
        confidence,
        processingTime: 1.2 + Math.random() * 2,
        sourceAttribution: {
          type: isAuthentic ? 'Human Voice' : types[Math.floor(Math.random() * types.length)],
          confidence: 70 + Math.random() * 25,
          vendor: isAuthentic ? 'N/A' : vendors[Math.floor(Math.random() * vendors.length)]
        },
        threatLevel: isAuthentic 
          ? 'low' 
          : confidence > 90 
            ? 'critical' 
            : confidence > 75 
              ? 'high' 
              : 'medium'
      };

      newResults.push(result);
      setResults([...newResults]);
      setProgress(((i + 1) / currentFiles.length) * 100);
    }

    setIsAnalyzing(false);
    
    toast({
      title: "Batch analysis complete",
      description: `Successfully analyzed ${currentFiles.length} audio file${currentFiles.length !== 1 ? 's' : ''}.`,
    });
  };

  const handleFilesSelect = (files: File[]) => {
    setCurrentFiles(files);
    setResults([]);
    setProgress(0);
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
            Batch Audio Analysis
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload and analyze multiple audio files simultaneously for comprehensive forensic evaluation
          </p>
        </div>

        <div className="space-y-8">
          <BatchUpload onFilesSelect={handleFilesSelect} />

          {currentFiles.length > 0 && !results.length && (
            <div className="flex justify-center">
              <Button
                onClick={analyzeBatch}
                disabled={isAnalyzing}
                size="lg"
                className="min-w-[200px]"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing... {Math.round(progress)}%
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Analyze All Files
                  </>
                )}
              </Button>
            </div>
          )}

          {results.length > 0 && (
            <BatchSummaryDashboard 
              results={results} 
              isAnalyzing={isAnalyzing}
              progress={progress}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default BatchAnalyzer;
