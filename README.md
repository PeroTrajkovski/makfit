<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# МакФит (MakFit) - AI-Powered Fitness & Meal Planning App

A modern, cross-platform fitness application featuring AI-powered meal planning, weight tracking, challenges, and progress photo management. Built with React, Vite, Firebase, and Capacitor for seamless web and mobile experiences.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Running the App](#running-the-app)
- [Building for Production](#building-for-production)
- [Mobile Development](#mobile-development)
- [Environment Configuration](#environment-configuration)
- [Key Features Documentation](#key-features-documentation)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- **AI Meal Planning**: Generate personalized weekly meal plans using Google's Gemini API
- **Weight Tracking**: Log and visualize weight progress over time
- **Fitness Challenges**: Participate in gamified challenges with badges and rewards
- **Progress Photos**: Store and compare progress photos with date tracking
- **Authentication**: Secure email/password and Google OAuth authentication
- **User Profiles**: Customizable profiles with dietary preferences and fitness goals
- **Dashboard**: Real-time overview of stats, macros, and progress
- **Subscription Management**: Built-in subscription plans and management
- **Cross-Platform**: Works on web, iOS, and Android via Capacitor
- **Dark Mode Support**: Beautiful UI with theme customization
- **Search Functionality**: Search meals, challenges, and other content

## 🛠 Tech Stack

**Frontend:**
- React 19 with TypeScript
- Vite 6 (build tool)
- Tailwind CSS 4 with Tailwind Merge
- Motion (animations)
- Lucide React (icons)
- Recharts (data visualization)

**Backend & Services:**
- Node.js with Express (development server)
- Firebase (Authentication & Firestore)
- Google Gemini API (AI meal planning)
- Capacitor 8 (cross-platform mobile)

**Mobile Platforms:**
- Android (Gradle-based build)
- iOS (SwiftUI integration)
- Google Auth for mobile

## 📋 Prerequisites

- **Node.js**: v18+ (LTS recommended)
- **npm**: v9+
- **Java Development Kit (JDK)**: 11+ (for Android development)
- **Android Studio** or **Android SDK** (for Android builds)
- **Xcode** (for iOS development on macOS)
- **Git**: For version control

## 📁 Project Structure

```
makfit/
├── src/                          # React application source
│   ├── components/               # Reusable React components
│   │   ├── Button.tsx           # Custom button component
│   │   ├── Input.tsx            # Custom input component
│   │   ├── InfoModal.tsx        # Modal dialog component
│   ├── views/                   # Main app pages/views
│   │   ├── AuthView.tsx         # Login/registration
│   │   ├── DashboardView.tsx    # Main dashboard
│   │   ├── AiMealPlanView.tsx   # Meal planning
│   │   ├── WeightView.tsx       # Weight tracking
│   │   ├── ChallengesView.tsx   # Fitness challenges
│   │   ├── ProfileView.tsx      # User profile
│   │   ├── SearchView.tsx       # Search functionality
│   │   ├── ProgressPhotosView.tsx
│   │   ├── SubscriptionView.tsx
│   │   └── OnboardingView.tsx
│   ├── data/                    # Static data & utilities
│   │   ├── challengeItems.ts    # Challenge definitions
│   │   ├── foods.ts             # Food database
│   │   ├── mealPlanData.ts      # Meal planning logic
│   │   └── themes.ts            # Theme configurations
│   ├── utils/                   # Utility functions
│   │   ├── badges.ts            # Badge/achievement logic
│   │   ├── macros.ts            # Macro calculation
│   │   ├── dashboardDate.ts     # Date utilities
│   │   ├── errors.ts            # Error handling
│   │   ├── leveling.ts          # Leveling system
│   │   └── cn.ts                # Class name utilities
│   ├── App.tsx                  # Main app component
│   ├── firebase.ts              # Firebase configuration
│   ├── types.ts                 # TypeScript type definitions
│   ├── ErrorBoundary.tsx        # Error boundary component
│   ├── main.tsx                 # App entry point
│   └── index.css                # Global styles
├── public/                       # Static assets
│   └── manifest.json            # PWA manifest
├── android/                     # Android native code
│   └── app/                     # Main Android app
├── vite.config.ts               # Vite configuration
├── capacitor.config.ts          # Capacitor configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.js           # Tailwind CSS config
├── package.json                 # Dependencies
├── firebase.json                # Firebase project config
├── firebase-applet-config.json  # Firebase app credentials
└── README.md                    # This file
```

## 🚀 Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd makfit
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

You can obtain a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

### 3. Firebase Configuration

Firebase config is loaded from `firebase-applet-config.json`. Ensure it contains:
- API Key
- Project ID
- Auth Domain
- Database URL
- App ID

Contact the development team for production credentials.

### 4. Linting

Check TypeScript types and catch errors:

```bash
npm run lint
```

## ▶️ Running the App

### Development Mode

```bash
npm run dev
```

This starts:
- Vite dev server (with hot module replacement)
- Express server for backend
- Available at: `http://localhost:5173`

The app uses persistent Firestore caching with a 20 MB limit for offline support.

### Preview Production Build Locally

```bash
npm run build
npm run preview
```

## 🔨 Building for Production

### Web Build

```bash
npm run build
```

Output is generated in the `dist/` folder, ready for deployment to web servers, Firebase Hosting, or CDNs.

### Clean Build

```bash
npm run clean
npm run build
```

## 📱 Mobile Development

### Android

**Setup:**
```bash
npm run cap:add:ios          # One-time iOS setup
npm run cap:sync:android    # Sync web assets to Android
```

**Open in Android Studio:**
```bash
npm run cap:open:android
```

**Build APK/AAB:**
- Use Android Studio's Build menu for debug/release builds

**Configuration:**
- App ID: `com.makfit.app`
- App Name: `МакФит`
- Google Auth Server ID in `capacitor.config.ts`

### iOS

**Setup:**
For first-time iOS setup, see [IOS_SETUP.md](IOS_SETUP.md) for safe setup instructions.

```bash
npm run cap:add:ios         # One-time setup
npm run cap:sync:ios       # Sync web assets
npm run cap:open:ios       # Open in Xcode
```

**Build in Xcode:**
- Select target device/simulator
- Build with `Cmd + B`
- Run with `Cmd + R`

**Important:** Capacitor multi-platform setup allows iOS and Android to coexist in the same project.

### Syncing Changes

After modifying React code:
```bash
npm run build
npm run cap:sync            # Syncs to both platforms
# or specific platform:
npm run cap:sync:android
npm run cap:sync:ios
```

## ⚙️ Environment Configuration

### Vite Configuration

- **React Plugin**: Fast refresh for development
- **Tailwind CSS**: Vite integration for JIT compilation
- **Path Alias**: `@` resolves to project root
- **HMR**: Auto-disabled in AI Studio environments

### Firebase Firestore

- **Cache Strategy**: Persistent local cache (20 MB max)
- **Multi-Tab Support**: Safe with single-tab manager
- **Auto-Cleanup**: Old data beyond cache limit removed automatically
- **Offline-First**: Queries read from cache when offline

### Authentication

Supports:
- Email/Password (Firebase Auth)
- Google OAuth (Capacitor GoogleAuth plugin)
- Server Client ID: `145514988309-e1qs6ctiubml3b4cepuod5s3oudjqdiq.apps.googleusercontent.com`

## 📚 Key Features Documentation

### Meal Planning (`src/data/mealPlanData.ts`)
- Generate weekly meal plans with macro targeting
- Integrates with Gemini API for recipe generation
- Dietary preference customization

### Challenges (`src/data/challengeItems.ts`)
- Gamified fitness challenges
- Badge and reward system
- Challenge swap mechanics
- Difficulty scaling

### Macros Calculation (`src/utils/macros.ts`)
- Calculate protein, carbs, fats from meals
- Daily/weekly macro tracking
- Goal adjustment utilities

### Badge System (`src/utils/badges.ts`)
- Achievement tracking
- Challenge completion badges
- Progress milestones

### Weight Tracking
- Log weight with timestamps
- View trends with Recharts visualization
- Compare against goals

## 🔒 Security

- Firebase Security Rules in `firestore.rules`
- Password hashing with bcryptjs
- JWT token support for API endpoints
- Environment variables for sensitive keys

## 📦 Dependencies Highlights

- **@capacitor/core**: Cross-platform bridge
- **firebase**: Backend & real-time database
- **@google/genai**: Gemini API client
- **motion**: Smooth animations
- **recharts**: Charts and graphs
- **lucide-react**: Icon library
- **tailwind-css**: Utility-first styling

## 🐛 Troubleshooting

### Hot Module Replacement (HMR) Issues
- HMR is disabled in AI Studio to prevent flickering
- Manually refresh browser if changes don't appear

### Firebase Connection Errors
- Verify Firebase credentials in `firebase-applet-config.json`
- Check internet connection
- Review Firestore security rules in `firestore.rules`

### Capacitor Sync Failures
- Clear build caches: `npm run clean`
- Rebuild: `npm run build`
- Resync: `npm run cap:sync`

### Android Build Issues
- Ensure Android SDK is installed via Android Studio
- Check `local.properties` contains valid SDK path
- Clear Android build cache: `rm -rf android/app/build`

### iOS Build Issues
- Run from macOS with Xcode installed
- Pod dependencies: `cd ios/App && pod install`
- Follow [IOS_SETUP.md](IOS_SETUP.md)

### Missing Gemini API Key
- Generate at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Add to `.env.local` as `GEMINI_API_KEY=...`
- Restart dev server after adding

## 📄 Additional Files

- **[IOS_SETUP.md](IOS_SETUP.md)**: iOS development guide
- **capacitor.config.ts**: Platform and plugin configuration
- **vite.config.ts**: Bundler configuration
- **tsconfig.json**: TypeScript compiler options
- **firebase.json**: Firebase deployment config

## 🤝 Contributing

1. Create a feature branch
2. Make changes with clear commits
3. Run `npm run lint` to check types
4. Test on both web and mobile
5. Submit PR with detailed description

## 📞 Support

For issues, questions, or contributions:
- Check existing GitHub issues
- Review error logs in browser console
- Consult [IOS_SETUP.md](IOS_SETUP.md) for platform-specific issues
- Review individual utility files for feature documentation

---

**Last Updated**: June 2026  
**Version**: 1.0.0  
**License**: [Add your license here]
