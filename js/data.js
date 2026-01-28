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
        
        // === 讀取目標學分設定 ===
        graduationTarget = parsed.graduationTarget || 128;

        // === 讀取模組目標 ===
        if (parsed.categoryTargets) {
            categoryTargets = parsed.categoryTargets;
        }
    } else {
        migrateOldData(uid);
    }
    loadSemesterData(currentSemester);
    renderSemesterOptions();

    // === 初始載入觸發 (確保介面同步) ===
    // 1. 根據課表建立選單選項
    if (typeof updateExamSubjectOptions === 'function') updateExamSubjectOptions();
    // 2. 嘗試渲染目前選中科目的成績 (若無選中則顯示提示)
    if (typeof renderRegularExams === 'function') renderRegularExams();
    if (typeof renderMidtermExams === 'function') renderMidtermExams();
    if (typeof renderCalendar === 'function') renderCalendar();

    // 載入時繪製圖表
    if (typeof renderAnalysis === 'function') renderAnalysis(); 

    // === NEW: 初始化設定頁面的輸入框數值 ===
    const targetInput = document.getElementById('setting-grad-target');
    if (targetInput) targetInput.value = graduationTarget;

    // === 產生模組設定輸入框 ===
    if (typeof renderCategorySettingsInputs === 'function') renderCategorySettingsInputs();

    // === 初始化學分設定介面 ===
    if (typeof renderCreditSettings === 'function') renderCreditSettings();
}

function saveData() {
    if (!currentUser) return;
    // === 將 regularExams 和 midtermExams 一併存入 ===
    allData[currentSemester] = { 
        schedule: weeklySchedule, 
        grades: gradeList,
        regularExams: regularExams,
        midtermExams: midtermExams,
        calendarEvents: calendarEvents
    };

    const storageObj = {
        allData: allData,
        semesterList: semesterList,
        currentSemester: currentSemester,
        graduationTarget: graduationTarget,
        categoryTargets: categoryTargets,
    };
    localStorage.setItem('campusMate_v2_' + currentUser.uid, JSON.stringify(storageObj));

    // 儲存後更新 UI
    switchDay(currentDay);
    loadGrades();
    // (之後這裡會加入更新小考介面的函式)

    // 同步更新小考/段考介面 (確保新增資料後畫面不脫節)
    if (typeof renderRegularExams === 'function') renderRegularExams();
    if (typeof renderMidtermExams === 'function') renderMidtermExams();
    
    // 存檔後更新圖表
    if (typeof renderAnalysis === 'function') renderAnalysis();
}

function loadSemesterData(sem) {
    // 確保結構存在，若無則初始化
    if (!allData[sem]) allData[sem] = {
        schedule: JSON.parse(JSON.stringify(defaultSchedule)),
        grades: [],
        // === 初始化新欄位 ===
        regularExams: {},
        midtermExams: {}
    };

    weeklySchedule = allData[sem].schedule;
    gradeList = allData[sem].grades;

    // === NEW: 讀取新資料 (若舊存檔沒有這些欄位，給予空物件預設值) ===
    regularExams = allData[sem].regularExams || {};
    midtermExams = allData[sem].midtermExams || {};
    calendarEvents = allData[sem].calendarEvents || [];
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

// === 更新模組目標並存檔 ===
function updateCategorySettings(category, type, value) {
    const val = parseInt(value) || 0;

    // 檢查目前的結構
    if (typeof categoryTargets[category] === 'object') {
        // 如果是物件結構 (有分必選修)
        if (type === '必修') categoryTargets[category]['必修'] = val;
        if (type === '選修') categoryTargets[category]['選修'] = val;
    } else {
        // 如果是單一數字
        categoryTargets[category] = val;
    }

    // 存檔
    saveData();
    
    // 即時更新首頁的分析圖表 (如果有開著的話)
    if (typeof renderAnalysis === 'function') renderAnalysis();
}
