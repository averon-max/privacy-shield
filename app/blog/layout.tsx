import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security Blog — Data Breach Guides & Tips",
  description: "Learn about data breaches, how to protect your email, what k-anonymity means, and how to create strong passwords. Security guides from ScanMyCreds.",
  alternates: { canonical: "https://www.scanmycreds.com/blog" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}