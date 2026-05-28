import https from 'https';

const urls = {
  'placeholder in Img_inmuebles (singular)': 'https://tcoevrfhrkyykldqqkym.supabase.co/storage/v1/object/public/Img_inmuebles/inmueble/personal/.emptyFolderPlaceholder',
  'placeholder in img_inmuebles (lowercase)': 'https://tcoevrfhrkyykldqqkym.supabase.co/storage/v1/object/public/img_inmuebles/inmueble/personal/.emptyFolderPlaceholder',
  'placeholder in IMG_INMUEBLES (uppercase)': 'https://tcoevrfhrkyykldqqkym.supabase.co/storage/v1/object/public/IMG_INMUEBLES/inmueble/personal/.emptyFolderPlaceholder',
};

async function checkUrl(name, url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          name,
          statusCode: res.statusCode,
          body: data.substring(0, 200)
        });
      });
    }).on('error', (err) => {
      resolve({ name, error: err.message });
    });
  });
}

async function run() {
  for (const [name, url] of Object.entries(urls)) {
    const result = await checkUrl(name, url);
    console.log(`URL Type: ${result.name}`);
    console.log(`  Status: ${result.statusCode}`);
    console.log(`  Body:   ${result.body}`);
    console.log('---');
  }
}

run();
