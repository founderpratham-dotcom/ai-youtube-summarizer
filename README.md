# AI YouTube Summarizer Actor

This Apify actor takes one or more YouTube URLs, fetches metadata, transcripts, and optionally comments, then summarizes them using OpenRouter (gpt-4o-mini) and stores structured results in an Apify dataset.

## Input

The actor input is defined in `INPUT_SCHEMA.json`, so the Apify platform will render a form automatically. The main fields are:

- `startUrls` (array, required): YouTube video / playlist / channel URLs to process.
- `maxVideos` (integer, optional): Hard limit on the total number of videos to summarize.
- `includeComments` (boolean, default `true`): Whether to fetch top comments and create a comment summary (requires `YOUTUBE_API_KEY`).
- `maxCommentsPerVideo` (integer, optional, default `50`): How many top comments to analyze per video.
- `summaryLanguage` (string, default `"en"`): Language for the main summary.
- `translationLanguages` (array of strings, optional): Extra languages for translations (reserved for future use).
- `includeFullTranscript` (boolean, default `false`): If `true`, full transcripts are stored to key-value store.
- `modelConfig` (object, optional): Advanced model tuning (`model`, `temperature`, `maxTokens`).
- `clientId` / `requestId` (strings, optional): Opaque IDs for correlating runs.

## Requirements

- `OPENROUTER_API_KEY` in environment or Apify Secrets.
- (Recommended) `YOUTUBE_API_KEY` for reliable metadata and comments.

## Running locally

```bash
npm install
npm start
```

Configure actor input in the Apify Console or via `Actor.getInput()` when running programmatically.
