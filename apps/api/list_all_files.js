import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tcoevrfhrkyykldqqkym.supabase.co';
const supabaseAnonKey = 'sb_publishable_SuK3k8G-V7F91VY7dqZC5g_omPyLhLf';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  // Let's list files inside 'inmueble'
  const { data: pData, error: pError } = await supabase.storage
    .from('Img_inmuebles')
    .list('inmueble');
    
  if (pError) console.error('Error:', pError);
  else console.log('Files under inmueble:', pData.map(f => f.name));
}

run().catch(console.error);
