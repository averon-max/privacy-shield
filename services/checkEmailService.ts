import axios from "axios";
import crypto from "crypto";

export async function checkPasswordExposure(password: string): Promise<{ exposed: boolean; count: number }> {
  if (!password) return { exposed: false, count: 0 };
  try {
    const sha1 = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);
    const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`, { timeout: 5000 });
    const hashes = response.data.split("\n");
    const found = hashes.find((h: string) => h.startsWith(suffix));
    const count = found ? parseInt(found.split(":")[1]) : 0;
    return { exposed: !!found, count };
  } catch {
    return { exposed: false, count: 0 };
  }
}

function inferSeverity(exposedData: string[]): "critical" | "high" | "medium" | "low" {
  const lower = exposedData.map(d => d.toLowerCase());
  if (lower.some(d => d.includes("password") || d.includes("credit") || d.includes("ssn"))) return "critical";
  if (lower.some(d => d.includes("phone") || d.includes("address") || d.includes("dob"))) return "high";
  if (lower.some(d => d.includes("email") || d.includes("username") || d.includes("ip"))) return "medium";
  return "low";
}

export interface BreachDetail {
  name: string;
  date: string;
  description: string;
  exposedData: string[];
  pwnCount?: number;
  severity: "critical" | "high" | "medium" | "low";
}

export interface BreachResult {
  breached: boolean;
  breachCount: number;
  breachSources: string[];
  exposedDataTypes: string[];
  breachDetails: BreachDetail[];
}

export async function checkEmailBreaches(email: string): Promise<BreachResult | null> {
  try {
    const basicRes = await axios.get(
      `https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`,
      { headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }, timeout: 8000 }
    );

    if (!basicRes.data || basicRes.data.Error === "Not found" || basicRes.data.Error === "Not Acceptable") {
      return { breached: false, breachCount: 0, breachSources: [], exposedDataTypes: [], breachDetails: [] };
    }

    const rawBreaches = basicRes.data.breaches || basicRes.data.Breaches || [];
    const sources: string[] = rawBreaches.map((b: any) => {
      if (typeof b === "string") return b;
      return b.breach || b.name || b.Name || b.source || null;
    }).filter((s: any) => s && s !== "Unknown" && s !== "unknown" && s.length > 1);

    let breachDetails: BreachDetail[] = [];
    try {
      const detailRes = await axios.get(
        `https://api.xposedornot.com/v1/breach-analytics?email=${encodeURIComponent(email)}`,
        { headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }, timeout: 10000 }
      );

      const raw =
        detailRes.data?.BreachMetrics?.breaches_details ||
        detailRes.data?.breaches_details ||
        detailRes.data?.ExposedBreaches?.breaches_details ||
        [];

      breachDetails = raw.map((b: any) => {
        const exposedData: string[] = b.xposed_data
          ? b.xposed_data.split(";").map((s: string) => s.trim()).filter(Boolean)
          : b.exposed_data || [];
        return {
          name: b.breach || b.name || b.Name || "Unknown",
          date: b.xposed_date || b.breach_date || b.date || "",
          description: b.description || b.Description || "",
          exposedData,
          pwnCount: b.xposed_records || b.pwn_count || b.PwnCount,
          severity: inferSeverity(exposedData),
        };
      });
    } catch {
      breachDetails = sources.map((name: string) => ({
        name,
        date: "",
        description: "",
        exposedData: [],
        severity: "medium" as const,
      }));
    }

    const allTypes = new Set<string>();
    breachDetails.forEach(b => b.exposedData.forEach((t: string) => allTypes.add(t)));

    const finalSources = sources.length > 0
      ? sources
      : breachDetails.map(b => b.name).filter(n => n && n !== "Unknown");

    return {
      breached: finalSources.length > 0,
      breachCount: finalSources.length,
      breachSources: finalSources,
      exposedDataTypes: Array.from(allTypes),
      breachDetails,
    };
  } catch (err: any) {
    if (err.response?.status === 404) return { breached: false, breachCount: 0, breachSources: [], exposedDataTypes: [], breachDetails: [] };
    if (err.response?.status === 403) { console.warn(`XposedOrNot 403 for ${email}`); return null; }
    console.error(`checkEmailBreaches error:`, err.message);
    return null;
  }
}