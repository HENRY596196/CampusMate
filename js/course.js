// --- 課程與課表邏輯 (含編輯功能) ---

// 新增變數：紀錄目前正在編輯的索引，-1 代表新增模式
let editingCourseIndex = -1;

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

                // === ★★★ 修改開始：處理標籤顯示 ★★★ ===
                // 1. 取得資料 (相容舊資料：如果沒有 nature 就用舊的 type，預設為必修)
                const nature = item.nature || item.type || '必修';
                const category = item.category || ''; // 類別 (例如：院共同)

                // 2. 設定顏色 (依照修別)
                let typeColor = "#999";
                if (nature === '必修') typeColor = "#e74c3c";       // 紅色
                else if (nature === '選修') typeColor = "#27ae60";  // 綠色
                else if (nature === '必選修') typeColor = "#f39c12"; // 橘色
                
                // 3. 組合顯示 HTML
                // 顯示樣式範例： [必修] (院共同)
                let badges = `<span style="font-size:0.7rem; color:white; background:${typeColor}; padding:2px 5px; border-radius:4px; margin-left:5px; vertical-align: middle;">${nature}</span>`;
                
                if (category && category !== '其他') {
                    badges += `<span style="font-size:0.7rem; color:#888; margin-left:3px;">(${category})</span>`;
                }


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
        // 新增修改按鈕
        html += `
        <div class="course-list-item">
            <div class="course-info">
                <div class="course-name">${item.subject}</div>
                <div class="course-time">${info}</div>
            </div>
            <div>
                <button class="btn-edit" onclick="editCourse(${index})">修改</button>
                <button class="btn-delete" onclick="deleteCourse(${index})">刪除</button>
            </div>
        </div>`;
    });
    listDiv.innerHTML = html || '<p style="color:#999; text-align:center;">無課程</p>';
}

// 新增：將資料填入輸入框，並切換為編輯模式
function editCourse(index) {
    const todayData = weeklySchedule[currentDay] || [];
    const item = todayData[index];
    if (!item) return;

    document.getElementById('input-period').value = item.period || '';
    document.getElementById('input-time').value = item.time || '';
    document.getElementById('input-subject').value = item.subject || '';

    document.getElementById('input-course-category').value = item.category || '通識';
    document.getElementById('input-course-nature').value = item.nature || item.type || '必修';

    document.getElementById('input-room').value = item.room || '';
    document.getElementById('input-teacher').value = item.teacher || '';

    editingCourseIndex = index;
    const btn = document.getElementById('btn-add-course');
    if (btn) {
        btn.innerText = "💾 保存修改";
        btn.style.background = "#f39c12"; // 變更顏色提示
    }
}

function addCourse() {
    const period = document.getElementById('input-period').value;
    const time = document.getElementById('input-time').value;
    const sub = document.getElementById('input-subject').value;

    const category = document.getElementById('input-course-category').value;
    const nature = document.getElementById('input-course-nature').value;

    const room = document.getElementById('input-room').value;
    const teacher = document.getElementById('input-teacher').value;

    if (sub && (time || period)) {
        if (!weeklySchedule[currentDay]) weeklySchedule[currentDay] = [];
        
        const courseData = {
            period: period || "",
            time: time || "",
            subject: sub,
            category: category,
            nature: nature,
            room: room || "",
            teacher: teacher || ""
        };

        if (editingCourseIndex > -1) {
            // 編輯模式：更新現有資料
            weeklySchedule[currentDay][editingCourseIndex] = courseData;
            alert("修改成功！");
        } else {
            // 新增模式：推入新資料
            weeklySchedule[currentDay].push(courseData);
        }

        resetCourseInput(); // 清空輸入框並重置按鈕
        // 新增課程
        saveData(); 
        renderEditList();

        updateExamSubjectOptions();
    } else alert('請至少輸入科目以及 (時間或節次)');
}

// 抽取出來的重置函式
function resetCourseInput() {
    document.getElementById('input-period').value = '';
    document.getElementById('input-time').value = '';
    document.getElementById('input-subject').value = '';

    document.getElementById('input-course-category').value = '通識'; // 或是您想設的其他預設值
    document.getElementById('input-course-nature').value = '必修';
    
    document.getElementById('input-room').value = '';
    document.getElementById('input-teacher').value = '';
    
    editingCourseIndex = -1;
    const btn = document.getElementById('btn-add-course');
    if (btn) {
        btn.innerText = "+ 加入清單";
        btn.style.background = "#333";
    }
}

function deleteCourse(index) {
    if (confirm('確定刪除？')) {
        // 如果正在編輯的項目被刪除了，要重置編輯狀態
        if (editingCourseIndex === index) resetCourseInput();
        
        weeklySchedule[currentDay].splice(index, 1);
        saveData();
        renderEditList();

        // === 刪除課程後立刻刷新上方選單 ===
        updateExamSubjectOptions();
    }
}

function openEditModal() {
    document.getElementById('course-modal').style.display = 'flex';
    resetCourseInput(); // 每次打開都確保是新增模式
    renderEditList();
}

function closeEditModal() {
    document.getElementById('course-modal').style.display = 'none';
    resetCourseInput(); // 關閉時清空
}
