import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { Order } from '@/lib/types';
import { FREE_DELIVERY_THRESHOLD, DELIVERY_RATES, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/constants';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL;
// Use service role key to bypass RLS if available, otherwise fallback to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      customer_name, 
      customer_email, 
      customer_phone, 
      customer_address, 
      province,
      notes, 
      items, 
      subtotal, 
      coupon_code,
      payment_method 
    } = body;

    const numSubtotal = Number(subtotal) || 0;

    // 1. Calculate Delivery Fee based on Province and Free Delivery Threshold
    const isDeliveryFree = numSubtotal >= FREE_DELIVERY_THRESHOLD;
    const shippingFee = isDeliveryFree
      ? 0
      : (province === 'Punjab' ? (DELIVERY_RATES.Punjab || 300) : (DELIVERY_RATES.default || 400));

    // 2. Validate Coupon Server-Side (if provided)
    let verifiedCouponCode: string | undefined = undefined;
    let couponDiscount = 0;

    if (coupon_code && typeof coupon_code === 'string' && coupon_code.trim()) {
      const { data: couponData, error: couponErr } = await supabase
        .from('coupons')
        .select('code, discount_percent, is_active')
        .ilike('code', coupon_code.trim())
        .maybeSingle();

      if (couponData && couponData.is_active) {
        verifiedCouponCode = couponData.code;
        const pct = Number(couponData.discount_percent) || 0;
        couponDiscount = Math.round((numSubtotal * pct) / 100);
      } else if (couponErr) {
        const STARTER_COUPONS: Record<string, number> = {
          WELCOME10: 10,
          COSMEVO15: 15,
          FLAT20: 20,
        };
        const upper = coupon_code.trim().toUpperCase();
        if (STARTER_COUPONS[upper]) {
          verifiedCouponCode = upper;
          couponDiscount = Math.round((numSubtotal * STARTER_COUPONS[upper]) / 100);
        }
      }
    }

    // 2b. Compute Routine Savings Server-Side
    // Routine savings: 10% for 2 items, 13% for 3 items, 16% for 4+ items (max 16% in custom bundles)
    const totalItemCount = Array.isArray(items)
      ? items.reduce((sum: number, it: any) => sum + (Number(it.qty) || 1), 0)
      : 0;
    const rawRoutinePct = totalItemCount >= 2 ? 10 + (totalItemCount - 2) * 3 : 0;
    const routinePct = Math.min(16, rawRoutinePct);
    const routineSavings = routinePct > 0 ? Math.round((numSubtotal * routinePct) / 100) : 0;

    const discountAmount = routineSavings + couponDiscount;
    const calculatedTotal = Math.max(0, numSubtotal - discountAmount) + shippingFee;

    // 3. Generate sequential reference (COS-XXXXX)
    let newReference = 'COS-00001';
    
    const { data: allOrders, error: fetchError } = await supabase
      .from('orders')
      .select('reference');

    if (!fetchError && allOrders) {
      let maxNum = 0;
      allOrders.forEach(o => {
        if (o.reference && o.reference.startsWith('COS-')) {
          const parts = o.reference.split('-');
          if (parts.length === 2) {
            const num = parseInt(parts[1], 10);
            if (!isNaN(num) && num < 100000) {
              if (num > maxNum) maxNum = num;
            }
          }
        }
      });
      const nextNum = maxNum + 1;
      newReference = `COS-${nextNum.toString().padStart(5, '0')}`;
    }

    // 4. Prepare full order object
    const orderToInsert = {
      reference: newReference,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      province: province || null,
      notes: notes || null,
      items,
      subtotal: numSubtotal,
      shipping_fee: shippingFee,
      coupon_code: verifiedCouponCode || null,
      discount_amount: discountAmount,
      total: calculatedTotal,
      payment_method,
      status: 'pending',
    };

    // 5. Insert into Supabase (with fallback if new columns not yet migrated)
    let insertedOrder: any = null;
    const { data, error: insertError } = await supabase
      .from('orders')
      .insert([orderToInsert])
      .select()
      .single();

    if (insertError) {
      console.warn('Insert with new columns failed, retrying with legacy schema fallback:', insertError.message);
      
      const fallbackNotes = [
        notes,
        province ? `Province: ${province}` : null,
        routinePct > 0 ? `Routine Savings: ${routinePct}% (-Rs. ${routineSavings})` : null,
        verifiedCouponCode ? `Coupon: ${verifiedCouponCode} (Discount: Rs. ${couponDiscount})` : null,
        `Shipping: Rs. ${shippingFee}`
      ].filter(Boolean).join(' | ');

      const fallbackOrder = {
        reference: newReference,
        customer_name,
        customer_email,
        customer_phone,
        customer_address: province ? `${customer_address}, ${province}` : customer_address,
        notes: fallbackNotes,
        items,
        subtotal: numSubtotal,
        total: calculatedTotal,
        payment_method,
        status: 'pending',
      };

      const fallbackRes = await supabase
        .from('orders')
        .insert([fallbackOrder])
        .select()
        .single();

      if (fallbackRes.error) {
        console.error('Error inserting fallback order:', fallbackRes.error);
        return NextResponse.json({ error: 'Failed to insert order' }, { status: 500 });
      }

      insertedOrder = {
        ...fallbackRes.data,
        province,
        shipping_fee: shippingFee,
        coupon_code: verifiedCouponCode,
        discount_amount: discountAmount,
      };
    } else {
      insertedOrder = data;
    }

    // 6. Send Confirmation Email
    try {
      await sendOrderConfirmationEmail(insertedOrder as Order);
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
    }

    return NextResponse.json({ success: true, order: insertedOrder });
  } catch (error) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
