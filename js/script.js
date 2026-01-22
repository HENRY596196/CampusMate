// --- 1. Firebase 設定 (請確認您的 Key 正確) ---
const firebaseConfig = {
    apiKey: "AIzaSyDCjUE-uDGHuTwShun_hUkHI0OgAEGx_Zk",
    authDomain: "campusmate-aa158.firebaseapp.com",
    projectId: "campusmate-aa158",
    storageBucket: "campusmate-aa158.firebasestorage.app",
    messagingSenderId: "233940430236",
    appId: "1:233940430236:web:0c7c25280a6074e6bb6c59",
    measurementId: "G-RJBVYV11FB"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// --- 2. 全域變數 ---
let currentUser = null;
let userType = localStorage.getItem('userType');
let isRegisterMode = false;

let currentDay = new Date().getDay();
if (currentDay === 0 || currentDay === 6) currentDay = 1;

// 學期變數
let currentSemester = "113-2";
let semesterList = ["113-2"];
let allData = {};

// 暫存變數
let weeklySchedule = {};
let gradeList = [];

const defaultSchedule = { 1: [], 2: [], 3: [], 4: [], 5: [] };

// --- 3. 程式啟動 ---
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        updateLoginUI(true);
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
    if (userPhoto && currentUser) userPhoto.src = currentUser.photoURL || "https://cdn-icons-png.flaticon.com/512/847/847969.png";
}

// --- 4. 資料存取 ---
function loadData() {
    if (!currentUser) return;
    const uid = currentUser.uid;
    const dbKey = 'campusMate_v2_' + uid;
    const savedData = localStorage.getItem(dbKey);

    if (savedData) {
        const parsed = JSON.parse(savedData);
        allData = parsed.allData || {};
        semesterList = parsed.semesterList || ["113-2"];
        currentSemester = parsed.currentSemester || semesterList[0];
    } else {
        migrateOldData(uid);
    }
    loadSemesterData(currentSemester);
    renderSemesterOptions();
}

function migrateOldData(uid) {
    const oldSchedule = localStorage.getItem('schedule_' + uid);
    const oldGrades = localStorage.getItem('grades_' + uid);
    currentSemester = "113-1";
    semesterList = ["113-1"];
    allData = {
        "113-1": {
            schedule: oldSchedule ? JSON.parse(oldSchedule) : JSON.parse(JSON.stringify(defaultSchedule)),
            grades: oldGrades ? JSON.parse(oldGrades) : []
        }
    };
    saveData();
}

function saveData() {
    if (!currentUser) return;
    allData[currentSemester] = { schedule: weeklySchedule, grades: gradeList };
    const storageObj = { allData: allData, semesterList: semesterList, currentSemester: currentSemester };
    localStorage.setItem('campusMate_v2_' + currentUser.uid, JSON.stringify(storageObj));
    switchDay(currentDay);
    loadGrades();
}

function loadSemesterData(sem) {
    if (!allData[sem]) allData[sem] = { schedule: JSON.parse(JSON.stringify(defaultSchedule)), grades: [] };
    weeklySchedule = allData[sem].schedule;
    gradeList = allData[sem].grades;
}

// --- 5. 學期控制 (含新增的編輯與刪除) ---
function renderSemesterOptions() {
    const select = document.getElementById('semester-select');
    select.innerHTML = '';
    semesterList.sort().reverse();
    semesterList.forEach(sem => {
        const option = document.createElement('option');
        option.value = sem;
        option.text = sem;
        if (sem === currentSemester) option.selected = true;
        select.appendChild(option);
    });
}

function switchSemester() {
    saveData();
    currentSemester = document.getElementById('semester-select').value;
    loadSemesterData(currentSemester);
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
            semesterList.push(newSemName);
            currentSemester = newSemName;
            allData[newSemName] = { schedule: JSON.parse(JSON.stringify(defaultSchedule)), grades: [] };
        }
        saveData();
        renderSemesterOptions();
        loadSemesterData(currentSemester);
        switchDay(currentDay);
        loadGrades();
    }
}

// 編輯學期名稱
function editSemester() {
    const newName = prompt("請輸入新的學期名稱", currentSemester);
    if (newName && newName !== currentSemester) {
        if (semesterList.includes(newName)) {
            alert("名稱重複！");
            return;
        }
        // 1. 複製資料到新 Key
        allData[newName] = allData[currentSemester];
        // 2. 刪除舊 Key
        delete allData[currentSemester];
        // 3. 更新列表
        const index = semesterList.indexOf(currentSemester);
        semesterList[index] = newName;
        // 4. 更新當前指標
        currentSemester = newName;

        saveData();
        renderSemesterOptions();
        alert("修改成功！");
    }
}

// 刪除學期
function deleteSemester() {
    if (semesterList.length <= 1) {
        alert("至少要保留一個學期，無法刪除！");
        return;
    }
    if (confirm(`確定要刪除「${currentSemester}」的所有資料嗎？此動作無法復原！`)) {
        // 1. 刪除資料
        delete allData[currentSemester];
        // 2. 移除列表
        semesterList = semesterList.filter(s => s !== currentSemester);
        // 3. 切換到列表中的第一個
        currentSemester = semesterList[0];

        saveData();
        renderSemesterOptions();
        loadSemesterData(currentSemester);
        switchDay(currentDay);
        loadGrades();
    }
}

// --- 6. 登入/註冊/UI ---
function toggleLoginMode() {
    isRegisterMode = !isRegisterMode;
    const btn = document.getElementById('btn-submit');
    const toggleBtn = document.getElementById('toggle-btn');
    const toggleText = document.getElementById('toggle-text');
    if (isRegisterMode) { btn.innerText = "註冊並登入"; toggleText.innerText = "已經有帳號？"; toggleBtn.innerText = "直接登入"; }
    else { btn.innerText = "登入"; toggleText.innerText = "還沒有帳號？"; toggleBtn.innerText = "建立新帳號"; }
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
function checkUserType() { if (!userType) document.getElementById('welcome-modal').style.display = 'flex'; else initUI(); }
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

// --- 7. 課表與成績邏輯 (更新：支援節次、老師) ---
function switchDay(day) {
    currentDay = day;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`tab-${day}`);
    if (activeBtn) activeBtn.classList.add('active');

    const todayData = weeklySchedule[day] || [];
    // 排序優先依照節次，若無節次則依時間
    todayData.sort((a, b) => (a.period || a.time || "").localeCompare(b.period || b.time || ""));

    const tbody = document.getElementById('schedule-body');
    if (tbody) {
        tbody.innerHTML = '';
        if (todayData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-class">😴 無課程</td></tr>';
        } else {
            todayData.forEach(item => {
                // 處理舊資料沒有 teacher/period 的情況
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

// 其他功能維持不變
function openEditModal() { document.getElementById('course-modal').style.display = 'flex'; renderEditList(); }
function closeEditModal() { document.getElementById('course-modal').style.display = 'none'; }
function deleteCourse(index) { if (confirm('確定刪除？')) { weeklySchedule[currentDay].splice(index, 1); saveData(); renderEditList(); } }
function openGradeModal() { document.getElementById('grade-modal').style.display = 'flex'; const g = document.getElementById('input-credit-group'); if (g) g.style.display = userType === 'university' ? 'block' : 'none'; renderGradeEditList(); }
function closeGradeModal() { document.getElementById('grade-modal').style.display = 'none'; }
function renderGradeEditList() { const listDiv = document.getElementById('current-grade-list'); let html = ''; gradeList.forEach((item, i) => { const info = userType === 'university' ? `${item.credit}學分|${item.score}分` : `${item.score}分`; html += `<div class="course-list-item"><div class="course-info"><div class="course-name">${item.subject}</div><div class="course-time">${info}</div></div><button class="btn-delete" onclick="deleteGrade(${i})">刪除</button></div>`; }); listDiv.innerHTML = html || '<p style="color:#999; text-align:center">無成績</p>'; }
function addGrade() { const s = document.getElementById('input-grade-subject').value; const c = document.getElementById('input-grade-credit').value; const sc = document.getElementById('input-grade-score').value; if (s && sc) { gradeList.push({ subject: s, credit: parseInt(c) || 0, score: parseInt(sc) || 0 }); document.getElementById('input-grade-subject').value = ''; document.getElementById('input-grade-score').value = ''; saveData(); renderGradeEditList(); } else alert('輸入不完整'); }
function deleteGrade(i) { if (confirm('確定刪除？')) { gradeList.splice(i, 1); saveData(); renderGradeEditList(); } }
function loadGrades() { const tb = document.getElementById('grade-body'); if (!tb) return; tb.innerHTML = ''; let ts = 0, tc = 0, ec = 0, c = 0; gradeList.forEach(g => { const cr = parseFloat(g.credit) || 0, sc = parseFloat(g.score) || 0, pass = sc >= 60; if (pass) ec += cr; if (userType === 'university') { ts += sc * cr; tc += cr; } else { ts += sc; c++; } tb.innerHTML += `<tr><td>${g.subject}</td>${userType === 'university' ? `<td>${cr}</td><td>${pass ? cr : 0}</td>` : ''} <td style="font-weight:bold; color:${pass ? '#2ecc71' : '#e74c3c'}">${sc}</td></tr>`; }); let avg = 0; if (userType === 'university') { if (tc > 0) avg = ts / tc; } else { if (c > 0) avg = ts / c; } document.getElementById('average-score').innerHTML = userType === 'university' ? `平均: ${avg.toFixed(1)} <span style="font-size:0.8rem; color:#666;">(實得${ec}學分)</span>` : `平均: ${avg.toFixed(1)}`; }
