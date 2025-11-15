const axios = require('axios');

const NVIDIA_API_BASE = 'https://integrate.api.nvidia.com/v1';
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

const modelMap = {
  'deepseek-r1': 'deepseek/deepseek-r1',
  'deepseek-r1-distill-llama-70b': 'deepseek/deepseek-r1-distill-llama-70b',
  'deepseek-r1-distill-qwen-32b': 'deepseek/deepseek-r1-distill-qwen-32b',
  'deepseek-r1-distill-qwen-14b': 'deepseek/deepseek-r1-distill-qwen-14b',
  'deepseek-r1-distill-qwen-7b': 'deepseek/deepseek-r1-distill-qwen-7b',
  'deepseek-r1-distill-llama-8b': 'deepseek/deepseek-r1-distill-llama-8b'
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  try {
    const { model, messages, temperature, max_tokens, stream, top_p } = req.body;

    if (!model || !messages) {
      return res.status(400).json({ error: 'Missing required fields: model and messages' });
    }

    const nvidiaModel = modelMap[model] || model;

    const nvidiaRequest = {
      model: nvidiaModel,
      messages: messages,
      temperature: temperature || 0.7,
      top_p: top_p || 1,
      max_tokens: max_tokens || 1024,
      stream: stream || false
    };

    if (stream) {
      const response = await axios.post(
        `${NVIDIA_API_BASE}/chat/completions`,
        nvidiaRequest,
        {
          headers: {
            'Authorization': `Bearer ${NVIDIA_API_KEY}`,
            'Content-Type': 'application/json'
          },
          responseType: 'stream'
        }
      );

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      response.data.pipe(res);
    } else {
      const response = await axios.post(
        `${NVIDIA_API_BASE}/chat/completions`,
        nvidiaRequest,
        {
          headers: {
            'Authorization': `Bearer ${NVIDIA_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      res.status(200).json(response.data);
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: {
        message: error.response?.data?.error?.message || error.message,
        type: 'api_error',
        code: error.response?.status || 500
      }
    });
  }
};
