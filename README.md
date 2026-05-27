# DocCareAI

An AI health chat assistant built with React (Vite), Firebase, Groq API, and Tailwind CSS. DocCareAI responds like a friendly, human-like health companion — warm, casual, and easy to understand.

## Features

- 🔐 User authentication (email/password + Google Sign-In) via Firebase Auth
- 💬 Real-time chat with AI powered by Groq (llama-3.3-70b-versatile)
- 🗂️ Multiple chat sessions saved per user in Firestore
- 🌙 Dark/light mode toggle
- 📱 Fully responsive mobile-first layout
- 🔊 Voice output (text-to-speech) per AI message
- 📋 Copy response button on every AI message
- 🌐 Multi-language support (auto-detects user language)

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Auth & Database**: Firebase (Auth + Firestore)
- **AI**: Groq API (llama-3.3-70b-versatile)
- **Icons**: Lucide React
- **Routing**: React Router v6

## Setup

### 1. Install

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### 3. Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** → Email/Password + Google
3. Enable **Firestore Database**
4. Set Firestore rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Groq API Key

Get a free key at [console.groq.com](https://console.groq.com)

### 5. Run

```bash
npm run dev
```

## Build

```bash
npm run build
```

Deploy the `dist/` folder to Vercel, Render, or Netlify. Set all `VITE_*` environment variables on your hosting platform.
