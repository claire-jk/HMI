// =====================================================
// js/weather.js
// 即時氣象站（含城市切換 / 7 天預報）
// =====================================================


// =========================
// 1. 設定區
// =========================

// 🚨 記得替換成自己的氣象署授權碼
const CWA_AUTH_KEY = "CWA-9BEFF585-4A1F-44D6-AD64-D676D2812788";

// CWA 36 小時預報資料集
const API_36HR = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001";

// CWA 7 天預報 – 各縣市一週預報
const API_7DAY = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-091";


// =========================
// 2. DOM 元素
// =========================
const loadingEl = document.getElementById("loading");
const weatherCardEl = document.getElementById("weather-card");

const citySelectEl = document.getElementById("city-select");
const viewForecastBtn = document.getElementById("view-forecast-btn"); // 7天預報按鈕

const locationNameEl = document.getElementById("location-name");
const weatherIconEl = document.getElementById("weather-icon");
const weatherTextEl = document.getElementById("weather-text");

const tempRangeEl = document.getElementById("temp-range");
const popEl = document.getElementById("pop");

const updateTimeEl = document.getElementById("update-time");
const currentTimeEl = document.getElementById("current-time");

// 修正點 1: 7 天預報的目標容器 ID
const forecastListEl = document.getElementById("forecast-list"); 


// =========================
// 3. 工具函式
// =========================

/**
 * 根據中文描述回傳 Font Awesome 圖示
 */
function getWeatherIcon(wxDescription) {
    if (wxDescription.includes("晴")) return "fas fa-sun";
    if (wxDescription.includes("陰")) return "fas fa-cloud";
    if (wxDescription.includes("多雲")) return "fas fa-cloud-sun";
    if (wxDescription.includes("雨")) return "fas fa-cloud-showers-heavy";
    if (wxDescription.includes("雷")) return "fas fa-bolt";
    if (wxDescription.includes("雪")) return "fas fa-snowflake";
    return "fas fa-question";
}

/**
 * 右上角顯示時間
 */
function updateCurrentTime() {
    const now = new Date();
    currentTimeEl.textContent = now.toLocaleTimeString("zh-TW", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });
}


// =========================
// 4. 36 小時天氣：抓取與渲染 (主頁)
// =========================
async function fetchAndRenderWeather(cityName) {

    const locationName = cityName || citySelectEl.value;
    const API_URL = `${API_36HR}?Authorization=${CWA_AUTH_KEY}&locationName=${locationName}`;

    loadingEl.classList.remove("hidden");
    weatherCardEl.classList.add("hidden");

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.success !== "true") {
            throw new Error(`CWA API 錯誤: ${data.message || "無法取得資料"}`);
        }

        const locationData = data.records.location[0];

        const Wx = locationData.weatherElement.find(e => e.elementName === "Wx")
            .time[0].parameter.parameterName;

        const MaxT = locationData.weatherElement.find(e => e.elementName === "MaxT")
            .time[0].parameter.parameterName;

        const MinT = locationData.weatherElement.find(e => e.elementName === "MinT")
            .time[0].parameter.parameterName;

        const PoP = locationData.weatherElement.find(e => e.elementName === "PoP")
            .time[0].parameter.parameterName;

        const dataTime = new Date(data.records.issueTime).toLocaleString("zh-TW");

        // ======= 渲染到頁面 =======
        locationNameEl.textContent = locationData.locationName;
        weatherTextEl.textContent = Wx;
        tempRangeEl.textContent = `${MinT} ~ ${MaxT} °C`;
        popEl.textContent = `${PoP} %`;

        weatherIconEl.className = "icon " + getWeatherIcon(Wx);
        updateTimeEl.textContent = `更新時間：${dataTime}`;

    } catch (error) {

        console.error("抓取天氣資料錯誤：", error);

        locationNameEl.textContent = "資料載入失敗";
        weatherTextEl.textContent = "無法連線至氣象署服務";

        tempRangeEl.textContent = "N/A";
        popEl.textContent = "N/A";

        weatherIconEl.className = "icon fas fa-exclamation-triangle";

        updateTimeEl.textContent = `錯誤發生於 ${new Date().toLocaleTimeString("zh-TW")}`;

    } finally {
        loadingEl.classList.add("hidden");
        weatherCardEl.classList.remove("hidden");
    }
}


// =========================
// 5. 7 天預報功能 (forecast.html 專用)
// =========================
async function fetchAndRenderForecast(cityName) {

    const locationName = cityName || citySelectEl.value;

    // 修正點 2: 檢查目標容器是否存在
    if (!forecastListEl) return;

    const API_URL = `${API_7DAY}?Authorization=${CWA_AUTH_KEY}&locationName=${locationName}`;

    forecastListEl.innerHTML = "<p class='loading-forecast'><i class='fas fa-spinner fa-spin'></i> 正在載入 7 天預報...</p>";

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.success !== "true") {
            throw new Error("7 天預報資料無法取得");
        }

        const location = data.records.locations[0].location[0];

        const Wx = location.weatherElement.find(e => e.elementName === "WeatherDescription");
        const MinT = location.weatherElement.find(e => e.elementName === "MinT");
        const MaxT = location.weatherElement.find(e => e.elementName === "MaxT");

        let html = "";

        for (let i = 0; i < 7; i++) {

            // 取日期部分，去掉年份
            const dateStr = Wx.time[i].startTime.split(" ")[0].slice(5);
            const desc = Wx.time[i].elementValue[0].value;

            const min = MinT.time[i].elementValue[0].value;
            const max = MaxT.time[i].elementValue[0].value;

            html += `
                <div class="forecast-item">
                    <span class="day">${dateStr.replace('-', '/')}</span>
                    <i class="${getWeatherIcon(desc)} icon"></i>
                    <p class="desc">${desc}</p>
                    <p class="temp">${min}°C ~ ${max}°C</p>
                </div>
            `;
        }

        forecastListEl.innerHTML = html;

    } catch (err) {
        console.error("7天預報錯誤:", err);
        forecastListEl.innerHTML = `<p class="error">無法取得 7 天預報資料：請檢查授權碼或網路連線。</p>`;
    }
}


// =========================
// 6. 事件監聽
// =========================

// 城市切換 → 立即更新天氣
citySelectEl?.addEventListener("change", () => {
    if (forecastListEl) {
        fetchAndRenderForecast(citySelectEl.value);
    } else {
        fetchAndRenderWeather(citySelectEl.value);
    }
});

// 點擊按鈕跳轉到 7 天預報頁面
viewForecastBtn?.addEventListener("click", () => {
    window.location.href = "forecast.html";
});


// =========================
// 7. 初始化
// =========================

// 判斷是否為 7 天預報頁面
if (forecastListEl) {
    fetchAndRenderForecast();
} else {
    fetchAndRenderWeather();
    // 每 30 分鐘刷新一次
    setInterval(fetchAndRenderWeather, 30 * 60 * 1000);
}

// 每秒更新右上角時間
setInterval(updateCurrentTime, 1000);
updateCurrentTime();