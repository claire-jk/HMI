// ======= 即時更新日期時間 =======
function updateDateTime() {
  const now = new Date();
  document.getElementById("date").textContent = now.toLocaleDateString("zh-TW", {
    year: "numeric", month: "2-digit", day: "2-digit"
  });
  document.getElementById("time").textContent = now.toLocaleTimeString("zh-TW", {
    hour12: false
  });
}
setInterval(updateDateTime, 1000);
updateDateTime();

// ======= 更新天氣背景（夜晚優先） =======
async function updateWeather() {
  const weatherInfo = document.getElementById("weather-info");
  try {
    const hour = new Date().getHours();

    if (hour >= 18 || hour < 6) {
      document.body.className = "weather-night";
      document.body.style.color = "#fff";
      weatherInfo.innerHTML = `<span class="icon">🌙</span> 現在是夜晚`;
      return;
    }

    const url = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-9BEFF585-4A1F-44D6-AD64-D676D2812788&locationName=臺北市";
    const res = await fetch(url);
    const data = await res.json();
    const wx = data.records.location[0].weatherElement[0].time[0].parameter.parameterName;

    let icon = "🌤";
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

  } catch (err) {
    console.log("天氣資料抓取失敗，使用預設背景", err);
    document.body.className = "weather-default";
    document.body.style.color = "#333";
    weatherInfo.innerHTML = `<span class="icon">⚠️</span> 天氣資料載入失敗`;
  }
}
updateWeather();

// ======= 顯示下一個重大事件 =======
function getNextEvent() {
  const now = new Date();
  let eventData = JSON.parse(localStorage.getItem("eventData")) || [];
  console.log("📌 目前 localStorage.eventData =", eventData);

  const upcoming = eventData
    .map(e => {
      // 解析日期與時間
      const dateStr = e.date;
      const timeStr = e.time || "00:00";
      const [y,m,d] = dateStr.split("-").map(Number);
      const [h,min] = timeStr.split(":").map(Number);
      const dateTime = new Date(y, m-1, d, h, min);
      return { ...e, dateTime };
    })
    .filter(e => e.dateTime > now)
    .sort((a,b) => a.dateTime - b.dateTime);

  console.log("📌 篩選後 upcoming =", upcoming);
  return upcoming.length > 0 ? upcoming[0] : null;
}

function displayNextEvent() {
  const nextEventLink = document.getElementById("next-event-link");
  const nextEvent = getNextEvent();
  if (nextEvent) {
    nextEventLink.textContent = `${nextEvent.date} ${nextEvent.time || ""} - ${nextEvent.text}`;
    nextEventLink.href = "event.html";
  } else {
    nextEventLink.textContent = "無事件";
    nextEventLink.removeAttribute("href");
  }
}

// 初始化顯示
displayNextEvent();

// 監聽其他頁面更新 localStorage，即時刷新
window.addEventListener("storage", (e) => {
  if (e.key === "eventData") {
    displayNextEvent();
  }
});