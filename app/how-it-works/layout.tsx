import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — Breach Detection in 3 Steps",
  description: "Learn how ScanMyCreds checks your email against 600+ breach databases using k-anonymity to keep your password safe. Free, instant, private.",
  alternates: { canonical: "https://www.scanmycreds.com/how-it-works" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}