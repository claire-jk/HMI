// =========================================
// Firebase 導入 (從 firebase-init.js 導入實例)
// =========================================
import { auth, db } from "./firebase-init.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


// =========================================
// DOM 元素
// =========================================
const openModalBtn = document.getElementById("openModalBtn");
const eventModal = document.getElementById("eventModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");
const createEventBtn = document.getElementById("createEventBtn");
const eventList = document.getElementById("eventList");

// Modal 內標題與確認按鈕
const modalTitle = eventModal ? eventModal.querySelector("h2") : null;
const confirmBtn = createEventBtn;

// 表單欄位
const eventName = document.getElementById("eventName");
const eventDesc = document.getElementById("eventDesc");
const eventLink = document.getElementById("eventLink");
const eventDate = document.getElementById("eventDate");
const eventTime = document.getElementById("eventTime");
const eventCategory = document.getElementById("eventCategory");


// =========================================
// 狀態變數
// =========================================
let events = [];
let currentEditId = null;
let unsubscribe = null;
let currentUserID = null;


// =================================================
// 工具函式
// =================================================

// 清空表單與 modal 狀態
function resetModal() {
    if (!eventModal) return;

    eventName.value = "";
    eventDesc.value = "";
    eventLink.value = "";
    eventDate.value = "";
    eventTime.value = "";
    eventCategory.value = "其他";

    currentEditId = null;

    if (modalTitle) modalTitle.textContent = "新增事件";
    if (confirmBtn) confirmBtn.textContent = "新增事件";

    eventModal.classList.add("hidden");
}

// 倒數字串產生
function getCountdownText(dateStr, timeStr) {
    const target = new Date(`${dateStr}T${timeStr}:00`);
    const now = new Date();
    let diff = target - now;

    if (diff <= 0) return "活動進行中或已過期";

    const SEC = 1000;
    const MIN = SEC * 60;
    const HOUR = MIN * 60;
    const DAY = HOUR * 24;

    const days = Math.floor(diff / DAY);
    diff %= DAY;

    const hours = Math.floor(diff / HOUR);
    diff %= HOUR;

    const minutes = Math.floor(diff / MIN);
    diff %= MIN;

    const seconds = Math.floor(diff / SEC);

    let output = [];
    if (days > 0) output.push(`${days} 天`);

    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    const s = String(seconds).padStart(2, '0');

    output.push(`${h} 時 ${m} 分 ${s} 秒`);

    return output.join(" ").trim().replace(/\s+/g, " ");
}


// =================================================
// 渲染事件卡片
// =================================================
function renderEvents() {
    if (!eventList) return;

    if (!currentUserID) {
        eventList.innerHTML = `<p style="text-align:center;color:#777;margin-top:50px;">請先登入以載入您的重大事件。</p>`;
        return;
    }

    const sortedEvents = [...events].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}:00`);
        const dateB = new Date(`${b.date}T${b.time}:00`);
        return dateA - dateB;
    });

    eventList.innerHTML = "";

    if (sortedEvents.length === 0) {
        eventList.innerHTML = `<p style="text-align:center;color:#777;margin-top:50px;">您還沒有新增任何事件。</p>`;
        return;
    }

    sortedEvents.forEach(e => {
        const card = document.createElement("div");
        card.classList.add("event-card");
        card.dataset.dateTime = `${e.date} ${e.time}`;
        card.dataset.id = e.id;

        const hasLink = e.link && e.link.trim() !== "";
        const linkButton = hasLink
            ? `<a href="${e.link}" target="_blank" class="card-link">前往連結 <i class="fas fa-external-link-alt"></i></a>`
            : "";

        const editButton = `<button class="card-edit" data-id="${e.id}">編輯</button>`;

        card.innerHTML = `
          <div class="event-title">${e.name}</div>
          <div class="event-date">${e.date} ${e.time}</div>
          <div class="event-countdown">${getCountdownText(e.date, e.time)}</div>

          <div class="card-btn-row">
            ${linkButton}
            ${editButton}
            <button class="card-delete" data-id="${e.id}">刪除</button>
          </div>
        `;

        eventList.appendChild(card);
    });

    updateCountdown();
}


// =================================================
// 倒數更新
// =================================================
function updateCountdown() {
    if (!eventList) return;

    const countdownElements = document.querySelectorAll(".event-countdown");
    countdownElements.forEach(countdownEl => {
        const card = countdownEl.closest(".event-card");
        if (!card) return;
        const [dateStr, timeStr] = card.dataset.dateTime.split(" ");
        countdownEl.textContent = getCountdownText(dateStr, timeStr);
    });
}


// =================================================
// Firestore 監聽與同步
// =================================================
function startFirestoreListener(uid) {
    if (unsubscribe) unsubscribe();

    const eventsCol = collection(db, "events");
    const q = query(
        eventsCol,
        where("uid", "==", uid),
        orderBy("dateTime")
    );

    unsubscribe = onSnapshot(
        q,
        snapshot => {
            events = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            renderEvents();

            const now = new Date();
            const upcoming = events.filter(e => e.dateTime && new Date(e.dateTime) >= now);
            const nextEvent = upcoming.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))[0];

            if (nextEvent) {
                window.dispatchEvent(new CustomEvent("next-event-updated", {
                    detail: {
                        text: nextEvent.name,
                        date: nextEvent.date,
                        time: nextEvent.time
                    }
                }));
            } else {
                window.dispatchEvent(new CustomEvent("next-event-updated", { detail: {} }));
            }
        },
        error => {
            console.error("Firestore 監聽失敗:", error);
        }
    );
}

function stopFirestoreListener() {
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }

    events = [];

    if (eventList) {
        eventList.innerHTML =
            `<p style="text-align:center;color:#777;margin-top:50px;">請先登入以載入您的重大事件。</p>`;
    }
}


// =================================================
// 監聽登入狀態
// =================================================
onAuthStateChanged(auth, user => {
    if (user) {
        currentUserID = user.uid;
        startFirestoreListener(user.uid);
    } else {
        currentUserID = null;
        stopFirestoreListener();
        window.dispatchEvent(new CustomEvent("next-event-updated", { detail: {} }));
    }
});


// =================================================
// Modal 開啟 / 關閉
// =================================================
if (openModalBtn) {
    openModalBtn.addEventListener("click", () => {
        if (!currentUserID) return alert("請先登入才能新增事件。");

        resetModal();
        eventModal.classList.remove("hidden");
    });
}

if (closeModalBtn) closeModalBtn.addEventListener("click", resetModal);
if (cancelBtn) cancelBtn.addEventListener("click", resetModal);


// =================================================
// 載入事件到 Modal
// =================================================
function loadEventToModal(id) {
    const event = events.find(e => e.id === id);
    if (!event || !eventModal) return;

    currentEditId = id;

    if (modalTitle) modalTitle.textContent = `編輯事件: ${event.name}`;
    if (confirmBtn) confirmBtn.textContent = "儲存變更";

    eventName.value = event.name;
    eventDesc.value = event.desc;
    eventLink.value = event.link;
    eventDate.value = event.date;
    eventTime.value = event.time;
    eventCategory.value = event.category;

    eventModal.classList.remove("hidden");
}


// =================================================
// 新增 / 編輯事件
// =================================================
if (createEventBtn) {
    createEventBtn.addEventListener("click", async () => {
        if (!currentUserID) return alert("請先登入才能操作。");

        if (!eventName.value || !eventDate.value || !eventTime.value) {
            alert("請填寫必填欄位 *");
            return;
        }

        let linkValue = eventLink.value.trim();
        if (linkValue && !linkValue.startsWith("http")) {
            linkValue = "https://" + linkValue;
        }

        const dateTime = new Date(`${eventDate.value}T${eventTime.value}:00`).toISOString();

        const eventData = {
            uid: currentUserID,
            name: eventName.value,
            desc: eventDesc.value,
            link: linkValue,
            date: eventDate.value,
            time: eventTime.value,
            category: eventCategory.value,
            dateTime: dateTime
        };

        try {
            if (currentEditId) {
                const docRef = doc(db, "events", currentEditId);
                await updateDoc(docRef, eventData);
                alert("事件更新成功！");
            } else {
                await addDoc(collection(db, "events"), eventData);
                alert("事件新增成功！");
            }
            resetModal();
        } catch (error) {
            console.error("事件操作失敗:", error);
            alert("事件操作失敗，請稍後再試。");
        }
    });
}


// =================================================
// 刪除 / 編輯按鈕監聽
// =================================================
if (eventList) {
    eventList.addEventListener("click", async e => {
        const target = e.target.closest("button") || e.target.closest("a");
        const id = target ? target.dataset.id : null;
        if (!id || !currentUserID) return;

        if (target.classList.contains("card-delete")) {
            if (confirm("確定要刪除這個事件嗎？")) {
                try {
                    await deleteDoc(doc(db, "events", id));
                    alert("事件已刪除。");
                } catch (error) {
                    console.error("刪除失敗:", error);
                    alert("刪除失敗，請稍後再試。");
                }
            }
        }

        if (target.classList.contains("card-edit")) {
            loadEventToModal(id);
        }
    });
}


// =================================================
// 首次渲染 + 倒數更新
// =================================================
if (eventList) {
    eventList.innerHTML = `<p style="text-align:center;color:#777;margin-top:50px;">載入中...</p>`;
    setInterval(updateCountdown, 1000);
}

window.addEventListener("user-logged-out", () => {
    stopFirestoreListener();
    window.dispatchEvent(new CustomEvent("next-event-updated", { detail: {} }));
});
