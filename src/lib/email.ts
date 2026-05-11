/* ── Shared email utilities ─────────────────────────────────── */

import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
export const resend = apiKey ? new Resend(apiKey) : null;

export const FROM_EMAIL  = 'بلاد الحرمين <noreply@belad-alharamain.com>';
export const TO_EMAIL    = process.env.CONTACT_TO_EMAIL ?? 'info@belad-alharamain.com';

/* ── HTML escape (prevent injection in email bodies) ─── */
export function esc(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ── Reusable branded email shell ─── */
export function wrapEmail(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
  <head><meta charset="UTF-8" /></head>
  <body style="margin:0;padding:0;background:#FAFAF7;font-family:Tahoma,Arial,sans-serif;color:#1a1a1a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF7;padding:24px 12px;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);border:1px solid #E0D8C8;">
          <tr><td style="background:linear-gradient(135deg,#155E6B 0%,#1F7A8C 100%);padding:24px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:20px;font-weight:bold;">${esc(title)}</h1>
            <p style="margin:6px 0 0;color:#C4A55E;font-size:13px;">بلاد الحرمين للحج والعمرة</p>
          </td></tr>
          <tr><td style="padding:28px 24px;line-height:1.8;font-size:15px;">${bodyHtml}</td></tr>
          <tr><td style="background:#F2EDE1;padding:14px;text-align:center;font-size:12px;color:#7D6530;">
            هذه رسالة آلية من نموذج موقع <strong>belad-alharamain.com</strong>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

/* ── Render a labeled field row for inside the email ─── */
export function row(label: string, value: string, opts?: { ltr?: boolean }): string {
  if (!value) return '';
  const dir = opts?.ltr ? 'ltr' : 'rtl';
  return `
    <p style="margin:0 0 14px;padding:10px 14px;background:#FAFAF7;border-right:3px solid #A88B4A;border-radius:6px;">
      <span style="display:block;color:#7D6530;font-size:12px;font-weight:bold;margin-bottom:4px;">${esc(label)}</span>
      <span style="display:block;color:#1a1a1a;direction:${dir};word-break:break-word;">${esc(value)}</span>
    </p>`;
}
