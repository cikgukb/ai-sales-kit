export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const IMAGEROUTER_KEY = process.env.VITE_IMAGEROUTER_API_KEY;
  if (!IMAGEROUTER_KEY) {
    return res.status(500).json({ error: 'ImageRouter API key not configured' });
  }

  try {
    const response = await fetch(
      'https://api.imagerouter.io/v1/openai/images/generations',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${IMAGEROUTER_KEY}`,
          'Content-Type': 'application/json'
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
    console.error('ImageRouter proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
