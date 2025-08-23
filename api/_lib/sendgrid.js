import sg from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.error('ENV MISSING: SENDGRID_API_KEY');
}
sg.setApiKey(process.env.SENDGRID_API_KEY);

// deve essere SOLO l'email Single Sender verificata (es. "name@gmail.com")
const FROM_EMAIL_RAW = (process.env.SENDGRID_SINGLE_SENDER || '').trim();
const SITE_URL_RAW   = (process.env.SITE_URL || '').trim();

function isEmail(s) {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
if (!isEmail(FROM_EMAIL_RAW)) {
  console.error('ENV MISSING/INVALID: SENDGRID_SINGLE_SENDER deve essere una email valida');
}

export const SITE_URL = SITE_URL_RAW;

export async function sendOne({ to, subject, html, fromName = 'Newsletter' }) {
  const toAddr = String(to || '').trim();
  if (!isEmail(FROM_EMAIL_RAW)) throw new Error('Invalid FROM email (SENDGRID_SINGLE_SENDER)');
  if (!isEmail(toAddr)) throw new Error(`Invalid TO email: ${toAddr}`);

  return sg.send({
    from: { email: FROM_EMAIL_RAW, name: fromName },
    to: toAddr,
    subject,
    html
  });
}

export async function sendBatch(messages) {
  if (!isEmail(FROM_EMAIL_RAW)) throw new Error('Invalid FROM email (SENDGRID_SINGLE_SENDER)');
  const norm = messages.map((m) => {
    const toAddr = typeof m.to === 'string' ? m.to.trim() : m.to;
    if (!isEmail(toAddr)) throw new Error(`Invalid TO email: ${toAddr}`);
    return {
      from: m.from?.email ? m.from : { email: FROM_EMAIL_RAW, name: m.from?.name || 'Newsletter' },
      to: toAddr,
      subject: m.subject,
      html: m.html
    };
  });
  return sg.send(norm);
}
