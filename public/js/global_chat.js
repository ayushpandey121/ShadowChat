import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, set, remove, onChildAdded, onChildRemoved, get } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyAZZkxiPzPTeEF4ptuSpc0N8yVLvr5Ff0I",
  authDomain: "shadowchat-a3453.firebaseapp.com",
  databaseURL: "https://shadowchat-a3453-default-rtdb.firebaseio.com",
  projectId: "shadowchat-a3453",
  storageBucket: "shadowchat-a3453.firebasestorage.app",
  messagingSenderId: "929947529759",
  appId: "1:929947529759:web:0a7debd131b46fc1a9db2a",
  measurementId: "G-YLMT43GFEF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Store the timestamp of the last message sent by each user
const userMessageTimestamps = {};

// Set the spam prevention limits
const SPAM_LIMIT = 5; // Maximum number of messages
const TIME_WINDOW = 10000; // Time window in milliseconds (e.g., 10 seconds)

// UI Elements
const nameEntry = document.getElementById('nameEntry');
const enterBtn = document.getElementById('enterBtn');
const messages = document.getElementById('messages');
const sendMsgButton = document.getElementById('sendMsg');
const msgTxt = document.getElementById('msgTxt');
const msgBtn = document.getElementById('msgBtn');

// Sender information
let sender = null;
const userSession = JSON.parse(sessionStorage.getItem('user'));
if (userSession && userSession.username) {
    sender = userSession.username;
} else {
    sender = sessionStorage.getItem("sender");
}

// Detect if user is already logged in
onAuthStateChanged(auth, (user) => {
  if (user && user.uid) {
    // User is signed in, check sessionStorage for user data
    const userSession = JSON.parse(sessionStorage.getItem('user'));
    if (userSession) {
      sender = userSession.username;
      showChatUI();
    } else {
      nameEntry.style.display = 'flex';
      messages.style.display = 'none';
      sendMsgButton.style.display = 'none';
    }
  } else {
    nameEntry.style.display = 'flex';
    messages.style.display = 'none';
    sendMsgButton.style.display = 'none';
  }
});

// Show chat UI
function showChatUI() {
  nameEntry.style.display = 'none';
  messages.style.display = 'block';
  sendMsgButton.style.display = 'block';
}

// Function to check for spam
function isSpamming(sender) {
  const now = new Date().getTime();

  if (!userMessageTimestamps[sender]) {
    userMessageTimestamps[sender] = [];
  }

  // Add the current timestamp to the user's message history
  userMessageTimestamps[sender].push(now);

  // Remove timestamps outside the time window
  userMessageTimestamps[sender] = userMessageTimestamps[sender].filter(
    (timestamp) => now - timestamp <= TIME_WINDOW
  );

  // Check if the user exceeded the spam limit
  return userMessageTimestamps[sender].length > SPAM_LIMIT;
}

// Updated sendMsg function with spam check
function sendMsg() {
  const msg = msgTxt.value.trim();

  if (msg) {
    if (isSpamming(sender)) {
      alert("You are sending messages too quickly. Please slow down.");
      return; // Prevent the message from being sent
    }

    const timestamp = new Date().getTime();
    set(ref(db, "messages/" + timestamp), {
      msg: msg,
      sender: sender,
      timestamp: timestamp, // Store timestamp with the message
    });

    msgTxt.value = "";
  }
}

// Attach Enter key event listener
msgTxt.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendMsg();
  }
});

// Attach button click event listener
if (msgBtn) {
  msgBtn.addEventListener('click', () => {
    sendMsg();
  });
}

// Listen for new messages
onChildAdded(ref(db, "messages"), (data) => {
  const msgContainer = document.createElement('div');
  msgContainer.classList.add('outer');
  msgContainer.id = data.key;

  const innerDiv = document.createElement('div');
  innerDiv.id = 'inner';

  if (data.val().sender === sender) {
    innerDiv.classList.add('me');
    innerDiv.innerHTML = `<span class="sender_me">You:</span> ${data.val().msg}`;

    // Create a delete button and attach the event listener
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = "DELETE";
    deleteBtn.classList.add('delete-btn');
    deleteBtn.onclick = () => dltMsg(data.key);
    innerDiv.appendChild(deleteBtn);
  } else {
    innerDiv.classList.add('notMe');
    innerDiv.innerHTML = `<span class="sender_notMe">${data.val().sender}</span>: ${data.val().msg}`;
    innerDiv.style.backgroundColor = getRandomLightColor();
  }

  msgContainer.appendChild(innerDiv);
  messages.appendChild(msgContainer);
  messages.scrollTop = messages.scrollHeight;
});

// Delete message function
function dltMsg(key) {
  remove(ref(db, "messages/" + key));
}

// When message is deleted
onChildRemoved(ref(db, "messages"), (data) => {
  const msgBox = document.getElementById(data.key);
  messages.removeChild(msgBox);
});

// Function to generate random light colors
function getRandomLightColor() {
  const r = Math.floor(Math.random() * 156) + 100;
  const g = Math.floor(Math.random() * 156) + 100;
  const b = Math.floor(Math.random() * 156) + 100;
  return `rgb(${r}, ${g}, ${b})`;
}
