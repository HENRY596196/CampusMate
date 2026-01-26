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

// === NEW: 新增兩個變數來儲存小考與段考成績 ===
let regularExams = {}; // 格式: { "微積分": [ {title: "小考1", score: 90}, ... ], ... }
let midtermExams = {}; // 格式: { "微積分": [ {title: "期中考", score: 85}, ... ], ... }

const defaultSchedule = { 1: [], 2: [], 3: [], 4: [], 5: [] };
