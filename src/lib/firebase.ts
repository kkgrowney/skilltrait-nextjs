// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getStorage } from 'firebase/storage';
// import { getFirestore } from 'firebase/firestore';

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'placeholder-api-key',
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'placeholder-auth-domain',
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'placeholder-project-id',
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'placeholder-storage-bucket',
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'placeholder-sender-id',
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'placeholder-app-id'
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Initialize Firebase Authentication and get a reference to the service
// export const auth = getAuth(app);

// // Initialize Firebase Storage and get a reference to the service
// export const storage = getStorage(app);

// // Initialize Firestore and get a reference to the service
// export const db = getFirestore(app);

// export default app;

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

let analytics;

const firebaseConfig = {
  apiKey: "AIzaSyDg7eFD9bFN4-D4vONrsCybG4L1TTwhrvs",
  authDomain: "skill-trait-rwubkx.firebaseapp.com",
  projectId: "skill-trait-rwubkx",
  storageBucket: "skill-trait-rwubkx.appspot.com",
  messagingSenderId: "758643500464",
  appId: "1:758643500464:web:834dcc4973420aad3c2275",
  measurementId: "G-R0C17N4NG6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Only call getAnalytics in the browser
if (typeof window !== "undefined") {
  const { getAnalytics } = await import("firebase/analytics");
  analytics = getAnalytics(app);
}
export const auth = getAuth(app);

export const storage = getStorage(app);

export const db = getFirestore(app);
// export default app;
