import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, addDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

let analytics;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDg7eFD9bFN4-D4vONrsCybG4L1TTwhrvs",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "skill-trait-rwubkx.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "skill-trait-rwubkx",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "skill-trait-rwubkx.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "758643500464",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:758643500464:web:834dcc4973420aad3c2275",
  measurementId: "G-R0C17N4NG6",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);

// Function to upload assets to Firebase Storage
export const uploadAsset = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading asset:', error);
    throw error;
  }
};

// Function to create template with uploaded assets
export const createTemplateWithAssets = async (templateData: any) => {
  try {
    const templatesRef = collection(db, 'templates');
    const docRef = await addDoc(templatesRef, {
      ...templateData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
};

// Function to save user prop to Firestore with enhanced process
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

// Enhanced function to save prop with image generation
export const savePropWithImage = async (userId: string, propData: any, generatedImageUrl: string) => {
  try {
    const userPropsRef = collection(db, 'users', userId, 'props');
    const docRef = await addDoc(userPropsRef, {
      ...propData,
      generatedImageUrl,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving prop with image:', error);
    throw error;
  }
};

// Function to update prop with generated image
export const updatePropWithImage = async (userId: string, propId: string, imageUrl: string) => {
  try {
    const propRef = doc(db, 'users', userId, 'props', propId);
    await updateDoc(propRef, {
      fullPropImage: imageUrl,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating prop with image:', error);
    throw error;
  }
};

// export default app;
