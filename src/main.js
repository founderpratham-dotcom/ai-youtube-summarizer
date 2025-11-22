const { Actor, Dataset, log } = require('apify');
const fs = require('fs');
const path = require('path');
const { inputSchema } = require('./schemas/inputSchema');
const { processVideoBatch } = require('./pipeline/videoProcessor');
const config = require('./config');

Actor.main(async () => {
  let rawInput = await Actor.getInput();

  // Fallback for local runs: read ./local-input.json if Apify input is empty
  if (!rawInput) {
    try {
      const localPath = path.join(process.cwd(), 'local-input.json');
      const contents = fs.readFileSync(localPath, 'utf-8');
      rawInput = JSON.parse(contents);
      log.info('Loaded input from local-input.json');
    } catch (err) {
      log.warning('No Apify input and failed to load local-input.json; using empty input', { error: err.message });
      rawInput = {};
    }
  }

  const parsed = inputSchema.parse(rawInput);

  log.info('Actor input parsed', {
    startUrlsCount: parsed.startUrls.length,
    maxVideos: parsed.maxVideos ?? null,
    includeComments: parsed.includeComments
  });

  const context = {
    apify: { Actor, Dataset, log },
    config,
    input: parsed
  };

  const resultStats = await processVideoBatch(context);

  log.info('Run finished', resultStats);
});
