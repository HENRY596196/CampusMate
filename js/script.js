// --- 1. Firebase 設定 (維持您原本的) ---
const firebaseConfig = {
    apiKey: "AIzaSyDCjUE-uDGHuTwShun_hUkHI0OgAEGx_Zk",
    authDomain: "campusmate-aa158.firebaseapp.com",
    projectId: "campusmate-aa158",
    storageBucket: "campusmate-aa158.firebasestorage.app",
    messagingSenderId: "233940430236",
    appId: "1:233940430236:web:0c7c25280a6074e6bb6c59",
    measurementId: "G-RJBVYV11FB"
};

// 初始化
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// --- 2. 全域變數 ---
let currentUser = null;
let userType = localStorage.getItem('userType');
let isRegisterMode = false; // 控制目前是「登入」還是「註冊」模式

// 日期處理
let currentDay = new Date().getDay(); 
if (currentDay === 0 || currentDay === 6) currentDay = 1;

let weeklySchedule = {};
let gradeList = [];

// 預設資料
const defaultSchedule = {
    1: [{ time: '08:10', subject: '國文', room: '301' }],
    2: [{ time: '10:00', subject: '體育', room: '操場' }],
    3: [], 4: [], 5: []
};
const defaultGrades = [
    { subject: '國文', credit: 3, score: 85 },
    { subject: '英文', credit: 2, score: 78 }
];

// --- 3. 程式啟動與登入監聽 ---
auth.onAuthStateChanged((user) => {
    if (user) {
        // 登入成功
        currentUser = user;
        updateLoginUI(true);
        
        // 顯示名稱 (Google有名字，Email/匿名可能沒有)
        const name = user.displayName || user.email || "匿名同學";
        console.log("登入成功:", name);
        
        loadData();
        checkUserType();
    } else {
        // 未登入
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
    
    // 設定大頭貼 (如果有)
    if (userPhoto) {
        userPhoto.src = (currentUser && currentUser.photoURL) 
            ? currentUser.photoURL 
            : "https://cdn-icons-png.flaticon.com/512/847/847969.png"; // 預設頭像
    }
}

// --- 4. 登入/註冊功能區 (本次新增) ---

// 切換 登入/註冊 介面文字
function toggleLoginMode() {
    isRegisterMode = !isRegisterMode;
    const btn = document.getElementById('btn-submit');
    const toggleBtn = document.getElementById('toggle-btn');
    const toggleText = document.getElementById('toggle-text');

    if (isRegisterMode) {
        btn.innerText = "註冊並登入";
        toggleText.innerText = "已經有帳號？";
        toggleBtn.innerText = "直接登入";
    } else {
        btn.innerText = "登入";
        toggleText.innerText = "還沒有帳號？";
        toggleBtn.innerText = "建立新帳號";
    }
}

// 處理 Email 登入或註冊
function handleEmailAuth() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert("請輸入 Email 和密碼");
        return;
    }

    if (isRegisterMode) {
        // 註冊模式
        auth.createUserWithEmailAndPassword(email, password)
            .catch((error) => alert("註冊失敗: " + error.message));
    } else {
        // 登入模式
        auth.signInWithEmailAndPassword(email, password)
            .catch((error) => alert("登入失敗: " + error.message));
    }
}

// Google 登入
function loginWithGoogle() {
    auth.signInWithPopup(provider).catch((error) => alert("Google 登入失敗: " + error.message));
}

// 匿名登入
function loginAnonymously() {
    auth.signInAnonymously().catch((error) => alert("匿名登入失敗: " + error.message));
}

// 登出
function logout() {
    if (currentUser && currentUser.isAnonymous) {
        if (!confirm("⚠️ 注意：匿名帳號登出後，資料可能會消失。\n確定要登出嗎？")) return;
    }
    auth.signOut().then(() => window.location.reload());
}

// --- 5. 資料存取邏輯 (不變) ---
function loadData() {
    if (!currentUser) return;
    const uid = currentUser.uid;
    
    // 讀取課表
    const savedSchedule = localStorage.getItem('schedule_' + uid);
    weeklySchedule = savedSchedule ? JSON.parse(savedSchedule) : defaultSchedule;

    // 讀取成績
    const savedGrades = localStorage.getItem('grades_' + uid);
    gradeList = savedGrades ? JSON.parse(savedGrades) : defaultGrades;
}

function saveData() {
    if (!currentUser) return;
    const uid = currentUser.uid;
    
    localStorage.setItem('schedule_' + uid, JSON.stringify(weeklySchedule));
    switchDay(currentDay);

    localStorage.setItem('grades_' + uid, JSON.stringify(gradeList));
    loadGrades();
}

// --- 6. 介面初始化 (不變) ---
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
    const displayStyle = userType === 'university' ? 'table-cell' : 'none';
    uniElements.forEach(el => el.style.display = displayStyle);
    
    switchDay(currentDay);
    loadGrades(); 
}

// --- 7. 課表與成績功能 (不變) ---
function switchDay(day) {
    currentDay = day;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`tab-${day}`);
    if(activeBtn) activeBtn.classList.add('active');

    const todayData = weeklySchedule[day] || [];
    todayData.sort((a, b) => a.time.localeCompare(b.time)); // 簡單排序

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

// 編輯課程
function openEditModal() { document.getElementById('course-modal').style.display = 'flex'; renderEditList(); }
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

// 成績功能
function openGradeModal() {
    document.getElementById('grade-modal').style.display = 'flex';
    const creditGroup = document.getElementById('input-credit-group');
    if(creditGroup) creditGroup.style.display = userType === 'university' ? 'block' : 'none';
    renderGradeEditList();
}
function closeGradeModal() { document.getElementById('grade-modal').style.display = 'none'; }
function renderGradeEditList() {
    const listDiv = document.getElementById('current-grade-list');
    let html = '';
    gradeList.forEach((item, index) => {
        const info = userType === 'university' ? `${item.credit} 學分 | ${item.score} 分` : `${item.score} 分`;
        html += `<div class="course-list-item"><div class="course-info"><div class="course-name">${item.subject}</div><div class="course-time">${info}</div></div><button class="btn-delete" onclick="deleteGrade(${index})">刪除</button></div>`;
    });
    listDiv.innerHTML = html || '<p style="color:#999; text-align:center;">目前沒有成績</p>';
}
function addGrade() {
    const sub = document.getElementById('input-grade-subject').value;
    const credit = document.getElementById('input-grade-credit').value;
    const score = document.getElementById('input-grade-score').value;
    if (sub && score) {
        gradeList.push({ subject: sub, credit: parseInt(credit)||0, score: parseInt(score)||0 });
        document.getElementById('input-grade-subject').value = ''; document.getElementById('input-grade-score').value = '';
        saveData(); renderGradeEditList();
    } else alert('請輸入科目與分數');
}
function deleteGrade(index) {
    if (confirm('確定刪除？')) { gradeList.splice(index, 1); saveData(); renderGradeEditList(); }
}
function loadGrades() {
    const tbody = document.getElementById('grade-body');
    if(!tbody) return;
    tbody.innerHTML = '';
    let totalScore = 0, totalCredits = 0, count = 0;
    gradeList.forEach(g => {
        const credit = parseFloat(g.credit)||0, score = parseFloat(g.score)||0;
        if (userType === 'university') { totalScore += score * credit; totalCredits += credit; } 
        else { totalScore += score; count++; }
        tbody.innerHTML += `<tr><td>${g.subject}</td>${userType==='university'?`<td>${credit}</td>`:''} <td style="font-weight:bold; color:${score<60?'#e74c3c':'#2ecc71'}">${score}</td></tr>`;
    });
    let average = 0;
    if (userType === 'university') { if (totalCredits > 0) average = totalScore / totalCredits; } 
    else { if (count > 0) average = totalScore / count; }
    document.getElementById('average-score').innerText = average.toFixed(1);
}
