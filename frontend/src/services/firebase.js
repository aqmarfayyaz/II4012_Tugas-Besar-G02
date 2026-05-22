import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY            || "AIzaSyAVJ1uH2XT81HzhS4Njhg-pR2_31D9BalM",
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN        || "talentpulse-ai.firebaseapp.com",
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID         || "talentpulse-ai",
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET     || "talentpulse-ai.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "858575621143",
  appId:             process.env.REACT_APP_FIREBASE_APP_ID             || "1:858575621143:web:794a0d5930a63ba91a6052",
  measurementId:     process.env.REACT_APP_FIREBASE_MEASUREMENT_ID     || "G-LVSL160RG7",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (_) {
  // Analytics may fail in non-browser environments — ignore
}
export { analytics };
export default app;
