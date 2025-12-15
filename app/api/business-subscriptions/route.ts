import { NextRequest, NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';

// GET - Fetch subscriptions for a business
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID required' },
        { status: 400 }
      );
    }

    const subscriptions = await query(`
      SELECT 
        bs.id,
        bs.business_id,
        bs.addon_module_id,
        bs.status,
        bs.billing_cycle,
        bs.trial_ends_at,
        bs.current_period_start,
        bs.current_period_end,
        bs.cancelled_at,
        bs.created_at,
        am.name as module_name,
        am.slug as module_slug,
        am.description as module_description,
        am.monthly_price,
        am.yearly_price,
        am.features
      FROM business_subscriptions bs
      JOIN addon_modules am ON bs.addon_module_id = am.id
      WHERE bs.business_id = ?
      ORDER BY bs.created_at DESC
    `, [businessId]);

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error('Get business subscriptions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

// POST - Subscribe to a module
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, addonModuleId, billingCycle, trialDays } = body;

    if (!businessId || !addonModuleId) {
      return NextResponse.json(
        { error: 'Business ID and Module ID required' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existing = await query(`
      SELECT id FROM business_subscriptions 
      WHERE business_id = ? AND addon_module_id = ?
    `, [businessId, addonModuleId]);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Already subscribed to this module' },
        { status: 400 }
      );
    }

    // Calculate dates
    const now = new Date();
    const trialEndsAt = trialDays ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000) : null;
    const currentPeriodStart = trialEndsAt || now;
    const currentPeriodEnd = new Date(currentPeriodStart);
    
    if (billingCycle === 'yearly') {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    const subscriptionId = await insert(`
      INSERT INTO business_subscriptions (
        business_id,
        addon_module_id,
        status,
        billing_cycle,
        trial_ends_at,
        current_period_start,
        current_period_end
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      businessId,
      addonModuleId,
      trialDays ? 'trial' : 'active',
      billingCycle || 'monthly',
      trialEndsAt,
      currentPeriodStart,
      currentPeriodEnd
    ]);

    return NextResponse.json({ 
      success: true, 
      id: subscriptionId 
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Subscription ID required' },
        { status: 400 }
      );
    }

    // Update status to cancelled instead of deleting
    await query(`
      UPDATE business_subscriptions 
      SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
