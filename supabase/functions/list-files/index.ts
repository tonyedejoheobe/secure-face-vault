import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { user_id } = await req.json();
    if (!user_id) return json({ error: "Missing user_id" }, 400);
    const { data, error } = await supabase
      .from("files")
      .select("id, file_name, file_size, file_path, created_at")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return json({ files: data });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}