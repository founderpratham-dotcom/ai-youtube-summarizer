module.exports = {
  youtube: {
    apiKeyEnvVar: "YOUTUBE_API_KEY",
    apiBaseUrl: "https://www.googleapis.com/youtube/v3"
  },
  openRouter: {
    apiKeyEnvVar: "OPENROUTER_API_KEY",
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "openai/gpt-4o-mini"
  },
  limits: {
    defaultMaxConcurrency: 3,
    transcriptMaxChars: 8000,
    commentTextMaxChars: 4000
  }
};
