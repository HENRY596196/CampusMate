// js/ui.js

// --- 介面控制與分頁 ---
function switchTab(tabName) {
    // 1. 定義所有頁面的 ID (包含新頁面)
    const views = ['home', 'chart', 'credits', 'info', 'settings'];

    // 2. 隱藏所有頁面，並移除側邊欄按鈕的 active 狀態
    views.forEach(view => {
        const el = document.getElementById('view-' + view);
        if (el) el.style.display = 'none';

        const btn = document.getElementById('btn-' + view);
        if (btn) btn.classList.remove('active');
    });

    // 3. 顯示目標頁面
    const targetView = document.getElementById('view-' + tabName);
    if (targetView) targetView.style.display = 'block';

    // 4. 設定目標按鈕為 active
    const targetBtn = document.getElementById('btn-' + tabName);
    if (targetBtn) targetBtn.classList.add('active');

    // 5. 特殊邏輯處理
    // 如果切回首頁，刷新當日課表
    if (tabName === 'home') {
        switchDay(currentDay);
    }
    // ★★★ 關鍵：如果切換到圖表或學分頁，重新計算並繪製圖表/進度條 ★★★
    if (tabName === 'chart' || tabName === 'credits') {
        if (typeof renderAnalysis === 'function') {
            renderAnalysis();
        }
    }
}

// 管理員檢查
function checkAdminStatus() {
    const adminPanel = document.getElementById('admin-panel');
    if (!adminPanel) return;

    if (currentUser && currentUser.uid === ADMIN_UID) {
        adminPanel.style.display = 'block';
    } else {
        adminPanel.style.display = 'none';
    }
}

function addAdminInfo() {
    const newInfoText = document.getElementById('admin-new-info').value;
    if (!newInfoText) return alert("請輸入內容");
    alert("公告已發布 (模擬)：" + newInfoText);
}

function initUI() {
    document.getElementById('user-badge').innerText = userType === 'university' ? '大學部' : '高中部';
    
    // 強制顯示學分欄位 (所有人都看得到)
    const uniElements = document.querySelectorAll('.uni-only');
    uniElements.forEach(el => el.style.display = 'table-cell'); 
    
    switchDay(currentDay);
    loadGrades();
    
    // 預載分析圖表 (以免第一次切換過去是空的)
    if (typeof renderAnalysis === 'function') renderAnalysis();
}

// === 學分設定介面邏輯 (保持不變) ===
let isEditingCredits = false;

function renderCreditSettings() {
    const viewContainer = document.getElementById('credits-view-mode');
    const editContainer = document.getElementById('category-settings-inputs');
    const gradInput = document.getElementById('edit-grad-target');

    if (!viewContainer || !editContainer) return;

    if (gradInput) gradInput.value = graduationTarget;

    let viewHtml = `<div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eee;">
                        <span>🎓 畢業總學分</span>
                        <span style="font-weight:bold; color:var(--primary);">${graduationTarget}</span>
                    </div>`;
    let editHtml = '';

    const order = ["通識", "院共同", "基礎", "核心", "專業", "自由"];

    order.forEach(cat => {
        const target = categoryTargets[cat];
        let targetText = '';
        if (typeof target === 'object') {
            targetText = `必${target['必修']} / 選${target['選修']}`;
        } else {
            targetText = `${target}`;
        }

        viewHtml += `<div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eee; font-size:0.95rem;">
                        <span style="color:#555;">${cat}</span>
                        <span>${targetText}</span>
                     </div>`;

        editHtml += `<div style="margin-bottom: 12px;">
                        <div style="font-weight: bold; color: #555; margin-bottom: 5px; font-size:0.9rem;">${cat}</div>
                        <div style="display: flex; gap: 10px;">`;

        if (typeof target === 'object') {
            editHtml += `
                <div style="flex: 1;">
                    <span style="font-size: 0.8rem; color: #888;">必修</span>
                    <input type="number" id="input-${cat}-req" value="${target['必修'] || 0}" 
                        style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div style="flex: 1;">
                    <span style="font-size: 0.8rem; color: #888;">選修</span>
                    <input type="number" id="input-${cat}-ele" value="${target['選修'] || 0}" 
                        style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;">
                </div>`;
        } else {
            editHtml += `
                <div style="flex: 1;">
                    <input type="number" id="input-${cat}-total" value="${target || 0}" 
                        style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;">
                </div>`;
        }
        editHtml += `</div></div>`;
    });

    viewContainer.innerHTML = viewHtml;
    editContainer.innerHTML = editHtml;
}

function toggleCreditEdit() {
    isEditingCredits = !isEditingCredits;
    const viewDiv = document.getElementById('credits-view-mode');
    const editDiv = document.getElementById('credits-edit-mode');
    const btn = document.getElementById('btn-edit-credits');

    if (isEditingCredits) {
        viewDiv.style.display = 'none';
        editDiv.style.display = 'block';
        btn.style.display = 'none';
    } else {
        viewDiv.style.display = 'block';
        editDiv.style.display = 'none';
        btn.style.display = 'block';
        renderCreditSettings();
    }
}

function saveCreditSettings() {
    if (!confirm("確定要儲存新的學分標準嗎？")) return;

    const newGradTarget = parseInt(document.getElementById('edit-grad-target').value) || 128;
    graduationTarget = newGradTarget;

    const order = ["通識", "院共同", "基礎", "核心", "專業", "自由"];
    order.forEach(cat => {
        const currentTarget = categoryTargets[cat];
        if (typeof currentTarget === 'object') {
            const reqVal = parseInt(document.getElementById(`input-${cat}-req`).value) || 0;
            const eleVal = parseInt(document.getElementById(`input-${cat}-ele`).value) || 0;
            categoryTargets[cat]['必修'] = reqVal;
            categoryTargets[cat]['選修'] = eleVal;
        } else {
            const totalVal = parseInt(document.getElementById(`input-${cat}-total`).value) || 0;
            categoryTargets[cat] = totalVal;
        }
    });

    saveData(); 
    alert("設定已更新！");
    isEditingCredits = false; 
    toggleCreditEdit();
    
    if (typeof renderAnalysis === 'function') renderAnalysis();
}