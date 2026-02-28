import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase config from Firebase Console
// Go to: Firebase Console → ⚙️ Project Settings → Your apps → Config
const firebaseConfig = {
  apiKey: "AIzaSyAdM1j8qWx6hefMSlQ02z0JK56okDHD4YE",
  authDomain: "savionalia-form.firebaseapp.com",
  projectId: "savionalia-form",
  storageBucket: "savionalia-form.firebasestorage.app",
  messagingSenderId: "1001232475012",
  appId: "1:1001232475012:web:cdacdfbf0218eace1b33d1"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
