import { NextResponse } from 'next/server';
import { appendOrderToSheet } from '@/lib/googleSheets';
import { OrderInput, createOrder, validateOrder } from '@/lib/order';
import { sendOrderEmails } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const allowedOrigins = (process.env.FRONTEND_URL || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
      .map((origin) => new URL(origin).origin);
    const requestOrigin = request.headers.get('origin');

    if (
      allowedOrigins.length > 0 &&
      requestOrigin &&
      !allowedOrigins.includes(requestOrigin)
    ) {
      return NextResponse.json(
        { success: false, error: 'This order form is not allowed.' },
        { status: 403 },
      );
    }

    const data = (await request.json()) as Partial<OrderInput>;
    const errors = validateOrder(data);

    if (errors.length) {
      return NextResponse.json(
        { success: false, error: errors.join(' ') },
        { status: 400 },
      );
    }

    const order = createOrder({
      fullName: data.fullName!.trim(),
      phone: data.phone!.trim(),
      email: data.email!.trim().toLowerCase(),
      location: data.location!.trim(),
      productName: data.productName!.trim(),
      quantity: Number(data.quantity),
      pricePerPiece: Number(data.pricePerPiece),
      totalPrice: Number(data.totalPrice),
    });

    await appendOrderToSheet(order);
    await sendOrderEmails(order);

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
    });
  } catch (error) {
    console.error('Order submission failed:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Order submission failed. Please try again.',
      },
      { status: 500 },
    );
  }
}
