#!/usr/bin/env node
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = 'Pic of website';
const outputDir = path.join(imagesDir, 'compressed');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function compressImages() {
    console.log('🗜️  Compressing images with Sharp...\n');
    
    const files = fs.readdirSync(imagesDir).filter(f => 
        /\.(jpg|jpeg|png)$/i.test(f)
    );
    
    let totalOriginal = 0;
    let totalCompressed = 0;
    
    for (const file of files) {
        const inputPath = path.join(imagesDir, file);
        const outputPath = path.join(outputDir, file);
        const ext = path.extname(file).toLowerCase();
        
        try {
            const originalSize = fs.statSync(inputPath).size;
            
            let pipeline = sharp(inputPath);
            
            if (ext === '.jpg' || ext === '.jpeg') {
                pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
            } else if (ext === '.png') {
                pipeline = pipeline.png({ quality: 80, compressionLevel: 9 });
            }
            
            await pipeline.toFile(outputPath);
            
            const compressedSize = fs.statSync(outputPath).size;
            const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);
            
            totalOriginal += originalSize;
            totalCompressed += compressedSize;
            
            console.log(`✅ ${file}`);
            console.log(`   ${(originalSize/1024).toFixed(1)}KB → ${(compressedSize/1024).toFixed(1)}KB (${savings}% saved)`);
            
        } catch (err) {
            console.log(`⚠️  ${file}: ${err.message}`);
        }
    }
    
    const totalSavings = ((1 - totalCompressed / totalOriginal) * 100).toFixed(1);
    console.log(`\n📊 Total: ${(totalOriginal/1024/1024).toFixed(2)}MB → ${(totalCompressed/1024/1024).toFixed(2)}MB (${totalSavings}% saved)`);
    console.log(`✨ Compressed images saved to: ${outputDir}`);
}

compressImages();
