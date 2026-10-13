import type { Metadata } from "next";
import { Vazirmatn, Cormorant_Garamond } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";
import { getCategories } from "@/lib/queries";

const vazir = Vazirmatn({ subsets: ["arabic", "latin"], variable: "--font-vazir" });
const brand = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-cormorant" });

export const metadata: Metadata = {
  title: "Arghavan Shop | ارغوان شاپ",
  description: "بهترین محصولات آرایشی و مراقبتی، اصل و با ارسال سریع",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();

  return (
    <html lang="fa" dir="rtl" className={`${vazir.variable} ${brand.variable}`}>
      <body className="font-sans antialiased">
        <Header categories={categories} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
