import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { embedding, passcode_hash } = await req.json();
    if (!Array.isArray(embedding) || embedding.length !== 128 || typeof passcode_hash !== "string") {
      return json({ error: "Invalid payload" }, 400);
    }
    // Reject if an existing face is too close (same person already enrolled)
    const vec = `[${embedding.join(",")}]`;
    const { data: match } = await supabase.rpc("match_user", {
      query_embedding: vec,
      match_threshold: 0.4,
    });
    if (match && match.length > 0) {
      return json({ error: "A vault already exists for this face. Try Access Storage instead." }, 409);
    }
    const { data, error } = await supabase
      .from("users")
      .insert({ face_embedding: vec, passcode_hash })
      .select("id")
      .single();
    if (error) throw error;
    return json({ user_id: data.id });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}