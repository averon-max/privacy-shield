import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features — Everything ScanMyCreds Checks",
  description: "Email breach detection, password exposure check, security score, watchlist monitoring, breach timeline, and more. All free.",
  alternates: { canonical: "https://www.scanmycreds.com/features" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}