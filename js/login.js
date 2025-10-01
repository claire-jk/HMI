import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {

  // === Firebase 初始化 ===
  const firebaseConfig = {
    apiKey: "AIzaSyDCawmUmT3jN0tlnl_wcxzC1Q8VRs4nGhA",
    authDomain: "weather-55116.firebaseapp.com",
    projectId: "weather-55116",
    storageBucket: "weather-55116.firebasestorage.app",
    messagingSenderId: "444123636429",
    appId: "1:444123636429:web:1bf333d3c73bc6fa36ff84",
    measurementId: "G-VSJGYNX08C"
  };

  const app = initializeApp(firebaseConfig);
  getAnalytics(app);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  // === DOM 元素 ===
  const statusEl = document.getElementById("login-status");
  const profileEl = document.getElementById("profile-info"); 
  const googleLoginBtn = document.getElementById("google-login");
  const emailSignupBtn = document.getElementById("email-signup");
  const emailLoginBtn = document.getElementById("email-login");
  const logoutBtn = document.getElementById("logout-btn");
  const specialBtn = document.getElementById("special-btn"); 

  // === 事件處理器 ===
  function handleGoogleLogin() {
    signInWithPopup(auth, provider)
      .then(result => alert(`歡迎，${result.user.displayName}`))
      .catch(err => alert(`Google 登入失敗：${err.message}`));
  }

  function handleEmailSignup() {
    const email = prompt("請輸入 Email");
    const password = prompt("請輸入密碼 (至少 6 位數)");
    createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => alert(`註冊成功：${userCredential.user.email}`))
      .catch(err => alert(`註冊失敗：${err.message}`));
  }

  function handleEmailLogin() {
    const email = prompt("請輸入 Email");
    const password = prompt("請輸入密碼");
    signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => alert(`登入成功：${userCredential.user.email}`))
      .catch(err => alert(`登入失敗：${err.message}`));
  }

  // === 登出處理（廣播事件版本）===
  function handleLogout() {
    signOut(auth)
      .then(() => {
        resetLoginState();
        removeLoginEvents();
        bindLoginEvents();
        // 廣播登出事件，讓 event.js 與 home.js 清空資料
        window.dispatchEvent(new Event("user-logged-out"));
        alert("已登出");
      })
      .catch(err => alert(`登出失敗：${err.message}`));
  }

  // === 綁定事件 ===
  function bindLoginEvents() {
    googleLoginBtn.addEventListener("click", handleGoogleLogin);
    emailSignupBtn.addEventListener("click", handleEmailSignup);
    emailLoginBtn.addEventListener("click", handleEmailLogin);
    logoutBtn.addEventListener("click", handleLogout);
  }

  // === 移除事件 ===
  function removeLoginEvents() {
    googleLoginBtn.removeEventListener("click", handleGoogleLogin);
    emailSignupBtn.removeEventListener("click", handleEmailSignup);
    emailLoginBtn.removeEventListener("click", handleEmailLogin);
    logoutBtn.removeEventListener("click", handleLogout);
  }

  // === 重置 UI ===
  function resetLoginState() {
    statusEl.textContent = "未登入";
    profileEl.textContent = "";
    profileEl.style.display = "none";
    if (specialBtn) specialBtn.style.display = "none";
  }

  // === 監聽登入狀態 ===
  onAuthStateChanged(auth, (user) => {
    if (user) {
      statusEl.textContent = `登入中：${user.displayName || user.email}`;
      profileEl.textContent = `Hello, ${user.displayName || user.email}`;
      profileEl.style.display = "block";
      if (specialBtn) specialBtn.style.display = "block"; 
    } else {
      resetLoginState();
    }
  });

  // === 初始綁定事件 ===
  bindLoginEvents();

});