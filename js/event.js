// ===== Firebase 初始化 =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyDCawmUmT3jN0tlnl_wcxzC1Q8VRs4nGhA",
  authDomain: "weather-55116.firebaseapp.com",
  projectId: "weather-55116",
  storageBucket: "weather-55116.firebasestorage.app",
  messagingSenderId: "444123636429",
  appId: "1:444123636429:web:1bf333d3c73bc6fa36ff84",
  measurementId: "G-VSJGYNX08C"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== DOM 元素 =====
const eventList = document.getElementById("event-list");  // 事件頁的列表
const addBtn = document.getElementById("add-btn");        // 新增按鈕
const dateInput = document.getElementById("event-date");  // 日期輸入
const timeInput = document.getElementById("event-time");  // 時間輸入
const textInput = document.getElementById("event-text");  // 事件名稱輸入
const nextEventLink = document.getElementById("next-event-link"); // 首頁顯示下一個事件

// ===== 顯示事件清單（event.html） =====
function displayEvents(events) {
  if (!eventList) return; // 如果不是事件頁，直接跳過
  eventList.innerHTML = "";

  events.forEach(event => {
    const li = document.createElement("li");
    li.textContent = `${event.date} ${event.time || "00:00"} ${event.text}`;

    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑";
    delBtn.addEventListener("click", async () => {
      await deleteDoc(doc(db, "events", event.id));
    });

    li.appendChild(delBtn);
    eventList.appendChild(li);
  });
}

// ===== 顯示下一個重大事件（index.html） =====
function displayNextEvent(events) {
  if (!nextEventLink) return; // 如果不是首頁，直接跳過

  const now = new Date();
  const upcoming = events
    .filter(e => e.dateTime && new Date(e.dateTime) >= now)
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  const nextEvent = upcoming[0];
  if (nextEvent) {
    nextEventLink.textContent = `${nextEvent.text}（${nextEvent.date} ${nextEvent.time || "00:00"}）`;
    nextEventLink.href = "event.html";
  } else {
    nextEventLink.textContent = "無事件";
    nextEventLink.removeAttribute("href");
  }
}

// ===== 新增事件（event.html） =====
if (addBtn) {
  addBtn.addEventListener("click", async () => {
    const date = dateInput.value;
    const time = timeInput.value || "00:00";
    const text = textInput.value.trim();
    if (!date || !text) return alert("請填日期與內容！");

    const dateTime = `${date}T${time}`; // Firestore 排序用
    await addDoc(collection(db, "events"), { date, time, text, dateTime });

    // 清空輸入框
    dateInput.value = "";
    timeInput.value = "";
    textInput.value = "";
  });
}

// ===== 監聽 Firestore 即時更新 =====
const q = query(collection(db, "events"), orderBy("dateTime"));
onSnapshot(q, snapshot => {
  const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // 事件頁顯示事件列表
  displayEvents(events);

  // 首頁顯示下一個重大事件
  displayNextEvent(events);
});