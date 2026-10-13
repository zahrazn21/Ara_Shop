"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      className="flex shrink-0 items-center gap-1.5 text-xs text-plum-600 hover:text-plum-900"
    >
      {copied ? <Check size={14} /> : <Share2 size={14} />}
      {copied ? "لینک کپی شد" : "اشتراک‌گذاری"}
    </button>
  );
}