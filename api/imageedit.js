import multiparty from 'multiparty';

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const IMAGEROUTER_KEY = process.env.VITE_IMAGEROUTER_API_KEY;
  if (!IMAGEROUTER_KEY) {
    return res.status(500).json({ error: 'ImageRouter API key not configured' });
  }

  try {
    // Parse the multipart form data
    const { fields, files } = await new Promise((resolve, reject) => {
      const form = new multiparty.Form();
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    // Rebuild FormData for the outgoing request
    const { default: FormData } = await import('form-data');
    const fs = await import('fs');
    const outForm = new FormData();

    // Add text fields
    for (const [key, values] of Object.entries(fields)) {
      outForm.append(key, values[0]);
    }

    // Add image file
    if (files.image && files.image[0]) {
      const file = files.image[0];
      outForm.append('image', fs.createReadStream(file.path), {
        filename: file.originalFilename,
        contentType: file.headers['content-type']
      });
    }

    const response = await fetch(
      'https://api.imagerouter.io/v1/openai/images/edits',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${IMAGEROUTER_KEY}`,
          ...outForm.getHeaders()
        },
        body: outForm
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('ImageRouter edit proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
