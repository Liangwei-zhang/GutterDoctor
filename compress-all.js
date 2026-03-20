const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const folders = ['1', '2', '3', '4'];

async function processFile(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  const dir = path.dirname(inputPath);
  const name = path.basename(inputPath, ext);
  
  // Skip if not an image we can process
  if (!/\.(jpg|jpeg|png)$/i.test(ext)) return;
  
  // Rename .JPG to .jpg
  if (ext === '.JPG') {
    const newPath = path.join(dir, `${name}.jpg`);
    if (inputPath !== newPath) {
      fs.renameSync(inputPath, newPath);
      inputPath = newPath;
      console.log(`  📝 Renamed: ${name}.JPG → ${name}.jpg`);
    }
  }
  
  try {
    const metadata = await sharp(inputPath).metadata();
    
    // Skip HEIC files (they'll fail)
    if (!metadata.width || !metadata.height) {
      console.log(`  ⏭️  Skipped (not valid JPEG): ${path.basename(inputPath)}`);
      return;
    }
    
    const tempPath = path.join(dir, `${name}_temp.jpg`);
    const finalPath = path.join(dir, `${name}.jpg`);
    
    await sharp(inputPath)
      .jpeg({ quality: 70, progressive: true })
      .toFile(tempPath);
    
    const origSize = fs.statSync(inputPath).size;
    const newSize = fs.statSync(tempPath).size;
    const saved = ((origSize - newSize) / origSize * 100).toFixed(1);
    
    fs.unlinkSync(inputPath);
    fs.renameSync(tempPath, finalPath);
    
    console.log(`  ✓ ${path.basename(finalPath)}: ${(origSize/1024).toFixed(1)}KB → ${(newSize/1024).toFixed(1)}KB (saved ${saved}%)`);
  } catch (err) {
    console.error(`  ✗ ${path.basename(inputPath)}: ${err.message}`);
  }
}

async function processFolder(folder) {
  const folderPath = path.join(__dirname, folder);
  if (!fs.existsSync(folderPath)) return;
  
  const files = fs.readdirSync(folderPath).filter(f => 
    /\.(jpg|jpeg|png|JPG)$/i.test(f) && !f.includes('temp')
  );

  console.log(`\n📁 Folder ${folder}: ${files.length} images`);

  for (const file of files) {
    await processFile(path.join(folderPath, file));
  }
}

async function main() {
  for (const folder of folders) {
    await processFolder(folder);
  }
  console.log('\n✅ Done!');
}

main();
