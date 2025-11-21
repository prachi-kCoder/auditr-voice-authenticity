import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileAudio, 
  Shield,
  Activity,
  TrendingUp,
  Clock
} from "lucide-react";
import { BatchAnalysisData } from "./BatchAnalyzer";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface BatchSummaryDashboardProps {
  results: BatchAnalysisData[];
  isAnalyzing: boolean;
  progress: number;
}

const BatchSummaryDashboard = ({ results, isAnalyzing, progress }: BatchSummaryDashboardProps) => {
  const authenticCount = results.filter(r => r.isAuthentic).length;
  const syntheticCount = results.length - authenticCount;
  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
  const avgProcessingTime = results.reduce((sum, r) => sum + r.processingTime, 0) / results.length;

  const threatLevelCounts = {
    critical: results.filter(r => r.threatLevel === 'critical').length,
    high: results.filter(r => r.threatLevel === 'high').length,
    medium: results.filter(r => r.threatLevel === 'medium').length,
    low: results.filter(r => r.threatLevel === 'low').length,
  };

  const pieData = [
    { name: 'Authentic', value: authenticCount, color: 'hsl(var(--success))' },
    { name: 'Synthetic', value: syntheticCount, color: 'hsl(var(--danger))' },
  ];

  const threatData = [
    { name: 'Critical', value: threatLevelCounts.critical, fill: 'hsl(var(--danger))' },
    { name: 'High', value: threatLevelCounts.high, fill: 'hsl(var(--warning))' },
    { name: 'Medium', value: threatLevelCounts.medium, fill: 'hsl(var(--accent))' },
    { name: 'Low', value: threatLevelCounts.low, fill: 'hsl(var(--success))' },
  ];

  const getThreatBadgeVariant = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {isAnalyzing && (
        <Card className="border-primary/50 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 animate-pulse text-primary" />
              Processing Files...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {Math.round(progress)}% complete
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Files</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <FileAudio className="w-6 h-6 text-primary" />
              {results.length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Authentic</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2 text-success">
              <CheckCircle2 className="w-6 h-6" />
              {authenticCount}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Synthetic</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2 text-danger">
              <XCircle className="w-6 h-6" />
              {syntheticCount}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Confidence</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-accent" />
              {avgConfidence.toFixed(1)}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Detection Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Threat Level Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={threatData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Processing Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Average Processing Time</p>
              <p className="text-2xl font-bold">{avgProcessingTime.toFixed(2)}s</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Processing Time</p>
              <p className="text-2xl font-bold">{(avgProcessingTime * results.length).toFixed(1)}s</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
          <CardDescription>Individual file analysis breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className="p-4 bg-card/50 border border-border rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <FileAudio className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="font-medium truncate">{result.fileName}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Size: </span>
                        {(result.fileSize / 1024 / 1024).toFixed(2)} MB
                      </div>
                      <div>
                        <span className="text-muted-foreground">Confidence: </span>
                        {result.confidence.toFixed(1)}%
                      </div>
                      <div>
                        <span className="text-muted-foreground">Time: </span>
                        {result.processingTime.toFixed(2)}s
                      </div>
                      <div>
                        <span className="text-muted-foreground">Source: </span>
                        {result.sourceAttribution.type}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Badge variant={getThreatBadgeVariant(result.threatLevel)}>
                      {result.threatLevel.toUpperCase()}
                    </Badge>
                    {result.isAuthentic ? (
                      <Badge variant="outline" className="border-success text-success">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Authentic
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-danger text-danger">
                        <XCircle className="w-3 h-3 mr-1" />
                        Synthetic
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchSummaryDashboard;
