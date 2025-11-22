const { YoutubeTranscript } = require('youtube-transcript');

async function fetchTranscript(videoId, { log }) {
  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const raw = await YoutubeTranscript.fetchTranscript(url);
    // raw: [{ text, duration, offset }]
    return raw.map(seg => {
      const startSeconds = seg.offset / 1000;
      const endSeconds = (seg.offset + seg.duration) / 1000;
      return {
        text: seg.text,
        startSeconds,
        endSeconds
      };
    });
  } catch (err) {
    if (log) log.warning('Failed to fetch transcript; continuing without transcript', { videoId, error: err.message });
    return [];
  }
}

module.exports = {
  fetchTranscript
};
