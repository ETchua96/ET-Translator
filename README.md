# ET Translator

English ↔ Simplified Chinese translation for work. Includes Hanyu Pinyin, plain meanings, business terms, and alternative wording. DeepSeek is the default provider; Gemini is available from the provider switch.

Live app: https://ettranslate.eetiong96.workers.dev/

## Project layout

- `public/`: HTML, CSS, browser JavaScript, and favicon.
- `src/index.js`: the single Cloudflare Worker backend source.
- `scripts/`: local preview and deployment build.
- `tests/`: translation, UI, security, and generated Worker tests.
- `dist/index.js`: generated Worker containing the current public assets. Ignored by Git.

Edit source files only. The build embeds the current public assets automatically. Do not edit or commit generated deployment files.

## Develop locally

Requires Node.js 22 or later.

```powershell
npm install
npm run serve
```

Open http://localhost:4173. Without a key for the selected provider, local preview returns sample translations.

For real local translations, set `DEEPSEEK_API_KEY` or `GEMINI_API_KEY` in the terminal environment before starting the server. Never commit API keys.

## Check and deploy

```powershell
npm run check
npm test
npm run deploy
```

`npm test` builds the deployment file first. Wrangler also runs the build automatically before deployment and preserves dashboard variables with `--keep-vars`. The target is the existing `ettranslate` Cloudflare Worker configured in `wrangler.toml`.

For Cloudflare Git builds, use `npm install` as the install command and `npm run deploy` as the deploy command.

### Cloudflare settings

- Secret `DEEPSEEK_API_KEY`: required for DeepSeek.
- Secret `GEMINI_API_KEY`: required for Gemini.
- Optional `DEEPSEEK_MODEL`: defaults to `deepseek-flash`.
- Optional `GEMINI_MODEL`: defaults to `gemini-3.5-flash`.
- Optional `ADMIN_PIN` and `USAGE_KV` binding: enable the usage dashboard at `/admin/usage?pin=YOUR_PIN`.
- `DAILY_DEVICE_LIMIT=0` and `DAILY_TOTAL_LIMIT=0` mean unlimited and are the code defaults.

Keys remain on the Worker. Translation history and cached results remain in the current browser session. Supabase is not needed.

## Android projects

Android sources are maintained separately so this repository stays focused on JavaScript, HTML, and CSS:

- [ET-Translator-Android](https://github.com/ETchua96/ET-Translator-Android): the online Android WebView wrapper.
- [ET-Translator-Offline-Archive](https://github.com/ETchua96/ET-Translator-Offline-Archive): the archived experimental native Qwen translator.

Both repositories are private. Existing APK installations load the live site and do not need rebuilding for web UI updates. Old source snapshots remain recoverable from this repository's Git history.
