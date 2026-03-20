const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const folders = ['1', '2', '3', '4'];

async function convertFolder(folder) {
  const folderPath = path.join(__dirname, folder);
  if (!fs.existsSync(folderPath)) return;
  
  const files = fs.readdirSync(folderPath).filter(f => 
    /\.heic$/i.test(f)
  );

  console.log(`\n📁 Folder ${folder}: ${files.length} HEIC files`);

  for (const file of files) {
    const inputPath = path.join(folderPath, file);
    const name = path.basename(file, '.heic');
    const outputPath = path.join(folderPath, `${name}.jpg`);

    try {
      await sharp(inputPath)
        .jpeg({ quality: 70, progressive: true })
        .toFile(outputPath);
      
      const origSize = fs.statSync(inputPath).size;
      const newSize = fs.statSync(outputPath).size;
      const saved = ((origSize - newSize) / origSize * 100).toFixed(1);

      console.log(`  ✓ ${file}: ${(origSize/1024).toFixed(1)}KB → ${(newSize/1024).toFixed(1)}KB (saved ${saved}%)`);
      
      // Delete original HEIC
      fs.unlinkSync(inputPath);
    } catch (err) {
      console.error(`  ✗ ${file}: ${err.message}`);
    }
  }
}

async function main() {
  for (const folder of folders) {
    await convertFolder(folder);
  }
  console.log('\n✅ Done!');
}

main();
