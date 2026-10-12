import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, KeyRound, Loader2, LogOut, ShieldAlert, Trash2, UserRound } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { authErrorMessage, runAuthRequest } from "@/lib/auth-resilience";

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[0-9]/, "Must contain at least one number");

const PasswordInput = ({ id, value, onChange, autoComplete }: {
  id: string; value: string; onChange: (v: string) => void; autoComplete: string;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input id={id} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)}
        className="pr-10" autoComplete={autoComplete} placeholder="••••••••" />
      <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};

const AccountSettings = () => {
  const navigate = useNavigate();
  const { user, signOut, refreshUser } = useAuth();

  const [fullName, setFullName] = useState<string>(user?.user_metadata?.full_name ?? "");
  const [savingName, setSavingName] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deletePw, setDeletePw] = useState("");
  const [deleting, setDeleting] = useState(false);

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = fullName.trim();
    if (name.length < 2 || name.length > 100) return toast.error("Name must be 2–100 characters");
    setSavingName(true);
    try {
      const { error } = await runAuthRequest(() => supabase.auth.updateUser({ data: { full_name: name } }));
      if (error) throw error;
      await refreshUser();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(authErrorMessage(err, "Could not update profile"));
    } finally {
      setSavingName(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    const parsed = passwordSchema.safeParse(newPw);
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);
    if (newPw !== confirmPw) return toast.error("Passwords don't match");
    if (!currentPw) return toast.error("Enter your current password");
    setSavingPw(true);
    try {
      // Confirm the current password first.
      const check = await runAuthRequest(() =>
        supabase.auth.signInWithPassword({ email: user.email!, password: currentPw })
      );
      if (check.error) {
        toast.error("Current password is incorrect");
        return;
      }
      const { error } = await runAuthRequest(() =>
        supabase.auth.updateUser({ password: newPw, current_password: currentPw } as never)
      );
      if (error) throw error;
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      toast.success("Password changed");
    } catch (err) {
      toast.error(authErrorMessage(err, "Could not change password"));
    } finally {
      setSavingPw(false);
    }
  };

  const signOutEverywhere = async () => {
    await signOut("global");
    toast.success("Signed out on all devices");
    navigate("/", { replace: true });
  };

  const deleteAccount = async () => {
    if (deleteText !== "DELETE") return toast.error('Type "DELETE" to confirm');
    if (!deletePw) return toast.error("Enter your password");
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-account", {
        body: { confirm: "DELETE", password: deletePw },
      });
      if (error) {
        let message = "Could not delete account. Please try again.";
        try {
          const ctx = (error as { context?: Response }).context;
          const parsed = ctx ? await ctx.json() : null;
          if (parsed?.error) message = parsed.error;
        } catch { /* ignore */ }
        throw new Error(message);
      }
      if (!data?.success) throw new Error(data?.error ?? "Could not delete account");

      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
      localStorage.clear();
      sessionStorage.clear();
      setDeleteOpen(false);
      toast.success("Your account and data have been permanently deleted.");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete account");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <p className="text-muted-foreground mt-1">Signed in as {user?.email}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserRound className="w-5 h-5 text-primary" /> Profile</CardTitle>
              <CardDescription>How your name appears across Auditr.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveName} className="flex flex-col sm:flex-row gap-3 sm:items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} />
                </div>
                <Button type="submit" disabled={savingName}>
                  {savingName && <Loader2 className="w-4 h-4 animate-spin" />} Save
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-primary" /> Change password</CardTitle>
              <CardDescription>8+ characters with an uppercase letter and a number.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={changePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPw">Current password</Label>
                  <PasswordInput id="currentPw" value={currentPw} onChange={setCurrentPw} autoComplete="current-password" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPw">New password</Label>
                    <PasswordInput id="newPw" value={newPw} onChange={setNewPw} autoComplete="new-password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPw">Confirm new password</Label>
                    <PasswordInput id="confirmPw" value={confirmPw} onChange={setConfirmPw} autoComplete="new-password" />
                  </div>
                </div>
                <Button type="submit" disabled={savingPw}>
                  {savingPw && <Loader2 className="w-4 h-4 animate-spin" />} Update password
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><LogOut className="w-5 h-5 text-primary" /> Sessions</CardTitle>
              <CardDescription>Sign out of Auditr on every browser and device.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={signOutEverywhere}>Sign out everywhere</Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive"><ShieldAlert className="w-5 h-5" /> Delete account</CardTitle>
              <CardDescription>
                Permanently erases your account and all associated data. This cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="w-4 h-4" /> Delete my account
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <AlertDialog open={deleteOpen} onOpenChange={(o) => { if (!deleting) setDeleteOpen(o); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account forever?</AlertDialogTitle>
            <AlertDialogDescription>
              Your account, analysis history and all personal data will be erased immediately. You will be signed out and cannot recover it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deleteConfirm">Type <span className="font-mono font-bold">DELETE</span> to confirm</Label>
              <Input id="deleteConfirm" value={deleteText} onChange={(e) => setDeleteText(e.target.value)} autoComplete="off" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deletePw">Your password</Label>
              <PasswordInput id="deletePw" value={deletePw} onChange={setDeletePw} autoComplete="current-password" />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={deleteAccount} disabled={deleting || deleteText !== "DELETE" || !deletePw}>
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />} Permanently delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AccountSettings;
