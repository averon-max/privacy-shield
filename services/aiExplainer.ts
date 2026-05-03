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
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not set in environment");
    throw new Error("AI service not configured");
  }

  const dataList = dataClasses.length > 0 ? dataClasses.join(", ") : "unknown data types";

  const prompt = `You are a cybersecurity expert helping a user understand a specific data breach. Be specific to THIS breach, not generic.

Breach name: "${breachName}"
Data exposed: ${dataList}

Research this specific breach. Consider:
- When did it happen and how big was it?
- What specific attack vectors are likely given THIS breach's data?
- What real-world consequences have users of THIS breach actually faced?
- Make the fix plan specific to the data types exposed in THIS breach.

Respond ONLY with valid JSON in this exact shape, no markdown, no code fences:
{
  "severity": "critical" | "high" | "medium" | "low",
  "severityColor": "#e05c4b for critical, #c48b20 for high, #6c9ef7 for medium, #6ce4c0 for low",
  "whatWasStolen": "1-2 sentences specific to this breach — include scale and date if known",
  "whatAttackersDo": "1-2 sentences about real attacks tied to this specific breach's exposed data",
  "steps": [
    { "title": "4-5 word action title", "description": "1 sentence specific to this breach" },
    { "title": "4-5 word action title", "description": "1 sentence specific to this breach" },
    { "title": "4-5 word action title", "description": "1 sentence specific to this breach" }
  ],
  "urgency": "specific time window with reason tied to this breach"
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      throw new Error(`Anthropic API ${response.status}`);
    }

    const data = await response.json();
    const text: string = data.content?.[0]?.text || "";

    if (!text) {
      console.error("Empty Anthropic response", data);
      throw new Error("Empty AI response");
    }

    const cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
    const parsed = JSON.parse(cleaned) as BreachExplanation;

    if (!parsed.steps || !Array.isArray(parsed.steps) || parsed.steps.length < 3) {
      throw new Error("Invalid AI response shape");
    }

    return parsed;

  } catch (err) {
    console.error("explainBreach error:", err);
    throw err;
  }
}