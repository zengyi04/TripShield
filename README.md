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
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

### Expo (`npm start` / tunnel) on Codespaces or Linux

If you see `libatk-1.0.so.0: cannot open shared object file` while Metro is starting, Expo is trying to install the desktop React Native DevTools shell. That is harmless for bundling but noisy.

- **Codespaces:** Rebuild the dev container (`.devcontainer/devcontainer.json` sets `EXPO_UNSTABLE_HEADLESS=1`), or add that variable to a local `.env` / `.env.local`.
- **One-off:** `EXPO_UNSTABLE_HEADLESS=1 npm start`

You can still debug in the browser via Expo’s web tooling; only the standalone Fusebox shell is skipped.
