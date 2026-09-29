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
    // Row 130 is headers, 131 is Top 1, 132 is Top 2
    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Vmix!A130:AH132', 
    });

    const rows = sheetResponse.data.values;
    if (!rows || rows.length < 3) {
      return NextResponse.json({ data: [] });
    }
    
    const headers = rows[0];
    const player1 = rows[1];
    const player2 = rows[2];

    return NextResponse.json({ headers, player1, player2 });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
