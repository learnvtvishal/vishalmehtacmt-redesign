// =============================================================
//  FIREBASE CONFIG  —  paste your project's keys below.
//
//  Where to find these:
//   1. Go to https://console.firebase.google.com  → create a project (free)
//   2. Build → Firestore Database → Create database (Production mode)
//   3. Build → Authentication → Sign-in method → enable "Email/Password"
//   4. Authentication → Users → Add user  (this is YOUR admin login)
//   5. Project Settings (gear icon) → Your apps → Web app (</>) → register
//   6. Copy the firebaseConfig values it shows you into the object below
//
//  Until these are filled in, the CRM runs in LOCAL DEMO mode
//  (leads saved only in this browser). Fill them in to go live.
// =============================================================
window.FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// The email you added in Firebase Authentication (step 4 above).
// Used as the admin login on admin.html.
window.ADMIN_EMAIL = "";
