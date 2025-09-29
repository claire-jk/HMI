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

    // ✅ 晚上固定夜晚背景 + 白字
    if (hour >= 18 || hour < 6) {
      document.body.className = "weather-night";
      document.body.style.color = "#fff";
      weatherInfo.innerHTML = `<span class="icon">🌙</span> 現在是夜晚`;
      return;
    }

    // 白天才依照天氣 API 切換
    const url = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-9BEFF585-4A1F-44D6-AD64-D676D2812788&locationName=臺北市";
    const res = await fetch(url);
    const data = await res.json();
    const wx = data.records.location[0].weatherElement[0].time[0].parameter.parameterName;

    let icon = "🌤"; // 預設
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

    // 白天字體用深色
    document.body.style.color = "#333";

    // ✅ 更新小區塊（含圖示）
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
let eventsData = JSON.parse(localStorage.getItem("eventsData")) || [];

function getNextEvent() {
  const now = new Date();
  const upcoming = eventsData
    .map(e => {
      const dateTime = new Date(`${e.date}T${e.time}`);
      return { ...e, dateTime };
    })
    .filter(e => e.dateTime > now)
    .sort((a, b) => a.dateTime - b.dateTime);

  return upcoming.length > 0 ? upcoming[0] : null;
}

function displayNextEvent() {
  const nextEventLink = document.getElementById("next-event-link");
  const nextEvent = getNextEvent();
  if (nextEvent) {
    nextEventLink.textContent = `${nextEvent.date} ${nextEvent.time} - ${nextEvent.name}`;
  } else {
    nextEventLink.textContent = "無事件";
  }
}

displayNextEvent();