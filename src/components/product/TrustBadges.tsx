import { Lock, ShieldCheck, Truck } from "lucide-react";

const ITEMS = [
  { icon: ShieldCheck, text: "ضمانت اصالت کالا" },
  { icon: Truck, text: "ارسال سریع" },
  { icon: Lock, text: "پرداخت امن" },
];

export default function TrustBadges() {
  return (
    <ul className="mt-5 grid grid-cols-3 gap-2 text-center text-[11px] text-plum-700">
      {ITEMS.map(({ icon: Icon, text }) => (
        <li key={text} className="flex flex-col items-center gap-1.5 rounded-xl bg-white px-2 py-3">
          <Icon size={20} className="text-gold" aria-hidden />
          {text}
        </li>
      ))}
    </ul>
  );
}
