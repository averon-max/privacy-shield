import crypto from "crypto";

export interface PasswordHealthResult {
  compromised: boolean;
  timesFound: number;
  strength: "very-weak" | "weak" | "fair" | "strong" | "very-strong";
  strengthScore: number;
  crackTime: string;
  issues: string[];
  suggestions: string[];
}

export async function checkPasswordHealth(password: string): Promise<PasswordHealthResult> {
  const sha1 = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);
  let timesFound = 0;
  let compromised = false;

  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "Add-Padding": "true" },
    });
    const text = await res.text();
    for (const line of text.split("\n")) {
      const [hash, count] = line.trim().split(":");
      if (hash === suffix) { timesFound = parseInt(count, 10); compromised = true; break; }
    }
  } catch { /* fail open */ }

  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  if (password.length >= 8)  score++; else issues.push("Too short — under 8 characters");
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password))        score++; else issues.push("No uppercase letters");
  if (/[a-z]/.test(password))        score++; else issues.push("No lowercase letters");
  if (/[0-9]/.test(password))        score++; else issues.push("No numbers");
  if (/[^A-Za-z0-9]/.test(password)) score++; else issues.push("No special characters");
  if (!/(.)\1{2,}/.test(password))   score++; else issues.push("Repeated characters detected");
  if (!/^(password|123456|qwerty|abc123)/i.test(password)) score++; else issues.push("Common password pattern");

  if (password.length < 12)           suggestions.push("Use at least 12 characters");
  if (!/[^A-Za-z0-9]/.test(password)) suggestions.push("Add symbols like @, #, $, !");
  if (compromised)                     suggestions.push("This password is in breach databases — never use it anywhere");
  if (suggestions.length === 0)        suggestions.push("Consider using a password manager");

  const strengths: PasswordHealthResult["strength"][] =
    ["very-weak","very-weak","weak","fair","fair","strong","strong","very-strong","very-strong","very-strong"];
  const cracks = ["instantly","seconds","minutes","hours","days","weeks","months","years","centuries","centuries"];
  const idx = Math.min(score, 9);

  return { compromised, timesFound, strength: strengths[idx], strengthScore: score, crackTime: cracks[idx], issues, suggestions };
}