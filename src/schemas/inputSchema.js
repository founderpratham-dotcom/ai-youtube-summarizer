const { z } = require('zod');

const inputSchema = z.object({
  startUrls: z
    .array(z.string().url())
    .min(1, 'Provide at least one YouTube URL.'),
  maxVideos: z.number().int().positive().optional(),
  includeComments: z.boolean().default(true),
  maxCommentsPerVideo: z.number().int().positive().optional(),
  summaryLanguage: z.string().default('en'),
  translationLanguages: z.array(z.string()).optional(),
  includeFullTranscript: z.boolean().default(false),
  modelConfig: z
    .object({
      model: z.string().default('openai/gpt-4o-mini'),
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().int().positive().optional()
    })
    .optional(),
  clientId: z.string().optional(),
  requestId: z.string().optional()
});

module.exports = {
  inputSchema
};
