import { Button } from "@/components/ui/button";
import { Shield, Upload, Mic } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  const scrollToAnalyzer = () => {
    document.getElementById('analyzer')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="flex justify-center mb-6 animate-pulse-glow">
          <Shield className="w-20 h-20 text-primary" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
          Auditr
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
          Advanced Deepfake Audio Detection
        </p>
        
        <p className="text-lg text-foreground/80 mb-8 max-w-2xl mx-auto">
          Combat voice impersonation fraud with forensic-level AI analysis. 
          Upload audio files and receive instant authenticity verification with detailed confidence scores.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            variant="hero" 
            size="lg" 
            className="text-lg"
            onClick={scrollToAnalyzer}
          >
            <Upload className="mr-2 h-5 w-5" />
            Upload Audio
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="text-lg border-primary/50 hover:border-primary"
            onClick={scrollToAnalyzer}
          >
            <Mic className="mr-2 h-5 w-5" />
            Record Audio
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6">
            <div className="text-3xl font-bold text-primary mb-2">98.7%</div>
            <div className="text-sm text-muted-foreground">Detection Accuracy</div>
          </div>
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6">
            <div className="text-3xl font-bold text-primary mb-2">&lt;2s</div>
            <div className="text-sm text-muted-foreground">Analysis Time</div>
          </div>
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6">
            <div className="text-3xl font-bold text-primary mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Real-time Processing</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
