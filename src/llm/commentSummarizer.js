const { callOpenRouterChat } = require('./openRouterClient');

function serializeComments(comments, maxChars) {
  const lines = [];
  let total = 0;
  for (const c of comments) {
    const line = `- (${c.likeCount || 0} likes) ${c.text}`;
    if (total + line.length > maxChars) break;
    lines.push(line);
    total += line.length + 1;
  }
  return lines.join('\n');
}

async function summarizeComments(comments, { input, config }) {
  const textBlock = serializeComments(comments, config.limits.commentTextMaxChars);

  const systemPrompt = 'You analyze YouTube comments and summarize overall sentiment and key themes.';
  const userPrompt = `Here are some top comments from a YouTube video:\n\n${textBlock}\n\nSummarize:\n1. Overall viewer sentiment (positive, negative, mixed).\n2. Main themes people talk about.\n3. In one sentence: should someone watch this video?`;

  const content = await callOpenRouterChat(
    {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: input.modelConfig?.model,
      temperature: input.modelConfig?.temperature,
      maxTokens: input.modelConfig?.maxTokens
    },
    { config }
  );

  return {
    overallSentiment: null, // Could be parsed from content in a later refinement
    highlights: [],
    rawSummary: content
  };
}

module.exports = {
  summarizeComments
};
