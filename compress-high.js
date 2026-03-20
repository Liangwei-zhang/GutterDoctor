const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const folder = '1';
const folderPath = path.join(__dirname, folder);

async function processFile(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  const name = path.basename(inputPath, ext);
  
  if (!/\.(jpg|jpeg|png)$/i.test(ext)) return;
  
  try {
    const tempPath = path.join(folderPath, `${name}_temp.jpg`);
    
    await sharp(inputPath)
      .jpeg({ quality: 50, progressive: true })
      .toFile(tempPath);
    
    const origSize = fs.statSync(inputPath).size;
    const newSize = fs.statSync(tempPath).size;
    const saved = ((origSize - newSize) / origSize * 100).toFixed(1);
    
    fs.unlinkSync(inputPath);
    fs.renameSync(tempPath, inputPath);
    
    console.log(`  ✓ ${path.basename(inputPath)}: ${(origSize/1024).toFixed(1)}KB → ${(newSize/1024).toFixed(1)}KB (saved ${saved}%)`);
  } catch (err) {
    console.error(`  ✗ ${path.basename(inputPath)}: ${err.message}`);
  }
}

async function main() {
  const files = fs.readdirSync(folderPath).filter(f => 
    /\.(jpg|jpeg|png)$/i.test(f)
  );

  console.log(`📁 Folder ${folder}: ${files.length} images (quality=50)`);

  for (const file of files) {
    await processFile(path.join(folderPath, file));
  }
  console.log('\n✅ Done!');
}

main();
