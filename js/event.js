let eventsData = [];

// 顯示重大事件列表
function displayEvents(){
  const eventList = document.getElementById("event-list");
  eventList.innerHTML = "";

  // 依日期+時間排序
  eventsData.sort((a,b)=>{
    return (a.date + " " + a.time).localeCompare(b.date + " " + b.time);
  });

  eventsData.forEach(event=>{
    const li = document.createElement("li");
    li.textContent = `${event.date} ${event.time} - ${event.name}`;
    eventList.appendChild(li);
  });
}

// 新增事件
document.getElementById("add-event-btn").addEventListener("click", ()=>{
  const date = document.getElementById("event-date").value;
  const time = document.getElementById("event-time").value;
  const name = document.getElementById("event-name").value.trim();

  if(date && time && name){
    eventsData.push({date, time, name});
    document.getElementById("event-date").value = "";
    document.getElementById("event-time").value = "";
    document.getElementById("event-name").value = "";
    displayEvents();
  }
});

// 初始化
displayEvents();