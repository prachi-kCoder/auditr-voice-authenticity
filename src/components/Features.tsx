import { Shield, Zap, BarChart3, Lock, FileCheck, Brain } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Multi-Model Fusion",
    description: "Ensemble of 5+ specialized ML models analyzing prosody, spectral artifacts, temporal patterns, and voice biometrics for unmatched accuracy."
  },
  {
    icon: BarChart3,
    title: "Explainable AI (XAI)",
    description: "Visual heatmaps and detailed reports showing exactly why audio was flagged, with individual model verdicts for complete transparency."
  },
  {
    icon: Zap,
    title: "Real-Time Analysis",
    description: "Lightning-fast screening under 1 second for quick checks, with comprehensive forensic analysis available on-demand."
  },
  {
    icon: Shield,
    title: "95.2% Accuracy",
    description: "Industry-leading detection rate against sophisticated deepfakes, continuously improving with novel attack patterns."
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "SOC 2 compliant infrastructure with end-to-end encryption, audit trails, and complete data sovereignty."
  },
  {
    icon: FileCheck,
    title: "Batch Processing",
    description: "Analyze hundreds of audio files simultaneously with comprehensive reports and exportable forensic documentation."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Forensic-Grade Detection
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Advanced AI technology that organizations trust to protect against voice fraud and audio manipulation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-glow"
              >
                <div className="mb-4">
                  <Icon className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
