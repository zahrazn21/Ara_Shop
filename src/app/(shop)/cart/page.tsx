import type { Metadata } from "next";
import CartView from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "سبد خرید | ارغوان شاپ",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-5 text-lg font-bold text-plum-900">سبد خرید</h1>
      <CartView />
    </div>
  );
}