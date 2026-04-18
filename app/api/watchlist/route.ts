import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import WatchedEmail from '@/models/WatchedEmail';
import { Types } from 'mongoose';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface WatchlistRequest {
  email?: string;
  userId?: string;
  alertEmail?: string;
  id?: string;
  active?: boolean;
  lastBreachCount?: number;
}

interface WatchlistResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  count?: number;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}

function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// ============================================================================
// RESPONSE HELPERS
// ============================================================================

function successResponse(data: any, status = 200): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  }, { status });
}

function errorResponse(message: string, status = 500): NextResponse {
  return NextResponse.json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  }, { status });
}

// ============================================================================
// GET - Fetch watched emails
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const active = searchParams.get('active');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId && !email) {
      return errorResponse('userId or email required', 400);
    }

    const query: any = {};
    if (userId) query.userId = userId;
    if (email) query.email = sanitizeEmail(email);
    if (active !== null) query.active = active === 'true';

    const watched = await WatchedEmail.find(query)
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 100));

    return successResponse({
      count: watched.length,
      items: watched,
      filters: { userId, email, active },
    });
  } catch (error) {
    console.error('Watchlist GET error:', error);
    return errorResponse('Failed to fetch watchlist', 500);
  }
}

// ============================================================================
// POST - Add email to watchlist
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body: WatchlistRequest = await req.json();
    const { email, userId, alertEmail } = body;

    // Validation
    if (!email || !userId) {
      return errorResponse('Email and userId are required', 400);
    }

    if (!isValidEmail(email)) {
      return errorResponse('Invalid email format', 400);
    }

    if (alertEmail && !isValidEmail(alertEmail)) {
      return errorResponse('Invalid alert email format', 400);
    }

    // Sanitize
    const cleanEmail = sanitizeEmail(email);
    const cleanAlertEmail = alertEmail ? sanitizeEmail(alertEmail) : cleanEmail;

    // Check duplicate
    const existing = await WatchedEmail.findOne({
      email: cleanEmail,
      userId,
      active: true,
    });

    if (existing) {
      return errorResponse('Already watching this email', 409);
    }

    // Create
    const watched = await WatchedEmail.create({
      email: cleanEmail,
      userId,
      alertEmail: cleanAlertEmail,
      active: true,
      lastBreachCount: 0,
      lastChecked: new Date(),
    });

    console.log(`[Watchlist] Added ${cleanEmail} for user ${userId}`);

    return successResponse(watched, 201);
  } catch (error) {
    console.error('Watchlist POST error:', error);
    return errorResponse('Failed to add to watchlist', 500);
  }
}

// ============================================================================
// PUT - Update watchlist entry
// ============================================================================

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const body: WatchlistRequest = await req.json();
    const { id, active, alertEmail } = body;

    if (!id) {
      return errorResponse('ID is required', 400);
    }

    if (!isValidObjectId(id)) {
      return errorResponse('Invalid ID format', 400);
    }

    const updateData: any = {};
    if (typeof active === 'boolean') updateData.active = active;
    if (alertEmail) {
      if (!isValidEmail(alertEmail)) {
        return errorResponse('Invalid alert email format', 400);
      }
      updateData.alertEmail = sanitizeEmail(alertEmail);
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse('No fields to update', 400);
    }

    const updated = await WatchedEmail.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return errorResponse('Watched email not found', 404);
    }

    console.log(`[Watchlist] Updated ${id}`);

    return successResponse(updated);
  } catch (error) {
    console.error('Watchlist PUT error:', error);
    return errorResponse('Failed to update watchlist', 500);
  }
}

// ============================================================================
// DELETE - Remove from watchlist
// ============================================================================

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const body: WatchlistRequest = await req.json();
    const { id, userId, email } = body;

    if (!id && (!userId || !email)) {
      return errorResponse('Provide id OR (userId + email)', 400);
    }

    let result;

    if (id) {
      if (!isValidObjectId(id)) {
        return errorResponse('Invalid ID format', 400);
      }
      result = await WatchedEmail.findByIdAndUpdate(
        id,
        { active: false },
        { new: true }
      );
    } else {
      result = await WatchedEmail.findOneAndUpdate(
        {
          userId,
          email: sanitizeEmail(email!),
          active: true,
        },
        { active: false },
        { new: true }
      );
    }

    if (!result) {
      return errorResponse('Watched email not found', 404);
    }

    console.log(`[Watchlist] Removed ${result.email}`);

    return successResponse({ message: 'Removed from watchlist', data: result });
  } catch (error) {
    console.error('Watchlist DELETE error:', error);
    return errorResponse('Failed to remove from watchlist', 500);
  }
}

// ============================================================================
// PATCH - Partial update
// ============================================================================

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const body: WatchlistRequest = await req.json();
    const { id, active, alertEmail, lastBreachCount } = body;

    if (!id) {
      return errorResponse('ID is required', 400);
    }

    if (!isValidObjectId(id)) {
      return errorResponse('Invalid ID format', 400);
    }

    const updateData: any = {};
    if (typeof active === 'boolean') updateData.active = active;
    if (alertEmail) {
      if (!isValidEmail(alertEmail)) {
        return errorResponse('Invalid alert email format', 400);
      }
      updateData.alertEmail = sanitizeEmail(alertEmail);
    }
    if (typeof lastBreachCount === 'number') {
      updateData.lastBreachCount = lastBreachCount;
      updateData.lastChecked = new Date();
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse('No fields to update', 400);
    }

    const updated = await WatchedEmail.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return errorResponse('Watched email not found', 404);
    }

    return successResponse(updated);
  } catch (error) {
    console.error('Watchlist PATCH error:', error);
    return errorResponse('Failed to patch watchlist', 500);
  }
}

// ============================================================================
// OPTIONS - CORS preflight
// ============================================================================

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
