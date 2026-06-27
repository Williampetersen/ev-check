"use client";

import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

export type AdminTabItem<T extends string> = {
  id: T;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  badge?: number | string;
};

export function AdminTabs<T extends string>({
  active,
  items,
  onSelect,
}: {
  active: T;
  items: AdminTabItem<T>[];
  onSelect: (id: T) => void;
}) {
  return (
    <div
      role="tablist"
      className="flex [scrollbar-width:none] gap-1 overflow-x-auto rounded-lg border border-white/70 bg-white/55 p-1.5 backdrop-blur [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const selected = active === item.id;

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(item.id)}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-xs font-bold transition",
              selected
                ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20"
                : "text-slate-600 hover:bg-white/70 hover:text-slate-950",
            )}
          >
            {Icon ? <Icon className="h-4 w-4" /> : null}
            <span>{item.label}</span>
            {item.badge !== undefined ? (
              <span
                className={cn(
                  "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px]",
                  selected
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600",
                )}
              >
                {item.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
