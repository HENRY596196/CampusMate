// --- 2. 全域變數狀態 ---
let currentUser = null;
let userType = localStorage.getItem('userType');
let isRegisterMode = false;

// 日期相關
let currentDay = new Date().getDay();
if (currentDay === 0 || currentDay === 6) currentDay = 1;

// 學期與資料相關
let currentSemester = "113-2";
let semesterList = ["113-2"];
let allData = {};

// 暫存變數 (當前顯示的資料)
let weeklySchedule = {};
let gradeList = [];

// === 新增兩個變數來儲存小考與段考成績 ===
let regularExams = {}; // 格式: { "微積分": [ {title: "小考1", score: 90}, ... ], ... }
let midtermExams = {}; // 格式: { "微積分": [ {title: "期中考", score: 85}, ... ], ... }
let calendarEvents = []; // 行事曆活動

// === 新增畢業學分目標變數 ===
let graduationTarget = 128; // 預設值

// === 各模組的目標學分 ★★★ ===
let categoryTargets = {
    "通識": 28,
    "院共同": 9,
    "基礎": {
        "必修": 15,
        "選修": 9
    },
    "核心": {
        "必修": 15,
        "選修": 9
    },
    "專業": {
        "必修": 0,
        "選修": 23
    },
    "自由": 20,
    "其他": 0
};

const defaultSchedule = { 1: [], 2: [], 3: [], 4: [], 5: [] };
