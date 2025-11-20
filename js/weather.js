// js/weather.js

// ====== 設定區塊 ======
// 請替換成您自己的 CWA 授權碼
// 注意：我保留了您提供的授權碼，但建議您使用自己的金鑰確保長期穩定
const CWA_AUTH_KEY = "CWA-9BEFF585-4A1F-44D6-AD64-D676D2812788"; 
// 選擇您想顯示的城市 (F-C0032-001 僅提供 22 縣市)
const LOCATION_NAME = "臺北市"; 
// CWA 36 小時預報 API
const API_URL = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${CWA_AUTH_KEY}&locationName=${LOCATION_NAME}`;


// ====== DOM 元素 ======
const loadingEl = document.getElementById('loading');
const weatherCardEl = document.getElementById('weather-card');
const locationNameEl = document.getElementById('location-name');
const weatherIconEl = document.getElementById('weather-icon');
const weatherTextEl = document.getElementById('weather-text');
const maxTempEl = document.getElementById('max-temp');
const popEl = document.getElementById('pop'); // 降雨機率
const updateTimeEl = document.getElementById('update-time');
const currentTimeEl = document.getElementById('current-time');


// ====== 工具函式 ======

/**
 * 根據天氣狀況 (Wx) 描述，回傳對應的圖示
 * @param {string} wxDescription 
 * @returns {string} FontAwesome 圖示類別
 */
function getWeatherIcon(wxDescription) {
    if (wxDescription.includes("晴")) return 'fas fa-sun';
    if (wxDescription.includes("陰")) return 'fas fa-cloud';
    if (wxDescription.includes("雨")) return 'fas fa-cloud-showers-heavy';
    if (wxDescription.includes("雷")) return 'fas fa-bolt';
    if (wxDescription.includes("多雲")) return 'fas fa-cloud-sun';
    if (wxDescription.includes("雪")) return 'fas fa-snowflake';
    return 'fas fa-question'; // 預設圖示
}

/**
 * 格式化時間 (HH:MM:SS)
 */
function updateCurrentTime() {
    const now = new Date();
    currentTimeEl.textContent = now.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

// ====== 核心功能：抓取與渲染天氣資料 ======

async function fetchAndRenderWeather() {
    // 1. 顯示載入中
    loadingEl.classList.remove('hidden');
    weatherCardEl.classList.add('hidden');

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.success !== 'true') {
             // 處理 API 回傳失敗 (例如授權碼錯誤)
            throw new Error(`CWA API 錯誤: ${data.message || '無法取得資料'}`);
        }
        
        // 2. 解析資料
        const locationData = data.records.location[0];
        
        // 從 locationData 中提取需要的元素
        const Wx = locationData.weatherElement.find(el => el.elementName === 'Wx').time[0].parameter.parameterName; // 天氣狀況
        const MaxT = locationData.weatherElement.find(el => el.elementName === 'MaxT').time[0].parameter.parameterName; // 最高溫度
        const PoP = locationData.weatherElement.find(el => el.elementName === 'PoP').time[0].parameter.parameterName; // 降雨機率

        const dataTime = new Date(data.records.issueTime).toLocaleString('zh-TW');

        // 3. 渲染到頁面
        locationNameEl.textContent = locationData.locationName;
        weatherTextEl.textContent = Wx;
        maxTempEl.textContent = `${MaxT} °C`;
        popEl.textContent = `${PoP} %`;
        
        weatherIconEl.className = 'icon ' + getWeatherIcon(Wx);
        updateTimeEl.textContent = `更新時間: ${dataTime}`;


    } catch (error) {
        console.error("抓取天氣資料時發生錯誤：", error);
        
        locationNameEl.textContent = '資料載入失敗';
        weatherTextEl.textContent = '無法連線至氣象署服務或授權碼錯誤';
        maxTempEl.textContent = 'N/A';
        popEl.textContent = 'N/A';
        weatherIconEl.className = 'icon fas fa-exclamation-triangle';
        updateTimeEl.textContent = `錯誤發生於: ${new Date().toLocaleTimeString('zh-TW')}`;
        
    } finally {
        // 4. 隱藏載入中，顯示卡片
        loadingEl.classList.add('hidden');
        weatherCardEl.classList.remove('hidden');
    }
}


// ====== 初始化與定時器 ======

// 立即執行抓取和渲染
fetchAndRenderWeather();

// CWA 資料約每 1-3 小時更新一次。我們每 30 分鐘檢查一次
setInterval(fetchAndRenderWeather, 30 * 60 * 1000); 

// 每秒更新時間
setInterval(updateCurrentTime, 1000);
updateCurrentTime(); // 立即執行一次