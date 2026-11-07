import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kavan.momentum',
  appName: 'Momentum',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  backgroundColor: '#F9F8F5',
  android: {
    backgroundColor: '#F9F8F5',
    allowMixedContent: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
