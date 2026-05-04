import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC1vI1WZ9GeGObCa4dhLLseX4AxMomRUvo",
  authDomain: "sos-stock-plomberie.firebaseapp.com",
  projectId: "sos-stock-plomberie",
  storageBucket: "sos-stock-plomberie.firebasestorage.app",
  messagingSenderId: "358753104526",
  appId: "1:358753104526:web:604ef31075b4c36f628fdf",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);