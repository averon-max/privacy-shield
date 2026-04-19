import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import PhoneCheck from '@/models/PhoneCheck';
import { checkPhoneBreach } from '@/services/checkPhoneService';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { phone } = await req.json();

    if (!phone || phone.replace(/[\s\-\(\)\+\.]/g, '').length < 7) {
      return NextResponse.json({ error: 'Valid phone number required' }, { status: 400 });
    }

    await connectDB();

    const breachData = await checkPhoneBreach(phone);

    if (!breachData) {
      return NextResponse.json({ error: 'Scan failed. Try again.' }, { status: 500 });
    }

    await PhoneCheck.create({
      phoneHash: phone.replace(/[\s\-\(\)]/g, '').slice(-4),
      phoneLast4: breachData.phoneLast4,
      countryCode: breachData.countryCode,
      breachCount: breachData.breachCount,
      breachSources: breachData.breachSources,
      dataTypes: breachData.dataTypes,
      riskLevel: breachData.riskLevel,
      userId: session.user.email,
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
      },
    });
  } catch (error) {
    console.error('Phone check API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}