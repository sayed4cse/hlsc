// ============================================================
//  EduManage Pro — Google Sheets Integration Module
//  এই file টি আপনার index.html এ <script> tag দিয়ে যোগ করুন
//  অথবা index.html এর নিচে <script> এর ভেতরে paste করুন
// ============================================================

// ⚠️ নিচের URL টি আপনার Apps Script deployment URL দিয়ে বদলান
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbwy2H2uXPJkMGQcgmb4Zw5fT1n4rkH4KTtK_BGp1l5AGwB1uiKGonPvGUpy1XW5gZb5fQ/exec";

// ============================================================
//  Core API caller
// ============================================================
async function sheetsAPI(action, data = {}) {
  try {
    const res = await fetch(SHEET_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action, data })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  } catch (err) {
    console.error("Sheets API Error:", err);
    showNotification("❌ Google Sheets এ সংযোগ সমস্যা: " + err.message, "error");
    return null;
  }
}

// ============================================================
//  Student Functions
// ============================================================
async function saveStudentToSheets(studentData) {
  showNotification("⏳ Google Sheets এ সংরক্ষণ হচ্ছে...", "info");
  const result = await sheetsAPI("addStudent", studentData);
  if (result) {
    showNotification("✅ Student Sheets এ সংরক্ষিত! ID: " + result.studentId, "success");
    return result.studentId;
  }
  return null;
}

async function loadStudentsFromSheets() {
  const students = await sheetsAPI("getStudents");
  return students || [];
}

// ============================================================
//  Fee Functions
// ============================================================
async function saveFeeToSheets(feeData) {
  showNotification("⏳ ফি তথ্য সংরক্ষণ হচ্ছে...", "info");
  const result = await sheetsAPI("addFee", feeData);
  if (result) {
    showNotification("✅ ফি রিসিট তৈরি হয়েছে! নং: " + result.receiptNo, "success");
    return result.receiptNo;
  }
  return null;
}

async function loadFeesFromSheets() {
  const fees = await sheetsAPI("getFees");
  return fees || [];
}

// ============================================================
//  Result Functions
// ============================================================
async function saveResultToSheets(resultData) {
  showNotification("⏳ রেজাল্ট সংরক্ষণ হচ্ছে...", "info");
  const result = await sheetsAPI("addResult", resultData);
  if (result) {
    showNotification("✅ রেজাল্ট সংরক্ষিত! গ্রেড: " + result.grade, "success");
    return result.grade;
  }
  return null;
}

async function loadResultsFromSheets() {
  const results = await sheetsAPI("getResults");
  return results || [];
}

// ============================================================
//  Attendance Functions
// ============================================================
async function saveAttendanceToSheets(attendanceData) {
  const result = await sheetsAPI("addAttendance", attendanceData);
  if (result) {
    showNotification("✅ উপস্থিতি নথিভুক্ত হয়েছে!", "success");
  }
  return result;
}

async function loadAttendanceFromSheets() {
  const attendance = await sheetsAPI("getAttendance");
  return attendance || [];
}

// ============================================================
//  Notification Helper (EduManage UI এর সাথে মিলিয়ে)
// ============================================================
function showNotification(message, type = "info") {
  // যদি EduManage এ আলাদা notification system থাকে সেটা ব্যবহার করুন
  // না হলে নিচের simple version কাজ করবে
  const existing = document.getElementById("sheets-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "sheets-toast";
  const colors = {
    success: "#1a8a2e",
    error:   "#c0392b",
    info:    "#1a5276"
  };
  toast.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    background:${colors[type] || colors.info};
    color:#fff; padding:12px 20px; border-radius:10px;
    font-size:14px; max-width:360px; box-shadow:0 4px 16px rgba(0,0,0,.25);
    animation: slideIn .3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ============================================================
//  EduManage Pro এর Form গুলোতে Auto-Hook করা
//  (আপনার form submit handler এর সাথে যুক্ত করুন)
// ============================================================

// উদাহরণ — Student ভর্তি form এ যোগ করুন:
//
// document.getElementById("admissionForm")
//   .addEventListener("submit", async (e) => {
//     e.preventDefault();
//     const studentData = {
//       name:          document.getElementById("studentName").value,
//       fatherName:    document.getElementById("fatherName").value,
//       motherName:    document.getElementById("motherName").value,
//       className:     document.getElementById("class").value,
//       section:       document.getElementById("section").value,
//       mobile:        document.getElementById("mobile").value,
//       address:       document.getElementById("address").value,
//       admissionDate: new Date().toLocaleDateString("bn-BD")
//     };
//     const newId = await saveStudentToSheets(studentData);
//     // বাকি আপনার existing code চালু রাখুন
//   });

// উদাহরণ — Fee form:
//
// async function onFeeSubmit(studentId, studentName, className, feeType, amount, month) {
//   await saveFeeToSheets({ studentId, studentName, className, feeType, amount, month });
// }

// উদাহরণ — Result form:
//
// async function onResultSubmit(studentId, studentName, className, examName, subject, fullMarks, obtained) {
//   await saveResultToSheets({ studentId, studentName, className, examName, subject, fullMarks, obtained });
// }

// উদাহরণ — Attendance:
//
// async function onAttendanceMark(studentId, studentName, className, status) {
//   await saveAttendanceToSheets({
//     studentId, studentName, className, status,
//     date: new Date().toLocaleDateString("bn-BD")
//   });
// }

console.log("✅ EduManage Pro — Google Sheets Integration লোড হয়েছে");
