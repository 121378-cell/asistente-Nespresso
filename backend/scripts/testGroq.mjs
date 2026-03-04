import 'dotenv/config';
import fetch from 'node-fetch';

async function testGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

  console.log(`--- Testing Groq Connection ---`);
  console.log(`Model: ${model}`);
  console.log(`API Key defined: ${!!apiKey}`);

  if (!apiKey) {
    console.error('Error: GROQ_API_KEY not found in environment.');
    process.exit(1);
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say hello in Spanish.' }
        ],
        max_tokens: 10
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Success! Groq response:');
      console.log(JSON.stringify(data.choices[0].message, null, 2));
    } else {
      console.error('❌ Groq API Error:');
      console.error(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Connection Error:');
    console.error(error);
  }
}

testGroq();
