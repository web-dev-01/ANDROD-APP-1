# Strategy Maker App

AI-powered strategy planner for goals, exams, interviews, and more.

## Tech Stack
- **Backend:** Node.js, Express, MongoDB, Gemini API
- **Mobile:** React Native (Expo), React Navigation, Axios

## Setup Instructions

### 1. Backend Setup
1. `cd backend`
2. `npm install`
3. Create a `.env` file based on `.env.example`:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: Any random string.
   - `GEMINI_API_KEY`: Your Google Gemini API key.
4. `npm start` (Runs on port 5000)

### 2. Mobile Setup
1. `cd mobile`
2. `npm install`
3. **CRITICAL:** Open `api/client.js` and replace the `API_URL` with your computer's LOCAL IP address (e.g., `http://192.168.1.10:5000/api`). Do NOT use `localhost`.
4. `npx expo start`

### 3. Build APK
To generate the APK for Android:
1. Ensure you have an Expo account and `eas-cli` installed.
2. `cd mobile`
3. `eas build -p android --profile preview` (or `npx expo run:android` for local development build)

## Features
- ✨ AI Strategy Generation (Gemini 2.0 Flash)
- 🔐 Secure JWT Authentication
- 📋 Task Checklists & Progress Tracking
- 📂 Category-based Strategy Organization
- 📤 Share Strategies as Text
- 📱 Premium Mobile UI with Tailwind-inspired styles
