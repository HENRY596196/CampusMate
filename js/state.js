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

const defaultSchedule = { 1: [], 2: [], 3: [], 4: [], 5: [] };