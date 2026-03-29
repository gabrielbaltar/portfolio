/**
 * Email Service — Portfolio Contact Form
 * Uses EmailJS (free tier: 200 emails/month, no backend needed).
 */

import emailjs from "@emailjs/browser";

// ─── EmailJS credentials ─────────────────────────────────────
const EMAILJS_FALLBACK_CONFIG = {
  serviceId: "service_idmftes",
  templateId: "template_ob93doe",
  publicKey: "q77sMIK9f29XKPTyQ",
} as const;

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || EMAILJS_FALLBACK_CONFIG.serviceId;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || EMAILJS_FALLBACK_CONFIG.templateId;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || EMAILJS_FALLBACK_CONFIG.publicKey;
// ──────────────────────────────────────────────────────────────

/** Initialize EmailJS — call once on app mount */
export function initEmailService() {
  if (!EMAILJS_PUBLIC_KEY) {
    return;
  }
  try {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    console.log("[Email Service] Initialized successfully");
  } catch (err) {
    console.error("[Email Service] Init failed:", err);
  }
}

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

interface ProjectAccessEmailData extends ContactFormData {
  projectTitle: string;
  projectUrl: string;
  recipientEmail?: string;
}

/**
 * Builds a clean, lightweight HTML email body.
 */
function buildEmailHTML(data: ContactFormData): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const esc = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/\n/g, "<br>");

  return `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
  <div style="background:#111111;padding:28px 24px;text-align:center;">
    <div style="display:inline-block;width:32px;height:32px;background:#fafafa;border-radius:6px;text-align:center;line-height:32px;font-size:16px;color:#111;">&#8599;</div>
    <h1 style="color:#fafafa;font-size:24px;margin:12px 0 4px;letter-spacing:-0.02em;">Gabriel Baltar</h1>
    <p style="color:#999;font-size:13px;margin:0;">UX/UI Designer &bull; Product Designer</p>
  </div>
  <div style="padding:24px;">
    <h2 style="font-size:20px;color:#111;text-align:center;margin:0 0 4px;">Nova mensagem recebida</h2>
    <p style="font-size:12px;color:#888;text-align:center;margin:0 0 20px;">${dateStr}</p>
    <hr style="border:none;border-top:1px solid #e5e5e5;margin:0 0 20px;">
    <div style="background:#f8f8f8;padding:14px;border-radius:8px;margin-bottom:16px;">
      <p style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin:0 0 2px;">Nome</p>
      <p style="font-size:15px;color:#111;font-weight:600;margin:0 0 12px;">${esc(data.name)}</p>
      <p style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin:0 0 2px;">E-mail</p>
      <p style="font-size:15px;margin:0;"><a href="mailto:${esc(data.email)}" style="color:#0066cc;text-decoration:none;font-weight:600;">${esc(data.email)}</a></p>
    </div>
    <p style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">Mensagem</p>
    <div style="font-size:14px;color:#333;line-height:1.6;padding:14px;background:#f8f8f8;border-radius:8px;border-left:3px solid #111;">
      ${esc(data.message)}
    </div>
    <div style="text-align:center;margin-top:24px;">
      <a href="mailto:${esc(data.email)}?subject=Re: Contato via Portfólio" style="display:inline-block;padding:12px 28px;background:#111;color:#fff;font-size:14px;font-weight:bold;text-decoration:none;border-radius:100px;">Responder</a>
    </div>
  </div>
  <div style="background:#111111;padding:20px 24px;">
    <p style="color:#fafafa;font-size:14px;font-weight:700;margin:0 0 6px;">Portfólio — Gabriel Baltar</p>
    <p style="color:#999;font-size:12px;margin:0 0 10px;">Mensagem enviada via formulário de contato do portfólio.</p>
    <p style="color:#666;font-size:10px;margin:0;">&copy; ${now.getFullYear()} Gabriel Baltar. Todos os direitos reservados.</p>
  </div>
</div>`.trim();
}

function buildProjectAccessEmailHTML(data: ProjectAccessEmailData): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const esc = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/\n/g, "<br>");
  const replySubject = encodeURIComponent(`Re: Acesso ao projeto ${data.projectTitle}`);

  return `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
  <div style="background:#111111;padding:28px 24px;text-align:center;">
    <div style="display:inline-block;width:32px;height:32px;background:#fafafa;border-radius:6px;text-align:center;line-height:32px;font-size:16px;color:#111;">&#128274;</div>
    <h1 style="color:#fafafa;font-size:24px;margin:12px 0 4px;letter-spacing:-0.02em;">Solicitação de acesso</h1>
    <p style="color:#999;font-size:13px;margin:0;">Pedido enviado a partir de um projeto protegido do portfólio.</p>
  </div>
  <div style="padding:24px;">
    <h2 style="font-size:20px;color:#111;text-align:center;margin:0 0 4px;">${esc(data.projectTitle)}</h2>
    <p style="font-size:12px;color:#888;text-align:center;margin:0 0 20px;">${dateStr}</p>
    <div style="background:#f8f8f8;padding:14px;border-radius:8px;margin-bottom:16px;">
      <p style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin:0 0 2px;">Nome</p>
      <p style="font-size:15px;color:#111;font-weight:600;margin:0 0 12px;">${esc(data.name)}</p>
      <p style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin:0 0 2px;">E-mail</p>
      <p style="font-size:15px;margin:0 0 12px;"><a href="mailto:${esc(data.email)}" style="color:#0066cc;text-decoration:none;font-weight:600;">${esc(data.email)}</a></p>
      <p style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin:0 0 2px;">Projeto</p>
      <p style="font-size:15px;margin:0;"><a href="${esc(data.projectUrl)}" style="color:#0066cc;text-decoration:none;font-weight:600;">${esc(data.projectTitle)}</a></p>
    </div>
    <p style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">Mensagem</p>
    <div style="font-size:14px;color:#333;line-height:1.6;padding:14px;background:#f8f8f8;border-radius:8px;border-left:3px solid #111;">
      ${esc(data.message)}
    </div>
    <div style="text-align:center;margin-top:24px;">
      <a href="mailto:${esc(data.email)}?subject=${replySubject}" style="display:inline-block;padding:12px 28px;background:#111;color:#fff;font-size:14px;font-weight:bold;text-decoration:none;border-radius:100px;">Responder por e-mail</a>
    </div>
  </div>
</div>`.trim();
}

async function sendEmailWithTemplate(templateParams: Record<string, string>) {
  const result = await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    templateParams
  );

  if (result.status === 200) {
    return { success: true as const };
  }

  return { success: false as const, error: `Status inesperado: ${result.status}` };
}

function normalizeEmailError(err: any): { success: false; error: string } {
  console.error("[Email Service] Error:", err);

  const errorText = err?.text || err?.message || "";

  if (errorText.includes("service_id")) {
    return { success: false, error: "Erro: Service ID inválido no EmailJS." };
  }
  if (errorText.includes("template_id")) {
    return { success: false, error: "Erro: Template ID inválido no EmailJS." };
  }
  if (errorText.includes("Account not found")) {
    return { success: false, error: "Erro: Conta EmailJS não encontrada." };
  }
  if (errorText.includes("The recipients")) {
    return { success: false, error: "Erro: Destinatário não configurado no template." };
  }

  return {
    success: false,
    error: errorText || "Erro ao enviar email. Tente novamente.",
  };
}

/**
 * Send email via EmailJS.
 */
export async function sendContactEmail(
  data: ContactFormData
): Promise<{ success: boolean; error?: string }> {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    return {
      success: false,
      error: "EmailJS nao configurado neste ambiente.",
    };
  }

  console.log("[Email Service] Attempting to send email...", {
    name: data.name,
    email: data.email,
    messageLength: data.message.length,
  });

  try {
    const templateParams = {
      from_name: data.name,
      from_email: data.email,
      email: data.email,        // used in Reply To field on EmailJS template
      to_email: "gabriel.baltar21@hotmail.com",
      message: data.message,
      message_html: buildEmailHTML(data),
      date: new Date().toLocaleDateString("pt-BR"),
    };

    const result = await sendEmailWithTemplate(templateParams);
    console.log("[Email Service] Response:", result);
    return result;
  } catch (err: any) {
    return normalizeEmailError(err);
  }
}

export async function sendProjectAccessRequestEmail(
  data: ProjectAccessEmailData
): Promise<{ success: boolean; error?: string }> {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    return {
      success: false,
      error: "EmailJS nao configurado neste ambiente.",
    };
  }

  try {
    const templateParams = {
      from_name: data.name,
      from_email: data.email,
      email: data.email,
      to_email: data.recipientEmail || "gabriel.baltar21@hotmail.com",
      message: `Solicitacao de acesso ao projeto "${data.projectTitle}"\n\n${data.message}\n\nLink: ${data.projectUrl}`,
      message_html: buildProjectAccessEmailHTML(data),
      date: new Date().toLocaleDateString("pt-BR"),
    };

    return await sendEmailWithTemplate(templateParams);
  } catch (err: any) {
    return normalizeEmailError(err);
  }
}
