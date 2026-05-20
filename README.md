# DocCareAI

A full-featured AI health chat application built with React (Vite), Firebase, OpenRouter API, and Tailwind CSS. DocCareAI responds like a friendly, human-like assistant — warm, casual, and easy to understand.

## Features

- 🔐 User authentication (email/password + Google Sign-In) via Firebase Auth
- 💬 Real-time chat with AI powered by Google Gemini via OpenRouter
- 🗂️ Multiple chat sessions saved per user in Firestore
- 🌙 Dark/light mode toggle with localStorage persistence
- 📱 Fully responsive mobile-first layout
- 🎙️ Voice input (speech-to-text) and voice output (text-to-speech) per message
- 📋 Copy response button on every AI message
- ⚡ Auto-scroll to latest message
- 🎨 Clean, modern UI with human-friendly plain-text responses

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Auth & Database**: Firebase (Auth + Firestore)
- **AI**: OpenRouter API (Google Gemini)
- **Icons**: Lucide React
- **Routing**: React Router v6

## Setup Instructions

### 1. Clone and Install

```bash
cd ai-chat-assistant
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable **Email/Password**
   - Enable **Google**
4. Enable **Firestore Database**:
   - Go to Firestore Database → Create database
   - Start in **test mode**
5. Get your Firebase config from Project Settings → General → Your apps

### 3. Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/chats/{chatId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. OpenRouter API Key

1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up and go to **Keys**
3. Create a new API key

### 5. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

### 6. Run the App

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Build for Production

```bash
npm run build
```

Output goes to the `dist/` directory. Deploy to Render, Vercel, or Netlify as a static site.

## Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── Chat/
│   │   ├── ChatWindow.jsx
│   │   ├── MessageBubble.jsx  # Voice + Copy buttons per AI message
│   │   ├── ChatInput.jsx      # Voice input + send
│   │   └── ChatSidebar.jsx
│   └── Layout/
│       ├── Navbar.jsx
│       └── ThemeToggle.jsx
├── context/
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── hooks/
│   └── useChat.js
├── services/
│   ├── firebase.js
│   └── openrouter.js          # System prompt for human-like responses
├── App.jsx
├── main.jsx
└── index.css
```
