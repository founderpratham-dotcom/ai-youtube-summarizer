const axios = require('axios');

function getYouTubeApiKey(config, log) {
  const key = process.env[config.youtube.apiKeyEnvVar];
  if (!key) {
    if (log && typeof log.warning === 'function') {
      log.warning('YOUTUBE_API_KEY is not set; comments will not be fetched.');
    }
    return null;
  }
  return key;
}

async function fetchTopComments(videoId, limit, { config, log }) {
  const apiKey = getYouTubeApiKey(config, log);
  if (!apiKey) return [];
  const baseUrl = `${config.youtube.apiBaseUrl}/commentThreads`;
  const comments = [];
  let pageToken;

  while (comments.length < limit) {
    const params = {
      key: apiKey,
      part: 'snippet',
      videoId,
      maxResults: Math.min(100, limit - comments.length),
      order: 'relevance',
      textFormat: 'plainText'
    };
    if (pageToken) params.pageToken = pageToken;

    const { data } = await axios.get(baseUrl, { params });

    for (const item of data.items || []) {
      const top = item.snippet?.topLevelComment?.snippet;
      if (!top) continue;
      comments.push({
        text: top.textDisplay || '',
        author: top.authorDisplayName || null,
        likeCount: top.likeCount ?? null,
        publishedAt: top.publishedAt || null,
        replyCount: item.snippet?.totalReplyCount ?? null
      });
      if (comments.length >= limit) break;
    }

    if (!data.nextPageToken || comments.length >= limit) break;
    pageToken = data.nextPageToken;
  }

  if (log) log.info('Fetched top comments', { videoId, count: comments.length });
  return comments;
}

module.exports = {
  fetchTopComments
};
