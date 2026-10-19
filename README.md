# A Little Question 💗

A responsive love/proposal landing page made with plain HTML, CSS, and JavaScript.

## Features
- Responsive layout for mobile and desktop
- Accessible form labels, focus styles, and reduced-motion support
- Yes/No interaction with animated hearts
- Form validation for name, date, time, and place
- Summary screen with share/copy fallback
- Optional Google Sheets integration through Google Apps Script

## Run locally
Open `index.html` in a browser. For best testing, use a local server such as VS Code Live Server.

## Deploy with GitHub Pages
1. Push these files to the root of your GitHub repository.
2. Open **Settings → Pages**.
3. Under build and deployment, select **Deploy from a branch**.
4. Select `main` and `/(root)`, then save.
5. Wait for deployment and open the published URL.

## Optional Google Sheets integration
By default, the page does not send form data anywhere. To connect a spreadsheet:

1. Create a Google Sheet and copy its ID from the URL.
2. Open **Extensions → Apps Script** in that sheet.
3. Paste the following code in `Code.gs`, replacing `YOUR_SPREADSHEET_ID`.
4. Deploy as a web app: **Execute as: Me** and choose an access setting that allows the intended users to submit.
5. Copy the web app URL and paste it into `CONFIG.GOOGLE_SCRIPT_URL` in `script.js`.
6. Test with non-sensitive sample data and confirm a row appears in the sheet.

### Apps Script (`Code.gs`)
```javascript
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
const SHEET_NAME = "Responses";

function doPost(e) {
  try {
    const p = (e && e.parameter) ? e.parameter : {};
    const personName = clean(p.personName, 60);
    const date = clean(p.date, 10);
    const time = clean(p.time, 5);
    const place = clean(p.place, 120);
    const note = clean(p.note, 300);
    const submittedAt = clean(p.submittedAt, 40) || new Date().toISOString();

    if (!personName || !date || !time || !place) {
      return json({ ok: false, message: "Missing required fields." });
    }
    if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(date) || !/^\\d{2}:\\d{2}$/.test(time)) {
      return json({ ok: false, message: "Invalid date or time." });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      let sheet = ss.getSheetByName(SHEET_NAME);
      if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["Submitted At", "Name", "Date", "Time", "Place", "Note"]);
      }
      sheet.appendRow([
        new Date(submittedAt),
        safeCell(personName),
        safeCell(date),
        safeCell(time),
        safeCell(place),
        safeCell(note)
      ]);
    } finally {
      lock.releaseLock();
    }
    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ ok: false, message: "Server error." });
  }
}

function clean(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

// Avoid spreadsheet formula injection from values beginning with formula characters.
function safeCell(value) {
  const s = String(value || "");
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Important integration note
The static page uses `mode: "no-cors"` for the simplest Apps Script setup. In that mode the browser cannot read the server response, so the page cannot truthfully confirm the spreadsheet write. Always verify the new row in Google Sheets. For robust success/error confirmation, use a backend/proxy with deliberate CORS configuration rather than trusting an opaque response.

## Before publishing
- Check the live page on a real phone and desktop.
- Test every button and form field.
- Open browser DevTools and check for console/network errors.
- Confirm CSS/JS paths are case-sensitive and correct.
- Do not commit passwords, API keys, or private personal data.
- If you do not want to collect personal data, leave the Sheets URL empty.
