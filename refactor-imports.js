const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('./features', (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  if (filePath.endsWith('index.ts')) return; // skip index files

  let content = fs.readFileSync(filePath, 'utf8');
  
  const parts = filePath.split(path.sep);
  const featureIndex = parts.indexOf('features');
  if (featureIndex === -1 || parts.length < featureIndex + 2) return;
  const featureName = parts[featureIndex + 1];

  const newContent = content.replace(/from\s+["']\.\.\/types["']/g, `from "@/features/${featureName}"`)
                            .replace(/from\s+["']\.\.\/services\/.*?\.client["']/g, `from "@/features/${featureName}"`)
                            .replace(/from\s+["']\.\/types["']/g, `from "@/features/${featureName}"`)
                            .replace(/from\s+["']\.\/services\/.*?\.client["']/g, `from "@/features/${featureName}"`);
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated ${filePath}`);
  }
});
