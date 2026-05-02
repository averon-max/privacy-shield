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
  const prompt = `You are a cybersecurity expert. A user just found out their data was exposed in the "${breachName}" breach. The data types stolen: ${dataClasses.join(", ")}.

Respond ONLY with JSON in this exact shape, no markdown:
{
  "severity": "critical|high|medium|low",
  "severityColor": "#e05c4b for critical, #c48b20 for high, #6c9ef7 for medium, #6ce4c0 for low",
  "whatWasStolen": "one sentence summary",
  "whatAttackersDo": "one sentence about typical attacks",
  "steps": [
    { "title": "4 words max", "description": "one sentence" },
    { "title": "4 words max", "description": "one sentence" },
    { "title": "4 words max", "description": "one sentence" }
  ],
  "urgency": "do this within X timeframe and why"
}`;

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
    return JSON.parse(text.replace(/```json|```/g, "").trim()) as BreachExplanation;
  } catch {
    return {
      severity: "high",
      severityColor: "#c48b20",
      whatWasStolen: `Your data was exposed in ${breachName}: ${dataClasses.slice(0, 3).join(", ")}.`,
      whatAttackersDo: "Attackers use this for phishing, credential stuffing, and identity fraud.",
      steps: [
        { title: "Change your password", description: `Change passwords on any site reusing your ${breachName} credentials.` },
        { title: "Enable 2FA", description: "Turn on two-factor authentication on this and linked accounts." },
        { title: "Watch for phishing", description: "Be alert for suspicious emails impersonating services you use." },
      ],
      urgency: "Change your passwords within 24 hours.",
    };
  }
}