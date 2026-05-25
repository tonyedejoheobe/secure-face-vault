import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { user_id, file_id } = await req.json();
    if (!user_id || !file_id) return json({ error: "Invalid payload" }, 400);
    const { data: file, error: fErr } = await supabase
      .from("files")
      .select("file_path")
      .eq("id", file_id)
      .eq("user_id", user_id)
      .single();
    if (fErr || !file) return json({ error: "Not found" }, 404);
    await supabase.storage.from("vault").remove([file.file_path]);
    await supabase.from("files").delete().eq("id", file_id).eq("user_id", user_id);
    return json({ ok: true });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}