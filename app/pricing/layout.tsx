import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Free Forever + Pro",
  description: "ScanMyCreds is free forever. Upgrade to Pro for unlimited scans, full breach sources, and unlimited watchlist monitoring for $4.99/month.",
  alternates: { canonical: "https://www.scanmycreds.com/pricing" },
  openGraph: {
    title: "ScanMyCreds Pricing — Free Forever + Pro at $4.99/mo",
    description: "Start free, no credit card. Upgrade to Pro for unlimited scans and monitoring.",
    url: "https://www.scanmycreds.com/pricing",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}