const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const { error, data } = await supabase.from('reviews').delete().eq('is_dummy', true).select();
  console.log('Delete result:', data, 'Error:', error);
}
main();
