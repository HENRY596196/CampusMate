let editingGradeIndex = -1;

// 統一用加權計算，並顯示 4 個欄位
function loadGrades() {
    const tb = document.getElementById('grade-body');
    if (!tb) return;
    tb.innerHTML = '';
    let ts = 0, tc = 0, ec = 0, c = 0;
    
    gradeList.forEach(g => {
        // 確保有學分 (預設為 1，避免除以 0)
        const cr = parseFloat(g.credit) || 1,
            sc = parseFloat(g.score) || 0,
            pass = sc >= 60;

        if (pass) ec += cr;
        
        // --- 核心修改：所有人一律使用加權平均 ---
        ts += sc * cr;  // 總積點 (分數 * 學分)
        tc += cr;       // 總學分
        
        // --- 顯示：所有人一律顯示 4 個欄位 (科目, 學分, 實得, 分數) ---
        tb.innerHTML += `<tr>
            <td>${g.subject}</td>
            <td>${cr}</td>
            <td>${pass ? cr : 0}</td>
            <td style="font-weight:bold; color:${pass ? '#2ecc71' : '#e74c3c'}">${sc}</td>
        </tr>`;
    }); 
    
    // 計算加權平均
    let avg = 0; 
    if (tc > 0) avg = ts / tc; 
    
    // 顯示結果
    document.getElementById('average-score').innerHTML = `加權平均: ${avg.toFixed(1)} <span style="font-size:0.8rem; color:#666;">(實得${ec}學分)</span>`;
}


function renderGradeEditList() {
    const listDiv = document.getElementById('current-grade-list');
    let html = ''; 
    gradeList.forEach((item, i) => {
        // 統一顯示格式：學分 | 分數
        const info = `${item.credit}學分 | ${item.score}分`;
        html += `
        <div class="course-list-item">
            <div class="course-info">
                <div class="course-name">${item.subject}</div>
                <div class="course-time">${info}</div>
            </div>
            <div>
                <button class="btn-edit" onclick="editGrade(${i})">修改</button>
                <button class="btn-delete" onclick="deleteGrade(${i})">刪除</button>
            </div>
        </div>`;
    });
    listDiv.innerHTML = html || '<p style="color:#999; text-align:center">無成績</p>';
}

function editGrade(index) {
    const item = gradeList[index];
    if (!item) return;

    updateExamSubjectOptions(); // 確保選單最新

    const sel = document.getElementById('input-grade-subject-select');
    const txt = document.getElementById('input-grade-subject-text');
    const btn = document.getElementById('btn-toggle-input');

    // --- 智慧判斷邏輯 ---
    // 檢查選單裡有沒有這個科目選項
    const optionExists = sel.querySelector(`option[value="${item.subject}"]`);

    if (optionExists) {
        // 有 -> 切換到選單模式
        sel.style.display = 'block';
        txt.style.display = 'none';
        btn.innerText = "✏️";
        sel.value = item.subject;
    } else {
        // 沒有 -> 切換到手動模式
        sel.style.display = 'none';
        txt.style.display = 'block';
        btn.innerText = "📜";
        txt.value = item.subject;
    }


    document.getElementById('input-grade-category').value = item.category || '通識';
    document.getElementById('input-grade-nature').value = item.nature || '必修';

    document.getElementById('input-grade-credit').value = item.credit || '';
    document.getElementById('input-grade-score').value = item.score || '';

    editingGradeIndex = index;
    const saveBtn = document.getElementById('btn-add-grade');
    if (saveBtn) {
        saveBtn.innerText = "💾 保存修改";
        saveBtn.style.background = "#f39c12";
    }
}

function addGrade() {
    const sel = document.getElementById('input-grade-subject-select');
    const txt = document.getElementById('input-grade-subject-text');
    // const s = document.getElementById('input-grade-subject').value;
    // --- 判斷要抓哪一個的值 ---
    let s = '';
    if (sel.style.display !== 'none') {
        s = sel.value; // 選單模式
    } else {
        s = txt.value; // 手動模式
    }

    // === 抓取選單的值 ===
    const category = document.getElementById('input-grade-category').value;
    const nature = document.getElementById('input-grade-nature').value;

    const c = document.getElementById('input-grade-credit').value;
    const sc = document.getElementById('input-grade-score').value;

    if (s && sc) {
        const gradeData = {
            subject: s, 
            category: category, 
            nature: nature,
            credit: parseInt(c) || 0,
            score: parseInt(sc) || 0
        };

        if (editingGradeIndex > -1) {
            gradeList[editingGradeIndex] = gradeData;
            alert("成績修改成功！");
        } else {
            gradeList.push(gradeData);
        }

        // 儲存後重置
        resetGradeInput(); // 這裡會自動切回預設選單模式
        saveData();
        renderGradeEditList();
    } else alert('輸入不完整');
}

function resetGradeInput() {
    // 強制切回選單模式
    document.getElementById('input-grade-subject-select').style.display = 'block';
    document.getElementById('input-grade-subject-text').style.display = 'none';
    document.getElementById('btn-toggle-input').innerText = "✏️";

    document.getElementById('input-grade-subject-select').value = '';
    document.getElementById('input-grade-subject-text').value = '';
    
    document.getElementById('input-grade-category').value = '通識'; 
    document.getElementById('input-grade-nature').value = '必修';

    document.getElementById('input-grade-credit').value = userType === 'university' ? '3' : '1'; // 預設值優化
    document.getElementById('input-grade-score').value = '';
    
    editingGradeIndex = -1;
    const btn = document.getElementById('btn-add-grade');
    if (btn) {
        btn.innerText = "+ 加入成績單";
        btn.style.background = "#333";
    }
}

function deleteGrade(i) {
    if (confirm('確定刪除？')) {
        if (editingGradeIndex === i) resetGradeInput();
        gradeList.splice(i, 1);
        saveData();
        renderGradeEditList();
    }
}

// 開啟視窗時，永遠顯示學分輸入框
function openGradeModal() {
    // 每次開啟前先更新選單內容
    updateExamSubjectOptions();

    document.getElementById('grade-modal').style.display = 'flex';
    // 強制顯示學分輸入框
    const g = document.getElementById('input-credit-group');
    if (g) g.style.display = 'block'; 
    
    resetGradeInput(); 
    renderGradeEditList();
}
function closeGradeModal() {
    document.getElementById('grade-modal').style.display = 'none';
    resetGradeInput();
}

// 從「課表」抓取不重複科目作為選單來源
function updateExamSubjectOptions() {
    const regSelect = document.getElementById('regular-subject-select');
    const midSelect = document.getElementById('midterm-subject-select');
    const gradeSelect = document.getElementById('input-grade-subject-select'); // 新增成績單選單
    
    if (!regSelect || !midSelect || !gradeSelect) return;

    // 紀錄目前選中的科目，避免更新選單後跑掉
    const regVal = regSelect.value;
    const midVal = midSelect.value;
    const gradeVal = gradeSelect.value;

    // 重置選單
    const  placeholder = '<option value="" disabled selected>選擇科目</option>';
    regSelect.innerHTML = placeholder
    midSelect.innerHTML = placeholder;
    gradeSelect.innerHTML = placeholder;


    // 使用 Set 收集課表中所有不重複的科目
    let allSubjects = new Set(); 
    
    // 遍歷週一到週五的課程 (weeklySchedule 資料來自 state.js)
    Object.values(weeklySchedule).forEach(dayCourses => {
        dayCourses.forEach(course => {
            if (course.subject) allSubjects.add(course.subject);
        });
    });

    // 將科目排序並加入選單
    Array.from(allSubjects).sort().forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub;
        opt.innerText = sub;
        
        regSelect.appendChild(opt.cloneNode(true));
        midSelect.appendChild(opt.cloneNode(true));
        gradeSelect.appendChild(opt.cloneNode(true)); // 同步到成績單編輯框
    });

    // 恢復原本選取的科目
    if (regVal) regSelect.value = regVal;
    if (midVal) midSelect.value = midVal;
    if (gradeVal) gradeSelect.value = gradeVal;
}

// --- 1. 監聽下拉選單變動 ---
// 當選單切換時，觸發對應的渲染函式
document.addEventListener('change', (e) => {
    if (e.target.id === 'regular-subject-select') {
        renderRegularExams();
    } else if (e.target.id === 'midterm-subject-select') {
        renderMidtermExams();
    }
});

function renderRegularExams() {
    const subject = document.getElementById('regular-subject-select').value;
    const tbody = document.getElementById('regular-exam-body');
    if (!tbody) return;

    if (!subject) {
        tbody.innerHTML = '<tr><td colspan="2" class="no-class">👈 請先選擇科目</td></tr>';
        return;
    }

    const scores = regularExams[subject] || [];
    
    if (scores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" class="no-class">📭 目前無紀錄</td></tr>';
    } else {
        // 加入刪除按鈕 (🗑️)
        tbody.innerHTML = scores.map((item, index) => `
            <tr>
                <td style="text-align:left; padding-left:10px;">
                    ${item.title}
                    <span onclick="deleteRegularExam(${index})" style="cursor:pointer; color:#e74c3c; margin-left:5px; font-size:0.8rem;">🗑️</span>
                </td>
                <td style="font-weight:bold; color: var(--primary);">${item.score}</td>
            </tr>
        `).join('');
    }
}

function renderMidtermExams() {
    const subject = document.getElementById('midterm-subject-select').value;
    const tbody = document.getElementById('midterm-exam-body');
    if (!tbody) return;

    if (!subject) {
        tbody.innerHTML = '<tr><td colspan="2" class="no-class">👈 請先選擇科目</td></tr>';
        return;
    }

    const scores = midtermExams[subject] || [];
    
    if (scores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" class="no-class">📭 目前無紀錄</td></tr>';
    } else {
        // 加入刪除按鈕 (🗑️)
        tbody.innerHTML = scores.map((item, index) => `
            <tr>
                <td style="text-align:left; padding-left:10px;">
                    ${item.title}
                    <span onclick="deleteMidtermExam(${index})" style="cursor:pointer; color:#e74c3c; margin-left:5px; font-size:0.8rem;">🗑️</span>
                </td>
                <td style="font-weight:bold; color: var(--primary);">${item.score}</td>
            </tr>
        `).join('');
    }
}


// 負責處理視窗開關、資料新增與刪除，並會呼叫 data.js 中的 saveData() 來儲存資料

// --- 平常考相關功能 ---
function openRegularModal() {
    const subject = document.getElementById('regular-subject-select').value;
    if (!subject) {
        alert("請先在上方選單選擇一個科目！");
        return;
    }
    // 顯示目前科目名稱
    document.getElementById('modal-regular-subject-name').innerText = subject;
    // 清空輸入框
    document.getElementById('input-regular-name').value = '';
    document.getElementById('input-regular-score').value = '';
    // 開啟視窗
    document.getElementById('regular-exam-modal').style.display = 'flex';
}

function closeRegularModal() {
    document.getElementById('regular-exam-modal').style.display = 'none';
}

function addRegularExam() {
    const subject = document.getElementById('regular-subject-select').value;
    const name = document.getElementById('input-regular-name').value;
    const score = document.getElementById('input-regular-score').value;

    if (!name || !score) {
        alert("請輸入名稱和分數");
        return;
    }

    // 確保該科目的陣列存在
    if (!regularExams[subject]) regularExams[subject] = [];

    // 新增資料
    regularExams[subject].push({
        title: name,
        score: parseInt(score) || 0
    });

    // 儲存並更新畫面
    saveData(); 
    closeRegularModal();
    renderRegularExams(); // 重新渲染列表
}

function deleteRegularExam(index) {
    const subject = document.getElementById('regular-subject-select').value;
    if (confirm("確定要刪除這筆成績嗎？")) {
        regularExams[subject].splice(index, 1);
        saveData();
        renderRegularExams();
    }
}

// --- 段考相關功能 ---

function openMidtermModal() {
    const subject = document.getElementById('midterm-subject-select').value;
    if (!subject) {
        alert("請先在上方選單選擇一個科目！");
        return;
    }
    document.getElementById('modal-midterm-subject-name').innerText = subject;
    document.getElementById('input-midterm-name').value = '';
    document.getElementById('input-midterm-score').value = '';
    document.getElementById('midterm-exam-modal').style.display = 'flex';
}

function closeMidtermModal() {
    document.getElementById('midterm-exam-modal').style.display = 'none';
}

function addMidtermExam() {
    const subject = document.getElementById('midterm-subject-select').value;
    const name = document.getElementById('input-midterm-name').value;
    const score = document.getElementById('input-midterm-score').value;

    if (!name || !score) {
        alert("請輸入名稱和分數");
        return;
    }

    if (!midtermExams[subject]) midtermExams[subject] = [];

    midtermExams[subject].push({
        title: name,
        score: parseInt(score) || 0
    });

    saveData();
    closeMidtermModal();
    renderMidtermExams();
}

function deleteMidtermExam(index) {
    const subject = document.getElementById('midterm-subject-select').value;
    if (confirm("確定要刪除這筆成績嗎？")) {
        midtermExams[subject].splice(index, 1);
        saveData();
        renderMidtermExams();
    }
}

// --- 切換輸入模式 (選單 <-> 手動) ---
function toggleGradeInputMode() {
    const sel = document.getElementById('input-grade-subject-select');
    const txt = document.getElementById('input-grade-subject-text');
    const btn = document.getElementById('btn-toggle-input');
    
    if (sel.style.display !== 'none') {
        // 切換到：手動模式
        sel.style.display = 'none';
        txt.style.display = 'block';
        btn.innerText = "📜"; // 按鈕變回選單圖示
        txt.focus();
    } else {
        // 切換到：選單模式
        sel.style.display = 'block';
        txt.style.display = 'none';
        btn.innerText = "✏️"; // 按鈕變回手寫圖示
    }
}

// --- 資料視覺化與分析功能 ---

let gradeChartInstance = null; // 用來儲存圖表實例，避免重複繪製

// 計算單一學期的加權平均 (輔助函式)
function calculateSemesterAverage(grades) {
    let ts = 0, tc = 0;
    if (!grades || grades.length === 0) return 0;
    grades.forEach(g => {
        const cr = parseFloat(g.credit) || 1;
        const sc = parseFloat(g.score) || 0;
        ts += sc * cr;
        tc += cr;
    });
    return tc > 0 ? (ts / tc).toFixed(1) : 0;
}

function renderAnalysis() {
    // 1. 準備資料
    const labels = [];
    const dataPoints = [];
    let totalCreditsEarned = 0;

    // 用來存每個類別的詳細數據
    let categoryEarned = {};

    // 初始化容器
    const categories = ["通識", "院共同", "基礎", "核心", "專業", "自由", "其他"];
    categories.forEach(cat => {
        categoryEarned[cat] = { total: 0, "必修": 0, "選修": 0, "必選修": 0 };
    });

    const graduationCredits = 128; // 預設畢業門檻，

    // 取得所有學期並排序 (從小到大: 113-1 -> 113-2)
    // 這裡假設 semesterList 存在於 js/state.js
    const sortedSemesters = semesterList.slice().sort(); 

    sortedSemesters.forEach(sem => {
        // 從 allData 中讀取該學期的資料，若讀不到則嘗試讀取當前暫存
        let semData = allData[sem];

        let grades = (sem === currentSemester) ? gradeList : (semData ? semData.grades : []);

        if (grades) {
            // 計算 GPA (圖表用)
            const avg = calculateSemesterAverage(grades);
            // 只有當平均大於 0 時才顯示 (避免空學期拉低圖表)
            if (grades.length > 0) {
                labels.push(sem);
                dataPoints.push(avg);
            }

            // === 統計各類別學分 ===
            grades.forEach(g => {
                const sc = parseFloat(g.score) || 0;
                const cr = parseFloat(g.credit) || 1;
                // 讀取類別 (如果沒選，歸類到"其他")
                const cat = g.category || '其他';
                // 取得修別，預設為必修
                const nature = g.nature || '必修';

                // 及格才算學分
                if (sc >= 60) {
                    totalCreditsEarned += cr;
                    
                    // 確保容器存在 (防止舊資料有奇怪的類別)
                    if (!categoryEarned[cat]) {
                        categoryEarned[cat] = { total: 0, "必修": 0, "選修": 0, "必選修": 0 };
                    }

                    // 1. 累加該類別總分
                    categoryEarned[cat].total += cr;

                    // 2. 累加該修別分數 (必修/選修/必選修)
                    if (categoryEarned[cat][nature] !== undefined) {
                        categoryEarned[cat][nature] += cr;
                    } else {
                        // 如果性質是空的或其他，預設歸到選修或是獨立計算
                         categoryEarned[cat]["選修"] += cr;
                    }
                }
            });
        }
    });

    // 2. 繪製圖表 (使用 Chart.js)
    const ctx = document.getElementById('gradeChart');
    if (ctx) {
        if (gradeChartInstance) gradeChartInstance.destroy(); // 銷毀舊圖表以防疊加

        gradeChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '學期平均',
                    data: dataPoints,
                    borderColor: '#4a90e2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        suggestedMin: 60,
                        suggestedMax: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    // 更新總學分進度條 (HTML 部分)
    updateTotalProgressBar(totalCreditsEarned);
    // === 更新各模組進度條 (新功能) ===
    renderCategoryBreakdown(categoryEarned);
}

// 輔助函式：更新總進度
function updateTotalProgressBar(earned) {
    const progressEl = document.getElementById('credit-progress-bar');
    const totalEl = document.getElementById('total-credits');
    const targetDisplay = document.getElementById('target-credits-display');
    const container = document.getElementById('credit-progress-container');

    if (userType === 'highschool') {
        if(container) container.style.display = 'none';
        return;
    }
    if(container) container.style.display = 'block';

    if (progressEl && totalEl) {
        const percentage = Math.min((earned / graduationTarget) * 100, 100);
        
        progressEl.style.width = percentage + '%';
        if(percentage < 30) progressEl.style.background = '#e74c3c';
        else if(percentage < 70) progressEl.style.background = '#f39c12';
        else progressEl.style.background = '#2ecc71';

        totalEl.innerText = earned;
        if(targetDisplay) targetDisplay.innerText = graduationTarget;
    }
}

// // === 產生各模組詳細條列 ===
// function renderCategoryBreakdown(earnedMap) {
//     const listDiv = document.getElementById('category-breakdown-list');
//     if (!listDiv) return;

//     // 定義顯示順序 (依照圖片架構)
//     const order = ["通識", "院共同", "基礎", "核心", "專業", "自由", "其他"];
    
//     let html = '';

//     order.forEach(cat => {
//         // 取得該類別的統計數據
//         const data = earnedMap[cat] || { total: 0, "必修": 0, "選修": 0 };
//         // 取得該類別的目標設定 (來自 state.js)
//         const targetConfig = categoryTargets[cat];

//         // 判斷目標設定是「單一數字」還是「物件(分必修選修)」
//         const isComplex = (typeof targetConfig === 'object');

//         const earned = earnedMap[cat] || 0;
//         const target = categoryTargets[cat] || 0;
        
//         // 如果是"其他"，或者目標是0，就不顯示分母，也不算百分比進度條
//         // 但如果"其他"有學分，還是顯示出來比較好
//         if (cat === "其他" && earned === 0) return; 

//         // 計算百分比
//         let percent = 0;
//         let widthPercent = 0;
//         if (target > 0) {
//             percent = Math.round((earned / target) * 100);
//             widthPercent = Math.min(percent, 100); // 寬度最多 100%
//         }

//         // 顏色邏輯
//         let barColor = "#4a90e2"; // 預設藍
//         if (widthPercent >= 100) barColor = "#2ecc71"; // 達標變綠

//         // 顯示文字： 分母為 0 (如其他) 就不顯示 "/ 0"
//         const fractionText = target > 0 ? `${earned} / ${target}` : `${earned}`;
//         const percentText = target > 0 ? `${percent}%` : '';

//         html += `
//         <div style="margin-bottom: 12px;">
//             <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:4px;">
//                 <span style="font-weight:bold; color:#555;">${cat}</span>
//                 <span>
//                     <span style="font-weight:bold; color:${barColor}">${fractionText}</span> 
//                     <span style="font-size:0.75rem; color:#999; margin-left:5px;">${percentText}</span>
//                 </span>
//             </div>
//             <div style="background: #eee; border-radius: 6px; height: 8px; width: 100%; overflow: hidden;">
//                 <div style="background: ${barColor}; width: ${widthPercent}%; height: 100%; transition: width 0.5s;"></div>
//             </div>
//         </div>
//         `;
//     });

//     listDiv.innerHTML = html;
// }

// === 2. 修改 renderCategoryBreakdown：渲染子進度條 ===
function renderCategoryBreakdown(earnedMap) {
    const listDiv = document.getElementById('category-breakdown-list');
    if (!listDiv) return;

    // 定義顯示順序
    const order = ["通識", "院共同", "基礎", "核心", "專業", "自由", "其他"];
    
    let html = '';

    order.forEach(cat => {
        // 取得該類別的統計數據
        const data = earnedMap[cat] || { total: 0, "必修": 0, "選修": 0 };
        // 取得該類別的目標設定 (來自 state.js)
        const targetConfig = categoryTargets[cat];

        // 判斷目標設定是「單一數字」還是「物件(分必修選修)」
        const isComplex = (typeof targetConfig === 'object');

        // --- A. 簡單模式 (只顯示一條總進度，例如通識) ---
        if (!isComplex) {
            const target = targetConfig || 0;
            const earned = data.total;
            
            // 如果沒目標且沒學分，跳過不顯示 (除了其他)
            if (target === 0 && earned === 0 && cat !== "其他") return;

            let percent = 0;
            if (target > 0) percent = Math.min(Math.round((earned / target) * 100), 100);
            
            let barColor = percent >= 100 ? "#2ecc71" : "#4a90e2";
            const fractionText = target > 0 ? `${earned} / ${target}` : `${earned}`;

            html += `
            <div style="margin-bottom: 12px;">
                <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom:4px;">
                    <span style="font-weight:bold; color:#555;">${cat}</span>
                    <span>
                        <span style="font-weight:bold; color:${barColor}">${fractionText}</span> 
                    </span>
                </div>
                <div style="background: #eee; border-radius: 6px; height: 10px; width: 100%; overflow: hidden;">
                    <div style="background: ${barColor}; width: ${percent}%; height: 100%; transition: width 0.5s;"></div>
                </div>
            </div>`;
        } 
        // --- B. 複雜模式 (顯示 必修 / 選修 兩條子進度) ---
        else {
            const reqTarget = targetConfig["必修"] || 0;
            const eleTarget = targetConfig["選修"] || 0;
            
            const reqEarned = data["必修"] || 0;
            // 把 "必選修" 也算進 "選修" 額度，或是看您系上規定。這裡暫時將「選修」與「必選修」相加算入選修額度
            const eleEarned = (data["選修"] || 0) + (data["必選修"] || 0);

            // 計算百分比
            const reqPercent = reqTarget > 0 ? Math.min(Math.round((reqEarned / reqTarget) * 100), 100) : (reqEarned > 0 ? 100 : 0);
            const elePercent = eleTarget > 0 ? Math.min(Math.round((eleEarned / eleTarget) * 100), 100) : (eleEarned > 0 ? 100 : 0);

            // 顏色：必修用紅色系/綠色，選修用藍色系/綠色
            const reqColor = reqPercent >= 100 ? "#2ecc71" : "#e74c3c"; // 未過紅，過綠
            const eleColor = elePercent >= 100 ? "#2ecc71" : "#f39c12"; // 未過橘，過綠

            html += `
            <div style="margin-bottom: 15px; background: #fafafa; padding: 10px; border-radius: 8px; border: 1px solid #eee;">
                <div style="font-weight:bold; color:#333; margin-bottom: 8px; font-size: 0.95rem;">${cat}模組</div>
                
                <div style="margin-bottom: 6px;">
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#666;">
                        <span>必修</span>
                        <span>${reqEarned} / ${reqTarget}</span>
                    </div>
                    <div style="background: #e0e0e0; border-radius: 4px; height: 8px; width: 100%; overflow: hidden;">
                        <div style="background: ${reqColor}; width: ${reqPercent}%; height: 100%;"></div>
                    </div>
                </div>

                <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#666;">
                        <span>選修</span>
                        <span>${eleEarned} / ${eleTarget}</span>
                    </div>
                    <div style="background: #e0e0e0; border-radius: 4px; height: 8px; width: 100%; overflow: hidden;">
                        <div style="background: ${eleColor}; width: ${elePercent}%; height: 100%;"></div>
                    </div>
                </div>
            </div>`;
        }
    });

    listDiv.innerHTML = html;
}

function updateGraduationTarget(val) {
    const newVal = parseInt(val);
    if (newVal && newVal > 0) {
        graduationTarget = newVal;
        saveData();
    } else {
        alert("請輸入有效的正整數");
        document.getElementById('setting-grad-target').value = graduationTarget;
    }
}
