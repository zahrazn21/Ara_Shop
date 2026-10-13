export const toman = (n: number) => new Intl.NumberFormat("fa-IR").format(n);
export const discountPercent = (price: number, original?: number | null) =>
  original && original > price ? Math.round((1 - price / original) * 100) : 0;
export const faDate = (d: Date) => new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(d);
