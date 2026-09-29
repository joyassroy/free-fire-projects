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
    
    // 1. Fetch data from Google Sheets
    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Vmix!A31:AH32', 
    });

    const rows = sheetResponse.data.values;
    if (!rows || rows.length < 2) {
      return NextResponse.json({ data: [] });
    }
    
    const headers = rows[0];
    const mvpData = rows[1];

    return NextResponse.json({ headers, mvpData });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
