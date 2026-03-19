import Header from "@/components/Header";
import { Code, Key, Zap, Shield, FileJson, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const endpoints = [
  {
    method: "POST",
    path: "/v1/analyze",
    description: "Submit an audio file for full forensic analysis with all 5 models.",
    response: `{
  "id": "ana_8x7k2m",
  "status": "complete",
  "verdict": "SYNTHETIC",
  "confidence": 0.952,
  "models": {
    "prosody": { "score": 0.94, "verdict": "synthetic" },
    "spectral": { "score": 0.97, "verdict": "synthetic" },
    "temporal": { "score": 0.91, "verdict": "synthetic" },
    "acoustic": { "score": 0.96, "verdict": "synthetic" },
    "biometric": { "score": 0.88, "verdict": "uncertain" }
  },
  "xai": {
    "heatmap_url": "https://api.auditr.ai/heatmaps/ana_8x7k2m.png",
    "flagged_regions": [
      { "start_ms": 1200, "end_ms": 3400, "reason": "Unnatural pitch transition" }
    ]
  }
}`,
  },
  {
    method: "POST",
    path: "/v1/screen",
    description: "Quick real-time screening (<1s) with a lightweight model ensemble.",
    response: `{
  "id": "scr_p3n9q1",
  "verdict": "LIKELY_SYNTHETIC",
  "confidence": 0.87,
  "latency_ms": 340
}`,
  },
  {
    method: "GET",
    path: "/v1/analyses/:id",
    description: "Retrieve the full forensic report for a previously submitted analysis.",
    response: `{ "id": "ana_8x7k2m", "status": "complete", ... }`,
  },
  {
    method: "POST",
    path: "/v1/batch",
    description: "Submit multiple audio files for batch processing. Returns a batch job ID.",
    response: `{
  "batch_id": "bat_r4t2v8",
  "total_files": 25,
  "status": "processing",
  "estimated_completion": "2024-01-15T10:30:00Z"
}`,
  },
];

const ApiDocs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Terminal className="w-4 h-4" />
              Developer API
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Auditr API Reference
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Integrate forensic-grade deepfake detection directly into your applications, pipelines, and security workflows.
            </p>
          </div>

          {/* Quick start */}
          <div className="bg-card border border-border rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              Quick Start
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">1</div>
                <div>
                  <p className="font-medium text-foreground">Get your API key</p>
                  <p className="text-sm text-muted-foreground">Sign up and generate a key from your dashboard settings.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">2</div>
                <div>
                  <p className="font-medium text-foreground">Authenticate requests</p>
                  <p className="text-sm text-muted-foreground">Include your key as a Bearer token in the Authorization header.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">3</div>
                <div>
                  <p className="font-medium text-foreground">Send your first request</p>
                  <code className="block mt-2 bg-background border border-border rounded-lg p-4 text-sm text-foreground overflow-x-auto">
                    curl -X POST https://api.auditr.ai/v1/screen \<br />
                    &nbsp;&nbsp;-H "Authorization: Bearer YOUR_API_KEY" \<br />
                    &nbsp;&nbsp;-F "file=@audio.wav"
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Auth & rate limits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card border border-border rounded-xl p-6">
              <Key className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1 text-foreground">Authentication</h3>
              <p className="text-sm text-muted-foreground">Bearer token via API key. Keys are scoped per project and rotatable.</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <Shield className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1 text-foreground">Security</h3>
              <p className="text-sm text-muted-foreground">TLS 1.3, AES-256 at rest, SOC 2 compliant endpoints.</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <FileJson className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1 text-foreground">Rate Limits</h3>
              <p className="text-sm text-muted-foreground">Starter: 100/hr • Pro: 1,000/hr • Enterprise: custom limits.</p>
            </div>
          </div>

          {/* Endpoints */}
          <h2 className="text-3xl font-bold mb-8">Endpoints</h2>
          <div className="space-y-6 mb-16">
            {endpoints.map((ep) => (
              <div key={ep.path} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-md text-xs font-bold ${
                      ep.method === "GET"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}>
                      {ep.method}
                    </span>
                    <code className="text-foreground font-mono text-sm">{ep.path}</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{ep.description}</p>
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-primary font-medium flex items-center gap-1">
                      <Code className="w-4 h-4" />
                      Example Response
                    </summary>
                    <pre className="mt-3 bg-background border border-border rounded-lg p-4 text-xs text-foreground overflow-x-auto">
                      {ep.response}
                    </pre>
                  </details>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center bg-card border border-border rounded-xl p-12">
            <h2 className="text-2xl font-bold mb-3 text-foreground">Ready to integrate?</h2>
            <p className="text-muted-foreground mb-6">Sign up to get your API key and start building in minutes.</p>
            <Button size="lg" onClick={() => navigate("/auth/signup")}>
              Get API Key
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocs;
