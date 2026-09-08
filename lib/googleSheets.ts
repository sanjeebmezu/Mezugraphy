import { Order, formatCurrency } from '@/lib/order';

const tokenUrl = 'https://oauth2.googleapis.com/token';
const scope = 'https://www.googleapis.com/auth/spreadsheets';
const headers = [
  'Order ID',
  'Date & Time',
  'Customer Name',
  'Phone Number',
  'Email Address',
  'Exact Location',
  'Product Name',
  'Quantity',
  'Price Per Piece',
  'Total Price',
  'Payment Method',
  'Order Status',
  'Notes',
];
const orderStatuses = [
  'New Order',
  'Order Confirmed',
  'Order Ongoing',
  'Delivered',
  'Cancelled',
];

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

function base64Url(input: string | Buffer) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getGoogleAccessToken() {
  const clientEmail = requiredEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  const privateKey = requiredEnv('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n');
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: clientEmail,
    scope,
    aud: tokenUrl,
    exp: now + 3600,
    iat: now,
  };
  const unsignedToken = `${base64Url(JSON.stringify(header))}.${base64Url(
    JSON.stringify(payload),
  )}`;

  const { createSign } = await import('node:crypto');
  const signature = createSign('RSA-SHA256')
    .update(unsignedToken)
    .sign(privateKey);
  const assertion = `${unsignedToken}.${base64Url(signature)}`;

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error_description || 'Google authorization failed.');
  }

  return result.access_token as string;
}

export async function appendOrderToSheet(order: Order) {
  const sheetId = requiredEnv('GOOGLE_SHEET_ID');
  const tabName = process.env.GOOGLE_SHEET_TAB_NAME || 'Orders';
  const accessToken = await getGoogleAccessToken();
  await ensureSheetSetup({ sheetId, tabName, accessToken });
  const range = encodeURIComponent(`${tabName}!A:M`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const values = [
    [
      order.orderId,
      order.dateTime,
      safeSheetValue(order.fullName),
      safeSheetValue(order.phone),
      safeSheetValue(order.email),
      safeSheetValue(order.location),
      safeSheetValue(order.productName),
      order.quantity,
      formatCurrency(order.pricePerPiece),
      formatCurrency(order.totalPrice),
      order.paymentMethod,
      order.orderStatus,
      order.notes,
    ],
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values }),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(
      result?.error?.message || 'Could not save the order to Google Sheets.',
    );
  }
}

function safeSheetValue(value: string) {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

async function ensureSheetSetup({
  sheetId,
  tabName,
  accessToken,
}: {
  sheetId: string;
  tabName: string;
  accessToken: string;
}) {
  const sheet = await getOrCreateSheet({ sheetId, tabName, accessToken });
  const headerRange = encodeURIComponent(`${tabName}!A1:M1`);

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${headerRange}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [headers] }),
    },
  ).then(async (response) => {
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      throw new Error(
        result?.error?.message || 'Could not prepare Google Sheet headers.',
      );
    }
  });

  await batchUpdateSheet({
    sheetId,
    accessToken,
    requests: [
      {
        updateSheetProperties: {
          properties: {
            sheetId: sheet.sheetId,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
          fields: 'gridProperties.frozenRowCount',
        },
      },
      {
        repeatCell: {
          range: {
            sheetId: sheet.sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: headers.length,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.05, green: 0.04, blue: 0.03 },
              horizontalAlignment: 'CENTER',
              textFormat: {
                foregroundColor: { red: 0.95, green: 0.78, blue: 0.42 },
                fontSize: 11,
                bold: true,
              },
            },
          },
          fields:
            'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
        },
      },
      {
        repeatCell: {
          range: {
            sheetId: sheet.sheetId,
            startRowIndex: 1,
            endRowIndex: 1000,
            startColumnIndex: 0,
            endColumnIndex: headers.length,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 1, green: 0.99, blue: 0.96 },
              textFormat: {
                foregroundColor: { red: 0.09, green: 0.08, blue: 0.07 },
                fontSize: 10,
              },
            },
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat)',
        },
      },
      {
        setBasicFilter: {
          filter: {
            range: {
              sheetId: sheet.sheetId,
              startRowIndex: 0,
              startColumnIndex: 0,
              endColumnIndex: headers.length,
            },
          },
        },
      },
      {
        setDataValidation: {
          range: {
            sheetId: sheet.sheetId,
            startRowIndex: 1,
            endRowIndex: 1000,
            startColumnIndex: 11,
            endColumnIndex: 12,
          },
          rule: {
            condition: {
              type: 'ONE_OF_LIST',
              values: orderStatuses.map((userEnteredValue) => ({
                userEnteredValue,
              })),
            },
            inputMessage: 'Choose the current order status',
            strict: true,
            showCustomUi: true,
          },
        },
      },
      {
        autoResizeDimensions: {
          dimensions: {
            sheetId: sheet.sheetId,
            dimension: 'COLUMNS',
            startIndex: 0,
            endIndex: headers.length,
          },
        },
      },
    ],
  });
}

async function getOrCreateSheet({
  sheetId,
  tabName,
  accessToken,
}: {
  sheetId: string;
  tabName: string;
  accessToken: string;
}) {
  const spreadsheetResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=sheets.properties`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!spreadsheetResponse.ok) {
    const result = await spreadsheetResponse.json().catch(() => null);
    throw new Error(
      result?.error?.message ||
        'Could not open the Google Sheet. Share it with the service account email.',
    );
  }

  const spreadsheet = await spreadsheetResponse.json();
  const existingSheet = spreadsheet.sheets?.find(
    (item: { properties: { title: string } }) =>
      item.properties.title === tabName,
  )?.properties;

  if (existingSheet) return existingSheet as { sheetId: number; title: string };

  const createResult = await batchUpdateSheet({
    sheetId,
    accessToken,
    requests: [
      {
        addSheet: {
          properties: {
            title: tabName,
          },
        },
      },
    ],
  });

  return createResult.replies[0].addSheet.properties as {
    sheetId: number;
    title: string;
  };
}

async function batchUpdateSheet({
  sheetId,
  accessToken,
  requests,
}: {
  sheetId: string;
  accessToken: string;
  requests: unknown[];
}) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    },
  );

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      result?.error?.message || 'Could not format the Google Sheet.',
    );
  }

  return result;
}
