// --- 1. Firebase 設定 ---
const firebaseConfig = {
    apiKey: "AIzaSyDCjUE-uDGHuTwShun_hUkHI0OgAEGx_Zk",
    authDomain: "campusmate-aa158.firebaseapp.com",
    projectId: "campusmate-aa158",
    storageBucket: "campusmate-aa158.firebasestorage.app",
    messagingSenderId: "233940430236",
    appId: "1:233940430236:web:0c7c25280a6074e6bb6c59",
    measurementId: "G-RJBVYV11FB"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// --- 2. 全域變數與資料設定 (修正：移到最上面以避免錯誤) ---
let currentUser = null;
let userType = localStorage.getItem('userType');
let currentDay = new Date().getDay(); 
if (currentDay === 0 || currentDay === 6) currentDay = 1;

let weeklySchedule = {};

// 預設課表
const defaultSchedule = {
    1: [{ time: '08:10', subject: '國文', room: '301' }, { time: '09:10', subject: '數學', room: '301' }],
    2: [{ time: '10:00', subject: '體育', room: '操場' }],
    3: [], 4: [], 5: []
};

// 預設成績 (修正：移到這裡，讓程式一開始就讀得到)
const grades = [
    { subject: '國文', credit: 3, score: 85 },
    { subject: '數學', credit: 4, score: 92 },
    { subject: '英文', credit: 2, score: 78 }
];

// --- 3. 程式啟動入口 ---
// 監聽登入狀態 (這會自動觸發資料載入)
auth.onAuthStateChanged((user) => {
    if (user) {
        // 使用者已登入
        currentUser = user;
        const loginOverlay = document.getElementById('login-overlay');
        const userInfo = document.getElementById('user-info');
        const userPhoto = document.getElementById('user-photo');

        if(loginOverlay) loginOverlay.style.display = 'none';
        if(userInfo) userInfo.style.display = 'flex';
        if(userPhoto) userPhoto.src = user.photoURL;

        console.log("登入成功:", user.displayName);
        
        loadData();
        checkUserType(); // 登入後才檢查身分與載入介面
    } else {
        // 未登入
        currentUser = null;
        const loginOverlay = document.getElementById('login-overlay');
        const userInfo = document.getElementById('user-info');

        if(loginOverlay) loginOverlay.style.display = 'flex';
        if(userInfo) userInfo.style.display = 'none';
    }
});

// --- 4. 核心功能函式 ---

function loginWithGoogle() {
    auth.signInWithPopup(provider).catch((error) => {
        alert("登入失敗: " + error.message);
        console.error(error);
    });
}

function logout() {
    auth.signOut().then(() => {
        window.location.reload();
    });
}

function loadData() {
    if (!currentUser) return;
    const storageKey = 'schedule_' + currentUser.uid;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
        weeklySchedule = JSON.parse(saved);
    } else {
        weeklySchedule = defaultSchedule;
    }
}

function saveData() {
    if (!currentUser) return;
    const storageKey = 'schedule_' + currentUser.uid;
    localStorage.setItem(storageKey, JSON.stringify(weeklySchedule));
    switchDay(currentDay);
}

function checkUserType() {
    // 檢查是否有選過身分 (這裡可以優化成跟著帳號存，但目前先維持跟著瀏覽器存)
    if (!userType) {
        const modal = document.getElementById('welcome-modal');
        if(modal) modal.style.display = 'flex';
    } else {
        initUI();
    }
}

function setUserType(type) {
    localStorage.setItem('userType', type);
    userType = type;
    document.getElementById('welcome-modal').style.display = 'none';
    initUI();
}

function resetIdentity() {
    localStorage.removeItem('userType');
    userType = null;
    document.getElementById('welcome-modal').style.display = 'flex';
}

function initUI() {
    const badge = document.getElementById('user-badge');
    if(badge) badge.innerText = userType === 'university' ? '大學部' : '高中部';
    
    const uniElements = document.querySelectorAll('.uni-only');
    const displayStyle = userType === 'university' ? 'table-cell' : 'none';
    uniElements.forEach(el => el.style.display = displayStyle);
    
    switchDay(currentDay);
    loadGrades(); 
}

function switchDay(day) {
    currentDay = day;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`tab-${day}`);
    if(activeBtn) activeBtn.classList.add('active');

    const todayData = weeklySchedule[day] || [];
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

// 編輯課程功能
function openEditModal() {
    const modal = document.getElementById('course-modal');
    if(modal) {
        modal.style.display = 'flex';
        renderEditList();
    }
}

function closeEditModal() {
    const modal = document.getElementById('course-modal');
    if(modal) modal.style.display = 'none';
}

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

        // 清空輸入
        timeIn.value = '';
        subIn.value = '';
        roomIn.value = '';

        saveData(); 
        renderEditList(); 
    } else {
        alert('請至少輸入時間與科目名稱！');
    }
}

function deleteCourse(index) {
    if (confirm('確定要刪除這堂課嗎？')) {
        weeklySchedule[currentDay].splice(index, 1);
        saveData(); 
        renderEditList(); 
    }
}

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
