import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Mail, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { authErrorMessage, isTransientAuthError, runAuthRequest } from "@/lib/auth-resilience";

const signupSchema = z.object({
  fullName: z.string().trim().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
    .regex(/[0-9]/, { message: "Must contain at least one number" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const signupWithRetry = (email: string, password: string, fullName: string, onRetry: () => void) =>
  runAuthRequest(
    () => supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    }),
    { onRetry }
  );

const Signup = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [retryNotice, setRetryNotice] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setRetryNotice("");
    try {
      const validated = signupSchema.parse({ fullName, email, password, confirmPassword });
      setLoading(true);
      const { data, error } = await signupWithRetry(validated.email, validated.password, validated.fullName, () => {
        setRetryNotice("Connection is slow. Retrying securely...");
      });
      if (error) {
        if (error.message?.includes("already registered")) {
          toast.error("This email is already registered. Please sign in instead.");
        } else if (error.status === 429) {
          toast.error("Too many attempts. Please wait and try again.");
        } else if (isTransientAuthError(error)) {
          toast.error(authErrorMessage(error));
        } else {
          toast.error(error.message || "Signup failed. Please try again.");
        }
        return;
      }
      if (data?.session) {
        toast.success("Account created successfully!");
        navigate("/dashboard");
      } else {
        toast.success("Account created! Check your email to verify.");
        navigate("/auth/login");
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(authErrorMessage(error, "An unexpected error occurred. Please try again."));
      }
    } finally {
      setLoading(false);
      setRetryNotice("");
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary items-center justify-center p-12">
        <div className="text-center text-primary-foreground">
          <Shield className="w-24 h-24 mx-auto mb-6 animate-pulse-glow" />
          <h1 className="text-5xl font-bold mb-4">Auditr</h1>
          <p className="text-xl mb-8">Forensic Precision for the Digital Voice</p>
          <div className="space-y-4 text-left max-w-md mx-auto">
            <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-primary-foreground" /><span>Multi-Model AI Detection</span></div>
            <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-primary-foreground" /><span>Explainable AI Reports</span></div>
            <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-primary-foreground" /><span>SOC 2 Compliant Security</span></div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Create Your Account</h2>
            <p className="text-muted-foreground">Start detecting deepfake audio with forensic precision</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="fullName" type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" autoComplete="email" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" autoComplete="new-password" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">8+ characters with uppercase and number</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 pr-10" autoComplete="new-password" required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}>
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {retryNotice && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{retryNotice}</span>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/auth/login" className="text-primary hover:underline font-semibold">Sign in</Link>
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" /><span>Your data is encrypted and secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
