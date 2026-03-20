const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const BASE_DIR = '/home/nico/.openclaw/workspace-enya/GutterDoctor';

// Files that need conversion (based on error messages)
const NEED_CONVERSION = [
  { folder: '1', file: 'Gutter after.jpg' },
  { folder: '2', file: 'siding after_1.jpg' },
  { folder: '2', file: 'siding after_2.jpg' },
  { folder: '3', file: 'Siding after_1.jpg' },
  { folder: '3', file: 'Siding after_2.jpg' },
  { folder: '3', file: 'Siding b4_1.jpg' },
  { folder: '3', file: 'gutter after_1.jpg' },
  { folder: '3', file: 'gutter after_2.jpg' },
  { folder: '3', file: 'gutter b4_1.jpg' },
  { folder: '3', file: 'gutter b4_2.jpg' },
  { folder: '3', file: 'siding b4_2.jpg' },
  { folder: '4', file: 'gutter after_1.jpg' },
  { folder: '4', file: 'gutter after_2.jpg' },
  { folder: '4', file: 'roof after.jpg' },
  { folder: '4', file: 'siding after_1.jpg' },
  { folder: '4', file: 'siding after_2.jpg' },
];

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function convertWithBrowser() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Go to converter
    await page.goto('https://heic.online/', { waitUntil: 'networkidle0', timeout: 30000 });
    
    for (const item of NEED_CONVERSION.slice(0, 3)) { // Try first 3
      const filePath = path.join(BASE_DIR, item.folder, item.file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        continue;
      }
      
      console.log(`Converting: ${item.file}`);
      
      // Upload file
      const fileInput = await page.$('input[type="file"]');
      await fileInput.setInputFiles(filePath);
      
      // Wait for upload and conversion
      await page.waitForTimeout(5000);
      
      // Try to find download button
      try {
        const downloadBtn = await page.waitForSelector('a[download], a.download-button', { timeout: 10000 });
        const downloadUrl = await downloadBtn.getAttribute('href');
        
        if (downloadUrl && downloadUrl.startsWith('http')) {
          // Download converted file
          const outputPath = filePath.replace('.jpg', '_converted.jpg');
          await downloadFile(downloadUrl, outputPath);
          console.log(`✓ Saved: ${path.basename(outputPath)}`);
        }
      } catch (e) {
        console.log(`✗ Could not find download for ${item.file}`);
      }
      
      // Go back or refresh for next file
      await page.goto('https://heic.online/', { waitUntil: 'networkidle0' });
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

// Try a simpler API-based approach
async function convertWithAPI() {
  console.log('Trying CloudConvert API...');
  
  // Try using a free HEIC converter API
  const files = NEED_CONVERSION.slice(0, 5);
  
  for (const item of files) {
    const filePath = path.join(BASE_DIR, item.folder, item.file);
    console.log(`Would convert: ${filePath}`);
  }
}

// Try using local conversion with ImageMagick if available
async function convertWithImageMagick() {
  console.log('Trying ImageMagick...');
  
  for (const item of NEED_CONVERSION.slice(0, 5)) {
    const filePath = path.join(BASE_DIR, item.folder, item.file);
    const outputPath = filePath.replace('.jpg', '_im.jpg');
    
    try {
      const { execSync } = require('child_process');
      execSync(`convert "${filePath}" "${outputPath}"`, { stdio: 'ignore' });
      console.log(`✓ Converted: ${item.file}`);
    } catch (e) {
      console.log(`✗ Failed: ${item.file} - ${e.message}`);
    }
  }
}

// Main
console.log('HEIC Conversion Tool');
console.log('===================');

// First try browser automation
convertWithBrowser().catch(console.error);
