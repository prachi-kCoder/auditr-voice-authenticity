import { Check, Zap, Building2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    icon: Zap,
    price: "Free",
    period: "",
    description: "For individuals and small teams getting started",
    features: [
      "10 analyses per month",
      "Single file upload",
      "Basic detection report",
      "Email support",
    ],
    cta: "Get Started Free",
    variant: "outline" as const,
    highlighted: false,
  },
  {
    name: "Professional",
    icon: Crown,
    price: "$49",
    period: "/month",
    description: "For organizations needing full forensic capabilities",
    features: [
      "500 analyses per month",
      "Batch processing (up to 50 files)",
      "Full XAI reports with heatmaps",
      "PDF export & audit trail",
      "API access (1,000 calls/mo)",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    variant: "default" as const,
    highlighted: true,
  },
  {
    name: "Enterprise",
    icon: Building2,
    price: "Custom",
    period: "",
    description: "For large organizations with compliance requirements",
    features: [
      "Unlimited analyses",
      "Unlimited batch processing",
      "Real-time screening API",
      "Custom model training",
      "SSO & RBAC",
      "Dedicated account manager",
      "SLA & on-premise option",
    ],
    cta: "Contact Sales",
    variant: "outline" as const,
    highlighted: false,
  },
];

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that fits your organization's needs. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-8 flex flex-col ${
                  plan.highlighted
                    ? "border-primary bg-card shadow-glow scale-105"
                    : "border-border bg-card/60 hover:border-primary/40"
                } transition-all duration-300`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                </div>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground/90">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.variant}
                  className="w-full"
                  onClick={() => navigate("/auth/signup")}
                >
                  {plan.cta}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
