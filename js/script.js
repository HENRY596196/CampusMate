// --- 1. Firebase 設定 -----------------------------
const firebaseConfig = {
    apiKey: "AIzaSyDCjUE-uDGHuTwShun_hUkHI0OgAEGx_Zk",
    authDomain: "campusmate-aa158.firebaseapp.com",
    projectId: "campusmate-aa158",
    storageBucket: "campusmate-aa158.firebasestorage.app",
    messagingSenderId: "233940430236",
    appId: "1:233940430236:web:0c7c25280a6074e6bb6c59",
    measurementId: "G-RJBVYV11FB"
};
// --------------------------------------------------

// 初始化 Firebase (這是我們用的 CDN 寫法，跟截圖不一樣是正常的)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();


//----------------------------------------------------------
let userType = localStorage.getItem('userType');
let currentDay = new Date().getDay(); 
if (currentDay === 0 || currentDay === 6) currentDay = 1;

// 預設資料 (只有第一次使用時會用到)
const defaultSchedule = {
    1: [{ time: '08:10', subject: '國文', room: '301' }, { time: '09:10', subject: '數學', room: '301' }],
    2: [{ time: '10:00', subject: '體育', room: '操場' }],
    3: [], 4: [], 5: []
};

// 全域變數：目前的課表資料
let weeklySchedule = {};

// 初始化
const welcomeModal = document.getElementById('welcome-modal');
const courseModal = document.getElementById('course-modal');
const uniElements = document.querySelectorAll('.uni-only');

// 程式啟動
loadData(); // 1. 先讀取資料
checkUserType(); // 2. 檢查身分

function checkUserType() {
    if (!userType) {
        if(welcomeModal) welcomeModal.style.display = 'flex';
    } else {
        initUI();
    }
}

function setUserType(type) {
    localStorage.setItem('userType', type);
    userType = type;
    if(welcomeModal) welcomeModal.style.display = 'none';
    initUI();
}

function resetIdentity() {
    localStorage.removeItem('userType');
    userType = null;
    if(welcomeModal) welcomeModal.style.display = 'flex';
}

function initUI() {
    const badge = document.getElementById('user-badge');
    if(badge) badge.innerText = userType === 'university' ? '大學部' : '高中部';
    
    const displayStyle = userType === 'university' ? 'table-cell' : 'none';
    uniElements.forEach(el => el.style.display = displayStyle);
    
    switchDay(currentDay);
    loadGrades(); // (成績部分暫時維持唯讀，可後續擴充)
}

// --- 資料存取核心 ---
function loadData() {
    const saved = localStorage.getItem('myWeeklySchedule');
    if (saved) {
        weeklySchedule = JSON.parse(saved);
    } else {
        weeklySchedule = defaultSchedule; // 無資料則使用預設值
    }
}

function saveData() {
    localStorage.setItem('myWeeklySchedule', JSON.stringify(weeklySchedule));
    switchDay(currentDay); // 儲存後重新渲染畫面
}
// ------------------

// 切換星期
function switchDay(day) {
    currentDay = day; // 更新全域 currentDay，讓編輯視窗知道現在是星期幾
    
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`tab-${day}`);
    if(activeBtn) activeBtn.classList.add('active');

    const todayData = weeklySchedule[day] || [];
    // 依時間排序 (簡單排序)
    todayData.sort((a, b) => a.time.localeCompare(b.time));

    const tbody = document.getElementById('schedule-body');
    if(tbody) {
        tbody.innerHTML = '';
        if (todayData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="no-class">😴 本日無課程，點擊下方按鈕新增</td></tr>';
        } else {
            todayData.forEach(item => {
                const row = `
                    <tr>
                        <td style="color:#666; font-weight:bold;">${item.time}</td>
                        <td>${item.subject}</td>
                        <td><span style="background:#f0f0f0; padding:2px 6px; border-radius:4px; font-size:0.85rem;">${item.room}</span></td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        }
    }
}

// --- 編輯功能區 ---

// 1. 打開編輯視窗
function openEditModal() {
    if(courseModal) {
        courseModal.style.display = 'flex';
        renderEditList(); // 顯示目前的課程列表以便刪除
    }
}

// 2. 關閉編輯視窗
function closeEditModal() {
    if(courseModal) courseModal.style.display = 'none';
}

// 3. 在編輯視窗中顯示「可刪除的列表」
function renderEditList() {
    const listDiv = document.getElementById('current-course-list');
    const todayData = weeklySchedule[currentDay] || [];
    
    if (todayData.length === 0) {
        listDiv.innerHTML = '<p style="color:#999; text-align:center;">目前沒有課程</p>';
        return;
    }

    let html = '';
    todayData.forEach((item, index) => {
        html += `
            <div class="course-list-item">
                <div class="course-info">
                    <div class="course-name">${item.subject}</div>
                    <div class="course-time">${item.time} @ ${item.room}</div>
                </div>
                <button class="btn-delete" onclick="deleteCourse(${index})">刪除</button>
            </div>
        `;
    });
    listDiv.innerHTML = html;
}

// 4. 新增課程
function addCourse() {
    const timeIn = document.getElementById('input-time');
    const subIn = document.getElementById('input-subject');
    const roomIn = document.getElementById('input-room');

    if (timeIn.value && subIn.value) {
        if (!weeklySchedule[currentDay]) weeklySchedule[currentDay] = [];
        
        weeklySchedule[currentDay].push({
            time: timeIn.value,
            subject: subIn.value,
            room: roomIn.value || '未定'
        });

        // 清空輸入框
        timeIn.value = '';
        subIn.value = '';
        roomIn.value = '';

        saveData(); // 存檔
        renderEditList(); // 更新列表顯示
    } else {
        alert('請至少輸入時間與科目名稱！');
    }
}

// 5. 刪除課程
function deleteCourse(index) {
    if (confirm('確定要刪除這堂課嗎？')) {
        weeklySchedule[currentDay].splice(index, 1);
        saveData(); // 存檔
        renderEditList(); // 更新列表顯示
    }
}

// 成績部分 (維持不變)
const grades = [
    { subject: '國文', credit: 3, score: 85 },
    { subject: '數學', credit: 4, score: 92 },
    { subject: '英文', credit: 2, score: 78 }
];
function loadGrades() {
    const tbody = document.getElementById('grade-body');
    if(!tbody) return;
    tbody.innerHTML = '';
    let totalScore = 0;
    let count = 0;
    grades.forEach(g => {
        const row = `
            <tr>
                <td>${g.subject}</td>
                ${userType === 'university' ? `<td>${g.credit}</td>` : ''}
                <td style="font-weight:bold; color:${g.score < 60 ? 'red' : 'green'}">${g.score}</td>
            </tr>
        `;
        tbody.innerHTML += row;
        totalScore += g.score;
        count++;
    });
    if(count > 0) {
        document.getElementById('average-score').innerText = (totalScore / count).toFixed(1);
    }
}
