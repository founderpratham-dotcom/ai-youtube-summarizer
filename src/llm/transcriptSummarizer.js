const { callOpenRouterChat } = require('./openRouterClient');

function joinTranscriptText(transcriptSegments, maxChars) {
  const parts = [];
  let total = 0;
  for (const seg of transcriptSegments) {
    const text = seg.text || '';
    if (!text) continue;
    if (total + text.length > maxChars) break;
    parts.push(text);
    total += text.length + 1;
  }
  return parts.join(' ');
}

async function summarizeTranscript({ transcriptSegments, metadata, input }, { config }) {
  const transcriptText = joinTranscriptText(
    transcriptSegments,
    config.limits.transcriptMaxChars
  );

  const systemPrompt = 'You are an assistant that summarizes YouTube videos into concise, structured notes. Keep the summary factual and neutral.';

  const userPrompt = `Video title: ${metadata.title || 'Unknown'}\nChannel: ${metadata.channelName || 'Unknown'}\n\nTranscript (partial or full):\n${transcriptText}\n\nWrite a concise summary (5-10 bullet points) in ${input.summaryLanguage}. Focus on the main ideas and, if possible, mention approximate sections (e.g., beginning/middle/end).`;

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
    language: input.summaryLanguage,
    text: content,
    keyPoints: [] // Can be extracted in a later refinement using a JSON-style prompt
  };
}

module.exports = {
  summarizeTranscript
};
