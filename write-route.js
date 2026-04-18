const fs = require('fs');

const content = `import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import WatchedEmail from '@/models/WatchedEmail';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    if (!userId && !email) {
      return NextResponse.json({ error: 'userId or email required' }, { status: 400 });
    }

    const query: any = { active: true };
    if (userId) query.userId = userId;
    if (email) query.email = email;

    const watched = await WatchedEmail.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, count: watched.length, data: watched });
  } catch (error) {
    console.error('Watchlist GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, userId, alertEmail } = body;

    if (!email || !userId) {
      return NextResponse.json({ error: 'Email and userId required' }, { status: 400 });
    }

    const existing = await WatchedEmail.findOne({ email: email.toLowerCase(), userId, active: true });
    if (existing) {
      return NextResponse.json({ error: 'Already watching' }, { status: 409 });
    }

    const watched = await WatchedEmail.create({
      email: email.toLowerCase(),
      userId,
      alertEmail: alertEmail ? alertEmail.toLowerCase() : email.toLowerCase(),
      active: true,
      lastBreachCount: 0,
      lastChecked: new Date(),
    });

    return NextResponse.json({ success: true, data: watched }, { status: 201 });
  } catch (error) {
    console.error('Watchlist POST error:', error);
    return NextResponse.json({ error: 'Failed to add' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await WatchedEmail.findByIdAndUpdate(id, { active: false });
    return NextResponse.json({ success: true, message: 'Removed' });
  } catch (error) {
    console.error('Watchlist DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove' }, { status: 500 });
  }
}`;

fs.writeFileSync('app/api/watchlist/route.ts', content, 'utf8');
console.log('File created successfully ✅');