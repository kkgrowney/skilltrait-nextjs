import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ref, getDownloadURL } from 'firebase/storage';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { storage, db } from './firebase';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Firebase Storage utility functions (keeping for backward compatibility)
export async function getFirebaseImageUrl(imagePath: string): Promise<string> {
  try {
    const imageRef = ref(storage, imagePath);
    const url = await getDownloadURL(imageRef);
    return url;
  } catch (error) {
    console.error('Error loading image from Firebase:', error);
    // Fallback to local image if Firebase fails
    return imagePath;
  }
}

// Firestore utility functions for template collection
export async function getTemplateImageUrl(templateNumber: number): Promise<string> {
  try {
    const templatesRef = collection(db, 'template');
    const q = query(templatesRef, where('id', '==', templateNumber));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      if (data.achievement && data.achievement.props) {
        return data.achievement.props;
      }
    }
    
    // Fallback to local image if Firestore doesn't have the data
    return `/templates/props/props-${templateNumber}.png`;
  } catch (error) {
    console.error('Error loading template from Firestore:', error);
    // Fallback to local image if Firestore fails
    return `/templates/props/props-${templateNumber}.png`;
  }
}

export async function getPropsTemplateUrl(templateNumber: number): Promise<string> {
  return getTemplateImageUrl(templateNumber);
}
