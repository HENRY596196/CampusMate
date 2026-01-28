// --- 1. Firebase 設定 (請確認您的 Key 正確) ---
const firebaseConfig = {
    apiKey: "AIzaSyDCjUE-uDGHuTwShun_hUkHI0OgAEGx_Zk",
    authDomain: "campusmate-aa158.firebaseapp.com",
    projectId: "campusmate-aa158",
    storageBucket: "campusmate-aa158.firebasestorage.app",
    messagingSenderId: "233940430236",
    appId: "1:233940430236:web:0c7c25280a6074e6bb6c59",
    measurementId: "G-RJBVYV11FB"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();


// ---【新增】在這裡加入管理員 ID ---
const ADMIN_UID = "yh2GM8FKn6Q4oXXPnDhqBr6SFOw1";