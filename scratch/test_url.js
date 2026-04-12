const imageUrl = 'https://jxivchmrvtetiijdpehp.supabase.co/storage/v1/object/public/product-images/e4105692-c182-4136-a15a-f096f4fc8c55.JPG';

async function testImage() {
  try {
    const response = await fetch(imageUrl);
    console.log(`URL: ${imageUrl}`);
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
    
    if (response.status !== 200) {
        const body = await response.text();
        console.log(`Error Body: ${body}`);
    } else {
        console.log('Success! Image is accessible.');
    }
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

testImage();
