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
      ],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // As per your requirement, explicitly fetching only from Vmix sheet
    // Row 2 to 14, Columns E to J
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Vmix!E2:J14', 
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Row 2 in the sheet is index 0 in the response (Headers)
    const headers = rows[0];
    
    // Row 3 to 14 in the sheet is index 1 to 12 in the response (Data)
    const data = rows.slice(1).map((row) => {
      const rowData: Record<string, any> = {};
      headers.forEach((header: string, index: number) => {
        if (header) {
          rowData[header] = row[index];
        }
      });
      return rowData;
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
