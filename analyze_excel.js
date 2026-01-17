const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filesDir = path.join(process.cwd(), 'files');
console.log('Files directory:', filesDir);

if (fs.existsSync(filesDir)) {
  const files = fs.readdirSync(filesDir).filter(f => f.endsWith('.xlsx'));
  console.log('Files found:', files);

  files.forEach(file => {
    console.log(`\n--- Analyzing: ${file} ---`);
    try {
      const workbook = XLSX.readFile(path.join(filesDir, file));
      const sheetName = workbook.SheetNames[0];
      console.log(`Sheet Name: ${sheetName}`);
      const worksheet = workbook.Sheets[sheetName];
      // Get first 10 rows to see structure
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 0, defval: '' });
      
      if (json.length > 0) {
        // Print first 5 rows to understand if there are multi-row headers
        for(let i=0; i<Math.min(5, json.length); i++) {
             console.log(`Row ${i+1}:`, JSON.stringify(json[i]));
        }
      } else {
        console.log('Empty sheet');
      }
    } catch (e) {
      console.log('Error reading file:', e.message);
    }
  });
} else {
  console.log('files directory not found');
}
