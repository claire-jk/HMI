// ====== Firebase 導入 (從 firebase-init.js 導入實例) ======
// 假設 firebase-init.js 已經導出了 app 和 analytics 實例
import { app, analytics } from "./firebase-init.js"; 
// 移除所有重複的 Firebase 初始化和配置

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

// ====== 接收事件資料（透過 event.js 的廣播） ======
// 統一使用一個監聽器來處理
window.addEventListener("next-event-updated", (e) => {
if (!nextEventLink) return;

const detail = e.detail;

if (detail.text && detail.date) {
// 顯示即將到來的事件
// 這裡將時間設為可選，如果沒有 time 則使用預設值
const eventTime = detail.time || "00:00"; 
nextEventLink.textContent = `${detail.text} (${detail.date} ${eventTime})`;
nextEventLink.href = "event.html";
} else {
// 沒有即將到來的事件或登出
nextEventLink.textContent = "無事件";
nextEventLink.removeAttribute("href");
}
});


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
  // home.js 已經沒有 Firestore 監聽器需要停止
});