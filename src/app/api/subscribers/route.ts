import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/constants';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET: Fetch all subscribers for admin
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Could not query subscribers table from Supabase:', error.message);
      return NextResponse.json({
        success: true,
        subscribers: [],
        tableMissing: true,
        error: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      subscribers: data || [],
    });
  } catch (err: any) {
    console.error('Error fetching subscribers:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST: Add new newsletter subscriber
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawEmail = body.email;

    if (!rawEmail || typeof rawEmail !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid email address is required.' },
        { status: 400 }
      );
    }

    const email = rawEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('subscribers')
      .insert([{ email }])
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation (code 23505 or duplicate error)
      if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique')) {
        return NextResponse.json({
          success: true,
          alreadySubscribed: true,
          message: "You're already subscribed to Cosmevo updates!",
        });
      }

      console.warn('Supabase subscribers insert error:', error.message);
      const isRlsError = error.message?.includes('row-level security') || error.code === '42501';
      return NextResponse.json({
        success: false,
        error: isRlsError
          ? 'Database permission error. Please run supabase_subscribers_setup.sql in your Supabase SQL editor to enable subscriptions.'
          : error.message,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      subscriber: data,
      message: "Thanks for subscribing to Cosmevo!",
    });
  } catch (err: any) {
    console.error('Error in /api/subscribers POST:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE: Remove subscriber (admin action)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (!id && !email) {
      return NextResponse.json(
        { success: false, error: 'Missing subscriber id or email to delete.' },
        { status: 400 }
      );
    }

    let query = supabase.from('subscribers').delete();
    if (id) {
      query = query.eq('id', id);
    } else if (email) {
      query = query.eq('email', email.trim().toLowerCase());
    }

    const { error } = await query;
    if (error) {
      console.error('Supabase subscribers delete error:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Subscriber removed successfully.',
    });
  } catch (err: any) {
    console.error('Error in /api/subscribers DELETE:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
