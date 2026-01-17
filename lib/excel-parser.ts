import * as XLSX from 'xlsx';
import Result from '@/models/Result';
import dbConnect from '@/lib/mongodb';

export async function parseAndSaveExcel(buffer: Buffer) {
  await dbConnect();

  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetNames = workbook.SheetNames;

  let totalProcessed = 0;
  const eventsProcessed: string[] = [];
  const GROUP_KEYWORDS = ["GROUP"];

  for (const sheetName of sheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as (string | number)[][];

    if (rows.length < 5) continue;

    // --- 1. IMPROVED METADATA EXTRACTION ---
    const eventRow = rows[2] || [];
    const eventRaw = String(eventRow[0] || "");
    const eventName = eventRaw.replace(/^EVENT\s*:\s*/i, '').trim();
    if (!eventName) continue;

    // Fixed Category logic: Don't just take the next cell if it's a number like "1"
    let category = "General";
    const catLabelIndex = eventRow.findIndex((c) => typeof c === 'string' && c.trim().toLowerCase().includes('category'));
    if (catLabelIndex !== -1 && eventRow.length > catLabelIndex + 1) {
      const catVal = String(eventRow[catLabelIndex + 1]).trim();
      if (catVal.length > 1) category = catVal; // Only update if it's not a single digit
    }

    // --- 2. ADVANCED HEADER MAPPING ---
    let headerRowIndex = -1;
    let colMap = { name: 2, school: 4, grade: 5, place: 6 }; // Defaults based on your data structure

    for (let i = 0; i < Math.min(rows.length, 10); i++) {
      const rowStr = rows[i].map(c => String(c).toLowerCase().trim());
      const nameIdx = rowStr.findIndex(c => c.includes('student') || c.includes('name'));
      if (nameIdx !== -1) {
        headerRowIndex = i;
        colMap.name = nameIdx;
        colMap.school = rowStr.findIndex(c => c.includes('school') || c.includes('institution'));
        colMap.grade = rowStr.findIndex(c => c.includes('grade') || c.includes('mark') || c === '1');
        colMap.place = rowStr.findIndex(c => c.includes('place') || c.includes('rank') || c.includes('pos'));
        break;
      }
    }

    const isGroup = GROUP_KEYWORDS.some(k => eventName.toUpperCase().includes(k));
    const resultsToSave = [];

    // --- 3. ROW PROCESSING WITH NORMALIZATION ---
    const dataStartIndex = headerRowIndex !== -1 ? headerRowIndex + 1 : 5;

    for (let i = dataStartIndex; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 3) continue;

      const studentName = String(row[colMap.name] || '').trim();
      if (!studentName || studentName.toLowerCase().includes('name of')) continue;

      const school = String(row[colMap.school] || '').trim();
      
      // Normalize Grade (Handling "1" as A-Grade)
      let rawGrade = String(row[colMap.grade] || '').trim().toUpperCase();
      let grade = rawGrade;
      if (grade === '1') grade = 'A'; 

      // Normalize Place (Handling "-seco", "-fir", "-i", "1", "2")
      let rawPlace = String(row[colMap.place] || '').trim().toLowerCase().replace(/^-/, '');
      let place = "";

      if (rawPlace.includes('fir') || rawPlace === '1') place = 'First';
      else if (rawPlace.includes('seco') || rawPlace === '2') place = 'Second';
      else if (rawPlace.includes('thi') || rawPlace === '3') place = 'Third';
      else if (rawPlace === 'i') { 
          // In some sheets 'i' means First Place or A Grade
          place = 'First'; 
          grade = grade || 'A';
      } else {
          place = rawPlace.charAt(0).toUpperCase() + rawPlace.slice(1);
      }

      // --- 4. POINT CALCULATION ---
      let placePoints = 0;
      let gradePoints = 0;

      if (place === 'First') placePoints = isGroup ? 10 : 5;
      else if (place === 'Second') placePoints = isGroup ? 6 : 3;
      else if (place === 'Third') placePoints = isGroup ? 2 : 1;

      if (grade === 'A') gradePoints = isGroup ? 10 : 5;
      else if (grade === 'B') gradePoints = isGroup ? 6 : 3;
      else if (grade === 'C') gradePoints = isGroup ? 2 : 1;

      resultsToSave.push({
        eventCode: sheetName,
        eventName,
        category,
        studentName,
        school,
        grade: grade || 'A', // Fallback to A if place exists but grade is blank
        place,
        points: placePoints + gradePoints
      });
    }

    if (resultsToSave.length > 0) {
      await Result.deleteMany({ eventName, category }); 
      await Result.insertMany(resultsToSave);
      totalProcessed += resultsToSave.length;
      eventsProcessed.push(eventName);
    }
  }

  return { success: true, count: totalProcessed, events: eventsProcessed };
}