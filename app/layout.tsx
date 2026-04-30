import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.scanmycreds.com"),
  title: {
    default: "ScanMyCreds — Check If Your Email Was in a Data Breach",
    template: "%s | ScanMyCreds",
  },
  description: "Instantly check if your email or password has been exposed in a data breach. Free real-time scan across 600+ breach databases.",
  openGraph: {
    type: "website",
    url: "https://www.scanmycreds.com",
    siteName: "ScanMyCreds",
    title: "ScanMyCreds — Check If Your Email Was in a Data Breach",
    description: "Free real-time scan across 600+ breach databases.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#000", color: "#fff" }}>
        {children}
      </body>
    </html>
  );
}