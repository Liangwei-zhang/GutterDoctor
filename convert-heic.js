const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE_DIR = '/home/nico/.openclaw/workspace-enya/GutterDoctor';

async function convertHeicToJpg(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  if (ext !== '.heic') return;
  
  const dir = path.dirname(inputPath);
  const basename = path.basename(inputPath, ext);
  const outputPath = path.join(dir, basename + '.jpg');
  
  try {
    // Use sharp with heic plugin
    await sharp(inputPath)
      .jpeg({ quality: 90 })
      .toFile(outputPath);
    
    const size = fs.statSync(outputPath).size;
    console.log(`✓ ${basename}.heic → ${basename}.jpg (${(size/1024).toFixed(0)}KB)`);
    
    // Remove original
    fs.unlinkSync(inputPath);
  } catch (err) {
    console.error(`✗ ${basename}.heic: ${err.message}`);
  }
}

async function main() {
  const folders = ['1', '2', '3', '4'];
  
  for (const folder of folders) {
    const folderPath = path.join(BASE_DIR, folder);
    const files = fs.readdirSync(folderPath);
    
    for (const file of files) {
      if (file.toLowerCase().endsWith('.heic')) {
        await convertHeicToJpg(path.join(folderPath, file));
      }
    }
  }
  
  console.log('\nDone!');
}

main();
