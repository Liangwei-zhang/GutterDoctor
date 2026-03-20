const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE_DIR = '/home/nico/.openclaw/workspace-enya/GutterDoctor/heic_files';

async function convertHeic(inputPath) {
  const dir = path.dirname(inputPath);
  const basename = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(dir, basename + '_converted.jpg');
  
  try {
    // Try with sharp - might work if libvips was built with HEIC support
    await sharp(inputPath)
      .jpeg({ quality: 90 })
      .toFile(outputPath);
    
    console.log(`✓ ${basename}: converted`);
    
    // Remove original
    fs.unlinkSync(inputPath);
  } catch (err) {
    console.log(`✗ ${basename}: ${err.message}`);
  }
}

async function main() {
  const files = fs.readdirSync(BASE_DIR);
  
  for (const file of files) {
    if (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.heic')) {
      await convertHeic(path.join(BASE_DIR, file));
    }
  }
}

main();
