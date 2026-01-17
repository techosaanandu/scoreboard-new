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

    const eventRow = rows[2] || [];
    const eventRaw = String(eventRow[0] || "");
    const eventName = eventRaw.replace(/^EVENT\s*:\s*/i, '').trim();
    if (!eventName) continue;

    let category = "General";
    const catLabelIndex = eventRow.findIndex((c) => typeof c === 'string' && c.trim().toLowerCase().includes('category'));
    if (catLabelIndex !== -1 && eventRow.length > catLabelIndex + 1) {
      const catVal = String(eventRow[catLabelIndex + 1]).trim();
      if (catVal.length > 1) category = catVal; 
    }

    // Fixed Header Detection to satisfy prefer-const
    let detectedNameIdx = 2;
    let detectedSchoolIdx = 4;
    let detectedGradeIdx = 5;
    let detectedPlaceIdx = 6;
    let headerRowIndex = 4;

    for (let i = 0; i < Math.min(rows.length, 10); i++) {
      const rowStr = rows[i].map(c => String(c).toLowerCase().trim());
      const nIdx = rowStr.findIndex(c => c.includes('student') || c.includes('name'));
      if (nIdx !== -1) {
        headerRowIndex = i;
        detectedNameIdx = nIdx;
        detectedSchoolIdx = rowStr.findIndex(c => c.includes('school') || c.includes('institution'));
        detectedGradeIdx = rowStr.findIndex(c => c.includes('grade') || c.includes('mark') || c === '1');
        detectedPlaceIdx = rowStr.findIndex(c => c.includes('place') || c.includes('rank') || c.includes('pos'));
        break;
      }
    }

    const colMap = { 
        name: detectedNameIdx, 
        school: detectedSchoolIdx, 
        grade: detectedGradeIdx, 
        place: detectedPlaceIdx 
    };

    const isGroup = GROUP_KEYWORDS.some(k => eventName.toUpperCase().includes(k));
    const resultsToSave = [];

    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 3) continue;

      const studentName = String(row[colMap.name] || '').trim();
      if (!studentName || studentName.toLowerCase().includes('name of')) continue;

      const school = colMap.school !== -1 ? String(row[colMap.school] || '').trim() : '';
      
      const rawGrade = String(row[colMap.grade] || '').trim().toUpperCase();
      let grade = rawGrade === '1' ? 'A' : rawGrade;

      const rawPlace = String(row[colMap.place] || '').trim().toLowerCase().replace(/^-/, '');
      let place = "";

      if (rawPlace.includes('fir') || rawPlace === '1') place = 'First';
      else if (rawPlace.includes('seco') || rawPlace === '2') place = 'Second';
      else if (rawPlace.includes('thi') || rawPlace === '3') place = 'Third';
      else if (rawPlace === 'i') { 
          place = 'First'; 
          grade = grade || 'A';
      } else {
          place = rawPlace.charAt(0).toUpperCase() + rawPlace.slice(1);
      }

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
        grade: grade || 'A',
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