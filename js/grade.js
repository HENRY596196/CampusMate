// // --- 成績與計算邏輯 ---
// function loadGrades() {
//     const tb = document.getElementById('grade-body');
//     if (!tb) return;
//     tb.innerHTML = '';
//     let ts = 0, tc = 0, ec = 0, c = 0;
//     gradeList.forEach(g => {
//         const cr = parseFloat(g.credit) || 0,
//             sc = parseFloat(g.score) || 0,
//             pass = sc >= 60;

//         if (pass) ec += cr;
//         if (userType === 'university') {
//             ts += sc * cr;
//             tc += cr;
//         } else {
//             ts += sc; c++;
//         }
//         tb.innerHTML += `<tr><td>${g.subject}</td>${userType === 'university' ? `<td>${cr}</td><td>${pass ? cr : 0}</td>` : ''} <td style="font-weight:bold; color:${pass ? '#2ecc71' : '#e74c3c'}">${sc}</td></tr>`;
//     }); 
    
//     let avg = 0; 
//     if (userType === 'university') { if (tc > 0) avg = ts / tc; } 
//     else { if (c > 0) avg = ts / c; } 
    
//     document.getElementById('average-score').innerHTML = userType === 'university' ? `平均: ${avg.toFixed(1)} <span style="font-size:0.8rem; color:#666;">(實得${ec}學分)</span>` : `平均: ${avg.toFixed(1)}`;
// }

// function renderGradeEditList() {
//     const listDiv = document.getElementById('current-grade-list');
//     let html = ''; 
//     gradeList.forEach((item, i) => {
//         const info = userType === 'university' ? `${item.credit}學分|${item.score}分` : `${item.score}分`;
//         html += `
//         <div class="course-list-item">
//             <div class="course-info">
//                 <div class="course-name">${item.subject}</div>
//                 <div class="course-time">${info}</div>
//             </div>
//             <button class="btn-delete" onclick="deleteGrade(${i})">刪除</button>
//         </div>`;
//     });
//     listDiv.innerHTML = html || '<p style="color:#999; text-align:center">無成績</p>';
// }

// function addGrade() {
//     const s = document.getElementById('input-grade-subject').value;
//     const c = document.getElementById('input-grade-credit').value;
//     const sc = document.getElementById('input-grade-score').value;
//     if (s && sc) {
//         gradeList.push({
//             subject: s, credit: parseInt(c) || 0,
//             score: parseInt(sc) || 0
//         });
//         document.getElementById('input-grade-subject').value = '';
//         document.getElementById('input-grade-score').value = '';
//         saveData();
//         renderGradeEditList();
//     } else alert('輸入不完整');
// }

// function deleteGrade(i) {
//     if (confirm('確定刪除？')) {
//         gradeList.splice(i, 1);
//         saveData();
//         renderGradeEditList();
//     }
// }

// function openGradeModal() {
//     document.getElementById('grade-modal').style.display = 'flex';
//     const g = document.getElementById('input-credit-group');
//     if (g) g.style.display = userType === 'university' ? 'block' : 'none';
//     renderGradeEditList();
// }

// function closeGradeModal() {
//     document.getElementById('grade-modal').style.display = 'none';
// }

// --- 成績與計算邏輯 (含編輯功能) ---

let editingGradeIndex = -1;

function loadGrades() {
    const tb = document.getElementById('grade-body');
    if (!tb) return;
    tb.innerHTML = '';
    let ts = 0, tc = 0, ec = 0, c = 0;
    gradeList.forEach(g => {
        const cr = parseFloat(g.credit) || 0,
            sc = parseFloat(g.score) || 0,
            pass = sc >= 60;

        if (pass) ec += cr;
        if (userType === 'university') {
            ts += sc * cr;
            tc += cr;
        } else {
            ts += sc; c++;
        }
        tb.innerHTML += `<tr><td>${g.subject}</td>${userType === 'university' ? `<td>${cr}</td><td>${pass ? cr : 0}</td>` : ''} <td style="font-weight:bold; color:${pass ? '#2ecc71' : '#e74c3c'}">${sc}</td></tr>`;
    }); 
    
    let avg = 0; 
    if (userType === 'university') { if (tc > 0) avg = ts / tc; } 
    else { if (c > 0) avg = ts / c; } 
    
    document.getElementById('average-score').innerHTML = userType === 'university' ? `平均: ${avg.toFixed(1)} <span style="font-size:0.8rem; color:#666;">(實得${ec}學分)</span>` : `平均: ${avg.toFixed(1)}`;
}

function renderGradeEditList() {
    const listDiv = document.getElementById('current-grade-list');
    let html = ''; 
    gradeList.forEach((item, i) => {
        const info = userType === 'university' ? `${item.credit}學分|${item.score}分` : `${item.score}分`;
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

    document.getElementById('input-grade-subject').value = item.subject || '';
    document.getElementById('input-grade-credit').value = item.credit || '';
    document.getElementById('input-grade-score').value = item.score || '';

    editingGradeIndex = index;
    const btn = document.getElementById('btn-add-grade');
    if (btn) {
        btn.innerText = "💾 保存修改";
        btn.style.background = "#f39c12";
    }
}

function addGrade() {
    const s = document.getElementById('input-grade-subject').value;
    const c = document.getElementById('input-grade-credit').value;
    const sc = document.getElementById('input-grade-score').value;
    
    if (s && sc) {
        const gradeData = {
            subject: s, 
            credit: parseInt(c) || 0,
            score: parseInt(sc) || 0
        };

        if (editingGradeIndex > -1) {
            gradeList[editingGradeIndex] = gradeData;
            alert("成績修改成功！");
        } else {
            gradeList.push(gradeData);
        }

        resetGradeInput();
        saveData();
        renderGradeEditList();
    } else alert('輸入不完整');
}

function resetGradeInput() {
    document.getElementById('input-grade-subject').value = '';
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

function openGradeModal() {
    document.getElementById('grade-modal').style.display = 'flex';
    const g = document.getElementById('input-credit-group');
    if (g) g.style.display = userType === 'university' ? 'block' : 'none';
    
    resetGradeInput(); // 確保重置
    renderGradeEditList();
}

function closeGradeModal() {
    document.getElementById('grade-modal').style.display = 'none';
    resetGradeInput();
}
