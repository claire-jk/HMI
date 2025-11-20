// js/weather.js (替換整個 fetchForecast 函式)

let weatherChartInstance = null; // 用於儲存 Chart.js 實例 (此行保留在檔案頂部，不重複定義)

/**
 * 繪製一週預報圖表 (此函式不變)
 * @param {object} forecastData - 包含標籤、溫度和降雨機率的物件
 */
function renderChart(forecastData) {
    const ctx = document.getElementById('weatherChart').getContext('2d');

    if (weatherChartInstance) {
        weatherChartInstance.destroy();
    }
    
    // 設定 Chart.js 深色主題選項 (省略，與您當前版本相同)
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#e0e0e0', // 文字顏色
                    font: { size: 14 }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(30, 30, 30, 0.9)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#4fc3f7',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#e0e0e0' }
            },
            yTemp: {
                type: 'linear',
                position: 'left',
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#e0e0e0', callback: (value) => `${value}°C` },
                title: { display: true, text: '溫度 (°C)', color: '#fff' }
            },
            yPoP: {
                type: 'linear',
                position: 'right',
                grid: { drawOnChartArea: false },
                ticks: { color: '#4fc3f7', callback: (value) => `${value}%` },
                title: { display: true, text: '降雨機率 (%)', color: '#4fc3f7' },
                max: 100,
                min: 0
            }
        }
    };


    weatherChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: forecastData.labels,
            datasets: [
                {
                    label: '最高溫度',
                    data: forecastData.maxTemps,
                    type: 'line',
                    yAxisID: 'yTemp',
                    borderColor: '#ff9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.2)',
                    tension: 0.4,
                    pointRadius: 5
                },
                {
                    label: '最低溫度',
                    data: forecastData.minTemps,
                    type: 'line',
                    yAxisID: 'yTemp',
                    borderColor: '#4fc3f7',
                    backgroundColor: 'rgba(79, 195, 247, 0.2)',
                    tension: 0.4,
                    pointRadius: 5
                },
                {
                    label: '降雨機率',
                    data: forecastData.pops,
                    yAxisID: 'yPoP',
                    backgroundColor: 'rgba(79, 195, 247, 0.5)',
                    borderColor: '#4fc3f7',
                    borderWidth: 1,
                    type: 'bar', 
                    borderRadius: 5
                }
            ]
        },
        options: chartOptions
    });
}


async function fetchForecast() {
    try {
        const response = await fetch(API_URL_7DAY);
        const data = await response.json();
        
        if (data.success !== 'true') {
             throw new Error('CWA 7日預報 API 授權碼或請求錯誤');
        }

        // --- 修正後的資料解析邏輯 (針對 F-D0047-091) ---
        
        // 檢查 records.locations 是否存在，如果存在，使用舊路徑。
        // 如果不存在 (即錯誤詳情所示)，則檢查 records.location (這是 F-C0032-001 的路徑，可能通用)
        
        let allLocations = null;

        if (data.records.locations && data.records.locations.length > 0) {
            // CWA 7日 API 的標準路徑：locations[0].location 是一個縣市的陣列
            allLocations = data.records.locations[0].location;
        } else if (data.records.location) {
            // 備用路徑：有時資料集會直接將縣市陣列放在 records.location
            allLocations = data.records.location;
        }

        if (!allLocations || allLocations.length === 0) {
             throw new Error("CWA 7日預報資料結構錯誤: 找不到縣市清單");
        }
        
        // 嘗試找到目標縣市
        const locationData = allLocations.find(loc => loc.locationName === LOCATION_NAME_7DAY);

        if (!locationData) {
             throw new Error(`CWA 7日預報資料錯誤: 找不到縣市 ${LOCATION_NAME_7DAY} 的資料`);
        }

        const temperatureElement = locationData.weatherElement.find(el => el.elementName === 'T'); // T: 溫度範圍
        const popElement = locationData.weatherElement.find(el => el.elementName === 'PoP12h'); // PoP12h: 降雨機率 (12小時)

        if (!temperatureElement || !popElement) {
             throw new Error("CWA 7日預報資料錯誤: 缺少溫度或降雨機率元素");
        }
        
        // ----------------------------------------
        
        const forecastData = {
            labels: [],
            minTemps: [],
            maxTemps: [],
            pops: []
        };
        
        // 由於 F-D0047-091 提供 14 個時間段 (7天 x 2段)
        for (let i = 0; i < temperatureElement.time.length; i += 2) {
            const date = new Date(temperatureElement.time[i].startTime);
            const label = date.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });

            const minT = temperatureElement.time[i].elementValue[0].value;
            // 安全檢查 i+1
            const maxT = (i + 1 < temperatureElement.time.length) ? 
                         temperatureElement.time[i+1].elementValue[0].value : 
                         minT; 
            
            // PoP12h 也是每兩個時間段 (i, i+1) 代表 24 小時的降雨機率
            const pop1 = parseInt(popElement.time[i].elementValue[0].value) || 0;
            const pop2 = (i + 1 < popElement.time.length) ? 
                         parseInt(popElement.time[i+1].elementValue[0].value) || 0 :
                         0;
            const pop = Math.max(pop1, pop2);
            
            forecastData.labels.push(label);
            forecastData.minTemps.push(minT);
            forecastData.maxTemps.push(maxT);
            forecastData.pops.push(pop);
        }

        renderChart(forecastData);
        forecastCardEl.classList.remove('hidden');

    } catch (error) {
        console.error("抓取 7 日預報資料錯誤：", error);
        forecastCardEl.innerHTML = `<h2 style="color: ${window.getComputedStyle(document.body).getPropertyValue('--accent-color')}; padding: 10px;">七日預報載入失敗 😟</h2>
                                    <p style="color: var(--text-muted); font-size: 0.9em; margin-top: 10px;">錯誤詳情: ${error.message}</p>`;
    }
}