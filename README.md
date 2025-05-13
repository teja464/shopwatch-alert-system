
# Shop Security Monitor - Mobile Installation Guide

This guide will help you get the Shop Security Monitor app running on your mobile device.

## Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)
- Git
- For iOS: Mac computer with Xcode installed
- For Android: Android Studio with SDK tools installed

## Step 1: Clone the repository to your laptop

1. Transfer the project to your own GitHub repository using the "Export to GitHub" button in Lovable
2. Clone the project to your local machine:
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd shopwatch-alert-system
```

## Step 2: Install dependencies

```bash
npm install
```

## Step 3: Add mobile platforms

For Android:
```bash
npx cap add android
```

For iOS (Mac only):
```bash
npx cap add ios
```

## Step 4: Update native platforms

After adding the platforms, update the native projects:

For Android:
```bash
npx cap update android
```

For iOS:
```bash
npx cap update ios
```

## Step 5: Add MP3 Alarm Sound File

**IMPORTANT:** You need to add an alarm sound file to make the alarm function properly:

1. Download a suitable alarm sound MP3 file
2. Name it `alarm-sound.mp3`
3. Place it in the `public/` folder of your project

## Step 6: Build the web app

```bash
npm run build
```

## Step 7: Sync the web code to the native projects

```bash
npx cap sync
```

## Step 8: Run on a device or emulator

For Android:
```bash
npx cap run android
```

For iOS:
```bash
npx cap run ios
```

## Making Changes

After making changes to the web code:

1. Rebuild the project: `npm run build`
2. Sync changes to native projects: `npx cap sync`
3. Run on device again: `npx cap run android` or `npx cap run ios`

## Troubleshooting

- Make sure your phone is in developer mode and connected to your computer
- For Android, enable USB debugging in developer options
- For iOS, trust the computer on your device when prompted
- Check that you have the latest Xcode or Android Studio installed
- If alarm doesn't work, verify you've added the alarm-sound.mp3 file to the public folder

## Important Notes

- The app requires camera permissions to detect motion
- Allow notifications when prompted for alarm functionality
- The app must be running (at least in background) to monitor for motion
- Shop closing hours determine when motion detection is active
