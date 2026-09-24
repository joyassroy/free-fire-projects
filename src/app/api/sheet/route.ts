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
      range: 'Vmix!E2:J14', 
    });

    // 2. Fetch all images from the specific Google Drive folder
    const driveResponse = await drive.files.list({
      q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed = false`,
      fields: 'files(id, name)',
    });
    const driveFiles = driveResponse.data.files || [];

    const rows = sheetResponse.data.values;
    if (!rows || rows.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const headers = rows[0];
    
    // Helper function to make matching easy (removes spaces, symbols, and converts to lowercase)
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

    const data = rows.slice(1).map((row) => {
      const rowData: Record<string, any> = {};
      headers.forEach((header: string, index: number) => {
        if (header) {
          rowData[header] = row[index];
        }
      });

      const teamName = rowData['TeamName'] || '';
      const normalizedTeamName = normalize(teamName);
      let matchedLogoUrl = null;

      // 3. Match team name with Drive file names
      for (const file of driveFiles) {
        if (file.name) {
          // Remove .png/.jpg extension and normalize
          const fileNameWithoutExt = normalize(file.name.replace(/\.[^/.]+$/, ""));
          
          // If the sheet's team name is inside the file name or vice versa, it's a match!
          // e.g. "X2" matches "X2 GLOBAL"
          if (fileNameWithoutExt.includes(normalizedTeamName) || normalizedTeamName.includes(fileNameWithoutExt)) {
            // Found a match! Construct the direct image URL
            matchedLogoUrl = `https://drive.google.com/uc?export=view&id=${file.id}`;
            break;
          }
        }
      }

      // If no match found, use a fallback demo logo based on the team's initials
      if (!matchedLogoUrl && teamName) {
        matchedLogoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&background=random&color=fff&size=128&bold=true`;
      }

      rowData['LogoUrl'] = matchedLogoUrl;
      return rowData;
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
