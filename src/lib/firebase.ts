import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  OAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBoUraz3l9P2VG8r4XvcE-zkylRqJDXoV0",
  authDomain: "chat-ec8b1.firebaseapp.com",
  projectId: "chat-ec8b1",
  storageBucket: "chat-ec8b1.firebasestorage.app",
  messagingSenderId: "841415038703",
  appId: "1:841415038703:web:e449b9ba7b40bd41972d1a",
  measurementId: "G-3P8H5VTJEF",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  onboardingComplete: boolean;
};

// Save or update user profile in Firestore
export async function saveUserProfile(uid: string, data: Partial<UserProfile>) {
  await setDoc(doc(db, "users", uid), data, { merge: true });
}

// Get user profile from Firestore
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  OAuthProvider,
  firebaseSignOut,
  onAuthStateChanged,
  type User,
};
