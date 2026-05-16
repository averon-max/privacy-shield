import axios from "axios";
import crypto from "crypto";

export async function checkPasswordExposure(password: string): Promise<{ exposed: boolean; count: number }> {
  if (!password) return { exposed: false, count: 0 };

  const sha1 = crypto
    .createHash("sha1")
    .update(password)
    .digest("hex")
    .toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  const response = await axios.get(
    `https://api.pwnedpasswords.com/range/${prefix}`
  );

  const hashes = response.data.split("\n");
  const found = hashes.find((h: string) => h.startsWith(suffix));
  const count = found ? parseInt(found.split(":")[1]) : 0;

  return { exposed: !!found, count };
}

export async function checkEmailBreaches(email: string): Promise<{
  breached: boolean;
  breachCount: number;
  breachSources: string[];
} | null> {
  try {
    const response = await axios.get(
      `https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json",
        },
        timeout: 8000,
      }
    );

    const data = response.data;

    // XposedOrNot возвращает { breaches: [ { breach: "Adobe", ... }, ... ] }
    // или { Error: "Not found" }
    if (!data || data.Error || !data.breaches) {
      return { breached: false, breachCount: 0, breachSources: [] };
    }

    const breaches: any[] = data.breaches || [];

    // Нормализуем — каждый элемент может быть строкой или объектом
    const sources = breaches.map((b: any) => {
      if (typeof b === "string") return b;
      return b.breach || b.name || b.source || JSON.stringify(b);
    }).filter(Boolean);

    return {
      breached: sources.length > 0,
      breachCount: sources.length,
      breachSources: sources,
    };

  } catch (err: any) {
    // 404 = email не найден в базе = не breached
    if (err.response?.status === 404) {
      return { breached: false, breachCount: 0, breachSources: [] };
    }
    // 403 = rate limit или блок
    if (err.response?.status === 403) {
      console.warn(`XposedOrNot 403 for ${email} — skipping`);
      return null;
    }
    console.error(`checkEmailBreaches error for ${email}:`, err.message);
    return null;
  }
}