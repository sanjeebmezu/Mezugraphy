'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { product } from '@/lib/product';

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  location: string;
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>({
    fullName: '',
    phone: '',
    email: '',
    location: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const order = useMemo(() => {
    const quantity = Math.max(1, Number(searchParams.get('quantity')) || 1);
    const pricePerPiece =
      Number(searchParams.get('price')) || product.offerPrice;
    const totalPrice = pricePerPiece * quantity;

    return {
      productName: searchParams.get('product') || product.name,
      quantity,
      pricePerPiece,
      totalPrice,
    };
  }, [searchParams]);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ...order }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Order submission failed.');
      }

      const params = new URLSearchParams({
        orderId: result.orderId,
        product: order.productName,
        quantity: String(order.quantity),
        total: String(order.totalPrice),
      });
      router.push(`/thank-you?${params.toString()}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] px-5 py-8 text-stone-50 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-300 transition hover:text-[#f3c86b]"
        >
          <ArrowLeft size={16} />
          Back to collection
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.82fr]">
          <section>
            <p className="text-sm font-semibold uppercase text-[#f3c86b]">
              Secure order
            </p>
            <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
              Complete your MezuStudio order.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-300">
              Your product details are filled automatically. Add your contact
              information so the team can confirm your order and send the
              download link.
            </p>

            <form onSubmit={submitOrder} className="mt-8 grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-stone-300">
                    Full Name
                  </span>
                  <input
                    required
                    value={form.fullName}
                    onChange={(event) =>
                      updateField('fullName', event.target.value)
                    }
                    className="min-h-12 rounded-lg border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-stone-500 focus:border-[#f3c86b]"
                    placeholder="Your full name"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-stone-300">
                    Phone Number
                  </span>
                  <input
                    required
                    value={form.phone}
                    onChange={(event) =>
                      updateField('phone', event.target.value)
                    }
                    className="min-h-12 rounded-lg border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-stone-500 focus:border-[#f3c86b]"
                    placeholder="98XXXXXXXX"
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-stone-300">
                  Email Address
                </span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  className="min-h-12 rounded-lg border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-stone-500 focus:border-[#f3c86b]"
                  placeholder="you@example.com"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-stone-300">
                  Exact Location
                </span>
                <textarea
                  required
                  value={form.location}
                  onChange={(event) =>
                    updateField('location', event.target.value)
                  }
                  className="min-h-28 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-stone-500 focus:border-[#f3c86b]"
                  placeholder="Kindly share your exact location"
                />
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <ReadOnlyField label="Product Name" value={order.productName} />
                <ReadOnlyField label="Quantity" value={String(order.quantity)} />
                <ReadOnlyField
                  label="Price Per Piece"
                  value={`Rs. ${order.pricePerPiece}`}
                />
                <ReadOnlyField
                  label="Total Price"
                  value={`Rs. ${order.totalPrice}`}
                />
              </div>

              {error ? (
                <p className="rounded-lg border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg bg-[#f3c86b] px-6 py-3 font-bold text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Submitting Order...
                  </>
                ) : (
                  'Order Now'
                )}
              </button>
            </form>
          </section>

          <aside className="h-fit rounded-[8px] border border-[#d7aa54]/30 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-semibold">Order summary</h2>
            <div className="mt-6 space-y-4 text-stone-300">
              <SummaryRow label="Product" value={order.productName} />
              <SummaryRow label="Quantity" value={String(order.quantity)} />
              <SummaryRow label="Price" value={`Rs. ${order.pricePerPiece}`} />
              <SummaryRow label="Delivery fee" value="Free" />
              <SummaryRow
                label="Payment method"
                value="Cash On Delivery"
              />
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
              <span className="text-stone-300">Total</span>
              <span className="text-3xl font-bold text-[#f3c86b]">
                Rs. {order.totalPrice}
              </span>
            </div>
            <div className="mt-6 grid gap-3">
              {[
                'Order saved to spreadsheet after credentials are added',
                'Business email receives the order details',
                'Customer receives an order confirmation email',
              ].map((item) => (
                <p key={item} className="flex gap-3 text-sm text-stone-300">
                  <CheckCircle2
                    className="mt-0.5 shrink-0 text-[#f3c86b]"
                    size={17}
                  />
                  <span>{item}</span>
                </p>
              ))}
            </div>
            <div className="mt-6 rounded-lg border border-white/10 bg-black/35 p-4">
              <p className="flex items-center gap-2 font-semibold text-white">
                <ShieldCheck className="text-[#f3c86b]" size={18} />
                Private checkout
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-400">
                Credentials and spreadsheet keys are handled only on the server.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-stone-300">{label}</span>
      <input
        readOnly
        value={value}
        className="min-h-12 rounded-lg border border-white/10 bg-white/[0.025] px-4 text-stone-300 outline-none"
      />
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span>{label}</span>
      <span className="text-right font-semibold text-white">{value}</span>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#050505]" />}>
      <CheckoutContent />
    </Suspense>
  );
}
