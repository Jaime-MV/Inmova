// Native fetch will be used

async function run() {
  try {
    const res = await fetch('http://localhost:3000/');
    const data = await res.json();
    console.log('API Status Response:', data);
  } catch (err: any) {
    console.error('API connection failed:', err.message);
  }
}

run();
