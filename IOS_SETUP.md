# iOS Setup (Safe, Android-First Flow)

This project supports both Android and iOS in one codebase.
Use this sequence to add iOS without breaking Android.

## 1) Pre-checks (run in project root)

```bash
npm install
npm run build
npm run cap:sync:android
```

If Android still builds and runs as before, proceed.

## 2) Add iOS platform files

Install iOS Capacitor package and generate native iOS project:

```bash
npm install
npm run cap:add:ios
npm run cap:sync:ios
```

Notes:
- `cap add ios` creates the `ios/` folder once.
- `cap sync ios` copies web assets and plugin config to iOS project.

## 3) Open and configure in Xcode (Mac only)

```bash
npm run cap:open:ios
```

Then in Xcode:
- Select your Team under Signing & Capabilities.
- Confirm Bundle Identifier (should align with appId in `capacitor.config.ts`).
- Set Deployment Target (iOS version you support).

## 4) iOS privacy permissions (required)

Add these keys in `ios/App/App/Info.plist`:
- `NSCameraUsageDescription` (barcode scanner and camera flows)
- `NSPhotoLibraryUsageDescription` (if user can pick photos)
- `NSPhotoLibraryAddUsageDescription` (if app saves photos)

Suggested Macedonian text:
- Camera: "МакФит користи камера за скенирање баркодови и додавање прогрес фотографии."
- Photo library read: "МакФит користи пристап до фотографии за избор на прогрес слики."
- Photo library add: "МакФит зачувува прогрес фотографии во вашата библиотека кога ќе изберете зачувување."

## 5) Google Sign-In for iOS

Because native Google auth is used, configure iOS client properly:
- In Google Cloud/Firebase, create iOS OAuth client for your iOS bundle ID.
- Download `GoogleService-Info.plist` and add it to Xcode target.
- Add URL scheme from the plist (`REVERSED_CLIENT_ID`) in Xcode URL Types.
- Keep Android and iOS client IDs separate.

## 6) Keep Android safe while enabling iOS

After any iOS changes, run both sync paths:

```bash
npm run build
npm run cap:sync:android
npm run cap:sync:ios
```

This keeps both native shells updated from the same web build.

## 7) Validate both platforms

Android:
```bash
npm run cap:open:android
```

iOS:
```bash
npm run cap:open:ios
```

Verify at least:
- Email/password auth
- Google login
- Barcode scan camera permission flow
- Profile photo pick/capture flow
- Premium/subscription screens behavior

## 8) App Store requirement to plan now

Your current premium flow appears app-simulated. For App Store release of digital premium features, integrate real iOS in-app purchases (StoreKit) and restore purchases flow.

## 9) CI/CD recommendation

Use one repo and one branch strategy:
- Build web once (`npm run build`)
- Sync Android and iOS
- Produce Android artifact in Android pipeline
- Produce iOS archive in macOS/Xcode pipeline

---

## Quick command order (copy/paste)

```bash
npm install
npm run build
npm run cap:sync:android
npm run cap:add:ios
npm run cap:sync:ios
npm run cap:open:ios
```

If anything fails, do not delete `android/`; fix iOS step and re-run `npm run cap:sync:android` to keep Android healthy.
