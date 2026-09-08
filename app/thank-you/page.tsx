'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft, CheckCircle2, Download, Phone } from 'lucide-react';
import { product } from '@/lib/product';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const productName = searchParams.get('product') || product.name;
  const quantity = searchParams.get('quantity') || '1';
  const total = searchParams.get('total') || String(product.offerPrice);
  const orderId = searchParams.get('orderId') || 'Pending';

  return (
    <main className="grid min-h-screen place-items-center bg-[#050505] px-5 py-10 text-stone-50 sm:px-8">
      <section className="w-full max-w-3xl rounded-[8px] border border-[#d7aa54]/30 bg-white/[0.04] p-6 text-center shadow-2xl shadow-black sm:p-10">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#f3c86b] text-black">
          <CheckCircle2 size={34} />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase text-[#f3c86b]">
          Order received
        </p>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
          Thank you for your order!
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-stone-300">
          Our sales representative will call you soon to confirm your order.
        </p>

        <div className="mt-8 grid gap-3 rounded-lg border border-white/10 bg-black/35 p-5 text-left">
          <SummaryRow label="Order ID" value={orderId} />
          <SummaryRow label="Product ordered" value={productName} />
          <SummaryRow label="Quantity" value={quantity} />
          <SummaryRow label="Total price" value={`Rs. ${total}`} />
          <SummaryRow label="Payment method" value="Cash On Delivery" />
        </div>

        <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <Download className="text-[#f3c86b]" />
            <p className="mt-3 font-semibold text-white">Digital delivery</p>
            <p className="mt-1 text-sm leading-6 text-stone-400">
              Your image download link will be shared after confirmation.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <Phone className="text-[#f3c86b]" />
            <p className="mt-3 font-semibold text-white">Quick follow-up</p>
            <p className="mt-1 text-sm leading-6 text-stone-400">
              MezuStudio will contact you soon using your submitted details.
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#f3c86b] px-6 py-3 font-bold text-black transition hover:bg-white"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>
      </section>
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/10 py-3 last:border-b-0">
      <span className="text-stone-400">{label}</span>
      <span className="text-right font-semibold text-white">{value}</span>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#050505]" />}>
      <ThankYouContent />
    </Suspense>
  );
}
