// ============================================================
//  read-band: a Supabase Edge Function
//  The app sends a photo of a cigar band. Claude reads the band and
//  sends back the brand and line. The app then matches that against
//  the Vault on the phone.
//
//  Setup (in the Supabase dashboard):
//    1. Edge Functions > Secrets: add ANTHROPIC_API_KEY
//    2. Edge Functions > Deploy a new function > Via Editor,
//       name it read-band, paste this file, Deploy.
//  The API key stays here on the server. It never goes in the app.
// ============================================================

import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const PROMPT = `This photo should show a cigar band (the paper ring on a cigar), or a cigar box or label.
Read it and say which cigar it is.
- brand: the company or maker, e.g. "Arturo Fuente", "Padrón", "My Father".
- line: the specific line or series, e.g. "Hemingway", "1964 Anniversary", "Le Bijou 1922". Include words like Maduro or Natural if printed. Leave it empty if only the brand shows.
- text: every word you can read on the band, in order.
- found: false if there is no cigar band or label in the photo, or nothing on it can be read.
Use what is printed. If a word is partly hidden, give your best reading of the cigar name.`;

const SCHEMA = {
  type: "object",
  properties: {
    found: { type: "boolean" },
    brand: { type: "string" },
    line: { type: "string" },
    text: { type: "string" },
  },
  required: ["found", "brand", "line", "text"],
  additionalProperties: false,
};

const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return reply({ error: "Use POST" }, 405);

  // Only signed-in MyWrap members can scan, so strangers can't run up the bill
  const auth = req.headers.get("Authorization") ?? "";
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data: { user } } = await supabase.auth.getUser(auth.replace(/^Bearer\s+/i, ""));
  if (!user) return reply({ error: "Sign in to scan bands" }, 401);

  let image = "";
  try { image = (await req.json()).image ?? ""; } catch { /* handled below */ }
  if (typeof image !== "string" || image.length < 100 || image.length > 4_000_000) {
    return reply({ error: "No photo came through. Try again." }, 400);
  }

  try {
    const res = await anthropic.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: image } },
          { type: "text", text: PROMPT },
        ],
      }],
    } as any);
    if (res.stop_reason === "refusal") return reply({ found: false, brand: "", line: "", text: "" });
    const text = res.content.find((b: any) => b.type === "text") as any;
    return reply(JSON.parse(text?.text ?? "{}"));
  } catch (e) {
    console.error(e);
    return reply({ error: "Couldn't read the band right now. Try again in a minute." }, 502);
  }
});
