const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const folders = ['1', '2', '3', '4'];

async function convertFile(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  const name = path.basename(inputPath, ext);
  const dir = path.dirname(inputPath);
  const tempPath = path.join(dir, `${name}_temp.jpg`);
  const finalPath = path.join(dir, `${name}_converted.jpg`);
  
  try {
    // First try to read metadata to check if it's a valid image
    const metadata = await sharp(inputPath).metadata();
    
    // Convert to JPEG with temp file
    await sharp(inputPath)
      .jpeg({ quality: 70, progressive: true })
      .toFile(tempPath);
    
    const origSize = fs.statSync(inputPath).size;
    const newSize = fs.statSync(tempPath).size;
    const saved = ((origSize - newSize) / origSize * 100).toFixed(1);
    
    // Replace original
    fs.unlinkSync(inputPath);
    fs.renameSync(tempPath, finalPath);
    
    console.log(`  ✓ ${name}${ext}: ${(origSize/1024).toFixed(1)}KB → ${(newSize/1024).toFixed(1)}KB (saved ${saved}%)`);
    return true;
  } catch (err) {
    // Clean up temp file if exists
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    console.error(`  ✗ ${name}${ext}: ${err.message}`);
    return false;
  }
}

async function processFolder(folder) {
  const folderPath = path.join(__dirname, folder);
  if (!fs.existsSync(folderPath)) return;
  
  const files = fs.readdirSync(folderPath).filter(f => 
    /\.(jpg|jpeg|heic|heif|png)$/i.test(f) && !f.includes('workscope') && !f.includes('converted')
  );

  console.log(`\n📁 Folder ${folder}: ${files.length} images`);

  for (const file of files) {
    const inputPath = path.join(folderPath, file);
    await convertFile(inputPath);
  }
}

async function main() {
  for (const folder of folders) {
    await processFolder(folder);
  }
  console.log('\n✅ Done!');
}

main();
