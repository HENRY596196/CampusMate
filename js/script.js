// --- 1. Firebase 設定 (保持您原本正確的設定) ---
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

// --- 2. 全域變數 ---
let currentUser = null;
let userType = localStorage.getItem('userType');
let isRegisterMode = false;

let currentDay = new Date().getDay();
if (currentDay === 0 || currentDay === 6) currentDay = 1;

// --- 學期系統變數 (新) ---
let currentSemester = "113-2"; // 預設當前學期
let semesterList = ["113-2"]; // 學期列表
let allData = {}; // 存放所有學期的總資料庫

// 暫存當下顯示的資料 (會隨學期切換而變動)
let weeklySchedule = {};
let gradeList = [];

// 預設空白資料
const defaultSchedule = { 1: [], 2: [], 3: [], 4: [], 5: [] };

// --- 3. 程式啟動 ---
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        updateLoginUI(true);
        console.log("登入成功:", user.email);
        loadData(); // 這裡會處理學期資料載入
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
    if (userPhoto && currentUser) userPhoto.src = currentUser.photoURL || "https://cdn-icons-png.flaticon.com/512/847/847969.png";
}

// --- 4. 核心資料存取 (重大更新：支援多學期) ---

function loadData() {
    if (!currentUser) return;
    const uid = currentUser.uid;
    const dbKey = 'campusMate_v2_' + uid; // 使用新的儲存 Key (v2)

    const savedData = localStorage.getItem(dbKey);

    if (savedData) {
        // 1. 如果有 v2 版本的新資料，直接讀取
        const parsed = JSON.parse(savedData);
        allData = parsed.allData || {};
        semesterList = parsed.semesterList || ["113-2"];
        currentSemester = parsed.currentSemester || semesterList[0];
    } else {
        // 2. 自動搬家：如果沒有新資料，嘗試讀取舊版 (v1) 資料並轉移
        console.log("偵測到舊版資料，正在進行遷移...");
        migrateOldData(uid);
    }

    // 3. 根據當前選到的學期，取出對應的課表和成績放入暫存變數
    loadSemesterData(currentSemester);

    // 4. 更新介面
    renderSemesterOptions();
}

function migrateOldData(uid) {
    // 讀取舊的散亂資料
    const oldSchedule = localStorage.getItem('schedule_' + uid);
    const oldGrades = localStorage.getItem('grades_' + uid);

    // 建立預設學期 (例如 113-1)
    currentSemester = "113-1";
    semesterList = ["113-1"];

    // 將舊資料塞入新結構
    allData = {
        "113-1": {
            schedule: oldSchedule ? JSON.parse(oldSchedule) : JSON.parse(JSON.stringify(defaultSchedule)),
            grades: oldGrades ? JSON.parse(oldGrades) : []
        }
    };

    saveData(); // 存入 v2 格式
}

function saveData() {
    if (!currentUser) return;

    // 1. 將當下的暫存變數，寫回總資料庫 (allData)
    allData[currentSemester] = {
        schedule: weeklySchedule,
        grades: gradeList
    };

    // 2. 準備要存入 LocalStorage 的完整物件
    const storageObj = {
        allData: allData,
        semesterList: semesterList,
        currentSemester: currentSemester
    };

    // 3. 寫入
    localStorage.setItem('campusMate_v2_' + currentUser.uid, JSON.stringify(storageObj));

    // 4. 重新渲染畫面
    switchDay(currentDay);
    loadGrades();
}

// 切換當前使用的資料 (不存檔，只讀取)
function loadSemesterData(sem) {
    if (!allData[sem]) {
        // 如果該學期沒資料，初始化
        allData[sem] = {
            schedule: JSON.parse(JSON.stringify(defaultSchedule)),
            grades: []
        };
    }
    weeklySchedule = allData[sem].schedule;
    gradeList = allData[sem].grades;
}

// --- 5. 學期控制功能 (新增) ---

function renderSemesterOptions() {
    const select = document.getElementById('semester-select');
    select.innerHTML = '';

    // 排序學期 (讓新的在上面)
    semesterList.sort().reverse();

    semesterList.forEach(sem => {
        const option = document.createElement('option');
        option.value = sem;
        option.text = sem + " 學期";
        if (sem === currentSemester) option.selected = true;
        select.appendChild(option);
    });
}

function switchSemester() {
    // 1. 先儲存目前學期的更動
    saveData();

    // 2. 獲取使用者選擇的新學期
    const select = document.getElementById('semester-select');
    currentSemester = select.value;

    // 3. 載入新學期資料
    loadSemesterData(currentSemester);

    // 4. 刷新畫面
    switchDay(currentDay);
    loadGrades();
}

function addNewSemester() {
    const newSemName = prompt("請輸入新學期名稱 (例如: 114-1)", "114-1");
    if (newSemName) {
        if (semesterList.includes(newSemName)) {
            alert("這個學期已經存在囉！");
            currentSemester = newSemName;
        } else {
            // 新增學期
            semesterList.push(newSemName);
            currentSemester = newSemName;

            // 初始化該學期資料
            allData[newSemName] = {
                schedule: JSON.parse(JSON.stringify(defaultSchedule)),
                grades: []
            };
        }

        saveData();
        renderSemesterOptions(); // 重新產生選單

        // 切換過去
        loadSemesterData(currentSemester);
        switchDay(currentDay);
        loadGrades();
    }
}

// --- 6. 登入/註冊/UI (保持原樣) ---

function toggleLoginMode() {
    isRegisterMode = !isRegisterMode;
    const btn = document.getElementById('btn-submit');
    const toggleBtn = document.getElementById('toggle-btn');
    const toggleText = document.getElementById('toggle-text');
    if (isRegisterMode) {
        btn.innerText = "註冊並登入"; toggleText.innerText = "已經有帳號？"; toggleBtn.innerText = "直接登入";
    } else {
        btn.innerText = "登入"; toggleText.innerText = "還沒有帳號？"; toggleBtn.innerText = "建立新帳號";
    }
}

function handleEmailAuth() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (!email || !password) { alert("請輸入 Email 和密碼"); return; }
    if (isRegisterMode) auth.createUserWithEmailAndPassword(email, password).catch(e => alert(e.message));
    else auth.signInWithEmailAndPassword(email, password).catch(e => alert(e.message));
}

function loginWithGoogle() { auth.signInWithPopup(provider).catch(e => alert(e.message)); }
function loginAnonymously() { auth.signInAnonymously().catch(e => alert(e.message)); }
function logout() {
    if (currentUser && currentUser.isAnonymous && !confirm("⚠️ 匿名帳號登出後資料會消失，確定嗎？")) return;
    auth.signOut().then(() => window.location.reload());
}

function checkUserType() {
    if (!userType) document.getElementById('welcome-modal').style.display = 'flex';
    else initUI();
}
function setUserType(type) { localStorage.setItem('userType', type); userType = type; document.getElementById('welcome-modal').style.display = 'none'; initUI(); }
function resetIdentity() { localStorage.removeItem('userType'); userType = null; document.getElementById('welcome-modal').style.display = 'flex'; }

function initUI() {
    document.getElementById('user-badge').innerText = userType === 'university' ? '大學部' : '高中部';
    const uniElements = document.querySelectorAll('.uni-only');
    const displayStyle = userType === 'university' ? 'table-cell' : 'none';
    uniElements.forEach(el => el.style.display = displayStyle);
    switchDay(currentDay);
    loadGrades();
}

// --- 7. 課表與成績邏輯 (微調適應新資料結構) ---

function switchDay(day) {
    currentDay = day;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`tab-${day}`);
    if (activeBtn) activeBtn.classList.add('active');

    // 這裡讀取的 weeklySchedule 已經是 loadSemesterData 切換過的資料了
    const todayData = weeklySchedule[day] || [];
    todayData.sort((a, b) => a.time.localeCompare(b.time));

    const tbody = document.getElementById('schedule-body');
    if (tbody) {
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

function loadGrades() {
    const tbody = document.getElementById('grade-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    let totalScore = 0, totalCredits = 0, earnedCredits = 0, count = 0;

    // 這裡讀取的 gradeList 已經是 loadSemesterData 切換過的資料了
    gradeList.forEach(g => {
        const credit = parseFloat(g.credit) || 0, score = parseFloat(g.score) || 0;
        const isPass = score >= 60;
        const thisEarned = isPass ? credit : 0;
        if (isPass) earnedCredits += credit;

        if (userType === 'university') { totalScore += score * credit; totalCredits += credit; }
        else { totalScore += score; count++; }

        tbody.innerHTML += `<tr><td>${g.subject}</td>${userType === 'university' ? `<td>${credit}</td><td>${thisEarned}</td>` : ''} <td style="font-weight:bold; color:${isPass ? '#2ecc71' : '#e74c3c'}">${score}</td></tr>`;
    });

    let average = 0;
    if (userType === 'university') { if (totalCredits > 0) average = totalScore / totalCredits; }
    else { if (count > 0) average = totalScore / count; }

    const summaryText = userType === 'university'
        ? `平均: ${average.toFixed(1)} <span style="font-size:0.8rem; color:#666; margin-left:5px;">(實得 ${earnedCredits} 學分)</span>`
        : `平均: ${average.toFixed(1)}`;
    document.getElementById('average-score').innerHTML = summaryText;
}

// 編輯功能 (不需要大改，因為它們操作的是 weeklySchedule/gradeList 參考)
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
function deleteCourse(index) { if (confirm('確定刪除？')) { weeklySchedule[currentDay].splice(index, 1); saveData(); renderEditList(); } }

function openGradeModal() {
    document.getElementById('grade-modal').style.display = 'flex';
    const creditGroup = document.getElementById('input-credit-group');
    if (creditGroup) creditGroup.style.display = userType === 'university' ? 'block' : 'none';
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
        gradeList.push({ subject: sub, credit: parseInt(credit) || 0, score: parseInt(score) || 0 });
        document.getElementById('input-grade-subject').value = ''; document.getElementById('input-grade-score').value = '';
        saveData(); renderGradeEditList();
    } else alert('請輸入科目與分數');
}
function deleteGrade(index) { if (confirm('確定刪除？')) { gradeList.splice(index, 1); saveData(); renderGradeEditList(); } }
