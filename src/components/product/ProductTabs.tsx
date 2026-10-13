"use client";
import { useId, useState } from "react";

export type TabItem = { id: string; label: string; content: React.ReactNode };

export default function ProductTabs({ tabs }: { tabs: TabItem[] }) {
  const uid = useId();
  const [active, setActive] = useState(tabs[0]?.id);

  if (tabs.length === 0) return null;

  const tabId = (id: string) => `${uid}-tab-${id}`;
  const panelId = (id: string) => `${uid}-panel-${id}`;

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const step = e.key === "ArrowLeft" ? 1 : e.key === "ArrowRight" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = tabs[(index + step + tabs.length) % tabs.length];
    setActive(next.id);
    document.getElementById(tabId(next.id))?.focus();
  };

  return (
    <div>
      <div role="tablist" className="scrollbar-hide mb-6 flex gap-1 overflow-x-auto border-b border-blush-200">
        {tabs.map((t, i) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              id={tabId(t.id)}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId(t.id)}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-sm transition-colors ${
                selected
                  ? "border-plum-700 font-bold text-plum-900"
                  : "border-transparent text-plum-600 hover:text-plum-900"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tabs.map((t) => (
        <div key={t.id} id={panelId(t.id)} role="tabpanel" aria-labelledby={tabId(t.id)} hidden={t.id !== active}>
          {t.content}
        </div>
      ))}
    </div>
  );
}
