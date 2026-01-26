// --- 3. 程式啟動 ---
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        updateLoginUI(true);
        loadData();
        checkUserType();

        checkAdminStatus(); // --- 當為管理者時，叫出來！ ---
    } else {
        currentUser = null;
        updateLoginUI(false);

        // ---【新增/插入】登出時隱藏管理介面 ---
        document.getElementById('admin-panel').style.display = 'none';
    }
});