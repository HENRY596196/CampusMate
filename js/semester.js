// --- 學期管理邏輯 ---
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
        // 1. 先儲存目前學期的資料 (修復資料連動 Bug)
        saveData();

        if (semesterList.includes(newSemName)) {
            alert("這個學期已經存在囉！");
            currentSemester = newSemName;
        } else {
            semesterList.push(newSemName);
            currentSemester = newSemName;
            // 初始化新學期資料
            allData[newSemName] = { schedule: JSON.parse(JSON.stringify(defaultSchedule)), grades: [] };
        }

        // 2. 載入新學期的資料
        loadSemesterData(currentSemester);
        
        // 3. 再次存檔
        saveData();

        renderSemesterOptions();
        switchDay(currentDay);
        loadGrades();
    }
}

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