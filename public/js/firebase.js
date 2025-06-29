// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getAuth ,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { getDatabase, child, ref, set, onDisconnect, onValue ,remove,update,push,onChildAdded,get,runTransaction} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

// Firebase configuration 
//replace with your config details
const firebaseConfig = {
  apiKey: "AIzaSyAZZkxiPzPTeEF4ptuSpc0N8yVLvr5Ff0I",
  authDomain: "shadowchat-a3453.firebaseapp.com",
  projectId: "shadowchat-a3453",
  storageBucket: "shadowchat-a3453.firebasestorage.app",
  messagingSenderId: "929947529759",
  appId: "1:929947529759:web:0a7debd131b46fc1a9db2a",
  measurementId: "G-YLMT43GFEF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { app,auth, database, ref, set, onDisconnect, onValue ,remove,update,push,onChildAdded,get,firebaseConfig,runTransaction,getAuth,getDatabase,onAuthStateChanged,child};
