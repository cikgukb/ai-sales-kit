export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Support both VITE_ prefixed (for dev compat) and non-prefixed (Vercel best practice)
  const REPLICATE_KEY = process.env.REPLICATE_API_TOKEN || process.env.VITE_REPLICATE_API_TOKEN;
  if (!REPLICATE_KEY) {
    console.error('Missing env: REPLICATE_API_TOKEN and VITE_REPLICATE_API_TOKEN are both undefined');
    return res.status(500).json({ error: 'Replicate API key not configured. Sila tetapkan REPLICATE_API_TOKEN di Vercel Environment Variables.' });
  }

  try {
    const response = await fetch(
      'https://api.replicate.com/v1/models/anthropic/claude-4.5-sonnet/predictions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${REPLICATE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait'
        },
        body: JSON.stringify(req.body)
      }
    );

    let data = await response.json();

    if (!response.ok) {
      console.error('Replicate API error:', response.status, JSON.stringify(data));
      return res.status(response.status).json(data);
    }

    // If Prefer: wait timed out, poll until completion
    if (!data.output && data.status !== 'succeeded' && data.urls?.get) {
      const pollUrl = data.urls.get;
      for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 2000));
        
        const pollRes = await fetch(pollUrl, {
          headers: { 'Authorization': `Bearer ${REPLICATE_KEY}` }
        });
        
        if (!pollRes.ok) continue;
        
        data = await pollRes.json();
        console.log(`Poll attempt ${i + 1}: status=${data.status}`);
        
        if (data.status === 'succeeded' && data.output) break;
        if (data.status === 'failed' || data.status === 'canceled') {
          return res.status(500).json({ error: data.error || 'Prediction failed' });
        }
      }
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Replicate proxy error:', error);
    return res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
}
