const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const HEIC_DIR = '/home/nico/.openclaw/workspace-enya/GutterDoctor/heic_files';
const OUTPUT_DIR = '/home/nico/.openclaw/workspace-enya/GutterDoctor/converted';

async function convertHeicToJpg(inputFile, outputFile) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Go to converter website
    await page.goto('https://heic.online/', { waitUntil: 'networkidle0' });
    
    // Upload file using file chooser
    const fileInput = await page.$('input[type="file"]');
    await fileInput.uploadFile(inputFile);
    
    // Wait for upload
    await page.waitForTimeout(2000);
    
    // Click convert button if needed
    const convertBtn = await page.$('button[type="submit"]');
    if (convertBtn) {
      await convertBtn.click();
    }
    
    // Wait for conversion
    await page.waitForTimeout(5000);
    
    // Try to find and click download button
    const downloadBtn = await page.$('a.download');
    if (downloadBtn) {
      const downloadUrl = await downloadBtn.evaluate(el => el.href);
      console.log(`Download URL: ${downloadUrl}`);
    }
    
    console.log(`Processed: ${path.basename(inputFile)}`);
  } catch (err) {
    console.error(`Error processing ${path.basename(inputFile)}: ${err.message}`);
  } finally {
    await browser.close();
  }
}

async function main() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Get all HEIC files
  const files = fs.readdirSync(HEIC_DIR).filter(f => f.toLowerCase().endsWith('.heic') || f.toLowerCase().endsWith('.jpg'));
  
  console.log(`Found ${files.length} files to convert`);
  
  // Convert each file
  for (const file of files.slice(0, 3)) { // Test with first 3
    const inputPath = path.join(HEIC_DIR, file);
    await convertHeicToJpg(inputPath, path.join(OUTPUT_DIR, file.replace(/\.(heic|jpg)$/i, '.jpg')));
  }
}

main().catch(console.error);
