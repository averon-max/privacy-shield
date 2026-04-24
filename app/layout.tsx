import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.scanmycreds.com"),
  title: {
    default: "ScanMyCreds — Check If Your Email Was in a Data Breach",
    template: "%s | ScanMyCreds",
  },
  description: "Instantly check if your email or password has been exposed in a data breach. Free, real-time scan across 600+ breach databases. k-Anonymity protected.",
  keywords: ["data breach checker", "have i been pwned alternative", "email breach check", "password exposed check", "credential leak scanner", "dark web monitor"],
  authors: [{ name: "ScanMyCreds" }],
  creator: "ScanMyCreds",
  publisher: "ScanMyCreds",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.scanmycreds.com",
    siteName: "ScanMyCreds",
    title: "ScanMyCreds — Check If Your Email Was in a Data Breach",
    description: "Free real-time scan across 600+ breach databases. Find out if your credentials are on the dark web in 10 seconds.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ScanMyCreds — Credential Breach Detection" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ScanMyCreds — Check If Your Email Was in a Data Breach",
    description: "Free real-time scan across 600+ breach databases. Find out in 10 seconds.",
    images: ["/og-image.png"],
    creator: "@scanmycreds",
  },
  alternates: {
    canonical: "https://www.scanmycreds.com",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,300;1,9..40,400&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#000", color: "#fff" }}>
        {children}
      </body>
    </html>
  );
}