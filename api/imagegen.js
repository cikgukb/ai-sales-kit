export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const REPLICATE_KEY = process.env.REPLICATE_API_TOKEN || process.env.VITE_REPLICATE_API_TOKEN;
  if (!REPLICATE_KEY) {
    return res.status(500).json({ error: 'Replicate API key not configured' });
  }

  try {
    const selectedModel = "google/nano-banana-2";
    const response = await fetch(
      `https://api.replicate.com/v1/models/${selectedModel}/predictions`,
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

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Replicate image proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
