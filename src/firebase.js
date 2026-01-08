import { initializeApp } from "firebase/app";
import { getAuth,GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


 const firebaseConfig = {
    apiKey: "AIzaSyAGPLOVwUhov3_8F7Iv5TdzAov_nSwkK0A",
    authDomain: "chat-7077a.firebaseapp.com",
    databaseURL: "https://chat-7077a-default-rtdb.firebaseio.com",
    projectId: "chat-7077a",
    storageBucket: "chat-7077a.firebasestorage.app",
    messagingSenderId: "102903516343",
    appId: "1:102903516343:web:0f4ebbca61785460711132",
    measurementId: "G-6ERD548TXY" 
    };

const app = initializeApp(firebaseConfig);
const googleProvider = new GoogleAuthProvider();

export const auth = getAuth(app);
export { googleProvider };
export const db = getFirestore(app);
