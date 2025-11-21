import { Button } from "@/components/ui/button";
import { Shield, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-32 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Shield className="w-24 h-24 text-primary animate-pulse-glow" />
            <div className="absolute inset-0 w-24 h-24 bg-primary/20 rounded-full blur-xl animate-pulse" />
          </div>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
          Auditr
        </h1>
        
        <p className="text-2xl md:text-4xl font-semibold mb-6 text-foreground">
          Forensic Precision for the Digital Voice
        </p>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
          Combat sophisticated voice impersonation fraud with multi-model AI fusion and explainable forensic analysis. 
          Trusted by organizations that demand enterprise-grade security and transparency.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 h-auto"
            onClick={() => navigate("/auth/signup")}
          >
            Start Free Analysis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="text-lg px-8 py-6 h-auto border-primary/50 hover:border-primary"
            onClick={() => navigate("/auth/login")}
          >
            Sign In
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card/80 backdrop-blur-md border border-border rounded-xl p-8 hover:border-primary/50 transition-all hover:shadow-glow">
            <div className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">95.2%</div>
            <div className="text-base text-foreground font-medium">Detection Accuracy</div>
            <div className="text-sm text-muted-foreground mt-1">Industry-leading precision</div>
          </div>
          <div className="bg-card/80 backdrop-blur-md border border-border rounded-xl p-8 hover:border-primary/50 transition-all hover:shadow-glow">
            <div className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">&lt;1s</div>
            <div className="text-base text-foreground font-medium">Analysis Time</div>
            <div className="text-sm text-muted-foreground mt-1">Lightning-fast screening</div>
          </div>
          <div className="bg-card/80 backdrop-blur-md border border-border rounded-xl p-8 hover:border-primary/50 transition-all hover:shadow-glow">
            <div className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">5+</div>
            <div className="text-base text-foreground font-medium">AI Models</div>
            <div className="text-sm text-muted-foreground mt-1">Multi-model fusion</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
