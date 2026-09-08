import crypto from 'node:crypto';
import fs from 'node:fs';

const raw = fs.readFileSync('.env.local', 'utf8');
const env = {};

for (const line of raw.split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!match) continue;
  let value = match[2];
  if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
  env[match[1]] = value;
}

function base64Url(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const unsignedToken = `${base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${base64Url(
    JSON.stringify({
      iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    }),
  )}`;
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(unsignedToken)
    .sign(env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'));

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsignedToken}.${base64Url(signature)}`,
    }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error_description || result.error);
  return result.access_token;
}

const token = await getAccessToken();
const metadataResponse = await fetch(
  `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}?fields=sheets.properties(title,sheetId,gridProperties)`,
  { headers: { Authorization: `Bearer ${token}` } },
);
const metadata = await metadataResponse.json();
if (!metadataResponse.ok) {
  throw new Error(metadata.error?.message || 'Could not read spreadsheet.');
}

const tabName = env.GOOGLE_SHEET_TAB_NAME || 'Orders';
const valuesResponse = await fetch(
  `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/${encodeURIComponent(`${tabName}!A:M`)}`,
  { headers: { Authorization: `Bearer ${token}` } },
);
const values = await valuesResponse.json();
if (!valuesResponse.ok) {
  throw new Error(values.error?.message || 'Could not read sheet values.');
}

const rows = values.values || [];
console.log(`Tabs: ${metadata.sheets.map((sheet) => sheet.properties.title).join(', ')}`);
console.log(`Rows including header: ${rows.length}`);
console.log(
  JSON.stringify(
    rows.slice(-5).map((row) => ({
      orderId: row[0],
      date: row[1],
      name: row[2],
      email: row[4],
      product: row[6],
      quantity: row[7],
      total: row[9],
      status: row[11],
    })),
    null,
    2,
  ),
);
