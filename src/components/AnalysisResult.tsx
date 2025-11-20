import { CheckCircle2, XCircle, AlertTriangle, Shield, Activity, Radio, Waves, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateForensicReport } from "@/lib/pdfGenerator";
import { useToast } from "@/hooks/use-toast";
import { useRef, useState } from "react";

export interface AnalysisData {
  isAuthentic: boolean;
  confidence: number;
  details: string;
  sourceAttribution: {
    type: string;
    vendor: string;
    likelihood: number;
  };
  acousticEnvironment: {
    qualityScore: number;
    backgroundNoise: string;
    artifacts: string[];
    manipulationPoints: string[];
  };
  spectralData: Array<{ frequency: number; amplitude: number }>;
  temporalData: Array<{ time: number; energy: number }>;
}

interface AnalysisResultProps {
  result: AnalysisData;
}

const AnalysisResult = ({ result }: AnalysisResultProps) => {
  const { isAuthentic, confidence, details, sourceAttribution, acousticEnvironment, spectralData, temporalData } = result;
  const { toast } = useToast();
  const spectralChartRef = useRef<HTMLDivElement>(null);
  const temporalChartRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadReport = async () => {
    setIsGeneratingPDF(true);
    toast({
      title: "Generating report",
      description: "Please wait while we prepare your forensic report...",
    });

    try {
      await generateForensicReport(result, {
        spectral: spectralChartRef.current,
        temporal: temporalChartRef.current,
      });

      toast({
        title: "Report generated",
        description: "Your forensic report has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate the forensic report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Download Report Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleDownloadReport}
          disabled={isGeneratingPDF}
          className="gap-2"
          variant="default"
        >
          <Download className="w-4 h-4" />
          {isGeneratingPDF ? "Generating..." : "Download Forensic Report"}
        </Button>
      </div>

      {/* Main Status Card */}
      <Card className={`
        p-6 md:p-8 border-2 transition-all duration-500
        ${isAuthentic 
          ? 'border-success bg-success/5 shadow-glow-success' 
          : 'border-destructive bg-destructive/5 shadow-glow-danger'
        }
      `}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Icon and Title */}
          <div className="lg:col-span-3 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-background/50">
              {isAuthentic ? (
                <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-success" />
              ) : (
                <XCircle className="w-10 h-10 md:w-12 md:h-12 text-destructive" />
              )}
            </div>
            
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {isAuthentic ? 'Authentic Audio' : 'Synthetic Audio Detected'}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">
                {isAuthentic 
                  ? 'This audio appears to be genuine human speech'
                  : 'This audio shows signs of AI generation or manipulation'
                }
              </p>
            </div>
          </div>

          {/* Confidence Score */}
          <div className="bg-background/50 rounded-lg p-4 md:p-6 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Confidence Score</span>
            </div>
            <div className={`text-3xl md:text-4xl font-bold ${isAuthentic ? 'text-success' : 'text-destructive'}`}>
              {confidence}%
            </div>
            <Progress value={confidence} className="h-2" />
          </div>

          {/* Source Attribution */}
          <div className="bg-background/50 rounded-lg p-4 md:p-6 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Radio className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Source Attribution</span>
            </div>
            <div className="text-xl md:text-2xl font-bold text-foreground">
              {sourceAttribution.type}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">
              {sourceAttribution.vendor}
            </div>
            <div className="text-xs text-muted-foreground">
              Likelihood: {sourceAttribution.likelihood}%
            </div>
          </div>

          {/* Acoustic Quality */}
          <div className="bg-background/50 rounded-lg p-4 md:p-6 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Environment Quality</span>
            </div>
            <div className="text-3xl md:text-4xl font-bold text-foreground">
              {acousticEnvironment.qualityScore}/10
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">
              {acousticEnvironment.backgroundNoise}
            </div>
          </div>
        </div>

        {/* Analysis Details */}
        <div className="mt-6 bg-background/50 rounded-lg p-4 md:p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Analysis Details</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {details}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Interactive Visualizations */}
      <Card className="p-4 md:p-6 border-2 border-border">
        <div className="flex items-center gap-2 mb-6">
          <Waves className="w-5 h-5 text-primary" />
          <h3 className="text-lg md:text-xl font-bold">Interactive Analysis</h3>
        </div>
        
        <Tabs defaultValue="spectral" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="spectral" className="text-xs md:text-sm">Spectral Analysis</TabsTrigger>
            <TabsTrigger value="temporal" className="text-xs md:text-sm">Temporal Energy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="spectral" className="space-y-4">
            <div ref={spectralChartRef} className="h-64 md:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spectralData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="frequency" 
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))' }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: 'Amplitude (dB)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amplitude" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary) / 0.2)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground text-center">
              Frequency spectrum analysis showing voice characteristic distribution
            </p>
          </TabsContent>
          
          <TabsContent value="temporal" className="space-y-4">
            <div ref={temporalChartRef} className="h-64 md:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={temporalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))' }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: 'Energy', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="energy" 
                    stroke={isAuthentic ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground text-center">
              Temporal energy distribution revealing speech pattern consistency
            </p>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Acoustic Environment Audit */}
      <Card className="p-4 md:p-6 border-2 border-border">
        <h3 className="text-lg md:text-xl font-bold mb-4">Acoustic Environment Audit</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Artifacts */}
          <div className="bg-background/50 rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Digital Artifacts
            </h4>
            {acousticEnvironment.artifacts.length > 0 ? (
              <ul className="space-y-2">
                {acousticEnvironment.artifacts.map((artifact, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive mt-0.5">•</span>
                    <span>{artifact}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No artifacts detected</p>
            )}
          </div>

          {/* Manipulation Points */}
          <div className="bg-background/50 rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-destructive" />
              Manipulation Points
            </h4>
            {acousticEnvironment.manipulationPoints.length > 0 ? (
              <ul className="space-y-2">
                {acousticEnvironment.manipulationPoints.map((point, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No manipulation detected</p>
            )}
          </div>
        </div>
      </Card>

      {/* Recommendation */}
      <Card className={`
        p-4 md:p-6 border-2
        ${isAuthentic 
          ? 'border-success bg-success/10' 
          : 'border-destructive bg-destructive/10'
        }
      `}>
        <div className="flex items-start gap-3">
          <Shield className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isAuthentic ? 'text-success' : 'text-destructive'}`} />
          <div>
            <h4 className="font-semibold mb-1">Forensic Recommendation</h4>
            <p className="text-sm">
              {isAuthentic 
                ? 'No further action required. Audio appears authentic with natural human speech characteristics.'
                : 'Exercise caution. Evidence suggests synthetic origin. Verify through alternative channels and consider the context of usage before trusting this audio.'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnalysisResult;
