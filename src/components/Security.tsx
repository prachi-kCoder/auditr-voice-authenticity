import { Shield, Lock, FileKey, Award } from "lucide-react";

const securityFeatures = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "All audio files are encrypted in transit and at rest using AES-256 encryption standards."
  },
  {
    icon: FileKey,
    title: "Complete Audit Trail",
    description: "Every analysis is logged with immutable timestamps for compliance and legal requirements."
  },
  {
    icon: Shield,
    title: "SOC 2 Compliance",
    description: "Our infrastructure meets the highest security standards for handling sensitive data."
  },
  {
    icon: Award,
    title: "Data Sovereignty",
    description: "Your data stays in your region. We never train models on your audio without explicit consent."
  }
];

const Security = () => {
  return (
    <section id="security" className="py-20 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Enterprise-Grade Security
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Built for organizations that demand the highest security and compliance standards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="bg-card border border-border rounded-lg p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-4 text-center">Trusted by Leading Organizations</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-50">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-muted-foreground font-semibold text-lg">
                Client {i}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Security;
