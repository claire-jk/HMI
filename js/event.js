// ===== 全域資料 =====
let eventList = document.getElementById("event-list");
let addBtn = document.getElementById("add-btn");
let dateInput = document.getElementById("event-date");
let timeInput = document.getElementById("event-time");
let textInput = document.getElementById("event-text");
let nextEventLink = document.getElementById("next-event-link"); // 🔹 新增：首頁「下一個重大事件」

// ===== 顯示重大事件清單 =====
function displayEvents() {
  if (!eventList) return; // event.html 才需要清單
  eventList.innerHTML = "";

  let eventData = JSON.parse(localStorage.getItem("eventData")) || [];
  eventData.sort(
    (a, b) =>
      new Date(`${a.date}T${a.time || "00:00"}`) -
      new Date(`${b.date}T${b.time || "00:00"}`)
  );

  eventData.forEach((event, index) => {
    const li = document.createElement("li");
    li.textContent = `${event.date} ${event.time || ""} ${event.text}`;

    // 刪除按鈕
    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑";
    delBtn.addEventListener("click", () => {
      eventData.splice(index, 1);
      localStorage.setItem("eventData", JSON.stringify(eventData));
      displayEvents(); // 立即刷新
      displayNextEvent(); // 🔹 同步更新首頁
    });

    li.appendChild(delBtn);
    eventList.appendChild(li);
  });
}

// ===== 顯示「下一個重大事件」在首頁 =====
function displayNextEvent() {
  if (!nextEventLink) return; // 只有 home.html 才需要

  let eventData = JSON.parse(localStorage.getItem("eventData")) || [];
  eventData.sort(
    (a, b) =>
      new Date(`${a.date}T${a.time || "00:00"}`) -
      new Date(`${b.date}T${b.time || "00:00"}`)
  );

  const today = new Date();
  const nextEvent = eventData.find(
    (event) => new Date(`${event.date}T${event.time || "00:00"}`) >= today
  );

  if (nextEvent) {
    nextEventLink.textContent = `${nextEvent.text}（${nextEvent.date} ${nextEvent.time || ""}）`;
    nextEventLink.href = "event.html";
  } else {
    nextEventLink.textContent = "無事件";
  }
}

// ===== 新增重大事件（手動） =====
if (addBtn) {
  addBtn.addEventListener("click", () => {
    const date = dateInput.value;
    const time = timeInput.value;
    const text = textInput.value.trim();
    if (!date || !text) return alert("請填日期與內容！");

    let eventData = JSON.parse(localStorage.getItem("eventData")) || [];
    eventData.push({ date, time, text });
    localStorage.setItem("eventData", JSON.stringify(eventData));

    // 清空輸入框
    dateInput.value = "";
    timeInput.value = "";
    textInput.value = "";

    displayEvents();     // 更新清單
    displayNextEvent();  // 🔹 更新首頁
  });
}

// ===== 監聽其他頁面的 storage 變化 =====
window.addEventListener("storage", (e) => {
  if (e.key === "eventData") {
    displayEvents();
    displayNextEvent();
  }
});

// ===== 初始化 =====
displayEvents();
displayNextEvent();