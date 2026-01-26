// --- 介面控制與分頁 ---
function switchTab(tabName) {
    // 隱藏所有頁面
    document.getElementById('view-home').style.display = 'none';
    document.getElementById('view-info').style.display = 'none';
    document.getElementById('view-settings').style.display = 'none';

    // 顯示目標頁面
    document.getElementById('view-' + tabName).style.display = 'block';

    // 更新按鈕狀態
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById('btn-' + tabName);
    if(btn) btn.classList.add('active');

    // 特殊處理：切回首頁時刷新課表
    if (tabName === 'home') {
        switchDay(currentDay);
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
    const uniElements = document.querySelectorAll('.uni-only');
    const displayStyle = userType === 'university' ? 'table-cell' : 'none';
    uniElements.forEach(el => el.style.display = displayStyle);
    switchDay(currentDay);
    loadGrades();
}