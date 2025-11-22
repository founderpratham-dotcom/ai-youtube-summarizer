const axios = require('axios');

function getYouTubeApiKey(config, log) {
  const key = process.env[config.youtube.apiKeyEnvVar];
  if (!key) {
    if (log && typeof log.warning === 'function') {
      log.warning('YOUTUBE_API_KEY is not set; video metadata will be minimal (no title/stats).');
    }
    return null;
  }
  return key;
}

function parseIsoDurationToSeconds(duration) {
  if (!duration || typeof duration !== 'string') return null;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;
  const hours = parseInt(match[1] || '0', 10);
  const mins = parseInt(match[2] || '0', 10);
  const secs = parseInt(match[3] || '0', 10);
  return hours * 3600 + mins * 60 + secs;
}

async function fetchVideoMetadata(videoId, { config, log }) {
  const apiKey = getYouTubeApiKey(config, log);

  // If no API key, return minimal metadata so the rest of the pipeline can continue.
  if (!apiKey) {
    return {
      videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      title: null,
      channelName: null,
      durationSeconds: null,
      publishedAt: null,
      stats: {
        viewCount: null,
        likeCount: null
      }
    };
  }

  const url = `${config.youtube.apiBaseUrl}/videos`;

  const { data } = await axios.get(url, {
    params: {
      key: apiKey,
      id: videoId,
      part: 'snippet,contentDetails,statistics'
    }
  });

  const item = data.items?.[0];
  if (!item) {
    throw new Error(`Video not found for ID ${videoId}`);
  }

  const snippet = item.snippet || {};
  const contentDetails = item.contentDetails || {};
  const statistics = item.statistics || {};

  return {
    videoId,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    title: snippet.title || null,
    channelName: snippet.channelTitle || null,
    durationSeconds: parseIsoDurationToSeconds(contentDetails.duration),
    publishedAt: snippet.publishedAt || null,
    stats: {
      viewCount: statistics.viewCount ? Number(statistics.viewCount) : null,
      likeCount: statistics.likeCount ? Number(statistics.likeCount) : null
    }
  };
}

module.exports = {
  fetchVideoMetadata
};
