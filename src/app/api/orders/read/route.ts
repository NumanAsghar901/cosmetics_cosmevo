import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/constants';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL;
// Use service role key if available, otherwise anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { orderId, orderIds, isRead = true } = await req.json();

    const targetIds: string[] = orderIds ? orderIds : orderId ? [orderId] : [];

    if (targetIds.length === 0) {
      return NextResponse.json({ error: 'Missing orderId or orderIds' }, { status: 400 });
    }

    // Try updating is_read in Supabase
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ is_read: isRead })
        .in('id', targetIds)
        .select('id, is_read');

      if (error) {
        console.warn('Supabase is_read update error (column may need migration):', error.message);
        return NextResponse.json({ 
          success: true, 
          dbUpdated: false, 
          message: 'Saved locally. Run supabase_orders_read_setup.sql in Supabase to sync in database.',
          error: error.message 
        });
      }

      return NextResponse.json({ success: true, dbUpdated: true, data });
    } catch (dbErr: any) {
      console.warn('Database error while updating order read state:', dbErr);
      return NextResponse.json({ success: true, dbUpdated: false, error: dbErr?.message });
    }
  } catch (err: any) {
    console.error('Order read API error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
