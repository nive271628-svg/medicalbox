# AI Chat Assistant

A full-featured AI chat application built with React (Vite), Firebase, OpenRouter API, and Tailwind CSS.

## Features

- 🔐 User authentication (email/password + Google Sign-In) via Firebase Auth
- 💬 Real-time chat with AI powered by Google Gemini 2.0 Flash via OpenRouter
- 🗂️ Multiple chat sessions saved per user in Firestore
- 🌙 Dark/light mode toggle with localStorage persistence
- 📱 Responsive layout (sidebar collapses on mobile)
- ⚡ Auto-scroll to latest message
- 🎨 Clean, modern UI inspired by ChatGPT

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Auth & Database**: Firebase (Auth + Firestore)
- **AI**: OpenRouter API (google/gemini-2.0-flash-exp:free)
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
2. Create a new project (or use an existing one)
3. Enable **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable **Email/Password**
   - Enable **Google** (optional, for Google sign-in)
4. Enable **Firestore Database**:
   - Go to Firestore Database → Create database
   - Start in **test mode** (or configure security rules below)
5. Get your Firebase config:
   - Go to Project Settings → General → Your apps
   - Click "Add app" → Web
   - Copy the config values

### 3. Firestore Security Rules

In Firebase Console → Firestore → Rules, set:

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
2. Sign up and go to **Keys** section
3. Create a new API key
4. The app uses the free `google/gemini-2.0-flash-exp:free` model

### 5. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

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

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.jsx          # Login form with email/password + Google
│   │   └── Signup.jsx         # Signup form
│   ├── Chat/
│   │   ├── ChatWindow.jsx     # Main chat area with messages
│   │   ├── MessageBubble.jsx  # Individual message with formatting
│   │   ├── ChatInput.jsx      # Text input with send button
│   │   └── ChatSidebar.jsx    # Session list sidebar
│   └── Layout/
│       ├── Navbar.jsx         # Top navigation bar
│       └── ThemeToggle.jsx    # Dark/light mode toggle
├── context/
│   ├── AuthContext.jsx        # Firebase auth state + functions
│   └── ThemeContext.jsx       # Theme state + localStorage
├── hooks/
│   └── useChat.js             # Chat sessions + Firestore + AI logic
├── services/
│   ├── firebase.js            # Firebase initialization
│   └── openrouter.js          # OpenRouter API client
├── App.jsx                    # Router + layout + protected routes
├── main.jsx                   # React entry point
└── index.css                  # Tailwind + custom CSS variables
```

## Firestore Data Structure

```
users/
  {userId}/
    chats/
      {chatId}/
        title: string          # First message truncated to 50 chars
        createdAt: timestamp
        updatedAt: timestamp
        messages: [
          {
            role: "user" | "assistant"
            content: string
            timestamp: ISO string
          }
        ]
```

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.
