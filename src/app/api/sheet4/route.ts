import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/drive.readonly' // Access to Drive
      ],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });
    
    // 1. Fetch data from Google Sheets
    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Vmix!K45:AB46', 
    });

    // 2. Fetch all images from the specific Google Drive folder
    const driveResponse = await drive.files.list({
      q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed = false`,
      fields: 'files(id, name)',
    });
    const driveFiles = driveResponse.data.files || [];

    const rows = sheetResponse.data.values;
    if (!rows || rows.length < 2) {
      return NextResponse.json({ data: [] });
    }
    
    // row 45 and row 46
    const team1Data = rows[0];
    const team2Data = rows[1];

    return NextResponse.json({ data: [team1Data, team2Data] });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
