// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore/lite';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCK5KpPu3TSMhRY_aMsmNwlBVxJ3XrzrEw",
  authDomain: "inventorymanager-01.firebaseapp.com",
  projectId: "inventorymanager-01",
  storageBucket: "inventorymanager-01.appspot.com",
  messagingSenderId: "988749641099",
  appId: "1:988749641099:web:b02c44849bb2da8c70ab8e",
  measurementId: "G-CQJTQ268N6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);
auth.languageCode = 'en';
const provider = new GoogleAuthProvider();

export { firestore, auth, provider, signInWithPopup, onAuthStateChanged };
