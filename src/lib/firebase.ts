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
  import("firebase/analytics").then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  });
}

export const auth = getAuth(app);

export const storage = getStorage(app);

export const db = getFirestore(app);
// export default app;
