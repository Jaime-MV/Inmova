import { createClient } from '@supabase/supabase-js';
import https from 'https';

const supabaseUrl = 'https://tcoevrfhrkyykldqqkym.supabase.co';
const supabaseAnonKey = 'sb_publishable_SuK3k8G-V7F91VY7dqZC5g_omPyLhLf';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Generating signed URL for '.emptyFolderPlaceholder' in 'inmueble/personal'...");
  const { data, error } = await supabase.storage
    .from('Img_inmuebles')
    .createSignedUrl('inmueble/personal/.emptyFolderPlaceholder', 60);
    
  if (error) {
    console.error('Error creating signed URL:', error);
    return;
  }
  
  console.log('Generated Signed URL successfully!');
  console.log('Signed URL:', data.signedUrl);
  
  // Test if signed URL works
  https.get(data.signedUrl, (res) => {
    console.log('HTTP Status accessing signed URL:', res.statusCode);
  }).on('error', (err) => {
    console.error('HTTP Error accessing signed URL:', err);
  });
}

run().catch(console.error);
