const { expandStartUrlsToVideoIds } = require('../youtube/discovery');
const { fetchVideoMetadata } = require('../youtube/videoMetadata');
const { fetchTranscript } = require('../youtube/transcriptFetcher');
const { fetchTopComments } = require('../youtube/commentsFetcher');
const { summarizeTranscript } = require('../llm/transcriptSummarizer');
const { summarizeComments } = require('../llm/commentSummarizer');

async function processVideoBatch({ apify: { Actor, Dataset, log }, config, input }) {
  const videoIds = await expandStartUrlsToVideoIds(input.startUrls, { config, log, input });
  const limitedVideoIds = input.maxVideos
    ? videoIds.slice(0, input.maxVideos)
    : videoIds;

  let successCount = 0;
  let failureCount = 0;

  for (const videoId of limitedVideoIds) {
    try {
      log.info('Processing video', { videoId });

      const [metadata, transcript] = await Promise.all([
        fetchVideoMetadata(videoId, { config, log }),
        fetchTranscript(videoId, { log })
      ]);

      let comments = [];
      if (input.includeComments) {
        const limit = input.maxCommentsPerVideo || 50;
        comments = await fetchTopComments(videoId, limit, { config, log });
      }

      const summary = await summarizeTranscript(
        { transcriptSegments: transcript, metadata, input },
        { config }
      );

      let commentSummary = null;
      if (input.includeComments && comments.length > 0) {
        commentSummary = await summarizeComments(comments, { input, config });
      }

      let transcriptKey = null;
      if (input.includeFullTranscript && transcript.length > 0) {
        transcriptKey = `transcript-${videoId}.json`;
        await Actor.setValue(transcriptKey, transcript);
      }

      const item = {
        ...metadata,
        summary,
        commentSummary,
        transcriptStored: Boolean(input.includeFullTranscript && transcript.length > 0),
        transcriptKey
      };

      await Dataset.pushData(item);
      successCount += 1;
    } catch (err) {
      failureCount += 1;
      log.exception(err, 'Failed to process video', { videoId });
    }
  }

  return {
    totalVideos: limitedVideoIds.length,
    successCount,
    failureCount
  };
}

module.exports = {
  processVideoBatch
};
