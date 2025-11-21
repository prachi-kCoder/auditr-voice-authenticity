import { Upload, Cpu, FileCheck, Download } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Audio",
    description: "Upload single files, record live audio, or process batches of audio files securely through our encrypted interface."
  },
  {
    icon: Cpu,
    title: "Multi-Model Analysis",
    description: "Our ensemble of 5+ specialized ML models analyzes prosody, spectral artifacts, temporal patterns, and acoustic fingerprints in parallel."
  },
  {
    icon: FileCheck,
    title: "XAI Verification",
    description: "Receive detailed explainability reports with visual heatmaps showing exactly which features triggered detection across all models."
  },
  {
    icon: Download,
    title: "Export Results",
    description: "Download comprehensive forensic reports with confidence scores, model verdicts, and evidence suitable for legal proceedings."
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Four simple steps to forensic-grade audio verification
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 border-2 border-primary">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 mt-4">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-4 w-8 h-0.5 bg-primary/30" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
