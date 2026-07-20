// TDFL cap-report email — Supabase Edge Function
// Deploy:  supabase functions deploy send-cap-report --no-verify-jwt
// Secret:  supabase secrets set RESEND_API_KEY=re_xxx   (free tier at resend.com)
//
// The hub POSTs { subject, html, recipients[] }. This forwards it to Resend.
// Swap the fetch below for SendGrid/Mailgun/Postmark if you prefer — same shape.

import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { subject, html, recipients } = await req.json();
    if (!Array.isArray(recipients) || !recipients.length)
      return json({ sent: 0, message: "No recipients" }, 400);

    const key = Deno.env.get("RESEND_API_KEY");
    if (!key) return json({ sent: 0, message: "RESEND_API_KEY not set" }, 500);

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        // Use a from-address on a domain you've verified in Resend, or the sandbox address.
        from: "TDFL Hub <onboarding@resend.dev>",
        to: recipients,
        subject: subject || "TDFL cap report",
        html: html || "<p>Cap report</p>",
      }),
    });
    const body = await r.json();
    return json({ sent: r.ok ? recipients.length : 0, resend: body }, r.ok ? 200 : 502);
  } catch (e) {
    return json({ sent: 0, message: String(e) }, 500);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
