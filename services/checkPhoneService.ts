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
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    const countryCode = cleaned.startsWith('+') ? cleaned.slice(0, 3) : '+1';
    const phoneLast4 = cleaned.slice(-4);
    
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(cleaned).digest('hex').toUpperCase();
    const prefix = hash.slice(0, 6);
    
    const sources = [
      checkLeakLookup(prefix),
      checkPhoneSpamDB(cleaned),
    ];
    
    const results = await Promise.allSettled(sources);
    
    let breachSources: string[] = [];
    let dataTypes: string[] = [];
    
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        breachSources = [...breachSources, ...result.value.sources];
        dataTypes = [...dataTypes, ...result.value.dataTypes];
      }
    });
    
    breachSources = [...new Set(breachSources)];
    dataTypes = [...new Set(dataTypes)];
    
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
      dataTypes: dataTypes.length > 0 ? dataTypes : ['Phone numbers', 'SMS messages', 'Contact lists'],
      riskLevel,
      phoneLast4,
      countryCode,
    };
  } catch (error) {
    console.error('Phone breach check failed:', error);
    return null;
  }
}

async function checkLeakLookup(prefix: string) {
  try {
    const response = await axios.get(`https://api.leak-lookup.com/api/search`, {
      params: { prefix, type: 'phone' },
      headers: { 'X-API-Key': process.env.LEAK_LOOKUP_KEY || '' },
      timeout: 5000,
    });
    
    if (response.data?.success && response.data?.breaches?.length > 0) {
      return {
        sources: response.data.breaches.map((b: any) => b.name),
        dataTypes: response.data.breaches.flatMap((b: any) => b.data_types || []),
      };
    }
  } catch {
  }
  return { sources: [], dataTypes: [] };
}

async function checkPhoneSpamDB(phone: string) {
  try {
    const response = await axios.get(`https://api.phonevalidator.com/v1/validate`, {
      params: { phone },
      timeout: 5000,
    });
    
    if (response.data?.spam_score > 70) {
      return {
        sources: ['Spam Database', 'Telemarketing Lists'],
        dataTypes: ['Phone numbers', 'Call records'],
      };
    }
  } catch {
  }
  return { sources: [], dataTypes: [] };
}
