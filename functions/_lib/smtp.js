// Minimal SMTP client for Cloudflare (implicit TLS, port 465) – sends through the
// Hostinger mailbox support@kdnfitness.com. Credentials come from Cloudflare secrets.

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64(str) {
  const bytes = enc.encode(str);
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
const wrap76 = (s) => s.replace(/(.{76})/g, '$1\r\n');

function encHeader(v) {
  return /^[\x20-\x7e]*$/.test(v) ? v : `=?UTF-8?B?${b64(v)}?=`;
}

function addr(a) {
  const m = String(a).match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  return m ? { name: m[1].replace(/^"|"$/g, ''), email: m[2] } : { name: '', email: String(a).trim() };
}

export function buildMessage({ from, to, subject, text, html, replyTo, inReplyTo, references, messageId }) {
  const f = addr(from);
  const boundary = 'kdn-' + crypto.randomUUID();
  const headers = [
    `From: ${f.name ? `${encHeader(f.name)} <${f.email}>` : f.email}`,
    `To: ${to}`,
    `Subject: ${encHeader(subject)}`,
    `Date: ${new Date().toUTCString().replace('GMT', '+0000')}`,
    `Message-ID: ${messageId}`,
    'MIME-Version: 1.0',
  ];
  if (replyTo) headers.push(`Reply-To: ${replyTo}`);
  if (inReplyTo) headers.push(`In-Reply-To: ${inReplyTo}`, `References: ${references || inReplyTo}`);
  headers.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
  const part = (type, body) => [
    `--${boundary}`,
    `Content-Type: ${type}; charset=UTF-8`,
    'Content-Transfer-Encoding: base64',
    '',
    wrap76(b64(body)),
  ].join('\r\n');
  return [headers.join('\r\n'), '', part('text/plain', text), part('text/html', html), `--${boundary}--`, ''].join('\r\n');
}

// connectFn(host, port) must return { readable, writable, close() } like cloudflare:sockets.
export async function smtpSend({ host, port = 465, user, pass, from, to, raw, connectFn, timeoutMs = 20000 }) {
  const sock = await connectFn(host, port);
  const writer = sock.writable.getWriter();
  const reader = sock.readable.getReader();
  let buf = '';

  const timer = setTimeout(() => { try { sock.close(); } catch {} }, timeoutMs);

  async function reply() {
    // Read one full (possibly multi-line) SMTP reply.
    for (;;) {
      const lines = buf.split('\r\n');
      for (let i = 0; i < lines.length - 1; i++) {
        if (/^\d{3} /.test(lines[i])) {
          const text = lines.slice(0, i + 1).join('\n');
          buf = lines.slice(i + 1).join('\r\n');
          return { code: +lines[i].slice(0, 3), text };
        }
      }
      const { value, done } = await reader.read();
      if (done) throw new Error('Mail server closed the connection');
      buf += dec.decode(value, { stream: true });
    }
  }
  async function cmd(line, expect) {
    if (line != null) await writer.write(enc.encode(line + '\r\n'));
    const r = await reply();
    if (!expect.includes(r.code)) {
      const shown = line && line.startsWith('AUTH') ? 'AUTH' : line;
      throw new Error(`Mail server said ${r.code} to ${shown || 'greeting'}: ${r.text.split('\n').pop().slice(4)}`);
    }
    return r;
  }

  try {
    await cmd(null, [220]);
    await cmd('EHLO kdnfitness.com', [250]);
    await cmd('AUTH PLAIN ' + b64(`\0${user}\0${pass}`), [235]);
    await cmd(`MAIL FROM:<${from}>`, [250]);
    await cmd(`RCPT TO:<${to}>`, [250, 251]);
    await cmd('DATA', [354]);
    const body = raw.replace(/\r?\n/g, '\r\n').replace(/^\./gm, '..');
    await cmd(body + '\r\n.', [250]);
    try { await writer.write(enc.encode('QUIT\r\n')); } catch {}
  } finally {
    clearTimeout(timer);
    try { reader.releaseLock(); writer.releaseLock(); sock.close(); } catch {}
  }
}

export async function cloudflareConnect(host, port) {
  const { connect } = await import('cloudflare:sockets');
  const s = connect({ hostname: host, port }, { secureTransport: 'on', allowHalfOpen: false });
  await s.opened;
  return s;
}
