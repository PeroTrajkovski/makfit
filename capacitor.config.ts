import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.makfit.app',
  appName: 'МакФит',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '145514988309-e1qs6ctiubml3b4cepuod5s3oudjqdiq.apps.googleusercontent.com',
      androidClientId: '145514988309-e1qs6ctiubml3b4cepuod5s3oudjqdiq.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
