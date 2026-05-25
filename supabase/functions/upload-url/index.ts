import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { user_id, file_name, file_size } = await req.json();
    if (!user_id || !file_name || typeof file_size !== "number") {
      return json({ error: "Invalid payload" }, 400);
    }
    if (file_size > 50 * 1024 * 1024) {
      return json({ error: "File too large (max 50MB)" }, 400);
    }
    const path = `${user_id}/${crypto.randomUUID()}-${file_name}`;
    const { data, error } = await supabase.storage
      .from("vault")
      .createSignedUploadUrl(path);
    if (error) throw error;
    return json({ path, token: data.token, signedUrl: data.signedUrl });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}