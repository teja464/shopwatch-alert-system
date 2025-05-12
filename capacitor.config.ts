
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c1762714456e4803b9ba8b496bea93ae',
  appName: 'shopwatch-alert-system',
  webDir: 'dist',
  server: {
    url: 'https://c1762714-456e-4803-b9ba-8b496bea93ae.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    path: 'android',
    // Add this if you need to specify a different SDK path
    // gradlePath: 'C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk'
  },
  plugins: {
    Camera: {
      permissions: ["camera"]
    }
  }
};

export default config;
