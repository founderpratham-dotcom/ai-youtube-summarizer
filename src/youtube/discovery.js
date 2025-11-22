const axios = require('axios');
const { classifyYouTubeUrl } = require('./urlUtils');

function getYouTubeApiKey(config, log) {
  const key = process.env[config.youtube.apiKeyEnvVar];
  if (!key) {
    if (log && typeof log.warning === 'function') {
      log.warning('YOUTUBE_API_KEY is not set; playlist expansion will be skipped.');
    }
    return null;
  }
  return key;
}

async function fetchPlaylistVideoIds(playlistId, maxVideos, { config, log }) {
  const apiKey = getYouTubeApiKey(config, log);
  if (!apiKey) return [];
  const baseUrl = `${config.youtube.apiBaseUrl}/playlistItems`;
  const videoIds = [];
  let pageToken;

  while (true) {
    const params = {
      key: apiKey,
      part: 'contentDetails',
      playlistId,
      maxResults: 50
    };
    if (pageToken) params.pageToken = pageToken;

    const { data } = await axios.get(baseUrl, { params });
    for (const item of data.items || []) {
      const vid = item.contentDetails?.videoId;
      if (vid) videoIds.push(vid);
      if (maxVideos && videoIds.length >= maxVideos) return videoIds;
    }

    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }

  return videoIds;
}

// For now we keep channel handling simple: log a warning and skip.
async function fetchChannelVideoIds(channelIdOrHandle, maxVideos, { log }) {
  log.warning('Channel URL support is not implemented yet; skipping channel', { channelIdOrHandle });
  return [];
}

async function expandStartUrlsToVideoIds(startUrls, { config, log, input }) {
  const ids = new Set();

  for (const url of startUrls) {
    const parsed = classifyYouTubeUrl(url);

    if (parsed.type === 'video' && parsed.videoId) {
      ids.add(parsed.videoId);
    } else if (parsed.type === 'playlist' && parsed.playlistId) {
      const maxForThis = input?.maxVideos || undefined;
      const playlistIds = await fetchPlaylistVideoIds(parsed.playlistId, maxForThis, { config, log });
      for (const vid of playlistIds) ids.add(vid);
    } else if (parsed.type === 'channel') {
      const channelIds = await fetchChannelVideoIds(parsed.channelIdOrHandle, input?.maxVideos, { log });
      for (const vid of channelIds) ids.add(vid);
    } else {
      log.warning('Unrecognized or unsupported YouTube URL', { url });
    }
  }

  return Array.from(ids);
}

module.exports = {
  expandStartUrlsToVideoIds
};
