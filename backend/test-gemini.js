const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  const genAI = new GoogleGenerativeAI('AIzaSyDVR1reBBL6hkhPuU74cV8BP_gBiYXgcSI');
  try {
    // The SDK does not natively expose a simple listModels, but we can fetch it via HTTP
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyDVR1reBBL6hkhPuU74cV8BP_gBiYXgcSI');
    const data = await res.json();
    console.log(data.models.map(m => m.name));
  } catch(e) {
    console.log(e.message);
  }
}

test();
