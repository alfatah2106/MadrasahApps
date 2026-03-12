// --- MASUKKAN ID DARI NOTEPAD ANDA DI SINI ---
const SHEET_ID = '1ofennYeG7faFo46Ii3265lgwF15E5FLwczaOYxtdmF8';
const FOLDER_ID = '1GmELbmcyps96ctrgPrn3uiAU5JUtRqHt';

// Fungsi untuk menerima permintaan GET (Membaca Data Tugas)
function doGet(e) {
  try {
    const email = e.parameter.email;
    const kelas = e.parameter.kelas; // Parameter baru dari React [cite: 2]

    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    const data = sheet.getDataRange().getValues();

    const tasks = [];

    // Baris pertama adalah header, mulai dari indeks 1
    for (let i = 1; i < data.length; i++) {
      const rowEmail = data[i][2];     // C: Email
      const rowKelas = data[i][9];     // J: Kelas
      const rowMapel = data[i][10];    // K: Mapel
      const isPublic = (data[i][11] === true || data[i][11] === 'TRUE' || data[i][11] === 'true'); // L: Public

      // Cek apakah user adalah pemilik file, ATAU file bersifat public & berada di kelas yang sama
      if (rowEmail === email || (isPublic && rowKelas === kelas)) {
        tasks.push({
          id: data[i][0],
          title: data[i][5],
          type: data[i][6],
          status: data[i][7],
          fileUrl: data[i][8],
          kelas: rowKelas,
          mapel: rowMapel,
          isPublic: isPublic,
          isOwner: rowEmail === email // Flagging penting untuk otorisasi di frontend
        });
      }
    }

    // Mengubah urutan agar yang terbaru di atas
    tasks.reverse();
    return ContentService.createTextOutput(JSON.stringify({success: true, data: tasks}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Fungsi untuk menerima permintaan POST (Membuat File, Update Status, & Delete)
function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();

    // 1. ACTION: CREATE TASK
    if (action === 'createTask') {
      let fileId;
      let fileUrl;
      const folder = DriveApp.getFolderById(FOLDER_ID);
      const docName = requestData.nis + " - " + requestData.name + " - " + requestData.mapel + " - " + requestData.title;

      if (requestData.type === 'docs') {
        const doc = DocumentApp.create(docName);
        fileId = doc.getId();
        fileUrl = `https://docs.google.com/document/d/${fileId}/edit`;
      } else if (requestData.type === 'sheets') {
        const spreadsheet = SpreadsheetApp.create(docName);
        fileId = spreadsheet.getId();
        fileUrl = `https://docs.google.com/spreadsheets/d/${fileId}/edit`;
      } else if (requestData.type === 'slides') {
        const slide = SlidesApp.create(docName);
        fileId = slide.getId();
        fileUrl = `https://docs.google.com/presentation/d/${fileId}/edit`;
      }

      // Pindahkan file ke folder tujuan
      const driveFile = DriveApp.getFileById(fileId);
      driveFile.moveTo(folder);

      // Catat di Sheet
      const taskId = 'TASK_' + new Date().getTime();
      const timestamp = new Date().toLocaleString('id-ID');

      // Pastikan urutan array ini selaras dengan Header A - L
      sheet.appendRow([
        taskId,              // A: 0
        timestamp,           // B: 1
        requestData.email,   // C: 2
        requestData.nis,     // D: 3
        requestData.name,    // E: 4
        requestData.title,   // F: 5
        requestData.type,    // G: 6
        'Belum Selesai',     // H: 7
        fileUrl,             // I: 8
        requestData.kelas,   // J: 9
        requestData.mapel,   // K: 10
        false                // L: 11 (Public default False)
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        taskId: taskId,
        fileUrl: fileUrl
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. ACTION: UPDATE STATUS
    if (action === 'updateStatus') {
      const data = sheet.getDataRange().getValues();
      let updated = false;

      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === requestData.taskId) {
          sheet.getRange(i + 1, 8).setValue(requestData.status); // Kolom H (Indeks ke-8 untuk setRange) adalah Status
          updated = true;
          break;
        }
      }

      return ContentService.createTextOutput(JSON.stringify({success: updated}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 3. ACTION: DELETE TASK
    if (action === 'deleteTask') {
      const data = sheet.getDataRange().getValues();
      let deleted = false;

      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === requestData.taskId) {
          const isPublic = (data[i][11] === true || data[i][11] === 'TRUE' || data[i][11] === 'true');
          const rowEmail = data[i][2];

          // Validasi keamanan: Pastikan user adalah pemilik & status public adalah false
          if (!isPublic && rowEmail === requestData.email) {

            // Opsional: Buang file dari Google Drive
            try {
              const fileUrl = data[i][8];
              const match = fileUrl.match(/[-\w]{25,}/); // Ambil ID dari URL
              if (match) {
                DriveApp.getFileById(match[0]).setTrashed(true);
              }
            } catch (err) {
              // Jika gagal menghapus di drive (misal sudah terhapus manual), lanjutkan hapus di sheet
            }

            sheet.deleteRow(i + 1);
            deleted = true;
          }
          break;
        }
      }

      return ContentService.createTextOutput(JSON.stringify({success: deleted}))
        .setMimeType(ContentService.MimeType.JSON);
    }

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
