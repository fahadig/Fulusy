// Supabase Edge Function: delete-account
// Deletes the signed-in user and, through ON DELETE CASCADE, all of their rows.
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "not_signed_in" }, 401);
    const asUser = createClient(Deno.env.get("SUPABASE_URL")!, (Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY"))!, {
      global: { headers: { Authorization: auth } },
    });
    const { data } = await asUser.auth.getUser();
    const user = data?.user;
    if (!user) return json({ error: "not_signed_in" }, 401);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEY"))!);
    const { data: files } = await admin.storage.from("receipts").list(user.id, { limit: 1000 });
    if (files && files.length) await admin.storage.from("receipts").remove(files.map((f) => `${user.id}/${f.name}`));
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
    return json({ deleted: true });
  } catch (e) {
    return json({ error: "delete_failed", detail: String((e as Error)?.message ?? e) }, 500);
  }
});
