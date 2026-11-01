import PostalMime from 'postal-mime';

// Receives mail forwarded from the Hostinger mailbox (support@kdnfitness.com)
// via Cloudflare Email Routing, and stores it in the KDN admin D1 database.
const MAX_HTML = 400_000;
const MAX_TEXT = 200_000;
const OWN = /@kdnfitness\.com$/i;

export default {
  async email(message, env) {
    const raw = await new Response(message.raw).arrayBuffer();
    const mail = await PostalMime.parse(raw);

    // Forwarders keep the original From header; fall back to the envelope sender.
    const fromAddr = (mail.from?.address || message.from || '').toLowerCase();
    const fromName = mail.from?.name || null;

    // Skip our own outgoing copies and bounces to avoid loops.
    if (!fromAddr || OWN.test(fromAddr) || /^(mailer-daemon|postmaster)@/i.test(fromAddr)) return;

    const attachments = (mail.attachments || []).map((a) => ({
      name: a.filename || 'attachment',
      type: a.mimeType,
      size: a.content?.byteLength || 0,
    }));

    await env.DB.prepare(
      `INSERT OR IGNORE INTO messages
       (direction,message_id,in_reply_to,peer_email,peer_name,subject,text_body,html_body,attachments,is_read,created_at)
       VALUES ('in',?,?,?,?,?,?,?,?,0,?)`
    ).bind(
      mail.messageId || null,
      mail.inReplyTo || null,
      fromAddr,
      fromName,
      (mail.subject || '').slice(0, 500),
      (mail.text || '').slice(0, MAX_TEXT),
      mail.html ? mail.html.slice(0, MAX_HTML) : null,
      attachments.length ? JSON.stringify(attachments) : null,
      Date.now()
    ).run();
  },
};
