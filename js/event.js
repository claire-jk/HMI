import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM 元素
const eventList = document.getElementById("event-list");
const addBtn = document.getElementById("add-btn");
const dateInput = document.getElementById("event-date");
const timeInput = document.getElementById("event-time");
const textInput = document.getElementById("event-text");
const nextEventLink = document.getElementById("next-event-link");

let unsubscribe = null; // Firestore 監聽器

// 顯示事件列表
function displayEvents(events) {
  if (!eventList) return;
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

// 顯示下一個重大事件
function displayNextEvent(events) {
  if (!nextEventLink) return;

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

// 清空畫面資料
function clearEventData() {
  if (eventList) eventList.innerHTML = "";
  if (nextEventLink) {
    nextEventLink.textContent = "無事件";
    nextEventLink.removeAttribute("href");
  }
}

// 新增事件
if (addBtn) {
  addBtn.addEventListener("click", async () => {
    const date = dateInput.value;
    const time = timeInput.value || "00:00";
    const text = textInput.value.trim();
    if (!date || !text) return alert("請填日期與內容！");

    const dateTime = `${date}T${time}`;
    await addDoc(collection(db, "events"), { date, time, text, dateTime });

    dateInput.value = "";
    timeInput.value = "";
    textInput.value = "";
  });
}

// 登入狀態監聽
onAuthStateChanged(auth, (user) => {
  if (user) {
    // 登入，啟動 Firestore 監聽
    if (!unsubscribe) {
      const q = query(collection(db, "events"), orderBy("dateTime"));
      unsubscribe = onSnapshot(q, snapshot => {
        const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        displayEvents(events);
        displayNextEvent(events);
      });
    }
  } else {
    // 登出，清空資料並停止監聽
    clearEventData();
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  }
});

// 監聽全局登出事件（從其他頁面登出）
window.addEventListener("user-logged-out", () => {
  clearEventData();
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
});