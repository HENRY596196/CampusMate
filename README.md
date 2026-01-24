
# 📅 CampusMate - 學霸課表

**CampusMate** 是一個專為學生設計的輕量級課表與成績管理工具。支援 PWA (Progressive Web App)，可直接安裝於手機桌面，隨時隨地管理你的學習生活。

## ✨ 主要功能 (Features)

### 1. 課表管理 (Schedule Management)
* **每週課表**：直覺的週一至週五切換介面。
* **詳細資訊**：可記錄節次、時間、科目、教室地點及老師姓名。
* **彈性編輯**：隨時新增或刪除課程，支援自訂節次代號 (如 1, 2, A, B)。

### 2. 成績試算 (Grade Tracker)
* **雙身分模式**：
    * 🎓 **大學生模式**：支援「學分」輸入，自動計算**加權平均 (GPA)**。
    * 🏫 **高中生模式**：專注於科目分數，自動計算**算術平均**。
* **及格提示**：自動標示不及格科目 (紅字/綠字區分)。

### 3. 多學期系統 (Multi-Semester)
* **學期切換**：可建立多個學期 (如 113-1, 113-2)，完整記錄求學歷程。
* **學期管理**：支援新增、更名與刪除舊學期資料。

### 4. 雲端同步與帳號 (Cloud Sync & Auth)
* **Firebase 整合**：資料儲存於雲端，換手機也不怕資料遺失。
* **多種登入方式**：
    * Google 快速登入
    * Email/密碼 註冊與登入
    * 👻 匿名試用模式 (資料僅暫存)

### 5. PWA 支援
* 支援 **Add to Home Screen**，可像原生 App 一樣安裝在手機上。
* 內建 Service Worker，優化載入速度與離線體驗。

---

## 🛠️ 技術棧 (Tech Stack)

* **Frontend**: HTML5, CSS3 (CSS Variables, Flexbox), Vanilla JavaScript (ES6+)
* **Backend / BaaS**: Google Firebase (Authentication)
* **PWA**: Web App Manifest, Service Worker
* **Icons**: Flaticon / FontAwesome (Concept)

---

## 🚀 如何安裝與執行 (Installation)

本專案為靜態網頁應用，無需複雜的後端架設。

1.  **下載專案**
    ```bash
    git clone [https://github.com/henry596196/campusmate.git](https://github.com/henry596196/campusmate.git)
    cd campusmate
    ```

2.  **啟動專案**
    * 直接使用瀏覽器開啟 `index.html`。
    * 或是使用 Live Server (VS Code Extension) 開啟以獲得最佳體驗。

3.  **Firebase 設定**
    * 專案已內建 Firebase Config 於 `js/script.js`。若您要部署自己的版本，請前往 [Firebase Console](https://console.firebase.google.com/) 建立新專案，並替換 `js/script.js` 中的 `firebaseConfig` 物件。

---

## 📱 使用說明

1.  **初次進入**：選擇您的身分（高中生/大學生），這將影響成績計算方式。
2.  **建立學期**：預設為當前學期，您可點擊「+ 新學期」來規劃下個階段。
3.  **新增課程**：點擊首頁的「+ 編輯本日課程」即可開始排課。
4.  **管理員功能**：(開發者限定) 特定 UID 登入後可看見公告發布面板。

---

## 🤝 貢獻與開發

由 **CampusMate Team** 開發。
如有任何問題或建議，歡迎提交 Issue 或 Pull Request！

License: MIT
