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
    allData[currentSemester] = { schedule: weeklySchedule, grades: gradeList };
    const storageObj = { allData: allData, semesterList: semesterList, currentSemester: currentSemester };
    localStorage.setItem('campusMate_v2_' + currentUser.uid, JSON.stringify(storageObj));
    // 儲存後更新 UI
    switchDay(currentDay);
    loadGrades();
}

function loadSemesterData(sem) {
    if (!allData[sem]) allData[sem] = { schedule: JSON.parse(JSON.stringify(defaultSchedule)), grades: [] };
    weeklySchedule = allData[sem].schedule;
    gradeList = allData[sem].grades;
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