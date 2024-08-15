// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from 'firebase/database';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB_nfWNW5D28ooRXZt5quoNh4ROAeYvWZk",
  authDomain: "e-cart-4fd56.firebaseapp.com",
  projectId: "e-cart-4fd56",
  storageBucket: "e-cart-4fd56.appspot.com",
  messagingSenderId: "1088293305276",
  appId: "1:1088293305276:web:ab0fe12a6af36c007c89b9",
  measurementId: "G-VCEP29ZZ8F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const rdb = getDatabase(app);
export const auth = getAuth(app);
 