import type { Metadata } from "next";

export function buildMeta(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: `https://www.scanmycreds.com${path}` },
    openGraph: {
      title: `${title} | ScanMyCreds`,
      description,
      url: `https://www.scanmycreds.com${path}`,
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ScanMyCreds`,
      description,
    },
  };
}