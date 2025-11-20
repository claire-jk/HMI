import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";

// Firebase 配置 (只在這裡定義一次)
const firebaseConfig = {
    apiKey: "AIzaSyDCawmUmT3jN0tlnl_wcxzC1Q8VRs4nGhA",
    authDomain: "weather-55116.firebaseapp.com",
    projectId: "weather-55116",
    storageBucket: "weather-55116.firebasestorage.app",
    messagingSenderId: "444123636429",
    appId: "1:444123636429:web:1bf333d3c73bc6fa36ff84",
    measurementId: "G-VSJGYNX08C"
};

// 初始化 Firebase (只在這裡執行一次)
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);