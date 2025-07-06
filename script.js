// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAkJRQNtd3BKiugN3m8rFPjm6AUxmMrfFY",
  authDomain: "prayer-tracker-ijlaal.firebaseapp.com",
  projectId: "prayer-tracker-ijlaal",
  storageBucket: "prayer-tracker-ijlaal.firebasestorage.app",
  messagingSenderId: "248720315304",
  appId: "1:248720315304:web:d737ad948b25189182439d",
  measurementId: "G-2RSYXY4LN6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let userId = null;
let count = 0;

const countEl = document.getElementById("count");
const progressBar = document.getElementById("progress");
const incrementBtn = document.getElementById("increment");
const menuBtn = document.getElementById("menuBtn");
const menuModal = document.getElementById("menuModal");
const closeModal = document.getElementById("closeModal");
const manualCount = document.getElementById("manualCount");
const updateCount = document.getElementById("updateCount");
const historyList = document.getElementById("historyList");

// Authenticate anonymously and track user ID
signInAnonymously(auth)
  .then(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        userId = user.uid;
        loadCount();
      }
    });
  });

// Load count and history
async function loadCount() {
  const userRef = doc(db, "users", userId);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    count = data.count || 0;
    countEl.textContent = count;
    updateProgress();

    const history = data.history || [];
    historyList.innerHTML = "";
    history.reverse().forEach((entry, i) => {
      const li = document.createElement("li");
      li.textContent = `${i + 1}. +1 at ${new Date(entry).toLocaleString()}`;
      historyList.appendChild(li);
    });
  } else {
    await setDoc(userRef, { count: 0, history: [] });
  }
}

// Save count and push timestamp to history
async function saveCount() {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    count: count,
    history: arrayUnion(Date.now())
  });
}

// Update progress bar
function updateProgress() {
  countEl.textContent = count;
  const percent = Math.min((count / 1100) * 100, 100);
  progressBar.style.width = percent + "%";
}

// Increment count
incrementBtn.addEventListener("click", async () => {
  if (count < 1100) {
    count++;
    updateProgress();
    await saveCount();
    loadCount();
  } else {
    alert("You’ve reached your goal of 1100 prayers!");
  }
});

// Open menu modal
menuBtn.onclick = () => {
  manualCount.value = count;
  menuModal.style.display = "block";
};

// Close modal
closeModal.onclick = () => {
  menuModal.style.display = "none";
};

// Update manually
updateCount.onclick = async () => {
  const val = parseInt(manualCount.value);
  if (!isNaN(val) && val >= 0 && val <= 1100) {
    count = val;
    updateProgress();
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { count: count }, { merge: true });
    loadCount();
    menuModal.style.display = "none";
  } else {
    alert("Please enter a number between 0 and 1100.");
  }
};
