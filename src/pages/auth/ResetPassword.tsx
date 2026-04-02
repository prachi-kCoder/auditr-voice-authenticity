import { useEffect, useRef, useState } from "react";
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
  const resolvedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    let fallbackTimer: number | undefined;

    const clearRecoveryUrl = () => {
      window.history.replaceState({}, document.title, window.location.pathname);
    };

    const resolveReady = () => {
      if (!mounted || resolvedRef.current) return;
      resolvedRef.current = true;
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      clearRecoveryUrl();
      setError("");
      setReady(true);
      setChecking(false);
    };

    const resolveError = (message: string) => {
      if (!mounted || resolvedRef.current) return;
      resolvedRef.current = true;
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      setReady(false);
      setError(message);
      setChecking(false);
    };

    const getParam = (name: string) => {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      return searchParams.get(name) ?? hashParams.get(name);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted || resolvedRef.current) return;

      if (event === "PASSWORD_RECOVERY") {
        resolveReady();
        return;
      }

      if (event === "SIGNED_IN" && session) {
        const type = getParam("type");
        const accessToken = getParam("access_token");
        const code = getParam("code");
        const tokenHash = getParam("token_hash");

        if (type === "recovery" || accessToken || code || tokenHash) {
          resolveReady();
        }
      }
    });

    const resolveRecoverySession = async () => {
      const type = getParam("type");
      const code = getParam("code");
      const tokenHash = getParam("token_hash");
      const accessToken = getParam("access_token");
      const refreshToken = getParam("refresh_token");
      const errorDescription = getParam("error_description");
      const hasRecoverySignal = type === "recovery" || Boolean(code || tokenHash || accessToken || refreshToken);

      if (errorDescription) {
        resolveError(errorDescription);
        return;
      }

      try {
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) throw error;
          resolveReady();
          return;
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          resolveReady();
          return;
        }

        if (type === "recovery" && tokenHash) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });

          if (error) throw error;
          resolveReady();
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          resolveReady();
          return;
        }

        fallbackTimer = window.setTimeout(async () => {
          if (!mounted || resolvedRef.current) return;

          const { data: { session: delayedSession } } = await supabase.auth.getSession();
          if (!mounted || resolvedRef.current) return;

          if (delayedSession) {
            resolveReady();
            return;
          }

          resolveError(
            hasRecoverySignal
              ? "This reset link is invalid or expired. Please request a new one."
              : "No valid reset link detected. Please request a new password reset."
          );
        }, 1500);
      } catch {
        resolveError("This reset link is invalid or expired. Please request a new one.");
      }
    };

    void resolveRecoverySession();

    return () => {
      mounted = false;
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
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
        return;
      }

      toast.success("Password updated successfully!");
      navigate("/dashboard");
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
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  autoComplete="new-password"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  autoComplete="new-password"
                  required
                />
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
