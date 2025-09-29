let scheduleData = JSON.parse(localStorage.getItem("scheduleData")) || {};
let today = new Date();
let selectedDate = formatDate(today);
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

const calendarGrid = document.getElementById("calendar-grid");
const monthTitle = document.getElementById("month-title");

function generateCalendar(year, month) {
  calendarGrid.innerHTML = "";
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weekdays = ["日","一","二","三","四","五","六"];
  weekdays.forEach(day => {
    const div = document.createElement("div");
    div.textContent = day;
    div.style.fontWeight = "bold";
    calendarGrid.appendChild(div);
  });

  for(let i=0;i<firstDay;i++){
    calendarGrid.appendChild(document.createElement("div"));
  }

  for(let day=1;day<=daysInMonth;day++){
    const div = document.createElement("div");
    div.textContent = day;

    // 高亮今天
    if(formatDate(new Date(year, month, day)) === formatDate(today)){
      div.style.background = "#444";
      div.style.borderRadius = "50%";
    }

    div.addEventListener("click", () => {
      selectedDate = formatDate(new Date(year, month, day));
      displayTasks();
    });
    calendarGrid.appendChild(div);
  }

  monthTitle.textContent = `${year}年 ${month+1}月`;
}

function formatDate(date){
  const y=date.getFullYear(), m=String(date.getMonth()+1).padStart(2,'0'), d=String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}

function displayTasks(){
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";
  if(!scheduleData[selectedDate]) scheduleData[selectedDate]=[];

  // 排序 (如果有時間在前面)
  scheduleData[selectedDate].sort((a,b)=>a.split(" ")[0].localeCompare(b.split(" ")[0]));

  scheduleData[selectedDate].forEach((task,index)=>{
    const li = document.createElement("li");
    li.textContent = task;

    // ⭐ 按鈕 → 存進 eventData
    const starBtn = document.createElement("button");
    starBtn.className = "star-btn";
    starBtn.innerHTML = "⭐";
    starBtn.addEventListener("click",()=>{
      let eventData = JSON.parse(localStorage.getItem("eventData")) || [];
      eventData.push({date: selectedDate, time:"", text:task}); // 統一格式
      // 排序
      eventData.sort((a,b)=> new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
      localStorage.setItem("eventData", JSON.stringify(eventData));
      alert("已加入重大事件！");
      // 如果 event.html 有 displayEvents 函數就刷新
      if(typeof displayEvents === "function") displayEvents();
    });

    // 🗑 刪除按鈕
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerHTML = "🗑";
    deleteBtn.addEventListener("click",()=>{
      scheduleData[selectedDate].splice(index,1);
      saveData();
      displayTasks();
    });

    li.appendChild(starBtn);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });

  document.getElementById("schedule-title").textContent=`${selectedDate} 行程`;
}

// === 新增行程 ===
document.getElementById("add-task-btn").addEventListener("click",()=>{
  const input=document.getElementById("task-input");
  const value=input.value.trim();
  if(value){
    if(!scheduleData[selectedDate]) scheduleData[selectedDate]=[];
    scheduleData[selectedDate].push(value);
    saveData();
    input.value="";
    displayTasks();
  }
});

// === 保存到 LocalStorage ===
function saveData(){
  localStorage.setItem("scheduleData", JSON.stringify(scheduleData));
}

// === 月份切換 ===
document.getElementById("prev-month").addEventListener("click",()=>{
  currentMonth--; if(currentMonth<0){ currentMonth=11; currentYear--; }
  generateCalendar(currentYear,currentMonth);
});
document.getElementById("next-month").addEventListener("click",()=>{
  currentMonth++; if(currentMonth>11){ currentMonth=0; currentYear++; }
  generateCalendar(currentYear,currentMonth);
});

// === 初始化 ===
generateCalendar(currentYear,currentMonth);
displayTasks();