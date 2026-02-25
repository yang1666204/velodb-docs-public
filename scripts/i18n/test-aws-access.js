// curl -X POST "https://bedrock-runtime.us-east-1.amazonaws.com/model/us.anthropic.claude-3-5-haiku-20241022-v1:0/converse" \
//   -H "Content-Type: application/json" \
//   -H "Authorization: Bearer ${api-key}" \
//   -d '{
//     "messages": [
//         {
//             "role": "user",
//             "content": [{"text": "Hello"}]
//         }
//     ]
//   }'

// Node.js >= 18
// 用法：
// API_KEY=xxx node bedrock-test.mjs

const API_KEY = process.env.AWS_API_KEY;
console.log('API_KEY',API_KEY)
if (!API_KEY) {
  console.error('Missing API_KEY env');
  process.exit(1);
}

const url =
  'https://bedrock-runtime.us-east-1.amazonaws.com/model/' +
  'us.anthropic.claude-sonnet-4-20250514-v1:0/converse';

const body = {
  messages: [
    {
      role: 'user',
      content: [{ text: 'Hello' }],
    },
  ],
};

async function main() {
  console.log('url',url)
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Request failed:', res.status, text);
    process.exit(1);
  }

  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
