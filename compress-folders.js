const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const folders = ['1', '2', '3', '4'];

async function compressFolder(folder) {
  const folderPath = path.join(__dirname, folder);
  if (!fs.existsSync(folderPath)) return;
  
  const files = fs.readdirSync(folderPath).filter(f => 
    /\.(png|jpg|jpeg|webp|heic)$/i.test(f)
  );

  console.log(`\n📁 Folder ${folder}: ${files.length} images`);

  for (const file of files) {
    const inputPath = path.join(folderPath, file);
    const ext = path.extname(file).toLowerCase();
    const name = path.basename(file, ext);

    try {
      let image = sharp(inputPath);
      const metadata = await image.metadata();
      
      let outputPath;
      let outputImage;

      if (ext === '.heic') {
        // Convert HEIC to JPEG
        outputPath = path.join(folderPath, `${name}.jpg`);
        outputImage = image.jpeg({ quality: 70, progressive: true });
      } else if (ext === '.png') {
        outputPath = path.join(folderPath, `${name}_min.png`);
        outputImage = image.png({ quality: 70, compressionLevel: 9 });
      } else if (ext === '.jpg' || ext === '.jpeg') {
        outputPath = path.join(folderPath, `${name}_min.jpg`);
        outputImage = image.jpeg({ quality: 70, progressive: true });
      } else if (ext === '.webp') {
        outputPath = path.join(folderPath, `${name}_min.webp`);
        outputImage = image.webp({ quality: 80 });
      } else {
        continue;
      }

      await outputImage.toFile(outputPath);

      const origSize = fs.statSync(inputPath).size;
      const newSize = fs.statSync(outputPath).size;
      const saved = ((origSize - newSize) / origSize * 100).toFixed(1);

      console.log(`  ✓ ${file}: ${(origSize/1024).toFixed(1)}KB → ${(newSize/1024).toFixed(1)}KB (saved ${saved}%)`);

      // Replace original
      fs.unlinkSync(inputPath);
      fs.renameSync(outputPath, inputPath);
    } catch (err) {
      console.error(`  ✗ ${file}: ${err.message}`);
    }
  }
}

async function main() {
  for (const folder of folders) {
    await compressFolder(folder);
  }
  console.log('\n✅ Done!');
}

main();
