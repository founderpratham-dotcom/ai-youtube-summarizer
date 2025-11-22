function classifyYouTubeUrl(urlString) {
  let url;
  try {
    url = new URL(urlString);
  } catch {
    return { type: 'unknown', videoId: null, playlistId: null, channelIdOrHandle: null };
  }

  const host = url.hostname.toLowerCase();
  const path = url.pathname;
  const params = url.searchParams;

  // youtu.be short link → always a video
  if (host === 'youtu.be') {
    const videoId = path.replace('/', '') || null;
    return { type: 'video', videoId, playlistId: null, channelIdOrHandle: null };
  }

  if (!host.includes('youtube.com')) {
    return { type: 'unknown', videoId: null, playlistId: null, channelIdOrHandle: null };
  }

  // Watch URLs
  if (path === '/watch') {
    const videoId = params.get('v');
    const playlistId = params.get('list');
    if (playlistId && !videoId) {
      return { type: 'playlist', videoId: null, playlistId, channelIdOrHandle: null };
    }
    return { type: 'video', videoId, playlistId: playlistId || null, channelIdOrHandle: null };
  }

  // Playlist URLs
  if (path === '/playlist') {
    const playlistId = params.get('list');
    return { type: 'playlist', videoId: null, playlistId, channelIdOrHandle: null };
  }

  // Channel URLs
  const segments = path.split('/').filter(Boolean);
  if (segments[0] === 'channel' && segments[1]) {
    return { type: 'channel', videoId: null, playlistId: null, channelIdOrHandle: segments[1] };
  }
  if (segments[0] === 'c' && segments[1]) {
    return { type: 'channel', videoId: null, playlistId: null, channelIdOrHandle: segments[1] };
  }
  if (segments[0] && segments[0].startsWith('@')) {
    // Handle-based URL
    return { type: 'channel', videoId: null, playlistId: null, channelIdOrHandle: segments[0] };
  }

  // Fallback: treat unknown YouTube URL as video if v param exists
  const videoId = params.get('v');
  if (videoId) {
    return { type: 'video', videoId, playlistId: params.get('list'), channelIdOrHandle: null };
  }

  return { type: 'unknown', videoId: null, playlistId: null, channelIdOrHandle: null };
}

module.exports = {
  classifyYouTubeUrl
};
