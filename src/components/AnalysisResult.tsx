import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export interface AnalysisData {
  isAuthentic: boolean;
  confidence: number;
  details: string;
}

interface AnalysisResultProps {
  result: AnalysisData;
}

const AnalysisResult = ({ result }: AnalysisResultProps) => {
  const { isAuthentic, confidence, details } = result;

  return (
    <Card className={`
      p-8 space-y-6 border-2 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4
      ${isAuthentic 
        ? 'border-success bg-success/5 shadow-glow-success' 
        : 'border-destructive bg-destructive/5 shadow-glow-danger'
      }
    `}>
      {/* Status Icon and Title */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-background/50">
          {isAuthentic ? (
            <CheckCircle2 className="w-12 h-12 text-success" />
          ) : (
            <XCircle className="w-12 h-12 text-destructive" />
          )}
        </div>
        
        <div>
          <h2 className="text-3xl font-bold mb-2">
            {isAuthentic ? 'Authentic Audio' : 'Synthetic Audio Detected'}
          </h2>
          <p className="text-muted-foreground">
            {isAuthentic 
              ? 'This audio appears to be genuine human speech'
              : 'This audio shows signs of AI generation or manipulation'
            }
          </p>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">Confidence Score</span>
          <span className={`text-2xl font-bold ${isAuthentic ? 'text-success' : 'text-destructive'}`}>
            {confidence}%
          </span>
        </div>
        <Progress 
          value={confidence} 
          className="h-3"
        />
      </div>

      {/* Analysis Details */}
      <div className="bg-background/50 rounded-lg p-6 space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
          <div>
            <h3 className="font-semibold mb-2">Analysis Details</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {details}
            </p>
          </div>
        </div>

        {/* Technical Indicators */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Spectral Analysis</div>
            <div className="text-sm font-medium">
              {isAuthentic ? 'Natural patterns' : 'Anomalies detected'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Voice Characteristics</div>
            <div className="text-sm font-medium">
              {isAuthentic ? 'Human-like' : 'Synthetic markers'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Temporal Consistency</div>
            <div className="text-sm font-medium">
              {confidence > 70 ? 'Consistent' : 'Irregular'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Noise Profile</div>
            <div className="text-sm font-medium">
              {isAuthentic ? 'Organic' : 'Processed'}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className={`
        rounded-lg p-4 text-sm
        ${isAuthentic ? 'bg-success/10 text-success-foreground' : 'bg-destructive/10 text-destructive-foreground'}
      `}>
        <strong>Recommendation:</strong> {isAuthentic 
          ? 'No further action required. Audio appears authentic.'
          : 'Exercise caution. Consider verifying through alternative channels.'}
      </div>
    </Card>
  );
};

export default AnalysisResult;
