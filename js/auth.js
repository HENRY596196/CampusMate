// --- 帳號驗證與管理 ---
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

function loginWithGoogle() {
    auth.signInWithPopup(provider).catch(e => alert(e.message));
}

function loginAnonymously() {
    auth.signInAnonymously().catch(e => alert(e.message));
}

function logout() {
    if (currentUser && currentUser.isAnonymous && !
        confirm("⚠️ 匿名帳號登出後資料會消失，確定嗎？")
    ) return;
    auth.signOut().then(() =>
        window.location.reload()
    );
}

function checkUserType() {
    if (!userType) document.getElementById('welcome-modal').style.display = 'flex';
    else initUI();
}

function setUserType(type) {
    localStorage.setItem('userType', type);
    userType = type;
    document.getElementById('welcome-modal').style.display = 'none';
    initUI();
}

// --- 身分重設功能 ---
// --- 舊版本 ---
// function resetIdentity() { localStorage.removeItem('userType'); userType = null; document.getElementById('welcome-modal').style.display = 'flex'; }
// ★★★ 請替換成這個新的版本 ★★★
function resetIdentity() {
    if (confirm("確定要重新選擇身分嗎？\n\n切換後將改變成績計算方式：\n• 高中生：算術平均\n• 大學生：GPA 計算\n\n(您的資料不會被刪除)"))
        {
        localStorage.removeItem('userType');
        userType = null;
        document.getElementById('welcome-modal').style.display = 'flex';
        
        // 關閉可能開啟的選單或切換回首頁，讓體驗更順暢
        switchTab('home'); 
    }
}

function updateLoginUI(isLoggedIn) {
    const loginOverlay = document.getElementById('login-overlay');
    const userInfo = document.getElementById('user-info');
    const userPhoto = document.getElementById('user-photo');
    if (loginOverlay) loginOverlay.style.display = isLoggedIn ? 'none' : 'flex';
    if (userInfo) userInfo.style.display = isLoggedIn ? 'flex' : 'none';
    if (userPhoto && currentUser) userPhoto.src = currentUser.photoURL || "https://cdn-icons-png.flaticon.com/512/847/847969.png";
}