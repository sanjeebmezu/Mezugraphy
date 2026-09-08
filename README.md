# MezuStudio Cash On Delivery Funnel

This is a Next.js App Router funnel for the MezuStudio Premium Photography Collection.

## Recommended Tech Stack

- Next.js App Router for the landing page, checkout page, thank-you page, and `/api/order`
- Tailwind CSS for responsive styling
- Google Sheets API for saving orders
- SMTP through Nodemailer, with a Resend API fallback if SMTP is not configured
- Vercel for deployment

## Order Flow

1. A visitor selects the image quantity on the landing page.
2. The CTA sends product name, quantity, price per image, and total price to `/checkout`.
3. The checkout form collects name, phone, email, and exact location.
4. The form submits to `POST /api/order`.
5. The server validates the order, creates an Order ID, sets payment method to `Cash On Delivery`, and sets status to `New Order`.
6. The server saves the order in Google Sheets.
7. The server sends one order email to the business and one confirmation email to the customer.
8. The customer is redirected to `/thank-you`.

The reels section is intentionally not included because no reel/video links were provided.

## Environment Variables

Copy `.env.example` to `.env.local` for local development and add the real values.

```env
NEXT_PUBLIC_SITE_URL=
BUSINESS_EMAIL=sanjeebmezu@gmail.com
EMAIL_FROM=sanjeebmezu@gmail.com
BRAND_NAME=MezuStudio

GOOGLE_SHEET_ID=
GOOGLE_SHEET_TAB_NAME=Orders
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

EMAIL_SERVICE_API_KEY=

FRONTEND_URL=
```

For Gmail SMTP, use:

- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=465`
- `SMTP_USER=your Gmail address`
- `SMTP_PASS=your Gmail app password`

Use a Gmail App Password, not your normal Gmail password.

## Google Spreadsheet Setup

1. Create a new Google Spreadsheet.
2. Rename the first sheet/tab to `Orders`, or use your chosen name in `GOOGLE_SHEET_TAB_NAME`.
3. Add these columns in row 1:

```text
Order ID
Date & Time
Customer Name
Phone Number
Email Address
Exact Location
Product Name
Quantity
Price Per Piece
Total Price
Payment Method
Order Status
Notes
```

4. Select the header row and turn on filters in Google Sheets.
5. Add a dropdown to the `Order Status` column with these options:

```text
New Order
Order Confirmed
Order Ongoing
Delivered
Cancelled
```

6. Get the Sheet ID from the spreadsheet URL. It is the long value between `/d/` and `/edit`.
7. Create a Google Cloud service account and enable the Google Sheets API.
8. Copy the service account email into `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
9. Generate a service account private key and copy it into `GOOGLE_PRIVATE_KEY`.
10. Share the Google Sheet with the service account email as an editor.

If your private key contains multiple lines, keep it in `.env.local` as one quoted value with `\n` line breaks.

## Email Setup

The app sends two HTML emails after the spreadsheet save succeeds:

- Business notification to `BUSINESS_EMAIL`
- Customer order received email to the submitted customer email

If SMTP variables are present, the app uses Gmail SMTP through Nodemailer. If SMTP variables are not present, it tries `EMAIL_SERVICE_API_KEY` with Resend.

## Testing Order Submission

1. Add real Google and email credentials to `.env.local`.
2. Start the app locally with `npm run dev`.
3. Open the landing page.
4. Choose a quantity and click an order CTA.
5. Fill in the checkout form and submit.
6. Confirm that:
   - A new row appears in Google Sheets.
   - The business email receives the order notification.
   - The customer email receives the order confirmation.
   - The customer reaches the thank-you page.

If any private credential is missing, the checkout shows a clear error and does not redirect.

## Deploying On Vercel

1. Push this project to GitHub.
2. Import the repository into Vercel.
3. Add all production environment variables in Vercel project settings.
4. Deploy the project.
5. Place a test order using the live URL.
6. Verify the Google Sheet row and both emails.

Do not add Google credentials, SMTP passwords, or API keys to frontend code.

`FRONTEND_URL` can contain one URL or multiple comma-separated URLs, for example:

```env
FRONTEND_URL=https://mezugraphy.mezustudio.com,https://mezugraphy.vercel.app
```
