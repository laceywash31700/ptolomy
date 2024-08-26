
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage , ref, uploadBytes } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// FIREBASE_API_KEY=
// FIREBASE_AUTH_DOMAIN=
// FIREBASE_PROJECT_ID=
// FIREBASE_STORAGE_BUCKET=
// FIREBASE_MESSAGE_SENDER_ID=
// FIREBASE_APP_ID=
// FIREBASE_MEASUREMENT_ID=

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const storage = getStorage(app);
const analytics = getAnalytics(app);

export const auth = getAuth();
export const db = getFirestore(app);
export const rootRef = ref(storage);
export const mapRef = ref(rootRef, 'maps');
export const tokenRef = ref(rootRef, 'tokens')

export default app;


