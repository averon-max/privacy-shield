const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

interface GroqOptions {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  model?: string;
}

export async function callGroq(options: GroqOptions): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model || "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: options.systemPrompt || "You are a helpful assistant. Keep responses concise." },
        { role: "user", content: options.prompt },
      ],
      max_tokens: options.maxTokens || 500,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Groq API error:", res.status, errText);
    if (res.status === 429) throw new Error("RATE_LIMITED");
    throw new Error("Groq API " + res.status);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function explainBreach(email: string, breaches: string[], exposedTypes: string[] = []): Promise<string> {
  const prompt = breaches.length === 0
    ? "The email " + email + " has no known breaches. Write a short reassuring message (2-3 short paragraphs) about what this means and best practices to maintain security. No markdown."
    : "Analyze this breach data: Email " + email + " is in " + breaches.length + " breaches: " + breaches.slice(0, 12).join(", ") + ". Exposed data types: " + (exposedTypes.join(", ") || "various") + ". Give: 1) severity assessment, 2) what the worst breaches mean, 3) top 3 urgent actions. Under 300 words. Plain English. No markdown.";

  return callGroq({
    prompt,
    systemPrompt: "You are a friendly cybersecurity advisor. Concise, practical, empathetic.",
    maxTokens: 500,
  });
}