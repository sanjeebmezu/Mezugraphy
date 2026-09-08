'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Image as ImageIcon,
  MailCheck,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import { product } from '@/lib/product';

const trustItems = [
  { label: 'Digital delivery', Icon: Download },
  { label: 'Secure order form', Icon: ShieldCheck },
  { label: 'Support by email', Icon: MailCheck },
];

function checkoutHref(quantity: number) {
  const total = product.offerPrice * quantity;
  const params = new URLSearchParams({
    product: product.name,
    quantity: String(quantity),
    price: String(product.offerPrice),
    total: String(total),
  });

  return `/checkout?${params.toString()}`;
}

export default function Home() {
  const [quantity, setQuantity] = useState(5);
  const [activeImage, setActiveImage] = useState(0);
  const total = useMemo(() => product.offerPrice * quantity, [quantity]);
  const selectedImage = product.images[activeImage];

  const increase = () => setQuantity((value) => Math.min(value + 1, 99));
  const decrease = () => setQuantity((value) => Math.max(value - 1, 1));
  const previousImage = () =>
    setActiveImage((value) =>
      value === 0 ? product.images.length - 1 : value - 1,
    );
  const nextImage = () =>
    setActiveImage((value) => (value + 1) % product.images.length);

  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-stone-50">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg border border-[#d7aa54]/40 bg-[#d7aa54]/10 text-[#f3c86b]">
              <Camera size={20} />
            </span>
            <span className="text-lg font-semibold">{product.brand}</span>
          </Link>
          <Link
            href={checkoutHref(quantity)}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#f3c86b] px-4 py-2 text-sm font-bold text-black transition hover:bg-white"
          >
            Order Now
            <ArrowRight size={16} />
          </Link>
        </nav>
      </header>

      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(215,170,84,0.18),transparent_28%),linear-gradient(180deg,rgba(5,5,5,0)_0%,#050505_100%)]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_0.92fr]">
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex rounded-full border border-[#d7aa54]/35 px-4 py-2 text-sm font-medium text-[#f3c86b]">
              Premium cultural photography collection
            </p>
            <h1 className="text-5xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
              Own cinematic images that make your brand impossible to ignore.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-stone-300">
              {product.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={checkoutHref(quantity)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#f3c86b] px-6 py-3 font-bold text-black transition hover:bg-white"
              >
                Purchase Now
                <ArrowRight size={18} />
              </Link>
              <a
                href="#showcase"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/15 px-6 py-3 font-semibold text-white transition hover:border-[#f3c86b]/70"
              >
                View Collection
              </a>
            </div>
            <div className="mt-9 grid gap-3 text-sm text-stone-300 sm:grid-cols-3">
              {trustItems.map(({ label, Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3"
                >
                  <Icon className="text-[#f3c86b]" size={17} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-[8px] border border-[#d7aa54]/35 bg-stone-950 shadow-2xl shadow-black">
              <Image
                src={product.images[0].src}
                alt={product.images[0].alt}
                width={1200}
                height={800}
                priority
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-5 right-5 rounded-lg border border-white/10 bg-black/85 p-4 shadow-2xl backdrop-blur">
              <p className="text-sm text-stone-400">Offer price</p>
              <div className="mt-1 flex items-end justify-between gap-4">
                <p className="text-3xl font-bold text-[#f3c86b]">
                  Rs. {product.offerPrice}
                </p>
                <p className="text-right text-sm text-stone-300">
                  Buy 5 images, get 2 free
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="showcase" className="border-t border-white/10 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.03]">
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                width={1200}
                height={800}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={previousImage}
                className="absolute left-4 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur transition hover:border-[#f3c86b]"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-4 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur transition hover:border-[#f3c86b]"
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`aspect-square overflow-hidden rounded-[8px] border transition ${
                    activeImage === index
                      ? 'border-[#f3c86b]'
                      : 'border-white/10 opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`View product image ${index + 1}`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={220}
                    height={220}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <p className="mb-3 text-sm font-semibold uppercase text-[#f3c86b]">
              Digital collection
            </p>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              {product.name}
            </h2>
            <p className="mt-4 text-stone-300">{product.shortSummary}</p>

            <div className="mt-7 space-y-3">
              {product.benefits.slice(0, 5).map((benefit) => (
                <div key={benefit} className="flex gap-3 text-stone-200">
                  <BadgeCheck className="mt-0.5 shrink-0 text-[#f3c86b]" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 rounded-lg border border-[#d7aa54]/30 bg-black/45 p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-stone-400">Price per image</p>
                  <p className="mt-1 text-3xl font-bold text-[#f3c86b]">
                    Rs. {product.offerPrice}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-stone-500 line-through">
                    Rs. {product.regularPrice}
                  </p>
                  <p className="text-sm font-medium text-white">
                    No delivery fee
                  </p>
                </div>
              </div>
              <p className="rounded-md bg-[#f3c86b]/10 px-3 py-2 text-sm text-[#ffe3a0]">
                Offer: Buy 5 images, Get 2 Free
              </p>
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium">Quantity</span>
                <div className="flex items-center rounded-lg border border-white/15">
                  <button
                    type="button"
                    onClick={decrease}
                    className="grid size-11 place-items-center text-stone-200 hover:text-[#f3c86b]"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={17} />
                  </button>
                  <span className="w-12 text-center font-semibold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={increase}
                    className="grid size-11 place-items-center text-stone-200 hover:text-[#f3c86b]"
                    aria-label="Increase quantity"
                  >
                    <Plus size={17} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-stone-300">Total price</span>
                <span className="text-2xl font-bold text-white">
                  Rs. {total}
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                href={checkoutHref(quantity)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#f3c86b] px-5 py-3 font-bold text-black transition hover:bg-white"
              >
                Buy Now
                <ArrowRight size={18} />
              </Link>
              <Link
                href={checkoutHref(quantity)}
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/15 px-5 py-3 font-semibold text-white transition hover:border-[#f3c86b]"
              >
                Order Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase text-[#f3c86b]">
              Why buy this collection
            </p>
            <h2 className="mt-3 text-4xl font-semibold text-white">
              Visuals with mood, culture, and commercial polish.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {product.benefits.map((benefit, index) => {
              const icons = [ImageIcon, Sparkles, Star, BadgeCheck, Clock, Camera];
              const Icon = icons[index % icons.length];

              return (
                <article
                  key={benefit}
                  className="rounded-[8px] border border-white/10 bg-white/[0.035] p-5"
                >
                  <Icon className="mb-5 text-[#f3c86b]" size={24} />
                  <p className="text-lg font-semibold text-white">{benefit}</p>
                </article>
              );
            })}
          </div>
          <Link
            href={checkoutHref(quantity)}
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-bold text-black transition hover:bg-[#f3c86b]"
          >
            Purchase Now
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-[#f3c86b]">
                Customer voices
              </p>
              <h2 className="mt-3 text-4xl font-semibold text-white">
                Chosen by creators, brands, and culture lovers.
              </h2>
            </div>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {product.testimonials.map((testimonial) => (
              <figure
                key={testimonial.name}
                className="rounded-[8px] border border-white/10 bg-black/35 p-6"
              >
                <div className="mb-5 flex gap-1 text-[#f3c86b]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={17} fill="currentColor" />
                  ))}
                </div>
                <blockquote className="text-xl leading-8 text-white">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="mt-5 text-sm font-semibold text-stone-300">
                  {testimonial.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase text-[#f3c86b]">
              Questions
            </p>
            <h2 className="mt-3 text-4xl font-semibold text-white">
              Clear answers before you order.
            </h2>
          </div>
          <div className="space-y-3">
            {product.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-[8px] border border-white/10 bg-white/[0.035] p-5"
              >
                <summary className="cursor-pointer list-none text-lg font-semibold text-white">
                  {faq.question}
                </summary>
                <p className="mt-3 leading-7 text-stone-300">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[8px] border border-[#d7aa54]/30 bg-[#f3c86b] p-8 text-black sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-4xl font-black">
                Ready to upgrade your content with MezuStudio?
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-black/75">
                Place your order now. You will receive confirmation by email,
                and our team will follow up with the download details.
              </p>
            </div>
            <Link
              href={checkoutHref(quantity)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-black px-6 py-3 font-bold text-white transition hover:bg-stone-800"
            >
              Order Now
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
