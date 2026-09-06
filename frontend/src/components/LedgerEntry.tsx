import { ReactNode } from "react";

export function LedgerEntry({
  index,
  timestamp,
  title,
  children,
  isLast = false,
}: {
  index: number;
  timestamp: string;
  title: string;
  children: ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className="relative pl-14 pb-8 last:pb-0">
      {!isLast && (
        <span className="absolute left-[19px] top-8 bottom-0 w-px bg-line" />
      )}
      <span className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-panel-raised font-mono text-xs text-text-muted">
        {String(index).padStart(2, "0")}
      </span>

      <div className="flex items-baseline justify-between gap-4 mb-2">
        <h4 className="font-display text-sm font-bold text-text-primary">
          {title}
        </h4>
        <time className="font-mono text-[11px] text-text-faint whitespace-nowrap">
          {timestamp}
        </time>
      </div>

      <div className="rounded-lg border border-line-soft bg-panel px-4 py-3">
        {children}
      </div>
    </div>
  );
}
