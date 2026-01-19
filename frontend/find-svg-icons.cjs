#!/usr/bin/env node
/**
 * React Icons Migration Helper Script
 * 
 * This script shows you ALL the SVG icons that need to be replaced
 * with lucide-react icons across your entire project.
 * 
 * Usage: node find-svg-icons.js
 */

const fs = require('fs');
const path = require('path');

// Icon mapping from SVG patterns to lucide-react components
const iconMappings = [
  {
    name: 'Folder (Category)',
    pattern: /<svg[^>]*>[\s\S]*?<path d="M2 6a2 2 0 012-2h5l2 2h5[\s\S]*?<\/svg>/g,
    replacement: '<Folder className="w-3 h-3" />',
    import: 'Folder'
  },
  {
    name: 'MapPin (Location)',
    pattern: /<svg[^>]*>[\s\S]*?path fillRule="evenodd" d="M5\.05 4\.05a7 7 0 119\.9[\s\S]*?<\/svg>/g,
    replacement: '<MapPin className="w-3 h-3" />',
    import: 'MapPin'
  },
  {
    name: 'User (Person)',
    pattern: /<svg[^>]*>[\s\S]*?path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0[\s\S]*?<\/svg>/g,
    replacement: '<User className="w-3 h-3" />',
    import: 'User'
  },
  {
    name: 'Phone',
    pattern: /<svg[^>]*>[\s\S]*?<path d="M2 3a1 1 0 011-1h2\.153[\s\S]*?<\/svg>/g,
    replacement: '<Phone className="w-3 h-3" />',
    import: 'Phone'
  },
  {
    name: 'Bot (AI)',
    pattern: /<svg[^>]*>[\s\S]*?<path d="M13 7H7v6h6V7z"[\s\S]*?<\/svg>/g,
    replacement: '<Bot className="w-3 h-3" />',
    import: 'Bot'
  },
  {
    name: 'Image (Placeholder)',
    pattern: /<svg[^>]*>[\s\S]*?strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4\.586-4\.586[\s\S]*?<\/svg>/g,
    replacement: '<Image className="w-12 h-12" />',
    import: 'Image'
  },
  {
    name: 'Mail (Inbox)',
    pattern: /<svg[^>]*>[\s\S]*?d="M20 13V6a2 2 0 00-2-2H6[\s\S]*?<\/svg>/g,
    replacement: '<Mail className="w-12 h-12 text-gray-400" />',
    import: 'Mail'
  },
  {
    name: 'Send',
    pattern: /<svg[^>]*>[\s\S]*?d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"[\s\S]*?<\/svg>/g,
    replacement: '<Send className="h-5 w-5" />',
    import: 'Send'
  },
  {
    name: 'AlertTriangle (Warning)',
    pattern: /<svg[^>]*>[\s\S]*?d="M12 9v2m0 4h\.01m-6\.938 4h13\.856[\s\S]*?<\/svg>/g,
    replacement: '<AlertTriangle className="w-6 h-6 text-red-600" />',
    import: 'AlertTriangle'
  },
  {
    name: 'Search',
    pattern: /<svg[^>]*>[\s\S]*?d="M21 21l-6-6m2-5a7 7 0[\s\S]*?<\/svg>/g,
    replacement: '<Search className="w-6 h-6" />',
    import: 'Search'
  }
];

// Function to recursively find all JSX files
function findJsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findJsxFiles(filePath, fileList);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Main function
function main() {
  const srcDir = path.join(__dirname, 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error('❌ Error: src directory not found!');
    console.log('Make sure you run this script from the frontend folder.');
    return;
  }
  
  console.log('🔍 Searching for SVG icons in JSX files...\n');
  
  const jsxFiles = findJsxFiles(srcDir);
  let totalSvgsFound = 0;
  const fileSummary = [];
  
  jsxFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const svgMatches = content.match(/<svg[^>]*>[\s\S]*?<\/svg>/g);
    
    if (svgMatches && svgMatches.length > 0) {
      const relativePath = path.relative(srcDir, filePath);
      totalSvgsFound += svgMatches.length;
      
      fileSummary.push({
        file: relativePath,
        count: svgMatches.length,
        svgs: svgMatches
      });
    }
  });
  
  if (totalSvgsFound === 0) {
    console.log('✅ No SVG icons found! All icons have been migrated to lucide-react.');
    return;
  }
  
  console.log(`📊 Found ${totalSvgsFound} SVG icons across ${fileSummary.length} files:\n`);
  
  fileSummary.forEach(({ file, count }) => {
    console.log(`   📄 ${file} - ${count} icon(s)`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 DETAILED BREAKDOWN\n' + '='.repeat(60));
  
  fileSummary.forEach(({ file, svgs }) => {
    console.log(`\n\n📄 File: ${file}`);
    console.log('-'.repeat(60));
    
    svgs.forEach((svg, index) => {
      // Identify which icon this is
      let iconType = 'Unknown';
      for (const mapping of iconMappings) {
        if (svg.match(mapping.pattern)) {
          iconType = mapping.name;
          break;
        }
      }
      
      console.log(`\n${index + 1}. Icon Type: ${iconType}`);
      console.log(`   Current: ${svg.substring(0, 100)}${svg.length > 100 ? '...' : ''}`);
      
      for (const mapping of iconMappings) {
        if (svg.match(mapping.pattern)) {
          console.log(`   Replace with: ${mapping.replacement}`);
          console.log(`   Import: ${mapping.import}`);
          break;
        }
      }
    });
  });
  
  console.log('\n\n' + '='.repeat(60));
  console.log('📝 REQUIRED IMPORTS\n' + '='.repeat(60));
  
  const uniqueImports = new Set();
  fileSummary.forEach(({ svgs }) => {
    svgs.forEach(svg => {
      for (const mapping of iconMappings) {
        if (svg.match(mapping.pattern)) {
          uniqueImports.add(mapping.import);
        }
      }
    });
  });
  
  console.log('\nAdd to your import statements:');
  console.log(`import { ${Array.from(uniqueImports).join(', ')} } from "lucide-react";\n`);
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ NEXT STEPS\n' + '='.repeat(60));
  console.log('\n1. Add the imports listed above to each file');
  console.log('2. Replace each SVG with the suggested lucide-react component');
  console.log('3. Test your application to ensure all icons display correctly');
  console.log('4. Run this script again to verify all SVGs have been replaced\n');
}

// Run the script
main();
