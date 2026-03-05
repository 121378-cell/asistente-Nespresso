import 'dotenv/config';
import fetch from 'node-fetch';

async function testKimi() {
  const apiKey = process.env.KIMI_API_KEY;
  const model = process.env.KIMI_MODEL || 'moonshot-v1-8k';

  console.log(`--- Testing Kimi (Moonshot) Connection ---`);
  console.log(`Model: ${model}`);
  console.log(`API Key defined: ${!!apiKey}`);

  if (!apiKey || apiKey === 'your_kimi_api_key_here') {
    console.error('Error: Valid KIMI_API_KEY not found in environment.');
    process.exit(1);
  }

  try {
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'Eres un asistente útil.' },
          { role: 'user', content: 'Dime hola y confírmame que eres Kimi.' }
        ],
        max_tokens: 50
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Success! Kimi response:');
      console.log(JSON.stringify(data.choices[0].message, null, 2));
    } else {
      console.error('❌ Kimi API Error:');
      console.error(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Connection Error:');
    console.error(error);
  }
}

testKimi();
