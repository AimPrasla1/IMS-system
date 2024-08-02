// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore/lite';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const provider = new GoogleAuthProvider();

export { firestore, auth, provider, signInWithPopup };