# AI YouTube Summarizer Actor

This Apify actor takes one or more YouTube URLs, fetches metadata, transcripts, and optionally comments, then summarizes them using OpenRouter (gpt-4o-mini) and stores structured results in an Apify dataset.

## Requirements

- `OPENROUTER_API_KEY` in environment or Apify Secrets.
- (Recommended) `YOUTUBE_API_KEY` for reliable metadata and comments.

## Running locally

```bash
npm install
npm start
```

Configure actor input in the Apify Console or via `Actor.getInput()` when running programmatically.
