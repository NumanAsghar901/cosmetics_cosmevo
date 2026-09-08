import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { Order } from '@/lib/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Use service role key to bypass RLS if available, otherwise fallback to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      customer_name, 
      customer_email, 
      customer_phone, 
      customer_address, 
      notes, 
      items, 
      subtotal, 
      total, 
      payment_method 
    } = body;

    // 1. Generate sequential reference (COS-XXXXX)
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
            // Ignore the old randomly generated 6-digit references (which were >= 100000)
            if (!isNaN(num) && num < 100000) {
              if (num > maxNum) maxNum = num;
            }
          }
        }
      });
      const nextNum = maxNum + 1;
      newReference = `COS-${nextNum.toString().padStart(5, '0')}`;
    }

    // 2. Prepare order object
    const orderToInsert = {
      reference: newReference,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      notes,
      items,
      subtotal,
      total,
      payment_method,
      status: 'pending',
    };

    // 3. Insert into Supabase
    const { data: insertedOrder, error: insertError } = await supabase
      .from('orders')
      .insert([orderToInsert])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting order:', insertError);
      return NextResponse.json({ error: 'Failed to insert order' }, { status: 500 });
    }

    // 4. Send Confirmation Email
    try {
      await sendOrderConfirmationEmail(insertedOrder as Order);
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // We don't fail the order if the email fails, just log it
    }

    return NextResponse.json({ success: true, order: insertedOrder });
  } catch (error) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
