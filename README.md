# Pixel Pilot

A small personal AI web app that can:

- chat with an AI assistant and retain the current conversation in the page;
- generate square images from a prompt; and
- download generated images.

## Run it

1. Install a current [Node.js LTS release](https://nodejs.org/) (this includes `npm`).
2. In this folder, run `npm install`.
3. Copy `.env.example` to `.env` and replace `your_api_key_here` with your OpenAI API key.
4. Run `npm start` and visit `http://localhost:3000`.

Never put your API key in `public/` or paste it in the browser. The server reads it from `.env`.

## Files

- `server.mjs` — secure server routes for chat and image creation
- `public/` — the browser interface
- `.env.example` — environment variable template

The chat route uses the OpenAI Responses API and image route uses `gpt-image-1`.
