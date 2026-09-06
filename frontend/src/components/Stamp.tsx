type StampTone = "verified" | "block" | "pending" | "chain";

const TONE_STYLES: Record<StampTone, { color: string; bg: string }> = {
  verified: { color: "var(--verified)", bg: "var(--verified-dim)" },
  block: { color: "var(--block)", bg: "var(--block-dim)" },
  pending: { color: "var(--pending)", bg: "var(--pending-dim)" },
  chain: { color: "var(--chain)", bg: "var(--chain-dim)" },
};

export function Stamp({
  label,
  tone,
  small = false,
}: {
  label: string;
  tone: StampTone;
  small?: boolean;
}) {
  const { color, bg } = TONE_STYLES[tone];
  return (
    <span
      className={`stamp font-mono uppercase ${
        small ? "text-[10px] px-2 py-1" : "text-xs px-3 py-1.5"
      }`}
      style={{ color, backgroundColor: `${bg}55` }}
    >
      {label}
    </span>
  );
}
