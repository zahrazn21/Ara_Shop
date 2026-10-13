export const inputClass =
  "w-full rounded-lg border border-blush-300 bg-white px-3 py-2 text-sm disabled:bg-blush-100 disabled:text-plum-600";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-plum-900">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-plum-600">{hint}</span>}
    </label>
  );
}