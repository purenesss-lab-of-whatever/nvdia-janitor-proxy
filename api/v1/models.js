module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  try {
    const models = [
      { id: 'deepseek-r1', object: 'model', created: 1234567890, owned_by: 'nvidia' },
      { id: 'deepseek-r1-distill-llama-70b', object: 'model', created: 1234567890, owned_by: 'nvidia' },
      { id: 'deepseek-r1-distill-qwen-32b', object: 'model', created: 1234567890, owned_by: 'nvidia' },
      { id: 'deepseek-r1-distill-qwen-14b', object: 'model', created: 1234567890, owned_by: 'nvidia' },
      { id: 'deepseek-r1-distill-qwen-7b', object: 'model', created: 1234567890, owned_by: 'nvidia' },
      { id: 'deepseek-r1-distill-llama-8b', object: 'model', created: 1234567890, owned_by: 'nvidia' }
    ];

    res.status(200).json({
      object: 'list',
      data: models
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: { message: error.message } });
  }
};
