import Link from "next/link";

export function Wordmark({ eyebrow }: { eyebrow?: string }) {
  return (
    <Link href="/" className="inline-flex items-baseline gap-3 group">
      <span className="font-display text-xl font-bold tracking-tight text-text-primary">
        CreditGuard-AI<span className="text-chain">.</span>
      </span>
      {eyebrow && (
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-faint group-hover:text-text-muted transition-colors">
          {eyebrow}
        </span>
      )}
    </Link>
  );
}
