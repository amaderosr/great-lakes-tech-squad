import { google } from 'googleapis';
import path from 'path';
import { writeFileSync } from 'fs';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const getSheetsClient = async () => {
  const credsDecoded = Buffer.from(process.env.GOOGLE_CREDS_BASE64, 'base64').toString('utf-8');
  const keyFilePath = path.resolve('/tmp/credentials.json');
  writeFileSync(keyFilePath, credsDecoded);
  const auth = new google.auth.GoogleAuth({ keyFile: keyFilePath, scopes: SCOPES });
  const client = await auth.getClient();
  return google.sheets({ version: 'v4', auth: client });
};

// 📬 Contact form logger
export const logToSheet = async ({ name, email, message }) => {
  try {
    const sheets = await getSheetsClient();
    const now = new Date().toISOString();
    const values = [[name, email, message, now]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SHEET_ID,
      range: 'Sheet1!A:D',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    console.log(`[📄] Contact logged for ${email}`);
  } catch (err) {
    console.error('[SHEET LOG ERROR] Contact', err);
  }
};

// 🤖 AI assistant logger
export const logAIChat = async ({ userMessage, botReply, intent }) => {
  try {
    const sheets = await getSheetsClient();
    const now = new Date().toISOString();
    const values = [[now, userMessage, botReply, intent]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.AI_SHEET_ID,
      range: 'AIChat!A:D',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    }).catch(err => {
      console.error('[🛑 SHEET APPEND ERROR]', err.errors || err.message);
    });

    console.log(`[📄] AI Chat logged: "${intent}"`);
  } catch (err) {
    console.error('[SHEET LOG ERROR] AI Chat', err);
  }
};

// 📈 Log AI lead to Google Sheets
export const logAILead = async ({ name, email, phone, preferredTime }) => {
  try {
    const sheets = await getSheetsClient();
    const now = new Date().toISOString();
    const values = [[now, name, email, phone, preferredTime]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.AI_SHEET_ID,
      range: 'AI Leads!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    console.log(`[📇] AI Lead logged: ${email}`);
  } catch (err) {
    console.error('[SHEET LOG ERROR] AI Lead', err);
  }
};