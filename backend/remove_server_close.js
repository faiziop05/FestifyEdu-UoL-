const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '__tests__');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.test.js'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the afterAll block
  content = content.replace(/afterAll\(\(done\) => \{\n\s*server\.close\(done\);\n\s*\}\);\n*/g, '');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
}
