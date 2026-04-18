import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PhoneCheck from '@/models/PhoneCheck';
import { checkPhoneBreach } from '@/services/checkPhoneService';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    
    const body = await req.json();
    const { phone } = body;
    
    if (!phone || phone.length < 10) {
      return NextResponse.json(
        { error: 'Valid phone number required' },
        { status: 400 }
      );
    }
    
    const breachData = await checkPhoneBreach(phone);
    
    if (!breachData) {
      return NextResponse.json(
        { error: 'Scan failed. Try again.' },
        { status: 500 }
      );
    }
    
    const userId = `guest:${ip}`;
    
    const phoneCheck = await PhoneCheck.create({
      phoneHash: phone.replace(/[\s\-\(\)]/g, '').slice(-4),
      phoneLast4: breachData.phoneLast4,
      countryCode: breachData.countryCode,
      breachCount: breachData.breachCount,
      breachSources: breachData.breachSources,
      dataTypes: breachData.dataTypes,
      riskLevel: breachData.riskLevel,
      userId,
    });
    
    return NextResponse.json({
      success: true,
      data: {
        breachCount: breachData.breachCount,
        breachSources: breachData.breachSources,
        dataTypes: breachData.dataTypes,
        riskLevel: breachData.riskLevel,
        phoneLast4: breachData.phoneLast4,
        countryCode: breachData.countryCode,
        scannedAt: phoneCheck.scannedAt,
      },
    });
  } catch (error) {
    console.error('Phone check API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
