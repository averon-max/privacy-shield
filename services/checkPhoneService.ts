import axios from 'axios';

export interface PhoneBreachResult {
  found: boolean;
  breachCount: number;
  breachSources: string[];
  dataTypes: string[];
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  phoneLast4: string;
  countryCode: string;
}

export async function checkPhoneBreach(phone: string): Promise<PhoneBreachResult | null> {
  try {
    const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    const normalized = cleaned.startsWith('+') ? cleaned : `+1${cleaned}`;
    const countryCode = normalized.slice(0, normalized.length - 10) || '+1';
    const phoneLast4 = normalized.slice(-4);

    let breachSources: string[] = [];
    let dataTypes: string[] = [];

    // XposedOrNot phone check
    try {
      const xonResponse = await axios.get(
        `https://api.xposedornot.com/v1/check-email/${encodeURIComponent(normalized)}`,
        {
          headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
          timeout: 6000,
        }
      );

      if (xonResponse.data?.breaches?.[0]?.length > 0) {
        breachSources = [...breachSources, ...xonResponse.data.breaches[0]];
      }

      if (xonResponse.data?.breaches_details) {
        xonResponse.data.breaches_details.forEach((d: any) => {
          if (d?.xposed_data) {
            d.xposed_data.split(';').forEach((t: string) => {
              const clean = t.trim();
              if (clean) dataTypes.push(clean);
            });
          }
        });
      }
    } catch (err: any) {
      if (err?.response?.status !== 404 && err?.response?.status !== 403) {
        console.error('XON phone check error:', err?.message);
      }
    }

    // HIBP phone check
    try {
      const hibpResponse = await axios.get(
        `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(normalized)}`,
        {
          headers: {
            'User-Agent': 'ScanMyCreds-PhoneChecker',
            'hibp-api-key': process.env.HIBP_API_KEY || '',
          },
          timeout: 5000,
        }
      );

      if (Array.isArray(hibpResponse.data)) {
        hibpResponse.data.forEach((breach: any) => {
          if (!breachSources.includes(breach.Name)) {
            breachSources.push(breach.Name);
          }
          if (breach.DataClasses) {
            breach.DataClasses.forEach((dc: string) => {
              if (!dataTypes.includes(dc)) dataTypes.push(dc);
            });
          }
        });
      }
    } catch (err: any) {
      // 404 = not found, that's fine
    }

    breachSources = [...new Set(breachSources)];
    dataTypes = [...new Set(dataTypes)];

    if (dataTypes.length === 0 && breachSources.length > 0) {
      dataTypes = ['Phone numbers', 'Personal information'];
    }

    const breachCount = breachSources.length;
    let riskLevel: PhoneBreachResult['riskLevel'] = 'safe';
    if (breachCount >= 5) riskLevel = 'critical';
    else if (breachCount >= 3) riskLevel = 'high';
    else if (breachCount >= 2) riskLevel = 'medium';
    else if (breachCount >= 1) riskLevel = 'low';

    return {
      found: breachCount > 0,
      breachCount,
      breachSources,
      dataTypes: dataTypes.length > 0 ? dataTypes : [],
      riskLevel,
      phoneLast4,
      countryCode,
    };
  } catch (error) {
    console.error('Phone breach check failed:', error);
    return null;
  }
}