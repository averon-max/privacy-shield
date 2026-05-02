export interface BreachExplanation {
  severity: "critical" | "high" | "medium" | "low";
  severityColor: string;
  whatWasStolen: string;
  whatAttackersDo: string;
  steps: { title: string; description: string }[];
  urgency: string;
}

export async function explainBreach(
  breachName: string,
  dataClasses: string[]
): Promise<BreachExplanation> {
  const prompt = `You are a cybersecurity expert. A user just found out their data was exposed in the "${breachName}" breach. The following data types were stolen: ${dataClasses.join(", ")}.

Respond ONLY with a JSON object in this exact shape, no markdown, no extra text:
{
  "severity": "critical",
  "severityColor": "#e05c4b",
  "whatWasStolen": "one sentence",
  "whatAttackersDo": "one sentence",
  "steps": [
    { "title": "4 words max", "description": "one sentence" },
    { "title": "4 words max", "description": "one sentence" },
    { "title": "4 words max", "description": "one sentence" }
  ],
  "urgency": "one sentence with timeframe"
}
Use severity: critical if passwords/CC/SSN exposed, high if emails/phones/DOB, medium otherwise, low if only usernames.
Use severityColor: #e05c4b for critical, #c48b20 for high, #6c9ef7 for medium, #6ce4c0 for low.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const text: string = data.content?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean) as BreachExplanation;
  } catch {
    return fallback(breachName, dataClasses);
  }
}

export async function summarizeBreachForNews(
  breachName: string,
  domain: string,
  dataClasses: string[],
  pwnCount: number
): Promise<string> {
  const prompt = `Summarize this data breach in exactly 2 sentences for a general audience. Plain text only, no markdown.
Breach: ${breachName} (${domain})
Records exposed: ${pwnCount.toLocaleString()}
Data types: ${dataClasses.join(", ")}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 150,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await response.json();
    return data.content?.[0]?.text || defaultSummary(breachName, pwnCount, dataClasses);
  } catch {
    return defaultSummary(breachName, pwnCount, dataClasses);
  }
}

function defaultSummary(name: string, count: number, dc: string[]): string {
  return `${name} exposed ${count.toLocaleString()} records including ${dc.slice(0, 2).join(" and ")}.`;
}

function fallback(breachName: string, dataClasses: string[]): BreachExplanation {
  return {
    severity: "high",
    severityColor: "#c48b20",
    whatWasStolen: `Your data was exposed in the ${breachName} breach including: ${dataClasses.slice(0, 3).join(", ")}.`,
    whatAttackersDo: "Attackers use this data for phishing, credential stuffing, and identity fraud.",
    steps: [
      { title: "Change your password", description: `Change your password on any site where you used the same credentials as ${breachName}.` },
      { title: "Enable two-factor auth", description: "Turn on 2FA on this account and any accounts using the same email." },
      { title: "Watch for phishing", description: "Be extra vigilant about suspicious emails pretending to be services you use." },
    ],
    urgency: "Change your passwords within 24 hours to minimise risk.",
  };
}