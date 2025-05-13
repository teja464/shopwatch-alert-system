
# Shop Security Monitor - Installation Guide

This guide will help you get the Shop Security Monitor app running on your mobile device or as a web application.

## Web Application Setup

To run the application as a web application in your browser:

1. Clone the repository to your local machine:
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd shopwatch-alert-system
```

2. Install dependencies:
```bash
npm install
```

3. Add alarm sound file:
```bash
# Download an alarm sound file and save it as "alarm-sound.mp3" in the public folder
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:5173
```

6. For the best experience, allow camera and notification permissions when prompted.

## Deployment to Render or similar platforms

1. Make sure you have committed all changes to your repository

2. On Render.com:
   - Create a new Web Service
   - Connect your GitHub repository
   - Use the following settings:
     - Build Command: `npm run build`
     - Start Command: `npm start`
   - Click "Create Web Service"

3. The application will be deployed and available at the URL provided by Render

4. Troubleshooting deployment:
   - If you encounter any issues with the server.js file, make sure the file is using ES module syntax (import/export) instead of CommonJS (require) since the project is set up with "type": "module" in package.json.

## Mobile Installation Guide

### Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)
- Git
- For iOS: Mac computer with Xcode installed
- For Android: Android Studio with SDK tools installed

### Step 1: Clone the repository to your laptop

1. Transfer the project to your own GitHub repository using the "Export to GitHub" button in Lovable
2. Clone the project to your local machine:
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd shopwatch-alert-system
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Add mobile platforms

For Android:
```bash
npx cap add android
```

For iOS (Mac only):
```bash
npx cap add ios
```

### Step 4: Update native platforms

After adding the platforms, update the native projects:

For Android:
```bash
npx cap update android
```

For iOS:
```bash
npx cap update ios
```

### Step 5: Add MP3 Alarm Sound File

**IMPORTANT:** You need to add an alarm sound file to make the alarm function properly:

1. Download a suitable alarm sound MP3 file
2. Name it `alarm-sound.mp3`
3. Place it in the `public/` folder of your project

### Step 6: Build the web app

```bash
npm run build
```

### Step 7: Sync the web code to the native projects

```bash
npx cap sync
```

### Step 8: Run on a device or emulator

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

## Connecting Your Phone to Computer

### Android
1. Enable Developer Options on your phone by going to Settings > About Phone and tapping Build Number 7 times
2. Enable USB Debugging in Developer Options
3. Connect your phone to your computer with a USB cable
4. Allow USB Debugging when prompted on your phone
5. Run `npx cap run android` to install and launch the app

### iOS (Mac only)
1. Connect your iPhone to your Mac with a USB cable
2. Trust your computer on your iPhone when prompted
3. Make sure your Apple Developer account is set up in Xcode
4. Run `npx cap run ios` to install and launch the app

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
