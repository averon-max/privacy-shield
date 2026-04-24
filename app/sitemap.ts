import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.scanmycreds.com";
  const now = new Date();

  const staticPages = [
    { url: base, priority: 1.0, changeFrequency: "weekly" as const },
    { url: `${base}/pricing`, priority: 0.9, changeFrequency: "monthly" as const },
    { url: `${base}/features`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${base}/how-it-works`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${base}/blog`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${base}/privacy`, priority: 0.5, changeFrequency: "yearly" as const },
    { url: `${base}/terms`, priority: 0.5, changeFrequency: "yearly" as const },
    { url: `${base}/blog/what-is-a-data-breach`, priority: 0.7, changeFrequency: "yearly" as const },
    { url: `${base}/blog/how-to-protect-your-email`, priority: 0.7, changeFrequency: "yearly" as const },
    { url: `${base}/blog/what-is-k-anonymity`, priority: 0.7, changeFrequency: "yearly" as const },
    { url: `${base}/blog/biggest-data-breaches`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${base}/blog/strong-password-guide`, priority: 0.7, changeFrequency: "yearly" as const },
    { url: `${base}/blog/two-factor-authentication`, priority: 0.7, changeFrequency: "yearly" as const },
  ];

  const breachPages = [
    "adobe", "linkedin", "facebook", "yahoo", "equifax", "canva",
    "twitter", "dropbox", "marriott", "uber", "myfitnesspal", "snapchat",
    "att", "rockyou", "collection1", "haveibeenpwned", "lastpass",
    "microsoft", "google", "amazon", "netflix", "spotify", "github",
  ].map(company => ({
    url: `${base}/breach/${company}`,
    priority: 0.8,
    changeFrequency: "monthly" as const,
  }));

  return [...staticPages, ...breachPages].map(p => ({
    ...p,
    lastModified: now,
  }));
}