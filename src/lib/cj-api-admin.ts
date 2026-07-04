// Server-side Firestore access using the Firebase client SDK
export async function getFirestoreAdmin() {
  const { initializeApp, getApps, getApp } = await import("firebase/app");
  const { getFirestore, collection, doc, getDoc, setDoc, getDocs, deleteDoc } = await import("firebase/firestore");

  const firebaseConfig = {
    apiKey: "AIzaSyBoUraz3l9P2VG8r4XvcE-zkylRqJDXoV0",
    authDomain: "chat-ec8b1.firebaseapp.com",
    projectId: "chat-ec8b1",
    storageBucket: "chat-ec8b1.firebasestorage.app",
    messagingSenderId: "841415038703",
    appId: "1:841415038703:web:e449b9ba7b40bd41972d1a",
  };

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const db = getFirestore(app);

  return { db, collection, doc, getDoc, setDoc, getDocs, deleteDoc };
}
