import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Every public table that stores rows owned by a user. Add new tables here
// so account deletion always erases them.
const USER_OWNED_TABLES: { table: string; column: string }[] = [];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Not signed in" }, 401);

  let body: { password?: unknown; confirm?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }
  if (body.confirm !== "DELETE") return json({ error: "Type DELETE to confirm" }, 400);
  if (typeof body.password !== "string" || body.password.length < 1 || body.password.length > 200) {
    return json({ error: "Password is required" }, 400);
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  // Validate the caller's session server-side.
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) return json({ error: "Session expired. Please sign in again." }, 401);
  const user = userData.user;

  // Re-check the password so a left-open browser can't delete the account.
  if (user.email) {
    const verifier = createClient(url, anonKey, { auth: { persistSession: false } });
    const { error: pwError } = await verifier.auth.signInWithPassword({
      email: user.email,
      password: body.password,
    });
    if (pwError) return json({ error: "Incorrect password" }, 403);
    await verifier.auth.signOut().catch(() => undefined);
  }

  // Erase user-owned data.
  for (const { table, column } of USER_OWNED_TABLES) {
    const { error } = await admin.from(table).delete().eq(column, user.id);
    if (error) {
      console.error(`delete-account: failed cleaning ${table}`, error.message);
      return json({ error: "Could not erase your data. Please try again." }, 500);
    }
  }

  // Remove the account itself (also revokes all sessions).
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error("delete-account: deleteUser failed", deleteError.message);
    return json({ error: "Could not delete account. Please try again." }, 500);
  }

  return json({ success: true });
});
