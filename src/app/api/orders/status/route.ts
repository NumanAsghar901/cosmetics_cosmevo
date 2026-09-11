import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendOrderStatusEmail } from '@/lib/email';
import { Order } from '@/lib/types';

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/constants';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL;
// Use service role key to bypass RLS if available, otherwise fallback to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { orderId, newStatus, trackingNumber } = await req.json();

    if (!orderId || !newStatus) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cleanTracking = typeof trackingNumber === 'string' ? trackingNumber.trim() : undefined;

    // 1. Update status and tracking_number in Supabase
    let updatedOrder: any = null;
    const updatePayload: Record<string, any> = { status: newStatus };
    if (cleanTracking !== undefined) {
      updatePayload.tracking_number = cleanTracking || null;
    }

    const { data, error: updateError } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      // If tracking_number column is not in Supabase yet, fallback gracefully by storing in notes
      if (updateError.message?.includes('tracking_number') || updateError.message?.includes('column')) {
        console.warn('tracking_number column missing in orders table, retrying with fallback in notes:', updateError.message);

        // Fetch existing order notes
        const { data: currentOrder } = await supabase
          .from('orders')
          .select('notes')
          .eq('id', orderId)
          .single();

        let updatedNotes = currentOrder?.notes || '';
        if (cleanTracking) {
          updatedNotes = updatedNotes 
            ? `${updatedNotes} | Leopards Tracking: ${cleanTracking}`
            : `Leopards Tracking: ${cleanTracking}`;
        }

        const { data: fallbackData, error: fallbackError } = await supabase
          .from('orders')
          .update({ status: newStatus, notes: updatedNotes })
          .eq('id', orderId)
          .select()
          .single();

        if (fallbackError) {
          console.error('Fallback order status update failed:', fallbackError);
          return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
        }

        updatedOrder = {
          ...fallbackData,
          tracking_number: cleanTracking,
        };
      } else {
        console.error('Error updating order status:', updateError);
        return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
      }
    } else {
      updatedOrder = data;
    }

    // 2. Send status update email (including Leopards tracking if shipped)
    if (updatedOrder) {
      try {
        await sendOrderStatusEmail(updatedOrder as Order, newStatus, cleanTracking);
      } catch (emailError) {
        console.error('Error sending status email:', emailError);
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Status Update API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
