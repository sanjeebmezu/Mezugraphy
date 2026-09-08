import nodemailer from 'nodemailer';
import { Order, formatCurrency } from '@/lib/order';

function env(name: string) {
  return process.env[name] || '';
}

function requiredEnv(name: string) {
  const value = env(name);
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

function brandName() {
  return env('BRAND_NAME') || 'MezuStudio';
}

function baseEmailShell(content: string) {
  return `
  <div style="margin:0;padding:0;background:#080808;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#080808;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#111111;border:1px solid #2b2418;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:24px 26px;background:#050505;border-bottom:1px solid #2b2418;">
                <div style="font-size:22px;font-weight:800;color:#f3c86b;">${escapeHtml(brandName())}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:26px;">
                ${content}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>`;
}

function detailRow(label: string, value: string | number) {
  const safeValue = typeof value === 'number' ? String(value) : escapeHtml(value);

  return `
    <tr>
      <td style="padding:10px 0;color:#a8a29e;font-size:14px;border-bottom:1px solid #242424;">${escapeHtml(label)}</td>
      <td align="right" style="padding:10px 0;color:#ffffff;font-size:14px;font-weight:700;border-bottom:1px solid #242424;">${safeValue}</td>
    </tr>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function businessOrderEmail(order: Order) {
  return baseEmailShell(`
    <h1 style="margin:0 0 10px;font-size:28px;line-height:1.2;color:#ffffff;">New order received</h1>
    <p style="margin:0 0 22px;color:#d6d3d1;line-height:1.6;">A customer placed a new ${order.paymentMethod} order. Please call the customer soon to confirm this order.</p>
    <div style="display:inline-block;margin-bottom:20px;padding:8px 12px;border-radius:999px;background:#f3c86b;color:#000000;font-size:13px;font-weight:800;">${order.orderStatus}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:22px;">
      ${detailRow('Order ID', order.orderId)}
      ${detailRow('Date & Time', order.dateTime)}
    </table>
    <h2 style="margin:0 0 8px;font-size:18px;color:#f3c86b;">Customer details</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:22px;">
      ${detailRow('Customer Name', order.fullName)}
      ${detailRow('Phone Number', order.phone)}
      ${detailRow('Email Address', order.email)}
      ${detailRow('Exact Location', order.location)}
    </table>
    <h2 style="margin:0 0 8px;font-size:18px;color:#f3c86b;">Product details</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:22px;">
      ${detailRow('Product Name', order.productName)}
      ${detailRow('Quantity', order.quantity)}
      ${detailRow('Price Per Piece', formatCurrency(order.pricePerPiece))}
      ${detailRow('Total Price', formatCurrency(order.totalPrice))}
    </table>
    <h2 style="margin:0 0 8px;font-size:18px;color:#f3c86b;">Payment details</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${detailRow('Payment Method', order.paymentMethod)}
      ${detailRow('Order Status', order.orderStatus)}
    </table>
    <div style="margin-top:24px;padding:16px;border-radius:10px;background:#221b10;border:1px solid #4f3b17;color:#ffe3a0;font-weight:700;">Please call the customer soon to confirm this order.</div>
  `);
}

export function customerOrderEmail(order: Order) {
  return baseEmailShell(`
    <h1 style="margin:0 0 10px;font-size:28px;line-height:1.2;color:#ffffff;">Thank you for your order.</h1>
    <p style="margin:0 0 20px;color:#d6d3d1;line-height:1.7;">Hi ${escapeHtml(order.fullName)},<br><br>We have received your order successfully. Our sales representative will call you soon to confirm your order.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:22px;">
      ${detailRow('Order ID', order.orderId)}
      ${detailRow('Product', order.productName)}
      ${detailRow('Quantity', order.quantity)}
      ${detailRow('Total Price', formatCurrency(order.totalPrice))}
      ${detailRow('Payment Method', order.paymentMethod)}
    </table>
    <p style="margin:0 0 18px;color:#d6d3d1;line-height:1.7;">If you need help, reply to this email at ${escapeHtml(env('EMAIL_FROM') || 'support.sanjeebmezu@gmail.com')}.</p>
    <p style="margin:0;color:#ffffff;font-weight:700;">Thank you,<br>${escapeHtml(brandName())}</p>
  `);
}

async function sendViaSmtp({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const transporter = nodemailer.createTransport({
    host: requiredEnv('SMTP_HOST'),
    port: Number(requiredEnv('SMTP_PORT')),
    secure: Number(env('SMTP_PORT')) === 465,
    auth: {
      user: requiredEnv('SMTP_USER'),
      pass: requiredEnv('SMTP_PASS'),
    },
  });

  await transporter.sendMail({
    from: `${brandName()} <${requiredEnv('EMAIL_FROM')}>`,
    replyTo: env('EMAIL_FROM'),
    to,
    subject,
    html,
  });
}

async function sendViaResend({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = requiredEnv('EMAIL_SERVICE_API_KEY');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${brandName()} <${requiredEnv('EMAIL_FROM')}>`,
      reply_to: env('EMAIL_FROM'),
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(result?.message || 'Email provider rejected the message.');
  }
}

export async function sendOrderEmails(order: Order) {
  const businessEmail = requiredEnv('BUSINESS_EMAIL');
  const useSmtp =
    env('SMTP_HOST') && env('SMTP_PORT') && env('SMTP_USER') && env('SMTP_PASS');
  const send = useSmtp ? sendViaSmtp : sendViaResend;

  await send({
    to: businessEmail,
    subject: `New Product Order Received - ${order.orderId}`,
    html: businessOrderEmail(order),
  });

  await send({
    to: order.email,
    subject: `Your Order Has Been Received - ${brandName()}`,
    html: customerOrderEmail(order),
  });
}
