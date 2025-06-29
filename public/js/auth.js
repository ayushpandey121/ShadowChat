import { app, auth } from './firebase.js';
import { get, child } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';
import { getDatabase, ref, set } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    sendEmailVerification,
    setPersistence, 
    browserSessionPersistence
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

const db = getDatabase(app);

// Regular expression to match the college email format
const collegeEmailPattern = /^[a-z0-9]+(\.[a-z0-9]+)*\.[a-z]+[0-9]{4}@ritroorkee\.com$/;

// Show custom alert
function showAlert(message) {
    const alertBox = document.getElementById('customAlert');
    const alertMessage = document.getElementById('alertMessage');
    alertMessage.textContent = message;
    alertBox.classList.remove('hidden');
}

function closeAlert() {
    document.getElementById('customAlert').classList.add('hidden');
}

// Attach event listener to the close button
document.getElementById('closeAlertButton').addEventListener('click', closeAlert);

// Set persistence to session
setPersistence(auth, browserSessionPersistence).catch((error) => {
    console.error('Error setting persistence:', error);
});

// Handle Signup
document.getElementById('signupForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    if (!collegeEmailPattern.test(email)) {
        showAlert('Please use a valid college email in the format: name.branchyear@ritroorkee.com');
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            set(ref(db, 'users/' + user.uid), {
                username: username,
                email: email
            });
            sessionStorage.setItem("sender", username);
            sendEmailVerification(user).then(() => {
                showAlert('Verification email sent! Please verify your email.');
            });
        })
        .catch((error) => {
            showAlert(error.message);
        });
});

// Handle Login
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            if (!user.emailVerified) {
                showAlert('Please verify your email first.');
            } else {
                const dbRef = ref(db);
                get(child(dbRef, `users/${user.uid}`)).then((snapshot) => {
                    if (snapshot.exists()) {
                        const userData = snapshot.val();
                        const username = userData.username;

                        // Save user info to sessionStorage
                        sessionStorage.setItem('user', JSON.stringify({
                            uid: user.uid,
                            email: user.email,
                            username: username
                        }));
                        sessionStorage.setItem("sender", username); 
                        window.location.href = 'chat.html';
                    } else {
                        // If user exists in Auth but no DB entry, create it now
                        const username = prompt("Username not found. Please enter your username:");
                        if (username && username.trim() !== "") {
                            set(ref(db, 'users/' + user.uid), {
                                username: username,
                                email: user.email
                            }).then(() => {
                                sessionStorage.setItem('user', JSON.stringify({
                                    uid: user.uid,
                                    email: user.email,
                                    username: username
                                }));
                                sessionStorage.setItem("sender", username);
                                window.location.href = 'chat.html';
                            }).catch((error) => {
                                showAlert('User DB record missing and could not be created.');
                                console.error("DB set error:", error);
                            });
                        } else {
                            showAlert('Username is required.');
                        }
                    }
                }).catch((error) => {
                    showAlert(error.message);
                });
            }
        })
        .catch((error) => {
            showAlert(error.message);
            // Redirect to funny.html if login fails
            window.open('funny.html', '_self');
        });
});
