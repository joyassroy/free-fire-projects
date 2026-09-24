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
    
    // Helper function to make matching easy
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

    // 3. Find the demo.png file to use as a fallback
    const demoFile = driveFiles.find(file => file.name && normalize(file.name) === 'demopng');
    const demoLogoUrl = demoFile 
      ? `https://drive.google.com/thumbnail?id=${demoFile.id}&sz=w150` 
      : null;

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

      // 4. Match team name with Drive file names
      for (const file of driveFiles) {
        if (file.name) {
          const fileNameWithoutExt = normalize(file.name.replace(/\.[^/.]+$/, ""));
          
          if (fileNameWithoutExt.includes(normalizedTeamName) || normalizedTeamName.includes(fileNameWithoutExt)) {
            // Found a match! Use Google's fast thumbnail CDN instead of the slow 'uc' link
            matchedLogoUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w150`;
            break;
          }
        }
      }

      // If no match found, use the demo.png from Drive. If demo.png is missing, use Avatar
      if (!matchedLogoUrl && teamName) {
        matchedLogoUrl = demoLogoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&background=random&color=fff&size=128&bold=true`;
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
