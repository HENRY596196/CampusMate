let userType = localStorage.getItem('userType');
let currentDay = new Date().getDay(); // 0=週日, 1=週一...
if (currentDay === 0 || currentDay === 6) currentDay = 1; // 如果是週末，預設顯示週一

// 預設課表資料 (模擬資料庫)
const weeklySchedule = {
    1: [ // 週一
        { time: '08:10', subject: '國文', room: '301' },
        { time: '09:10', subject: '數學', room: '301' },
        { time: '10:10', subject: '英文', room: '視聽室' }
    ],
    2: [ // 週二
        { time: '08:10', subject: '物理', room: '實驗室' },
        { time: '10:10', subject: '體育', room: '操場' }
    ],
    3: [ // 週三
        { time: '09:00', subject: '通識', room: 'B102' },
        { time: '13:00', subject: '微積分', room: 'A204' }
    ],
    4: [], // 週四沒課
    5: [ // 週五
        { time: '15:00', subject: '班會', room: '301' }
    ]
};

// 預設成績資料
const grades = [
    { subject: '國文', credit: 3, score: 85 },
    { subject: '數學', credit: 4, score: 92 },
    { subject: '英文', credit: 2, score: 78 }
];

// 初始化
const modal = document.getElementById('welcome-modal');
const uniElements = document.querySelectorAll('.uni-only');

if (!userType) {
    if(modal) modal.style.display = 'flex';
} else {
    initApp();
}

function setUserType(type) {
    localStorage.setItem('userType', type);
    userType = type;
    if(modal) modal.style.display = 'none';
    initApp();
}

function initApp() {
    const badge = document.getElementById('user-badge');
    if(badge) badge.innerText = userType === 'university' ? '大學部' : '高中部';
    
    if (userType === 'university') {
        uniElements.forEach(el => el.style.display = 'table-cell');
    }
    
    // 載入當天的課表
    switchDay(currentDay);
    // 載入成績
    loadGrades();
}

// 切換星期幾的函數
function switchDay(day) {
    // 1. 更新按鈕狀態
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`tab-${day}`);
    if(activeBtn) activeBtn.classList.add('active');

    // 2. 獲取該日資料
    const todayData = weeklySchedule[day] || [];
    const tbody = document.getElementById('schedule-body');
    if(tbody) {
        tbody.innerHTML = '';

        // 3. 渲染表格
        if (todayData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="no-class">😴 今天沒有課程安排</td></tr>';
        } else {
            todayData.forEach(item => {
                // 根據大學/高中顯示不同時間格式
                let displayTime = item.time;
                if(userType === 'highschool' && day === 1 && item.time === '08:10') displayTime = '第一節'; 
                
                const row = `
                    <tr>
                        <td style="color:#666; font-weight:bold;">${displayTime}</td>
                        <td>${item.subject}</td>
                        <td><span style="background:#f0f0f0; padding:2px 6px; border-radius:4px; font-size:0.85rem;">${item.room}</span></td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        }
    }
}

function loadGrades() {
    const tbody = document.getElementById('grade-body');
    if(!tbody) return;

    let totalScore = 0;
    let count = 0;
    
    grades.forEach(g => {
        const row = `
            <tr>
                <td>${g.subject}</td>
                ${userType === 'university' ? `<td>${g.credit}</td>` : ''}
                <td style="font-weight:bold; color:${g.score < 60 ? 'red' : 'green'}">${g.score}</td>
            </tr>
        `;
        tbody.innerHTML += row;
        totalScore += g.score;
        count++;
    });

    if(count > 0) {
        document.getElementById('average-score').innerText = (totalScore / count).toFixed(1);
    }
}

function addItem() {
    alert('提醒：目前是展示模式。\n若要啟用編輯功能，需要進一步設定資料庫儲存邏輯。');
}
