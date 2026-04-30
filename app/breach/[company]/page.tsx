import Link from "next/link";
import type { Metadata } from "next";

const BREACH_DATA: Record<string, {
  name: string;
  year: number;
  records: string;
  types: string[];
  description: string;
  severity: "critical" | "high" | "medium";
  color: string;
}> = {
  adobe: {
    name: "Adobe", year: 2013, records: "153 million", severity: "critical", color: "#e05c4b",
    types: ["Email addresses", "Passwords", "Usernames", "Password hints"],
    description: "In October 2013, Adobe suffered a massive breach exposing 153 million user records. Encrypted passwords and unencrypted password hints were leaked, allowing attackers to crack passwords using the hints.",
  },
  linkedin: {
    name: "LinkedIn", year: 2021, records: "700 million", severity: "critical", color: "#6c9ef7",
    types: ["Email addresses", "Phone numbers", "Geolocation data", "Usernames"],
    description: "In 2021, data from 700 million LinkedIn profiles was scraped and posted online. The data included personal information scraped from public profiles combined with private account data.",
  },
  facebook: {
    name: "Facebook", year: 2021, records: "533 million", severity: "critical", color: "#6c9ef7",
    types: ["Phone numbers", "Email addresses", "Names", "Locations", "Birthdates"],
    description: "In April 2021, personal data from 533 million Facebook users was posted to a hacking forum. The data was originally scraped in 2019 using a vulnerability in Facebook's contact import feature.",
  },
  yahoo: {
    name: "Yahoo", year: 2016, records: "3 billion", severity: "critical", color: "#c48b20",
    types: ["Email addresses", "Passwords", "Security questions", "Birthdates"],
    description: "Yahoo suffered the largest known breach in history — all 3 billion accounts were compromised. The breach occurred in 2013 but was not fully disclosed until 2017.",
  },
  equifax: {
    name: "Equifax", year: 2017, records: "147 million", severity: "critical", color: "#e05c4b",
    types: ["Social Security numbers", "Birthdates", "Addresses", "Driver's license numbers", "Credit card numbers"],
    description: "The Equifax breach exposed the most sensitive personal data of any major breach — Social Security numbers, birthdates, and financial information of 147 million Americans.",
  },
  canva: {
    name: "Canva", year: 2019, records: "137 million", severity: "high", color: "#b47fe8",
    types: ["Email addresses", "Usernames", "Names", "Passwords"],
    description: "In May 2019, Canva suffered a breach exposing 137 million user records. Bcrypt-hashed passwords were included in the leaked data.",
  },
  dropbox: {
    name: "Dropbox", year: 2012, records: "68 million", severity: "high", color: "#6c9ef7",
    types: ["Email addresses", "Passwords"],
    description: "In 2012, Dropbox was breached and 68 million email and hashed password combinations were stolen. The breach was not publicly confirmed until 2016.",
  },
  twitter: {
    name: "Twitter", year: 2022, records: "200 million", severity: "high", color: "#6c9ef7",
    types: ["Email addresses", "Usernames", "Phone numbers"],
    description: "In 2022, a dataset of 200 million Twitter users was published online. The data allowed linking anonymous accounts to real email addresses.",
  },
  marriott: {
    name: "Marriott", year: 2018, records: "500 million", severity: "critical", color: "#b47fe8",
    types: ["Names", "Addresses", "Phone numbers", "Passport numbers", "Email addresses", "Birthdates"],
    description: "Marriott's Starwood guest reservation database was breached between 2014 and 2018. Up to 500 million guests were affected.",
  },
  att: {
    name: "AT&T", year: 2024, records: "73 million", severity: "critical", color: "#e05c4b",
    types: ["Social Security numbers", "Email addresses", "Phone numbers", "Dates of birth", "Account passcodes"],
    description: "In March 2024, AT&T confirmed that data from 73 million current and former customers was leaked to the dark web.",
  },
  rockyou: {
    name: "RockYou", year: 2009, records: "32 million", severity: "high", color: "#e05c4b",
    types: ["Passwords", "Email addresses", "Usernames"],
    description: "The RockYou breach of 2009 stored passwords in plain text. The 32 million leaked passwords became the famous rockyou.txt wordlist used in password cracking.",
  },
  myfitnesspal: {
    name: "MyFitnessPal", year: 2018, records: "144 million", severity: "high", color: "#e05c4b",
    types: ["Email addresses", "Usernames", "Passwords"],
    description: "In February 2018, Under Armour's MyFitnessPal app was breached. 144 million accounts were compromised.",
  },
  lastpass: {
    name: "LastPass", year: 2022, records: "25 million", severity: "critical", color: "#e05c4b",
    types: ["Password vaults", "Email addresses", "Billing addresses", "Phone numbers"],
    description: "In 2022, LastPass suffered a severe breach where encrypted password vaults were stolen along with customer metadata.",
  },
  uber: {
    name: "Uber", year: 2022, records: "57 million", severity: "high", color: "#6c9ef7",
    types: ["Email addresses", "Phone numbers", "Names"],
    description: "Uber suffered a significant breach in 2022 where an attacker gained access to internal systems and compromised data of 57 million riders and drivers.",
  },
  github: {
    name: "GitHub", year: 2020, records: "500 thousand", severity: "medium", color: "#6c9ef7",
    types: ["Email addresses", "Passwords", "Usernames"],
    description: "GitHub credential stuffing attacks in 2020 resulted in hundreds of thousands of accounts being compromised using passwords reused from other breaches.",
  },
  snapchat: {
    name: "Snapchat", year: 2014, records: "4.6 million", severity: "medium", color: "#c48b20",
    types: ["Phone numbers", "Usernames"],
    description: "In January 2014, 4.6 million Snapchat usernames and phone numbers were published online.",
  },
};

export async function generateMetadata(
  props: { params: Promise<{ company: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const company = (params?.company || "").toLowerCase();
  const data = BREACH_DATA[company];
  if (!data) return { title: "Breach Not Found | ScanMyCreds" };
  return {
    title: data.name + " Data Breach — " + data.records + " Records Exposed (" + data.year + ")",
    description: "The " + data.name + " data breach of " + data.year + " exposed " + data.records + " records. Check if your email was affected.",
    alternates: { canonical: "https://www.scanmycreds.com/breach/" + company },
  };
}

export async function generateStaticParams() {
  return Object.keys(BREACH_DATA).map(company => ({ company }));
}

export default async function BreachPage(
  props: { params: Promise<{ company: string }> }
) {
  const params = await props.params;
  const company = params?.company?.toLowerCase() ?? "";
  const data = BREACH_DATA[company];

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#e05c4b", fontSize: "14px", marginBottom: "16px" }}>Breach not found</p>
          <Link href="/" style={{ color: "#6c9ef7", textDecoration: "none", fontSize: "13px" }}>Back to scanner</Link>
        </div>
      </div>
    );
  }

  const severityColor = data.severity === "critical" ? "#e05c4b" : data.severity === "high" ? "#c48b20" : "#6c9ef7";
  const severityLabel = data.severity === "critical" ? "Critical" : data.severity === "high" ? "High" : "Medium";

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <nav style={{ padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ fontSize: "12px", letterSpacing: "0.2em", fontWeight: 800, color: "rgba(255,255,255,0.4)", textDecoration: "none", textTransform: "uppercase" }}>ScanMyCreds</Link>
        <Link href="/app" style={{ padding: "8px 18px", fontSize: "12px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "7px" }}>
          Check my email
        </Link>
      </nav>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "56px 24px 80px" }}>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", marginBottom: "28px" }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.2)", textDecoration: "none" }}>Home</Link>
          {" / "}
          <span style={{ color: "rgba(255,255,255,0.4)" }}>{data.name}</span>
        </p>

        <div style={{ marginBottom: "40px", padding: "32px", borderRadius: "20px", border: "1px solid " + severityColor + "25", background: severityColor + "06", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(to right, " + severityColor + ", transparent)" }} />
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "6px" }}>Data Breach</p>
              <h1 style={{ fontSize: "clamp(28px, 6vw, 48px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1.05 }}>
                {data.name}
              </h1>
              <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.35)", fontStyle: "italic", letterSpacing: "-0.02em" }}>Breach of {data.year}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "100px", background: severityColor + "18", border: "1px solid " + severityColor + "40", flexShrink: 0 }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: severityColor, boxShadow: "0 0 8px " + severityColor }} />
              <span style={{ fontSize: "12px", color: severityColor, fontWeight: 700 }}>{severityLabel}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {[
              { label: "Records exposed", value: data.records, color: severityColor },
              { label: "Year", value: String(data.year), color: "rgba(255,255,255,0.5)" },
              { label: "Data types", value: String(data.types.length), color: "#6c9ef7" },
            ].map(s => (
              <div key={s.label} style={{ padding: "10px 16px", borderRadius: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p style={{ fontSize: "16px", fontWeight: 800, color: s.color, letterSpacing: "-0.02em", marginBottom: "2px" }}>{s.value}</p>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "28px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "12px" }}>What happened</h2>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)", lineHeight: 1.75 }}>{data.description}</p>
        </div>

        <div style={{ marginBottom: "28px", padding: "22px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Data types exposed</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
            {data.types.map((type, i) => {
              const colors = ["#e05c4b", "#6c9ef7", "#b47fe8", "#c48b20", "#6ce4c0"];
              const color = colors[i % colors.length];
              return (
                <div key={type} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "6px", background: color + "10", border: "1px solid " + color + "25" }}>
                  <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: color }} />
                  <span style={{ fontSize: "12px", color, fontWeight: 500 }}>{type}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: "40px", padding: "22px", borderRadius: "14px", border: "1px solid rgba(224,92,75,0.15)", background: "rgba(224,92,75,0.04)" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>What to do if you were affected</p>
          {[
            { text: "Change your " + data.name + " password immediately if you have not already", color: "#e05c4b" },
            { text: "Change any other accounts where you used the same password", color: "#c48b20" },
            { text: "Enable two-factor authentication on all important accounts", color: "#6c9ef7" },
            { text: "Use a password manager to generate unique passwords for every site", color: "#b47fe8" },
            { text: "Monitor your accounts for suspicious activity", color: "#6ce4c0" },
          ].map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: i < 4 ? "10px" : "0" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: a.color, boxShadow: "0 0 4px " + a.color, flexShrink: 0, marginTop: "6px" }} />
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{a.text}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: "32px", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)" }} />
          <p style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", marginBottom: "8px" }}>
            Was your email in the {data.name} breach?
          </p>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginBottom: "24px", lineHeight: 1.6 }}>
            Check for free in 10 seconds across 600+ breach databases.
          </p>
          <Link href="/app" style={{ padding: "14px 36px", fontSize: "15px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px", display: "inline-block", boxShadow: "0 0 40px rgba(255,255,255,0.25)" }}>
            Check my email free
          </Link>
        </div>

        <div style={{ marginTop: "48px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Other major breaches</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {Object.entries(BREACH_DATA)
              .filter(([key]) => key !== company)
              .slice(0, 8)
              .map(([key, b]) => (
                <Link key={key} href={"/breach/" + key} style={{ padding: "6px 14px", borderRadius: "7px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", fontSize: "12px", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
                  {b.name} ({b.year})
                </Link>
              ))}
          </div>
        </div>
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
    </div>
  );
}