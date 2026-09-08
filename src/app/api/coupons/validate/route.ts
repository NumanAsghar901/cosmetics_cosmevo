import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/constants';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawCode = body?.code;

    if (!rawCode || typeof rawCode !== 'string' || !rawCode.trim()) {
      return NextResponse.json(
        { valid: false, message: 'Please enter a coupon code.' },
        { status: 400 }
      );
    }

    const cleanCode = rawCode.trim();

    // Query active coupons case-insensitively
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('code, discount_percent, is_active')
      .ilike('code', cleanCode)
      .maybeSingle();

    if (error) {
      console.warn('Coupons table query warning (table may need migration):', error.message);
      // Fallback starter coupons if database table hasn't been migrated yet
      const STARTER_COUPONS: Record<string, number> = {
        WELCOME10: 10,
        COSMEVO15: 15,
        FLAT20: 20,
      };

      const upper = cleanCode.toUpperCase();
      if (STARTER_COUPONS[upper]) {
        return NextResponse.json({
          valid: true,
          coupon: {
            code: upper,
            discount_percent: STARTER_COUPONS[upper],
          },
        });
      }

      return NextResponse.json({
        valid: false,
        message: 'Invalid or expired coupon code.',
      });
    }

    if (!coupon || !coupon.is_active) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid or expired coupon code.',
      });
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discount_percent: Number(coupon.discount_percent),
      },
    });
  } catch (err) {
    console.error('Coupon validation error:', err);
    return NextResponse.json(
      { valid: false, message: 'Internal server error validating coupon.' },
      { status: 500 }
    );
  }
}
