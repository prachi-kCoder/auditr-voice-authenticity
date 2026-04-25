import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { authErrorMessage, isTransientAuthError, runAuthRequest } from "@/lib/auth-resilience";

type RecoveryParams = {
  type: string | null;
  code: string | null;
  tokenHash: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  errorDescription: string | null;
};

const extractRecoveryParams = (input: string): RecoveryParams | null => {
  try {
    const url = input.startsWith("http://") || input.startsWith("https://")
      ? new URL(input)
      : new URL(input, window.location.origin);

    const searchParams = new URLSearchParams(url.search);
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
    const getParam = (name: string) => searchParams.get(name) ?? hashParams.get(name);

    return {
      type: getParam("type"),
      code: getParam("code"),
      tokenHash: getParam("token_hash") ?? getParam("token"),
      accessToken: getParam("access_token"),
      refreshToken: getParam("refresh_token"),
      errorDescription: getParam("error_description"),
    };
  } catch {
    return null;
  }
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualLink, setManualLink] = useState("");
  const [manualProcessing, setManualProcessing] = useState(false);
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted || resolvedRef.current) return;

      if (event === "PASSWORD_RECOVERY") {
        resolveReady();
        return;
      }

      if (event === "SIGNED_IN" && session) {
        const params = extractRecoveryParams(window.location.href);
        const type = params?.type;
        const accessToken = params?.accessToken;
        const code = params?.code;
        const tokenHash = params?.tokenHash;

        if (type === "recovery" || accessToken || code || tokenHash) {
          resolveReady();
        }
      }
    });

    const resolveRecoverySession = async () => {
      const params = extractRecoveryParams(window.location.href);
      const type = params?.type ?? null;
      const code = params?.code ?? null;
      const tokenHash = params?.tokenHash ?? null;
      const accessToken = params?.accessToken ?? null;
      const refreshToken = params?.refreshToken ?? null;
      const errorDescription = params?.errorDescription ?? null;
      const hasRecoverySignal = type === "recovery" || Boolean(code || tokenHash || accessToken || refreshToken);

      if (errorDescription) {
        resolveError(errorDescription);
        return;
      }

      try {
        if (accessToken && refreshToken) {
          const { error } = await runAuthRequest(() => supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          }));

          if (error) throw error;
          resolveReady();
          return;
        }

        if (code) {
          const { error } = await runAuthRequest(() => supabase.auth.exchangeCodeForSession(code));
          if (error) throw error;
          resolveReady();
          return;
        }

        if (type === "recovery" && tokenHash) {
          const { error } = await runAuthRequest(() => supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          }));

          if (error) throw error;
          resolveReady();
          return;
        }

        const { data: { session } } = await runAuthRequest(() => supabase.auth.getSession());
        if (session) {
          resolveReady();
          return;
        }

        fallbackTimer = window.setTimeout(async () => {
          if (!mounted || resolvedRef.current) return;

          try {
            const { data: { session: delayedSession } } = await runAuthRequest(() => supabase.auth.getSession(), { retries: 2 });
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
          } catch (error) {
            if (!mounted || resolvedRef.current) return;
            resolveError(authErrorMessage(error));
          }
        }, 1500);
      } catch (error) {
        resolveError(
          isTransientAuthError(error)
            ? authErrorMessage(error)
            : "This reset link is invalid or expired. Please request a new one."
        );
      }
    };

    void resolveRecoverySession();

    return () => {
      mounted = false;
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, []);

  const handleManualLink = async (e: React.FormEvent) => {
    e.preventDefault();

    const params = extractRecoveryParams(manualLink.trim());
    const hasRecoverySignal = Boolean(
      params?.code ||
      params?.tokenHash ||
      (params?.accessToken && params?.refreshToken)
    );

    if (!params || !hasRecoverySignal) {
      toast.error("Paste the full reset link from the newest email.");
      return;
    }

    setManualProcessing(true);
    setChecking(true);

    try {
      if (params.accessToken && params.refreshToken) {
        const { error } = await runAuthRequest(() => supabase.auth.setSession({
          access_token: params.accessToken,
          refresh_token: params.refreshToken,
        }));

        if (error) throw error;
      } else if (params.code) {
        const { error } = await runAuthRequest(() => supabase.auth.exchangeCodeForSession(params.code));
        if (error) throw error;
      } else if (params.tokenHash) {
        const { error } = await runAuthRequest(() => supabase.auth.verifyOtp({
          token_hash: params.tokenHash,
          type: "recovery",
        }));

        if (error) throw error;
      }

      window.history.replaceState({}, document.title, window.location.pathname);
      setError("");
      setReady(true);
    } catch (error: any) {
      const message = isTransientAuthError(error)
        ? authErrorMessage(error)
        : error?.message?.includes("expired") || error?.message?.includes("invalid")
          ? "That reset link is no longer valid. Please request a new one and paste the newest link."
          : "We couldn't validate that reset link. Please request a new one and paste the newest link.";

      setReady(false);
      setError(message);
      toast.error(message);
    } finally {
      setChecking(false);
      setManualProcessing(false);
    }
  };

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
      const { error } = await runAuthRequest(() => supabase.auth.updateUser({ password }));

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password updated successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(authErrorMessage(error, "An error occurred. Please try again."));
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
        <div className="text-center space-y-4 max-w-md w-full">
          <Shield className="w-16 h-16 mx-auto text-destructive" />
          <h2 className="text-2xl font-bold">Reset Link Needs Attention</h2>
          <p className="text-muted-foreground">{error}</p>
          <form onSubmit={handleManualLink} className="space-y-3 text-left">
            <div className="space-y-2">
              <Label htmlFor="manualResetLink">Paste the newest reset link</Label>
              <Input
                id="manualResetLink"
                type="url"
                placeholder="https://..."
                value={manualLink}
                onChange={(e) => setManualLink(e.target.value)}
                autoComplete="off"
              />
            </div>
            <Button type="submit" className="w-full" disabled={manualProcessing}>
              {manualProcessing ? "Validating..." : "Use Pasted Link"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground">
            If your mail app opens an invalid page, request a fresh email and paste the full link here instead of tapping it.
          </p>
          <Button variant="outline" onClick={() => navigate("/auth/forgot-password")} className="mt-2">
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
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>
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
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}>
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
