<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/eb3f7015-463a-4dbd-810b-387a9ae1cf83

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set `GEMINI_API_KEY` in [.env.local](.env.local)
3. Set `VITE_FIREBASE_API_KEY` in [.env.local](.env.local) (required for Firebase init)
4. Run the app:
   `npm run dev`

## Mobile Platforms

- Android and iOS can live in the same project (Capacitor multi-platform setup).
- For a safe iOS onboarding flow that preserves Android stability, see [IOS_SETUP.md](IOS_SETUP.md).

### Android Firebase Config (Security)

- Do not commit `android/app/google-services.json`.
- Use `android/app/google-services.json.example` as a template and keep your real file local.
- If a key is leaked, rotate/revoke it immediately in Google Cloud/Firebase before continuing development.

### Web Firebase Config (Security)

- `firebase-applet-config.json` no longer stores a real API key.
- Keep the real web key in local/hosted environment variable `VITE_FIREBASE_API_KEY`.
- If a key is leaked, rotate/revoke it in Google Cloud Console, then update your environment secrets.
