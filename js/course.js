// --- 課程與課表邏輯 ---
function switchDay(day) {
    currentDay = day;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`tab-${day}`);
    if (activeBtn) activeBtn.classList.add('active');

    const todayData = weeklySchedule[day] || [];
    todayData.sort((a, b) => (a.period || a.time || "").localeCompare(b.period || b.time || ""));

    const tbody = document.getElementById('schedule-body');
    if (tbody) {
        tbody.innerHTML = '';
        if (todayData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-class">😴 無課程</td></tr>';
        } else {
            todayData.forEach(item => {
                const period = item.period || "-";
                const teacher = item.teacher || "";
                const room = item.room || "";

                const row = `
                    <tr>
                        <td style="color:#primary; font-weight:bold;">${period}</td>
                        <td style="color:#666;">${item.time}</td>
                        <td style="font-weight:bold;">${item.subject}</td>
                        <td><span style="background:#f0f0f0; padding:2px 4px; border-radius:4px; font-size:0.8rem;">${room}</span></td>
                        <td style="font-size:0.85rem;">${teacher}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        }
    }
}

function renderEditList() {
    const listDiv = document.getElementById('current-course-list');
    const todayData = weeklySchedule[currentDay] || [];
    let html = '';
    todayData.forEach((item, index) => {
        const info = `${item.time} ${item.room ? '@' + item.room : ''}`;
        html += `<div class="course-list-item"><div class="course-info"><div class="course-name">${item.subject}</div><div class="course-time">${info}</div></div><button class="btn-delete" onclick="deleteCourse(${index})">刪除</button></div>`;
    });
    listDiv.innerHTML = html || '<p style="color:#999; text-align:center;">無課程</p>';
}

function addCourse() {
    const period = document.getElementById('input-period').value;
    const time = document.getElementById('input-time').value;
    const sub = document.getElementById('input-subject').value;
    const room = document.getElementById('input-room').value;
    const teacher = document.getElementById('input-teacher').value;

    if (sub && (time || period)) {
        if (!weeklySchedule[currentDay]) weeklySchedule[currentDay] = [];
        weeklySchedule[currentDay].push({
            period: period || "",
            time: time || "",
            subject: sub,
            room: room || "",
            teacher: teacher || ""
        });
        // 清空輸入框
        document.getElementById('input-period').value = '';
        document.getElementById('input-time').value = '';
        document.getElementById('input-subject').value = '';
        document.getElementById('input-room').value = '';
        document.getElementById('input-teacher').value = '';
        saveData(); renderEditList();
    } else alert('請至少輸入科目以及 (時間或節次)');
}

function deleteCourse(index) {
    if (confirm('確定刪除？')) {
        weeklySchedule[currentDay].splice(index, 1);
        saveData();
        renderEditList();
    }
}

function openEditModal() {
    document.getElementById('course-modal').style.display = 'flex';
    renderEditList();
}

function closeEditModal() {
    document.getElementById('course-modal').style.display = 'none';
}