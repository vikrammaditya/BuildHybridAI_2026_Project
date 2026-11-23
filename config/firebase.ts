// Firebase Client Configuration
// Reads public configuration strictly from environment variables (safe in client bundle)
// Guardrail: Never expose private Firebase service account credentials or administrative keys

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export function getFirebaseConfig(): FirebaseClientConfig {
  const meta = import.meta as unknown as { env?: Record<string, string> };
  const env = meta.env || {};

  return {
    apiKey: env.VITE_FIREBASE_API_KEY || "demo-api-key",
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "demo-app.firebaseapp.com",
    projectId: env.VITE_FIREBASE_PROJECT_ID || "demo-build-hybrid-ai",
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "demo-build-hybrid-ai.appspot.com",
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
    appId: env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456",
  };
}
