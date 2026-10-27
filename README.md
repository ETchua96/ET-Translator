# ET Translator

A personal English ↔ Simplified Chinese translator for work chats, product requirements, meeting notes, and emails.

[Open ET Translator](https://ettranslate.eetiong96.workers.dev/)

## What it does

Translate in either direction with a choice of Business, Plain, or Polished tone. Alongside the translation, you get:

- Hanyu Pinyin with tone marks.
- A plain English explanation of the meaning.
- Key business terms and their meanings.
- Alternative ways to phrase the message.

The app uses Mainland Chinese business wording. DeepSeek is the default AI provider, with Gemini available as an alternative.

Recent translations stay in your current browser session. API keys stay on the server.

## Run locally

Install Node.js 22 or later, then run:

```powershell
npm install
npm run serve
```

Open [localhost:4173](http://localhost:4173). Without an API key, the preview shows sample results.

To use DeepSeek locally, set your key before starting the server:

```powershell
$env:DEEPSEEK_API_KEY="your-key"
npm run serve
```

For Gemini, set `GEMINI_API_KEY` instead and select Gemini in the app.

## Development

The frontend is in `public/`. The backend is in `src/index.js`.

```powershell
npm run check
npm test
```

The build generates `dist/index.js`, which contains the backend and web assets. Generated files are not committed.

## Deploy

Hosted on Cloudflare Workers. Add `DEEPSEEK_API_KEY` and/or `GEMINI_API_KEY` as secrets for the providers you use, then run:

```powershell
npm run deploy
```

Deployment builds the app automatically and preserves existing dashboard variables. For a separate installation, update the Worker name and account ID in `wrangler.toml` first.
