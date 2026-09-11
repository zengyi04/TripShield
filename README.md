# TripShield

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/53d1b511-7adf-4431-9531-e7afa983c54f

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`

   **Codespaces:** If `npm install` fails with `ENOTEMPTY` on `node_modules/...`, remove the folder and reinstall:

   ```bash
   npm run reinstall
   ```

   Or: `rm -rf node_modules && npm install`

   **Do not run** `npm audit fix --force` — it can remove or break packages (e.g. `chromium-edge-launcher`) and then `npm start` fails. If that happened, run `npm run reinstall` and use the lockfile from git (`git checkout package-lock.json` if you changed it).

2. **Codespaces / Expo:** add to `.env.local` (see [.env.example](.env.example)):

   ```bash
   EXPO_UNSTABLE_HEADLESS=1
   ```

3. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
4. Run the app:
   - Mobile UI: `npm start`
   - Web preview: `npm run dev`
