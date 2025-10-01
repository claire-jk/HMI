// ====== Firebase 初始化 ======
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";
import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

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
const analytics = getAnalytics(app);
const db = getFirestore(app);

// ====== DOM 元素 ======
const dateEl = document.getElementById("date");
const timeEl = document.getElementById("time");
const weatherInfo = document.getElementById("weather-info");
const nextEventLink = document.getElementById("next-event-link"); // 首頁可能不存在

// ====== 時間更新（秒級） ======
function updateDateTime() {
  const now = new Date();
  if (dateEl) dateEl.textContent = now.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  if (timeEl) timeEl.textContent = now.toLocaleTimeString("zh-TW", { hour12: false });
  setTimeout(updateDateTime, 1000 - now.getMilliseconds());
}
updateDateTime();

// ====== 天氣更新（每10分鐘） ======
async function fetchWeather() {
  const url = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-9BEFF585-4A1F-44D6-AD64-D676D2812788&locationName=臺北市";
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.records.location[0].weatherElement[0].time[0].parameter.parameterName;
  } catch (err) {
    console.error("天氣抓取失敗", err);
    return null;
  }
}

async function updateWeather() {
  if (!weatherInfo) return;

  const hour = new Date().getHours();

  // 夜晚固定背景
  if (hour >= 18 || hour < 6) {
    document.body.className = "weather-night";
    document.body.style.color = "#fff";
    weatherInfo.innerHTML = `<span class="icon">🌙</span> 現在是夜晚`;
    return;
  }

  const wx = await fetchWeather();
  let icon = "🌤";

  if (!wx) {
    document.body.className = "weather-default";
    weatherInfo.innerHTML = `<span class="icon">⚠️</span> 天氣資料載入失敗`;
    return;
  }

  if (wx.includes("晴")) {
    document.body.className = "weather-sunny";
    icon = "☀️";
  } else if (wx.includes("雲") || wx.includes("陰")) {
    document.body.className = "weather-cloudy";
    icon = "☁️";
  } else if (wx.includes("雨")) {
    document.body.className = "weather-rainy";
    icon = "🌧";
  } else {
    document.body.className = "weather-default";
    icon = "🌤";
  }

  document.body.style.color = "#333";
  weatherInfo.innerHTML = `<span class="icon">${icon}</span> 台北市目前天氣：${wx}`;
}
updateWeather();
setInterval(updateWeather, 10 * 60 * 1000);

// ====== Firestore 事件監聽（下一個重大事件） ======
const eventsCol = collection(db, "events");
const q = query(eventsCol, orderBy("dateTime"));

let unsubscribe = null; // 監聽器存起來

function updateNextEvent(snapshot) {
  if (!nextEventLink) return;

  const now = new Date();
  const upcoming = snapshot.docs
    .map(doc => doc.data())
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

// 啟動監聽
unsubscribe = onSnapshot(q, updateNextEvent);

// ====== 登出清空資料 ======
function clearNextEvent() {
  if (!nextEventLink) return;
  nextEventLink.textContent = "無事件";
  nextEventLink.removeAttribute("href");
}

// 監聽全局登出事件
window.addEventListener("user-logged-out", () => {
  // 清空資料
  clearNextEvent();

  // 停止 Firestore 監聽
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
});