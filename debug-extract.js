// Detailed debugging: find exactly where the lookahead matches
const fs = require('fs');
const cvContent = fs.readFileSync('cv.md', 'utf-8');
const normalized = cvContent.replace(/\r\n/g, '\n');

// Find the "## Work Experience" section manually
const startIdx = normalized.indexOf('## Work Experience');
const afterWorkExp = normalized.substring(startIdx + 19); // +19 to skip "## Work Experience"

console.log('Content after "## Work Experience":');
console.log(JSON.stringify(afterWorkExp.substring(0, 200)));

// Find all positions where "^##" would match (after a newline)
console.log('\n=== Finding positions where ^## matches ===');
const lines = normalized.split('\n');
let currentPos = 0;
let lineNum = 0;

for (const line of lines) {
  if (line.match(/^## /)) {
    console.log(`Line ${lineNum} (pos ${currentPos}): "${line}"`);
  }
  currentPos += line.length + 1;  // +1 for newline
  lineNum++;
}

// Now manually apply the regex with debug output
console.log('\n=== Manual regex matching ===');
const regex = /^## Work Experience\s*$\n([\s\S]*?)(?=^## |$)/im;
const fullText = normalized;
const match = fullText.match(regex);

if (match) {
  console.log('Match found');
  console.log('Full match starts at:', fullText.indexOf(match[0]));
  console.log('Full match length:', match[0].length);
  console.log('Captured group length:', match[1].length);
  
  // Find where the captured group ends in the full text
  const matchStart = fullText.indexOf(match[0]);
  const capStart = matchStart + match[0].length - match[1].length;
  const capEnd = capStart + match[1].length;
  
  console.log('Captured group starts at:', capStart);
  console.log('Captured group ends at:', capEnd);
  console.log('Character at capture end:', JSON.stringify(fullText[capEnd]));
  console.log('Characters around capture end:');
  console.log(JSON.stringify(fullText.substring(capEnd - 10, capEnd + 30)));
}












