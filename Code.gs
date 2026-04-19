// ============================================================
//  EduManage Pro — Google Apps Script Backend (সম্পূর্ণ)
//  Hemayetpur Laboratory School & College
// ============================================================

function doGet(e) {
  // Connection test + CORS header সহ response
  return ContentService
    .createTextOutput(JSON.stringify({
      status : "EduManage Pro API চালু আছে ✅",
      time   : new Date().toLocaleString('bn-BD'),
      version: "2.0"
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action  = payload.action;
    const data    = payload.data || {};
    let result;

    if      (action === 'addStudent')    result = addRow('Students',    studentRow(data));
    else if (action === 'addTeacher')    result = addRow('Teachers',    teacherRow(data));
    else if (action === 'addFee')        result = addRow('Fees',        feeRow(data));
    else if (action === 'addResult')     result = addRow('Results',     resultRow(data));
    else if (action === 'addAttendance') result = addRow('Attendance',  attRow(data));
    else if (action === 'addExam')       result = addRow('Exams',       examRow(data));
    else if (action === 'addNotice')     result = addRow('Notices',     noticeRow(data));
    else throw new Error('অজানা action: ' + action);

    logActivity(action, 'সফল');
    return jsonResponse({ success: true });

  } catch (err) {
    logActivity('error', err.message);
    return jsonResponse({ success: false, error: err.message });
  }
}

// ── Row builders ──────────────────────────────────────────
function studentRow(d) {
  return {
    headers: ['ID','নাম','শ্রেণী','শাখা','সেকশন','রোল','লিঙ্গ','জন্মতারিখ','অভিভাবক','ফোন','ঠিকানা','ভর্তির তারিখ'],
    values:  [d.id,d.name,d.className,d.branch||'সাধারণ',d.section,d.roll,d.gender,d.dob,d.guardian,d.phone,d.address,today()]
  };
}
function teacherRow(d) {
  return {
    headers: ['ID','নাম','বিষয়','শ্রেণী','ফোন','যোগ্যতা','মাসিক বেতন','যোগদান তারিখ'],
    values:  [d.id,d.name,d.subject,d.className,d.phone,d.qualification,d.salary,d.joinDate]
  };
}
function feeRow(d) {
  return {
    headers: ['স্টুডেন্ট ID','নাম','শ্রেণী','মাস','পরিমাণ','পরিশোধ','অবস্থা','তারিখ'],
    values:  [d.studentId,d.studentName,d.className,d.month,d.amount,d.paid,d.status,d.date]
  };
}
function resultRow(d) {
  return {
    headers: ['স্টুডেন্ট ID','নাম','শ্রেণী','পরীক্ষা','বিষয়','Tutorial','Semester','মোট'],
    values:  [d.studentId,d.studentName,d.className,d.examName,d.subject,d.tutorial,d.semester,d.total]
  };
}
function attRow(d) {
  return {
    headers: ['তারিখ','স্টুডেন্ট ID','নাম','শ্রেণী','অবস্থা'],
    values:  [d.date,d.studentId,d.studentName,d.className,d.status]
  };
}
function examRow(d) {
  return {
    headers: ['ID','নাম','শ্রেণী','শুরু','শেষ'],
    values:  [d.id,d.name,d.className,d.startDate,d.endDate]
  };
}
function noticeRow(d) {
  return {
    headers: ['শিরোনাম','ধরন','তারিখ','লেখক','বিস্তারিত'],
    values:  [d.title,d.type,d.date,d.author,d.body]
  };
}

// ── Core helper: sheet এ row যোগ করা ───────────────────────
function addRow(sheetName, rowDef) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(rowDef.headers);
    sheet.getRange(1,1,1,rowDef.headers.length)
         .setBackground('#1a73e8').setFontColor('#fff').setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  sheet.appendRow(rowDef.values);
  return true;
}

function logActivity(action, status) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName('Log');
  if (!sheet) {
    sheet = ss.insertSheet('Log');
    sheet.appendRow(['সময়','Action','অবস্থা']);
  }
  sheet.appendRow([new Date().toLocaleString('bn-BD'), action, status]);
}

function today() {
  return new Date().toLocaleDateString('bn-BD');
}

function jsonResponse(obj) {
  // Apps Script Web App এ CORS header নিজে থেকেই থাকে
  // ContentService দিয়ে JSON পাঠালে Apps Script নিজেই handle করে
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Sheet এর সব data পড়া (GET দিয়ে) ─────────────────────
function getAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ['Students','Teachers','Fees','Results','Attendance','Exams','Notices'];
  const out = {};
  sheets.forEach(name => {
    const sh = ss.getSheetByName(name);
    if (sh) {
      const rows = sh.getDataRange().getValues();
      out[name] = rows;
    }
  });
  return out;
}
