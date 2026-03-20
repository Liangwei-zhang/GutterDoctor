const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgFolder = 'Pic of website';

async function compressImages() {
  const files = fs.readdirSync(imgFolder).filter(f => 
    /\.(png|jpg|jpeg|webp|gif)$/i.test(f) && !f.includes('min')
  );

  console.log(`Found ${files.length} images to compress`);

  for (const file of files) {
    const inputPath = path.join(imgFolder, file);
    const ext = path.extname(file).toLowerCase();
    const name = path.basename(file, ext);

    try {
      const image = sharp(inputPath);
      const metadata = await image.metadata();
      
      let outputPath;
      let outputImage;

      if (ext === '.png') {
        outputPath = path.join(imgFolder, `${name}_min.png`);
        outputImage = image.png({ quality: 70, compressionLevel: 9 });
      } else if (ext === '.jpg' || ext === '.jpeg') {
        outputPath = path.join(imgFolder, `${name}_min.jpg`);
        outputImage = image.jpeg({ quality: 70, progressive: true });
      } else if (ext === '.webp') {
        outputPath = path.join(imgFolder, `${name}_min.webp`);
        outputImage = image.webp({ quality: 80 });
      } else {
        continue;
      }

      await outputImage.toFile(outputPath);

      const origSize = fs.statSync(inputPath).size;
      const newSize = fs.statSync(outputPath).size;
      const saved = ((origSize - newSize) / origSize * 100).toFixed(1);

      console.log(`✓ ${file}: ${(origSize/1024).toFixed(1)}KB → ${(newSize/1024).toFixed(1)}KB (saved ${saved}%)`);

      // Replace original
      fs.unlinkSync(inputPath);
      fs.renameSync(outputPath, inputPath);
    } catch (err) {
      console.error(`✗ ${file}: ${err.message}`);
    }
  }

  console.log('Done!');
}

compressImages();
