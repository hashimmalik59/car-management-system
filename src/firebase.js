// Step 1: Firebase SDK se zaroori functions import karna
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Step 2: Tumhara Real Configuration Data
const firebaseConfig = {
  apiKey: "AIzaSyCrdOOSXnJzh-OqepJd2VulAJ9o5x-hnjc",
  authDomain: "car-management-system-a4d31.firebaseapp.com",
  projectId: "car-management-system-a4d31",
  storageBucket: "car-management-system-a4d31.firebasestorage.app",
  messagingSenderId: "928739306764",
  appId: "1:928739306764:web:e3da11c3741b3b2819ed29",
  measurementId: "G-4NEP6XCG8Z",
};

// Step 3: Firebase ko initialize karna
const app = initializeApp(firebaseConfig);

// Step 4: Auth aur Firestore Database ko initialize karna
const auth = getAuth(app);
const db = getFirestore(app);

// Step 5: Inko export karna taake poori app mein use ho sakein
export { auth, db };
