import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Usar variáveis de ambiente
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("Firebase inicializado com:", {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY ? "Definida" : "Não definida",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN
    ? "Definida"
    : "Não definida",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
    ? "Definida"
    : "Não definida",
});

export { app, auth, db };
