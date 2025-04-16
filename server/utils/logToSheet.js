import { google } from 'googleapis';
import path from 'path';
import { writeFileSync } from 'fs';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = process.env.SHEET_ID;

export const logToSheet = async ({ name, email, message }) => {
  try {
    // 🔐 Decode service account key from .env
    const credsDecoded = Buffer.from(process.env.GOOGLE_CREDS_BASE64, 'base64').toString('utf-8');

    // 📄 Write creds to /tmp (Render-safe path)
    const keyFilePath = path.resolve('/tmp/credentials.json');
    writeFileSync(keyFilePath, credsDecoded);
    console.log('[🔐] Credentials written to /tmp/credentials.json');

    // 🔑 Auth with Google API
    const auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: SCOPES,
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const now = new Date().toISOString();
    const values = [[name, email, message, now]];

    console.log('[🧪 Google Sheets] Sending values:', values);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:D',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    console.log(`[📄] Contact logged to Google Sheets for ${email}`);
  } catch (err) {
    console.error('[SHEET LOG ERROR]', err);
  }
};