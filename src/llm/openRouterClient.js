const axios = require('axios');

async function callOpenRouterChat({ messages, model, temperature, maxTokens }, { config }) {
  const apiKey = process.env[config.openRouter.apiKeyEnvVar];
  if (!apiKey) {
    throw new Error(`Missing OpenRouter API key in env var ${config.openRouter.apiKeyEnvVar}`);
  }

  const payload = {
    model: model || config.openRouter.defaultModel,
    messages,
    temperature,
    max_tokens: maxTokens
  };

  const res = await axios.post(`${config.openRouter.baseUrl}/chat/completions`, payload, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  const choice = res.data.choices?.[0];
  return choice?.message?.content ?? '';
}

module.exports = {
  callOpenRouterChat
};
