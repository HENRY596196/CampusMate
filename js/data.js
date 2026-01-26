// --- 資料存取核心 ---
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

function saveData() {
    if (!currentUser) return;
    // === NEW: 將 regularExams 和 midtermExams 一併存入 ===
    allData[currentSemester] = { 
        schedule: weeklySchedule, 
        grades: gradeList,
        regularExams: regularExams,
        midtermExams: midtermExams
    };

    const storageObj = {
        allData: allData,
        semesterList: semesterList,
        currentSemester: currentSemester
    };
    localStorage.setItem('campusMate_v2_' + currentUser.uid, JSON.stringify(storageObj));

    // 儲存後更新 UI
    switchDay(currentDay);
    loadGrades();
    // (之後這裡會加入更新小考介面的函式)
}

function loadSemesterData(sem) {
    // 確保結構存在，若無則初始化
    if (!allData[sem]) allData[sem] = {
        schedule: JSON.parse(JSON.stringify(defaultSchedule)),
        grades: [],
        // === NEW: 初始化新欄位 ===
        regularExams: {},
        midtermExams: {}
    };

    weeklySchedule = allData[sem].schedule;
    gradeList = allData[sem].grades;

    // === NEW: 讀取新資料 (若舊存檔沒有這些欄位，給予空物件預設值) ===
    regularExams = allData[sem].regularExams || {};
    midtermExams = allData[sem].midtermExams || {};
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
