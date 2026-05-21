// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAVJ1uH2XT81HzhS4Njhg-pR2_31D9BalM",
  authDomain: "talentpulse-ai.firebaseapp.com",
  projectId: "talentpulse-ai",
  storageBucket: "talentpulse-ai.firebasestorage.app",
  messagingSenderId: "858575621143",
  appId: "1:858575621143:web:794a0d5930a63ba91a6052",
  measurementId: "G-LVSL160RG7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);