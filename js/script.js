// 使用者選擇的心情
let selectedMood = null;

// 綁定心情按鈕事件
document.querySelectorAll(".mood-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedMood = btn.dataset.mood;

    // 先清掉舊的背景 class
    document.body.classList.remove(
      "mood-default",
      "mood-happy",
      "mood-angry",
      "mood-sad",
      "mood-calm",
      "mood-background"
    );

    // 根據選到的心情加上新的背景 class
    if (selectedMood === "喜") {
      document.body.classList.add("mood-happy", "mood-background");
    } else if (selectedMood === "怒") {
      document.body.classList.add("mood-angry", "mood-background");
    } else if (selectedMood === "哀") {
      document.body.classList.add("mood-sad", "mood-background");
    } else if (selectedMood === "平靜") {
      document.body.classList.add("mood-calm", "mood-background");
    }

    alert("已選擇心情：" + selectedMood);
  });
});

// 內建歌單對照表
const playlistMapping = {
  "喜-中": { name: "Happy Chinese", url: "https://youtube.com/playlist?list=PL3IOmYrQT7yyXnHP-pAzYQbyLKOMR7fFn&si=SB0D5u7nTzGGzYbq" },
  "喜-日": { name: "Happy Jpop", url: "https://youtube.com/playlist?list=PL3IOmYrQT7yxPMYkOQwwIIPH5H7msusl4&si=GRMZce4sPQ_a_ZVv" },
  "喜-韓": { name: "Happy Kpop", url: "https://youtube.com/playlist?list=PL3IOmYrQT7yyipZWwPlqjbwVtHGsXJG39&si=qYaflSqV2EY2QdVw" },
  "喜-英": { name: "Happy English", url: "https://youtube.com/playlist?list=PL3IOmYrQT7yyISQBVJSp69-gtrNOHIQ0I&si=XtWZ7_Pgystrd4GG" },
  "喜-無差": { name: "Happy", url: "https://youtube.com/playlist?list=PL3IOmYrQT7yyIJZB_JpaKxR-C87X3n7Gl&si=6ne_iJOeqHrCTHdf" },
  "怒-中": { name: "Angry Chinese", url: "https://youtube.com/playlist?list=PL3IOmYrQT7ywUQol17IW7GpTA40IX58OL&si=rtp8nUyPSllYwW07" },
  "怒-日": { name: "Angry Jpop", url: "https://youtube.com/playlist?list=PL3IOmYrQT7yxvkJBA_lPdyLgs53hmDXcX&si=SzbyoGIaR1OH9r9r" },
  "怒-韓": { name: "Angry Kpop", url: "https://youtube.com/playlist?list=PL3IOmYrQT7yyPLOqpJ4aPOHHgYPMzeB5u&si=Y-aDn0yL_L5cRAdH" },
  "怒-英": { name: "Angry English", url: "https://youtube.com/playlist?list=PL3IOmYrQT7yyISQBVJSp69-gtrNOHIQ0I&si=XtWZ7_Pgystrd4GG" },
  "怒-無差": { name: "Angry", url: "https://youtube.com/playlist?list=PL3IOmYrQT7yxRXM5yfYrQTD3an1kSdpKE&si=3NPtBwg98tz-eOvr" },
  "哀-中": { name: "Sad Chinese", url: "https://youtube.com/playlist?list=PL3IOmYrQT7yyGpI93rvozerL7g3V2nEpZ&si=woP2RqlL5A-E8UPC" },
  "哀-日": { name: "Sad Jpop", url: "https://youtube.com/playlist?list=PL3IOmYrQT7yxKEIBGTDQsyIOEQFOCRF40&si=yv-83joCYQIQdUQv" },
  "哀-韓": { name: "Sad Kpop", url: "https://youtube.com/playlist?list=PL3IOmYrQT7yy68-JQDhcWWQBaSPZ_ltyU&si=4D7IsGjYc3xw_IXn" },
  "哀-英": { name: "Sad English", url: "https://youtube.com/playlist?list=PL3IOmYrQT7yxpgIJqRgMVGb0Jrl-DJ_NH&si=mTp1OTRxkOzVugK-" },
  "哀-無差": { name: "Sad", url: "https://youtube.com/playlist?list=PL3IOmYrQT7yzeH33-AuCWZI67l9uo6rD1&si=kStZSg06LCR4lUy5" },
  "平靜-中": { name: "Chill Chinese", url: "https://youtube.com/playlist?list=PL3IOmYrQT7ywqC_KTcyF2H92AWDkP9ZP0&si=ORwv_gT0_vRgIo1H" },
  "平靜-日": { name: "Chill Jpop", url: "https://youtube.com/playlist?list=PL3IOmYrQT7yxBpOChr2ey8yAR_XCfNTGH&si=ZDfgeKIGYfZUn6KT" },
  "平靜-韓": { name: "Chill Kpop", url: "https://youtube.com/playlist?list=PL3IOmYrQT7yzIlmUyPZE3tOVq5Ml2GqOp&si=4TeFxNFYJFGiAv1k" },
  "平靜-英": { name: "Chill English", url: "https://youtube.com/playlist?list=PL3IOmYrQT7yyISQBVJSp69-gtrNOHIQ0I&si=XtWZ7_Pgystrd4GG" },
  "平靜-無差": { name: "Chill", url: "https://youtube.com/playlist?list=PL3IOmYrQT7yzRpHaLijVpXgiCKrRYzZbe&si=wFh4omPk1kNyimu4" }
};

// 推薦按鈕事件
document.getElementById("recommend-btn").addEventListener("click", () => {
  if (!selectedMood) {
    alert("請先選擇心情！");
    return;
  }
  const language = document.getElementById("language").value;
  const key = `${selectedMood}-${language}`;

  let playlist;
  if (playlistMapping[key]) {
    playlist = playlistMapping[key];
  } else {
    playlist = { 
      name: "預設隨機歌單", 
      url: "https://youtube.com/results?search_query=" + selectedMood + "+" + language + "+music" 
    };
  }

  // 顯示結果
  document.getElementById("playlist-name").textContent = playlist.name;
  const link = document.getElementById("playlist-link");
  link.href = playlist.url;

  document.getElementById("result").classList.remove("hidden");
});

// ------------------- 加分展示：API 搜尋範例 -------------------
async function searchSpotify(query) {
  const token = "YOUR_SPOTIFY_ACCESS_TOKEN"; 
  const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=1`, {
    headers: { "Authorization": "Bearer " + token }
  });
  const data = await res.json();
  console.log("Spotify search result:", data);
  return data;
}