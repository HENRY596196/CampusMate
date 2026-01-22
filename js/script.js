// --- 1. Firebase 設定 (請保留您原本正確的設定) ---
const firebaseConfig = {
    apiKey: "AIzaSyDCjUE-uDGHuTwShun_hUkHI0OgAEGx_Zk", // 請確認這是您的 Key
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

// --- 2. 全域變數 ---
let currentUser = null;
let userType = localStorage.getItem('userType');
let currentDay = new Date().getDay(); 
if (currentDay === 0 || currentDay === 6) currentDay = 1;

let weeklySchedule = {};
let gradeList = []; // 新增：用來存成績的陣列

// 預設資料
const defaultSchedule = {
    1: [{ time: '08:10', subject: '國文', room: '301' }],
    2: [{ time: '10:00', subject: '體育', room: '操場' }],
    3: [], 4: [], 5: []
};
// 預設成績
const defaultGrades = [
    { subject: '國文', credit: 3, score: 85 },
    { subject: '英文', credit: 2, score: 78 }
];

// --- 3. 程式啟動 ---
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        updateLoginUI(true);
        console.log("登入成功:", user.displayName);
        loadData();
        checkUserType();
    } else {
        currentUser = null;
        updateLoginUI(false);
    }
});

function updateLoginUI(isLoggedIn) {
    const loginOverlay = document.getElementById('login-overlay');
    const userInfo = document.getElementById('user-info');
    const userPhoto = document.getElementById('user-photo');
    
    if (loginOverlay) loginOverlay.style.display = isLoggedIn ? 'none' : 'flex';
    if (userInfo) userInfo.style.display = isLoggedIn ? 'flex' : 'none';
    if (userPhoto && currentUser) userPhoto.src = currentUser.photoURL;
}

// --- 4. 核心功能 ---

function loginWithGoogle() {
    auth.signInWithPopup(provider).catch((error) => alert("登入失敗: " + error.message));
}

function logout() {
    auth.signOut().then(() => window.location.reload());
}

// 讀取資料 (整合課表與成績)
function loadData() {
    if (!currentUser) return;
    
    // 讀取課表
    const scheduleKey = 'schedule_' + currentUser.uid;
    const savedSchedule = localStorage.getItem(scheduleKey);
    weeklySchedule = savedSchedule ? JSON.parse(savedSchedule) : defaultSchedule;

    // 讀取成績 (新增)
    const gradeKey = 'grades_' + currentUser.uid;
    const savedGrades = localStorage.getItem(gradeKey);
    gradeList = savedGrades ? JSON.parse(savedGrades) : defaultGrades;
}

// 儲存資料
function saveData() {
    if (!currentUser) return;
    
    // 儲存課表
    localStorage.setItem('schedule_' + currentUser.uid, JSON.stringify(weeklySchedule));
    switchDay(currentDay);

    // 儲存成績 (新增)
    localStorage.setItem('grades_' + currentUser.uid, JSON.stringify(gradeList));
    loadGrades(); // 重新計算平均並渲染
}

// 介面初始化
function checkUserType() {
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
    // 大學生顯示學分欄，高中生隱藏
    const displayStyle = userType === 'university' ? 'table-cell' : 'none';
    uniElements.forEach(el => el.style.display = displayStyle);
    
    switchDay(currentDay);
    loadGrades(); 
}

// --- 課表功能 (保持不變) ---
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
            tbody.innerHTML = '<tr><td colspan="3" class="no-class">😴 無課程</td></tr>';
        } else {
            todayData.forEach(item => {
                const row = `<tr><td style="color:#666; font-weight:bold;">${item.time}</td><td>${item.subject}</td><td><span style="background:#f0f0f0; padding:2px 6px; border-radius:4px; font-size:0.85rem;">${item.room}</span></td></tr>`;
                tbody.innerHTML += row;
            });
        }
    }
}

// --- 課程編輯視窗 ---
function openEditModal() {
    document.getElementById('course-modal').style.display = 'flex';
    renderEditList();
}
function closeEditModal() { document.getElementById('course-modal').style.display = 'none'; }

function renderEditList() {
    const listDiv = document.getElementById('current-course-list');
    const todayData = weeklySchedule[currentDay] || [];
    let html = '';
    todayData.forEach((item, index) => {
        html += `<div class="course-list-item"><div class="course-info"><div class="course-name">${item.subject}</div><div class="course-time">${item.time}</div></div><button class="btn-delete" onclick="deleteCourse(${index})">刪除</button></div>`;
    });
    listDiv.innerHTML = html || '<p style="color:#999; text-align:center;">無課程</p>';
}

function addCourse() {
    const time = document.getElementById('input-time').value;
    const sub = document.getElementById('input-subject').value;
    const room = document.getElementById('input-room').value;
    if (time && sub) {
        if (!weeklySchedule[currentDay]) weeklySchedule[currentDay] = [];
        weeklySchedule[currentDay].push({ time, subject: sub, room: room || '' });
        document.getElementById('input-time').value = ''; document.getElementById('input-subject').value = ''; document.getElementById('input-room').value = '';
        saveData(); renderEditList();
    } else alert('請輸入時間與科目');
}

function deleteCourse(index) {
    if(confirm('確定刪除？')) { weeklySchedule[currentDay].splice(index, 1); saveData(); renderEditList(); }
}

// --- 成績功能 (本次新增重點) ---

// 1. 渲染成績單與計算平均
function loadGrades() {
    const tbody = document.getElementById('grade-body');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    let totalScore = 0; // 總分 (或加權總分)
    let totalCredits = 0; // 總學分
    let count = 0; // 科目數

    gradeList.forEach(g => {
        const credit = parseFloat(g.credit) || 0;
        const score = parseFloat(g.score) || 0;

        // 大學生：加權計算 (分數 * 學分)
        // 高中生：算術計算 (分數)
        if (userType === 'university') {
            totalScore += score * credit;
            totalCredits += credit;
        } else {
            totalScore += score;
            count++;
        }

        const row = `
            <tr>
                <td>${g.subject}</td>
                ${userType === 'university' ? `<td>${credit}</td>` : ''}
                <td style="font-weight:bold; color:${score < 60 ? '#e74c3c' : '#2ecc71'}">${score}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    // 計算平均
    let average = 0;
    if (userType === 'university') {
        // 加權平均 = 加權總分 / 總學分
        if (totalCredits > 0) average = totalScore / totalCredits;
    } else {
        // 算術平均 = 總分 / 科目數
        if (count > 0) average = totalScore / count;
    }

    document.getElementById('average-score').innerText = average.toFixed(1);
}

// 2. 打開成績編輯視窗
function openGradeModal() {
    document.getElementById('grade-modal').style.display = 'flex';
    // 根據身分決定是否顯示「學分輸入框」
    const creditGroup = document.getElementById('input-credit-group');
    if(creditGroup) creditGroup.style.display = userType === 'university' ? 'block' : 'none';
    
    renderGradeEditList();
}

function closeGradeModal() {
    document.getElementById('grade-modal').style.display = 'none';
}

// 3. 顯示編輯列表
function renderGradeEditList() {
    const listDiv = document.getElementById('current-grade-list');
    let html = '';
    gradeList.forEach((item, index) => {
        const info = userType === 'university' ? `${item.credit} 學分 | ${item.score} 分` : `${item.score} 分`;
        html += `
            <div class="course-list-item">
                <div class="course-info">
                    <div class="course-name">${item.subject}</div>
                    <div class="course-time">${info}</div>
                </div>
                <button class="btn-delete" onclick="deleteGrade(${index})">刪除</button>
            </div>
        `;
    });
    listDiv.innerHTML = html || '<p style="color:#999; text-align:center;">目前沒有成績</p>';
}

// 4. 新增成績
function addGrade() {
    const sub = document.getElementById('input-grade-subject').value;
    const credit = document.getElementById('input-grade-credit').value;
    const score = document.getElementById('input-grade-score').value;

    if (sub && score) {
        gradeList.push({
            subject: sub,
            credit: parseInt(credit) || 0,
            score: parseInt(score) || 0
        });

        // 清空
        document.getElementById('input-grade-subject').value = '';
        document.getElementById('input-grade-score').value = '';
        
        saveData(); // 儲存並更新畫面
        renderGradeEditList();
    } else {
        alert('請輸入科目與分數！');
    }
}

// 5. 刪除成績
function deleteGrade(index) {
    if (confirm('確定刪除這筆成績？')) {
        gradeList.splice(index, 1);
        saveData();
        renderGradeEditList();
    }
}
