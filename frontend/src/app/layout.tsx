import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreditGuard AI — Proof-Driven Financial Agent",
  description:
    "Verified cross-chain evidence, interpreted by an AI agent, enforced by deterministic policy, executed on Creditcoin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
