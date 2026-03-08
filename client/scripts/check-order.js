import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Get config from env or hardcode local test
// I will just use the same config as the project
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fetch the most recently updated order to see what its status is
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

async function check() {
    const q = query(collection(db, "orders"), orderBy("updatedAt", "desc"), limit(1));
    const snap = await getDocs(q);
    snap.forEach(doc => {
        console.log("ORDER_ID:", doc.id);
        console.log("STATUS:", doc.data().status);
    })
}

check();
