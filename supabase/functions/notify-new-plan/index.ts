import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Preflight CORS del navegador. La app nativa no lo enviaba, pero la web sí.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const payload = await req.json();
  const plan = payload.record;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Buscar el creador y su partner_id
  const { data: creator } = await supabase
    .from("profiles")
    .select("name, partner_id")
    .eq("id", plan.created_by)
    .single();

  if (!creator?.partner_id) {
    return new Response("no partner", { status: 200, headers: corsHeaders });
  }

  // Buscar el email del partner desde auth.users
  const { data: partnerAuth } = await supabase.auth.admin.getUserById(
    creator.partner_id
  );

  const partnerEmail = partnerAuth?.user?.email;
  if (!partnerEmail) {
    return new Response("no email", { status: 200, headers: corsHeaders });
  }

  const creatorName = creator.name?.split(" ")[0] ?? "Tu pareja";
  const planTitle = plan.title;
  const planDate = plan.date
    ? new Date(plan.date).toLocaleDateString("es", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "UTC",
      })
    : null;

  // Enviar email via Resend
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
    },
    body: JSON.stringify({
      from: "duo <hola@diegocerna.site>",
      to: partnerEmail,
      subject: `${creatorName} agregó un nuevo plan`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background-color: #0e0b14; color: #f5f0eb;">
          <p style="color: #7c6f85; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 32px;">duo</p>
          <h1 style="font-size: 28px; font-weight: normal; margin: 0 0 8px;">${planTitle}</h1>
          ${planDate ? `<p style="color: #7c6f85; font-size: 14px; margin: 0 0 32px;">${planDate}</p>` : '<div style="margin-bottom: 32px;"></div>'}
          <p style="color: #9b8fa0; font-size: 14px; margin: 0 0 40px;">${creatorName} lo agregó en Duo.</p>
          <hr style="border: none; border-top: 1px solid #2a2035; margin: 0;" />
          <p style="color: #3d3348; font-size: 11px; margin: 24px 0 0; text-align: center; letter-spacing: 0.1em;">solo para dos</p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("Resend error:", error);
    return new Response(error, { status: 500, headers: corsHeaders });
  }

  return new Response("ok", { status: 200, headers: corsHeaders });
});
