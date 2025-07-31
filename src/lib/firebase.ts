import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, addDoc } from "firebase/firestore";
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

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);

// Function to save user prop to Firestore
export const saveUserProp = async (userId: string, propData: any) => {
  try {
    const userPropsRef = collection(db, 'users', userId, 'props');
    const docRef = await addDoc(userPropsRef, {
      ...propData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving user prop:', error);
    throw error;
  }
};

// export default app;
