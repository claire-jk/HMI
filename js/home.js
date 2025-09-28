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

// ======= 簡單判斷白天/晚上背景 =======
function updateDayNight() {
  const hour = new Date().getHours();
  if (hour >= 18 || hour < 6) {
    document.body.className = "weather-night";
  }
}
updateDayNight();

// ======= 取得台北市天氣 → 切換背景 =======
async function updateWeather() {
  try {
    const url = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-9BEFF585-4A1F-44D6-AD64-D676D2812788&locationName=臺北市";
    const res = await fetch(url);
    const data = await res.json();
    const wx = data.records.location[0].weatherElement[0].time[0].parameter.parameterName;

    // 簡單關鍵字判斷
    if (wx.includes("晴")) {
      document.body.className = "weather-sunny";
    } else if (wx.includes("雲") || wx.includes("陰")) {
      document.body.className = "weather-cloudy";
    } else if (wx.includes("雨")) {
      document.body.className = "weather-rainy";
    }
  } catch (err) {
    console.log("天氣資料抓取失敗，使用預設背景", err);
  }
}
updateWeather();

// ======= 顯示下一個重大事件 =======
// 從 localStorage 讀取重大事件列表
let eventsData = JSON.parse(localStorage.getItem("eventsData")) || [];

// 找到下一個即將到來的事件
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

// 顯示在首頁
function displayNextEvent() {
  const nextEventLink = document.getElementById("next-event-link");
  const nextEvent = getNextEvent();
  if (nextEvent) {
    nextEventLink.textContent = `${nextEvent.date} ${nextEvent.time} - ${nextEvent.name}`;
  } else {
    nextEventLink.textContent = "無事件";
  }
}

// 初始化
displayNextEvent();