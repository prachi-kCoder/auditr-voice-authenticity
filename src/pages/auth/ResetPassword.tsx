import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Listen for auth state changes - Supabase will fire PASSWORD_RECOVERY
    // when the recovery token from the URL is successfully exchanged
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event on reset page:", event);
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
        setChecking(false);
      } else if (event === "SIGNED_IN" && session) {
        // Sometimes recovery comes as SIGNED_IN with a recovery session
        setReady(true);
        setChecking(false);
      }
    });

    // Also try to extract tokens from URL hash/params and exchange them
    const processTokens = async () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);

      // Handle hash-based tokens: #access_token=...&type=recovery
      if (hash && hash.includes("type=recovery")) {
        // Supabase client auto-processes hash tokens via onAuthStateChange
        // Give it a moment to process
        setTimeout(() => {
          setChecking(false);
          // If onAuthStateChange hasn't fired yet, check session
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) setReady(true);
          });
        }, 2000);
        return;
      }

      // Handle query-param based tokens (PKCE flow)
      const code = params.get("code");
      const tokenHash = params.get("token_hash");
      const type = params.get("type");

      if (code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("Code exchange error:", error);
            setError("Invalid or expired reset link. Please request a new one.");
          } else {
            setReady(true);
          }
        } catch (err) {
          console.error("Code exchange failed:", err);
          setError("Failed to verify reset link. Please try again.");
        }
        setChecking(false);
        return;
      }

      if (tokenHash && type === "recovery") {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });
          if (error) {
            console.error("OTP verify error:", error);
            setError("Invalid or expired reset link. Please request a new one.");
          } else {
            setReady(true);
          }
        } catch (err) {
          console.error("OTP verify failed:", err);
          setError("Failed to verify reset link. Please try again.");
        }
        setChecking(false);
        return;
      }

      // No tokens found - wait a bit for onAuthStateChange to fire
      setTimeout(() => {
        if (!ready) {
          // Last resort: check if there's already a session from the recovery
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
              setReady(true);
            } else {
              setError("No valid reset link detected. Please request a new password reset.");
            }
            setChecking(false);
          });
        }
      }, 3000);
    };

    processTokens();

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password updated successfully!");
        navigate("/dashboard");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <Shield className="w-16 h-16 mx-auto text-destructive" />
          <h2 className="text-2xl font-bold">Reset Link Invalid</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => navigate("/auth/forgot-password")} className="mt-4">
            Request New Reset Link
          </Button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">Something Went Wrong</h2>
          <p className="text-muted-foreground">We couldn't verify your reset link.</p>
          <Button onClick={() => navigate("/auth/forgot-password")} className="mt-4">
            Request New Reset Link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary items-center justify-center p-12">
        <div className="text-center text-primary-foreground">
          <Shield className="w-24 h-24 mx-auto mb-6 animate-pulse-glow" />
          <h1 className="text-5xl font-bold mb-4">Auditr</h1>
          <p className="text-xl">Set Your New Password</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Reset Password</h2>
            <p className="text-muted-foreground">Enter your new password below</p>
          </div>

          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 pr-10" required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
