import * as XLSX from 'xlsx';
import Result from '@/models/Result';
import dbConnect from '@/lib/mongodb';

interface ParsedResult {
  slNo: number;
  chestNo: string;
  name: string;
  class: string;
  school: string;
  grade: string;
  place: string;
}

export async function parseAndSaveExcel(buffer: Buffer) {
  await dbConnect();
  
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetNames = workbook.SheetNames;
  
  let totalProcessed = 0;
  let eventsProcessed: string[] = [];

  const GROUP_KEYWORDS = ["GROUP"];

  for (const sheetName of sheetNames) {
      // Skip empty or utility sheets if any, though "101", "102" are valid
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];

      if (rows.length < 5) {
          console.log(`Skipping sheet ${sheetName}: Too few rows`);
          continue;
      }

      const eventRow = rows[2];
      const codeRow = rows[3];
      
      // Extract Event Name
      let eventRaw = (eventRow[0] as string) || "";
      let eventName = eventRaw.replace(/^EVENT\s*:\s*/i, '').trim();

      if (!eventName) {
         // Try to find event name in other cells of row 2?
         // console.log(`Skipping sheet ${sheetName}: No event name found`);
         // continue;
         // Sometimes meta might be shifted. Let's strict for now.
         continue; 
      }

      // Extract Category
      let category = "Unknown";
      const catLabelIndex = eventRow.findIndex((c: any) => typeof c === 'string' && c.trim().toLowerCase() === 'category:');
      if (catLabelIndex !== -1 && eventRow.length > catLabelIndex + 1) {
          category = String(eventRow[catLabelIndex + 1]).trim();
      }

      // Extract Event Code
      let codeRaw = (codeRow[0] as string) || "";
      let eventCode = codeRaw.replace(/^EVENT CODE\s*:\s*/i, '').trim();
      // If code missing from cell, use sheet name if numeric?
      if (!eventCode && /^\d+$/.test(sheetName)) {
          eventCode = sheetName;
      }

      // Auto-detect Group
      const isGroup = GROUP_KEYWORDS.some(k => eventName.toUpperCase().includes(k));

      console.log(`Processing Sheet ${sheetName}: Event: ${eventName} (${eventCode}), Cat: ${category}, IsGroup: ${isGroup}`);

      const dataStartIndex = 5;
      const resultsToSave = [];

      for (let i = dataStartIndex; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        
        const studentName = String(row[2] || '').trim();
        
        if (!studentName) continue;

        const school = String(row[4] || '').trim();
        const grade = String(row[5] || '').trim().toUpperCase();
        const place = String(row[6] || '').trim().toLowerCase().replace(/st|nd|rd|th/g, ''); 

        let placePoints = 0;
        let gradePoints = 0;

        // Place Points
        if (place === '1') placePoints = isGroup ? 10 : 5;
        else if (place === '2') placePoints = isGroup ? 6 : 3;
        else if (place === '3') placePoints = isGroup ? 2 : 1;

        // Grade Points
        if (grade === 'A') gradePoints = isGroup ? 10 : 5;
        else if (grade === 'B') gradePoints = isGroup ? 6 : 3;
        else if (grade === 'C') gradePoints = isGroup ? 2 : 1;

        const totalPoints = placePoints + gradePoints;

        resultsToSave.push({
          eventCode: eventCode || "MISC", 
          eventName,
          category,
          studentName,
          school,
          grade,
          place: place === '1' ? 'First' : place === '2' ? 'Second' : place === '3' ? 'Third' : place, 
          points: totalPoints
        });
      }

      if (resultsToSave.length > 0) {
          // Transaction-like replacement PER EVENT
          await Result.deleteMany({ eventName, category }); 
          await Result.insertMany(resultsToSave);
          totalProcessed += resultsToSave.length;
          eventsProcessed.push(eventName);
      }
  }

  return { success: true, count: totalProcessed, events: eventsProcessed };
}
