import axios from "axios";
import crypto from "crypto";

export async function checkPasswordExposure(password: string): Promise<{ exposed: boolean; count: number }> {
  if (!password) return { exposed: false, count: 0 };
  const sha1 = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);
  const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);
  const hashes = response.data.split("\n");
  const found = hashes.find((h: string) => h.startsWith(suffix));
  const count = found ? parseInt(found.split(":")[1]) : 0;
  return { exposed: !!found, count };
}

function inferSeverity(exposedData: string[]): "critical" | "high" | "medium" | "low" {
  const lower = exposedData.map(d => d.toLowerCase());
  if (lower.some(d => d.includes("password") || d.includes("credit") || d.includes("ssn") || d.includes("social security"))) return "critical";
  if (lower.some(d => d.includes("phone") || d.includes("address") || d.includes("dob") || d.includes("birth"))) return "high";
  if (lower.some(d => d.includes("email") || d.includes("username") || d.includes("ip"))) return "medium";
  return "low";
}

export async function checkEmailBreaches(email: string): Promise<{
  breached: boolean;
  breachCount: number;
  breachSources: string[];
  exposedDataTypes: string[];
  breachDetails: Array<{
    name: string;
    date: string;
    description: string;
    exposedData: string[];
    pwnCount?: number;
    severity: "critical" | "high" | "medium" | "low";
  }>;
} | null> {
  try {
    // Basic check
    const basicRes = await axios.get(
      `https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`,
      { headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }, timeout: 8000 }
    );

    if (!basicRes.data || basicRes.data.Error || !basicRes.data.breaches) {
      return { breached: false, breachCount: 0, breachSources: [], exposedDataTypes: [], breachDetails: [] };
    }

    const breaches: any[] = basicRes.data.breaches || [];
    const sources = breaches.map((b: any) => {
      if (typeof b === "string") return b;
      return b.breach || b.name || b.source || String(b);
    }).filter(Boolean);

    // Try to get detailed breach info
    let breachDetails: any[] = [];
    try {
      const detailRes = await axios.get(
        `https://api.xposedornot.com/v1/breach-analytics?email=${encodeURIComponent(email)}`,
        { headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }, timeout: 8000 }
      );

      if (detailRes.data?.BreachMetrics?.breaches_details) {
        breachDetails = detailRes.data.BreachMetrics.breaches_details.map((b: any) => {
          const exposedData = b.xposed_data
            ? b.xposed_data.split(";").map((s: string) => s.trim()).filter(Boolean)
            : [];
          return {
            name: b.breach || b.name || "Unknown",
            date: b.xposed_date || b.breach_date || "",
            description: b.description || "",
            exposedData,
            pwnCount: b.xposed_records || b.pwn_count,
            severity: inferSeverity(exposedData),
          };
        });
      }
    } catch {
      // Detailed API failed — build basic details from sources
      breachDetails = sources.map(name => ({
        name,
        date: "",
        description: "",
        exposedData: [],
        severity: "medium" as const,
      }));
    }

    // Collect all exposed data types
    const allTypes = new Set<string>();
    breachDetails.forEach(b => b.exposedData.forEach((t: string) => allTypes.add(t)));

    return {
      breached: sources.length > 0,
      breachCount: sources.length,
      breachSources: sources,
      exposedDataTypes: Array.from(allTypes),
      breachDetails,
    };

  } catch (err: any) {
    if (err.response?.status === 404) {
      return { breached: false, breachCount: 0, breachSources: [], exposedDataTypes: [], breachDetails: [] };
    }
    if (err.response?.status === 403) {
      console.warn(`XposedOrNot 403 for ${email}`);
      return null;
    }
    console.error(`checkEmailBreaches error:`, err.message);
    return null;
  }
}