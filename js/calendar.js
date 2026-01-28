// --- 行事曆功能 ---

function renderCalendar() {
    const listDiv = document.getElementById('calendar-list');
    if (!listDiv) return;

    // 依日期排序 (越近的在越上面)
    calendarEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    let html = '';
    if (calendarEvents.length === 0) {
        html = '<p style="color:#999; text-align:center;">😴 目前無活動</p>';
    } else {
        calendarEvents.forEach((event, index) => {
            // 檢查是否過期 (選用功能，這裡先變淡處理)
            const isPast = new Date(event.date) < new Date().setHours(0,0,0,0);
            const style = isPast ? 'opacity: 0.5;' : '';
            
            html += `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding:10px 0; ${style}">
                <div style="text-align:left;">
                    <div style="font-weight:bold; color:var(--primary); font-size:0.9rem;">${event.date}</div>
                    <div style="font-size:1rem;">${event.title}</div>
                </div>
                <button class="btn-delete" onclick="deleteCalendarEvent(${index})" style="padding:4px 8px;">🗑️</button>
            </div>`;
        });
    }
    listDiv.innerHTML = html;
}

function openCalendarModal() {
    document.getElementById('calendar-modal').style.display = 'flex';
    document.getElementById('input-cal-date').value = '';
    document.getElementById('input-cal-title').value = '';
}

function closeCalendarModal() {
    document.getElementById('calendar-modal').style.display = 'none';
}

function addCalendarEvent() {
    const date = document.getElementById('input-cal-date').value;
    const title = document.getElementById('input-cal-title').value;

    if (date && title) {
        calendarEvents.push({ date, title });
        saveData(); // 儲存到 localStorage
        closeCalendarModal();
        renderCalendar();
    } else {
        alert("請輸入日期與名稱");
    }
}

function deleteCalendarEvent(index) {
    if(confirm("確定刪除此活動？")) {
        calendarEvents.splice(index, 1);
        saveData();
        renderCalendar();
    }
}