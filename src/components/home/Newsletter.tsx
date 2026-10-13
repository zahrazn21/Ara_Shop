"use client";
import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <section className="bg-blush-200">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row">
        <div>
          <h3 className="font-bold text-plum-900">خبرنامه ارغوان شاپ</h3>
          <p className="text-xs text-plum-700">برای اطلاع از جدیدترین محصولات، تخفیف‌ها و پیشنهادهای ویژه، ایمیل خود را وارد کنید.</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); 
          setDone(true); }} className="flex gap-2">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ایمیل شما..." className="w-64 rounded-lg border border-blush-300 bg-white px-4 py-2 text-sm" />
          <button className="rounded-lg bg-plum-700 px-6 text-sm text-white">{done ? "ثبت شد" : "عضویت"}</button>
        </form>
      </div>
    </section>
  );
}
