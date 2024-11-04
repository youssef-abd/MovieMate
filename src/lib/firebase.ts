import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDg4T37zDPVF5wKL-YYfLSX-nZzrizOQjs",
  authDomain: "moviemate-ab023.firebaseapp.com",
  projectId: "moviemate-ab023",
  storageBucket: "moviemate-ab023.firebasestorage.app",
  messagingSenderId: "495694734401",
  appId: "1:495694734401:web:0e40ec084bcfe25f0752c0",
  measurementId: "G-179W066G1D"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const signIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};