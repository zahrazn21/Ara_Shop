import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import CheckoutView from "@/components/checkout/CheckoutView";

export const metadata: Metadata = {
  title: "ثبت سفارش | ارغوان شاپ",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    select: {
      id: true, title: true, fullName: true, phone: true, province: true,
      city: true, postalCode: true, addressLine: true, isDefault: true,
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-5 text-lg font-bold text-plum-900">ثبت سفارش</h1>
      <CheckoutView initialAddresses={addresses} />
    </div>
  );
}