// =====================================================
// js/forecast.js (V5: F-D0047-089 + 顯示資料集錯誤提示)
// =====================================================

// =========================
// 1. 設定區
// =========================
const CWA_AUTH_KEY = "CWA-9BEFF585-4A1F-44D6-AD64-D676D2812788";
const API_7DAY = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-089";

// =========================
// 2. DOM 元素
// =========================
const citySelectEl = document.getElementById("city-select");
const forecastListEl = document.getElementById("forecast-list");
const locationNameEl = document.getElementById("forecast-location-name");
const updateTimeEl = document.getElementById("update-time");
const currentTimeEl = document.getElementById("current-time");

// =========================
// 3. 工具函式
// =========================
function normalizeCityName(name) {
    if (!name) return '';
    return name.replace(/臺/g, '台').trim();
}

function getWeatherIcon(wxDescription) {
    if (wxDescription.includes("晴")) return "fas fa-sun";
    if (wxDescription.includes("陰")) return "fas fa-cloud";
    if (wxDescription.includes("多雲")) return "fas fa-cloud-sun";
    if (wxDescription.includes("雨")) return "fas fa-cloud-showers-heavy";
    if (wxDescription.includes("雷")) return "fas fa-bolt";
    if (wxDescription.includes("雪")) return "fas fa-snowflake";
    return "fas fa-question";
}

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
// 4. 抓取與渲染 7 天預報
// =========================
async function fetchAndRenderForecast(cityName) {
    const displayLocationName = cityName || citySelectEl.value;

    forecastListEl.innerHTML = `
        <p class='loading-forecast'>
            <i class='fas fa-spinner fa-spin'></i> 正在抓取 ${displayLocationName} 的 7 天預報...
        </p>
    `;
    locationNameEl.textContent = displayLocationName;

    const API_URL = `${API_7DAY}?Authorization=${CWA_AUTH_KEY}`;

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.success !== "true") {
            throw new Error(`API 服務錯誤: ${data.message || '無法取得資料'}`);
        }

        const allLocations = data.records?.locations || [];

        // 如果資料為空陣列，顯示明顯錯誤提示
        if (allLocations.length === 0) {
            forecastListEl.innerHTML = `
                <p class="error">
                    ⚠️ 無法取得任何縣市資料！<br>
                    請確認您的 CWA_AUTH_KEY 是否有效，或該資料集 (F-D0047-089) 是否有權限。
                </p>
            `;
            updateTimeEl.textContent = `更新時間：${new Date().toLocaleTimeString("zh-TW")}`;
            return;
        }

        const normalizedTargetName = normalizeCityName(displayLocationName);
        const location = allLocations.find(loc => normalizeCityName(loc.locationName) === normalizedTargetName);

        if (!location) {
            throw new Error(`找不到 ${displayLocationName} 的預報資料。請檢查授權碼或城市名稱。`);
        }

        const Wx = location.weatherElement.find(e => e.elementName === "Wx");
        const MinT = location.weatherElement.find(e => e.elementName === "MinT");
        const MaxT = location.weatherElement.find(e => e.elementName === "MaxT");
        const dataTime = new Date(data.records.issueTime).toLocaleString("zh-TW");

        const forecastTimes = Wx?.time || [];
        const totalForecastItems = forecastTimes.length;

        let html = "";
        let dayCount = 0;

        for (let i = 0; i < totalForecastItems; i += 2) {
            const dayTimeData = forecastTimes[i];
            if (!dayTimeData) continue;

            const dateStr = dayTimeData.startTime?.split(" ")[0].slice(5).replace('-', '/') || 'N/A';
            dayCount++;

            const desc = Wx.time[i]?.elementValue?.[0]?.value || '資料不足';
            const min = MinT.time[i]?.elementValue?.[0]?.value || '-';
            const max = MaxT.time[i]?.elementValue?.[0]?.value || '-';
            const tempDisplay = (min !== '-' && max !== '-') ? `${min}°C ~ ${max}°C` : 'N/A';
            const iconClass = getWeatherIcon(desc);

            html += `
                <div class="forecast-item">
                    <span class="day">${dateStr}</span>
                    <i class="${iconClass} icon"></i>
                    <p class="desc">${desc}</p>
                    <p class="temp">${tempDisplay}</p>
                </div>
            `;

            if (dayCount >= 7) break;
        }

        forecastListEl.innerHTML = html;
        updateTimeEl.textContent = `更新時間：${dataTime}`;

    } catch (err) {
        console.error("7天預報錯誤:", err.message);
        forecastListEl.innerHTML = `
            <p class="error">
                載入失敗！錯誤訊息: <strong>${err.message}</strong> <br>
                請確認 CWA_AUTH_KEY 是否有效，或資料集是否正常。
            </p>
        `;
        updateTimeEl.textContent = `更新時間：${new Date().toLocaleTimeString("zh-TW")}`;
    }
}

// =========================
// 5. 事件監聽
// =========================
citySelectEl?.addEventListener("change", () => {
    fetchAndRenderForecast(citySelectEl.value);
});

// =========================
// 6. 初始化
// =========================
fetchAndRenderForecast();
setInterval(updateCurrentTime, 1000);
updateCurrentTime();

setInterval(() => {
    fetchAndRenderForecast(citySelectEl.value);
}, 30 * 60 * 1000);