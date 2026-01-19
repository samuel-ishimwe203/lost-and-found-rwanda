#!/usr/bin/env node
/**
 * Automatic Icon Replacer Script
 * 
 * This script automatically replaces ALL SVG icons with lucide-react components
 * and adds the necessary imports.
 * 
 * Usage: node replace-icons-auto.js
 * 
 * ⚠️ BACKUP YOUR CODE BEFORE RUNNING! This modifies files directly.
 */

const fs = require('fs');
const path = require('path');

// Icon replacements with their patterns
const iconReplacements = [
  {
    // Folder icon
    pattern: /<svg\s+className="w-3 h-3"\s+fill="currentColor"\s+viewBox="0 0 20 20">\s*<path\s+d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"\s*\/>\s*<\/svg>/g,
    replacement: '<Folder className="w-3 h-3" />',
    import: 'Folder'
  },
  {
    // MapPin icon (w-3 h-3)
    pattern: /<svg\s+className="w-3 h-3"\s+fill="currentColor"\s+viewBox="0 0 20 20">\s*<path\s+fillRule="evenodd"\s+d="M5\.05 4\.05a7 7 0 119\.9 9\.9L10 18\.9l-4\.95-4\.95a7 7 0 010-9\.9zM10 11a2 2 0 100-4 2 2 0 000 4z"\s+clipRule="evenodd"\s*\/>\s*<\/svg>/g,
    replacement: '<MapPin className="w-3 h-3" />',
    import: 'MapPin'
  },
  {
    // MapPin icon (w-4 h-4 mr-1)
    pattern: /<svg\s+className="w-4 h-4 mr-1"\s+fill="currentColor"\s+viewBox="0 0 20 20">\s*<path\s+fillRule="evenodd"\s+d="M5\.05 4\.05a7 7 0 119\.9 9\.9L10 18\.9l-4\.95-4\.95a7 7 0 010-9\.9zM10 11a2 2 0 100-4 2 2 0 000 4z"\s+clipRule="evenodd"\s*\/>\s*<\/svg>/g,
    replacement: '<MapPin className="w-4 h-4 mr-1" />',
    import: 'MapPin'
  },
  {
    // User icon (w-3 h-3)
    pattern: /<svg\s+className="w-3 h-3"\s+fill="currentColor"\s+viewBox="0 0 20 20">\s*<path\s+fillRule="evenodd"\s+d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"\s+clipRule="evenodd"\s*\/>\s*<\/svg>/g,
    replacement: '<User className="w-3 h-3" />',
    import: 'User'
  },
  {
    // User icon (w-5 h-5 mr-2 text-blue-600)
    pattern: /<svg\s+className="w-5 h-5 mr-2 text-blue-600"\s+fill="currentColor"\s+viewBox="0 0 20 20">\s*<path\s+fillRule="evenodd"\s+d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"\s+clipRule="evenodd"\s*\/>\s*<\/svg>/g,
    replacement: '<User className="w-5 h-5 mr-2 text-blue-600" />',
    import: 'User'
  },
  {
    // Phone icon
    pattern: /<svg\s+className="w-3 h-3"\s+fill="currentColor"\s+viewBox="0 0 20 20">\s*<path\s+d="M2 3a1 1 0 011-1h2\.153a1 1 0 01\.986\.836l\.74 4\.435a1 1 0 01-\.54 1\.06l-1\.548\.773a11\.037 11\.037 0 006\.105 6\.105l\.774-1\.548a1 1 0 011\.059-\.54l4\.435\.74a1 1 0 01\.836\.986V17a1 1 0 01-1 1h-2C7\.82 18 2 12\.18 2 5V3z"\s*\/>\s*<\/svg>/g,
    replacement: '<Phone className="w-3 h-3" />',
    import: 'Phone'
  },
  {
    // Bot/AI icon - complex pattern
    pattern: /<svg\s+className="w-3 h-3"\s+fill="currentColor"\s+viewBox="0 0 20 20">\s*<path\s+d="M13 7H7v6h6V7z"\s*\/>\s*<path\s+fillRule="evenodd"\s+d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z"\s+clipRule="evenodd"\s*\/>\s*<\/svg>/g,
    replacement: '<Bot className="w-3 h-3" />',
    import: 'Bot'
  },
  {
    // Image placeholder - blue version (w-12 h-12)
    pattern: /<svg\s+className="w-12 h-12 text-blue-300"\s+fill="none"\s+stroke="currentColor"\s+viewBox="0 0 24 24">\s*<path\s+strokeLinecap="round"\s+strokeLinejoin="round"\s+strokeWidth={2}\s+d="M4 16l4\.586-4\.586a2 2 0 012\.828 0L16 16m-2-2l1\.586-1\.586a2 2 0 012\.828 0L20 14m-6-6h\.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"\s*\/>\s*<\/svg>/g,
    replacement: '<Image className="w-12 h-12 text-blue-300" />',
    import: 'Image'
  },
  {
    // Image placeholder - emerald version (w-12 h-12)
    pattern: /<svg\s+className="w-12 h-12 text-emerald-300"\s+fill="none"\s+stroke="currentColor"\s+viewBox="0 0 24 24">\s*<path\s+strokeLinecap="round"\s+strokeLinejoin="round"\s+strokeWidth={2}\s+d="M4 16l4\.586-4\.586a2 2 0 012\.828 0L16 16m-2-2l1\.586-1\.586a2 2 0 012\.828 0L20 14m-6-6h\.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"\s*\/>\s*<\/svg>/g,
    replacement: '<Image className="w-12 h-12 text-emerald-300" />',
    import: 'Image'
  },
  {
    // Image placeholder - purple version (w-12 h-12)
    pattern: /<svg\s+className="w-12 h-12 text-purple-300"\s+fill="none"\s+stroke="currentColor"\s+viewBox="0 0 24 24">\s*<path\s+strokeLinecap="round"\s+strokeLinejoin="round"\s+strokeWidth={2}\s+d="M4 16l4\.586-4\.586a2 2 0 012\.828 0L16 16m-2-2l1\.586-1\.586a2 2 0 012\.828 0L20 14m-6-6h\.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"\s*\/>\s*<\/svg>/g,
    replacement: '<Image className="w-12 h-12 text-purple-300" />',
    import: 'Image'
  },
  {
    // MessageCircle/Chat icon (w-5 h-5)
    pattern: /<svg\s+className="w-5 h-5"\s+fill="none"\s+stroke="currentColor"\s+viewBox="0 0 24 24">\s*<path\s+strokeLinecap="round"\s+strokeLinejoin="round"\s+strokeWidth={2}\s+d="M8 12h\.01M12 12h\.01M16 12h\.01M21 12c0 4\.418-4\.03 8-9 8a9\.863 9\.863 0 01-4\.255-\.949L3 20l1\.395-3\.72C3\.512 15\.042 3 13\.574 3 12c0-4\.418 4\.03-8 9-8s9 3\.582 9 8z"\s*\/>\s*<\/svg>/g,
    replacement: '<MessageCircle className="w-5 h-5" />',
    import: 'MessageCircle'
  },
  {
    // MessageCircle/Chat icon (w-5 h-5 mr-2)
    pattern: /<svg\s+className="w-5 h-5 mr-2"\s+fill="none"\s+stroke="currentColor"\s+viewBox="0 0 24 24">\s*<path\s+strokeLinecap="round"\s+strokeLinejoin="round"\s+strokeWidth={2}\s+d="M8 12h\.01M12 12h\.01M16 12h\.01M21 12c0 4\.418-4\.03 8-9 8a9\.863 9\.863 0 01-4\.255-\.949L3 20l1\.395-3\.72C3\.512 15\.042 3 13\.574 3 12c0-4\.418 4\.03-8 9-8s9 3\.582 9 8z"\s*\/>\s*<\/svg>/g,
    replacement: '<MessageCircle className="w-5 h-5 mr-2" />',
    import: 'MessageCircle'
  },
  {
    // MessageCircle/Chat icon (w-6 h-6)
    pattern: /<svg\s+className="w-6 h-6"\s+fill="none"\s+stroke="currentColor"\s+viewBox="0 0 24 24">\s*<path\s+strokeLinecap="round"\s+strokeLinejoin="round"\s+strokeWidth={2}\s+d="M8 12h\.01M12 12h\.01M16 12h\.01M21 12c0 4\.418-4\.03 8-9 8a9\.863 9\.863 0 01-4\.255-\.949L3 20l1\.395-3\.72C3\.512 15\.042 3 13\.574 3 12c0-4\.418 4\.03-8 9-8s9 3\.582 9 8z"\s*\/>\s*<\/svg>/g,
    replacement: '<MessageCircle className="w-6 h-6" />',
    import: 'MessageCircle'
  },
  {
    // MessageCircle/Chat icon (mx-auto h-12 w-12)
    pattern: /<svg\s+className="mx-auto h-12 w-12 text-gray-400 mb-4"\s+fill="none"\s+viewBox="0 0 24 24"\s+stroke="currentColor">\s*<path\s+strokeLinecap="round"\s+strokeLinejoin="round"\s+strokeWidth={2}\s+d="M8 12h\.01M12 12h\.01M16 12h\.01M21 12c0 4\.418-4\.03 8-9 8a9\.863 9\.863 0 01-4\.255-\.949L3 20l1\.395-3\.72C3\.512 15\.042 3 13\.574 3 12c0-4\.418 4\.03-8 9-8s9 3\.582 9 8z"\s*\/>\s*<\/svg>/g,
    replacement: '<MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />',
    import: 'MessageCircle'
  },
  {
    // Send icon (h-5 w-5)
    pattern: /<svg\s+className="h-5 w-5"\s+fill="none"\s+viewBox="0 0 24 24"\s+stroke="currentColor">\s*<path\s+strokeLinecap="round"\s+strokeLinejoin="round"\s+strokeWidth={2}\s+d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"\s*\/>\s*<\/svg>/g,
    replacement: '<Send className="h-5 w-5" />',
    import: 'Send'
  },
  {
    // AlertCircle/Error icon (w-6 h-6 text-red-600 mr-3)
    pattern: /<svg\s+className="w-6 h-6 text-red-600 mr-3"\s+fill="none"\s+stroke="currentColor"\s+viewBox="0 0 24 24">\s*<path\s+strokeLinecap="round"\s+strokeLinejoin="round"\s+strokeWidth={2}\s+d="M12 8v4m0 4h\.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"\s*\/>\s*<\/svg>/g,
    replacement: '<AlertCircle className="w-6 h-6 text-red-600 mr-3" />',
    import: 'AlertCircle'
  },
  {
    // FileText icon (w-24 h-24 mx-auto text-red-300) - no matches state
    pattern: /<svg\s+className="w-24 h-24 mx-auto text-red-300"\s+fill="none"\s+stroke="currentColor"\s+viewBox="0 0 24 24">\s*<path\s+strokeLinecap="round"\s+strokeLinejoin="round"\s+strokeWidth={1\.5}\s+d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5\.586a1 1 0 01\.707\.293l5\.414 5\.414a1 1 0 01\.293\.707V19a2 2 0 01-2 2z"\s*\/>\s*<\/svg>/g,
    replacement: '<FileText className="w-24 h-24 mx-auto text-red-300" />',
    import: 'FileText'
  },
  {
    // CheckCircle icon (w-5 h-5 mr-2 text-green-600)
    pattern: /<svg\s+className="w-5 h-5 mr-2 text-green-600"\s+fill="currentColor"\s+viewBox="0 0 20 20">\s*<path\s+fillRule="evenodd"\s+d="M10 18a8 8 0 100-16 8 8 0 000 16zm3\.707-9\.293a1 1 0 00-1\.414-1\.414L9 10\.586 7\.707 9\.293a1 1 0 00-1\.414 1\.414l2 2a1 1 0 001\.414 0l4-4z"\s+clipRule="evenodd"\s*\/>\s*<\/svg>/g,
    replacement: '<CheckCircle className="w-5 h-5 mr-2 text-green-600" />',
    import: 'CheckCircle'
  },
  {
    // CheckCircle2 icon (w-5 h-5 mr-2) - Mark as Received button
    pattern: /<svg\s+className="w-5 h-5 mr-2"\s+fill="none"\s+stroke="currentColor"\s+viewBox="0 0 24 24">\s*<path\s+strokeLinecap="round"\s+strokeLinejoin="round"\s+strokeWidth={2}\s+d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"\s*\/>\s*<\/svg>/g,
    replacement: '<CheckCircle2 className="w-5 h-5 mr-2" />',
    import: 'CheckCircle2'
  },
  {
    // Loader2 icon - spinning loader (animate-spin h-5 w-5)
    pattern: /<svg\s+className="animate-spin h-5 w-5"\s+viewBox="0 0 24 24">\s*<circle\s+className="opacity-25"\s+cx="12"\s+cy="12"\s+r="10"\s+stroke="currentColor"\s+strokeWidth="4"\s+fill="none"\s*\/>\s*<path\s+className="opacity-75"\s+fill="currentColor"\s+d="M4 12a8 8 0 018-8V0C5\.373 0 0 5\.373 0 12h4zm2 5\.291A7\.962 7\.962 0 014 12H0c0 3\.042 1\.135 5\.824 3 7\.938l3-2\.647z"\s*\/>\s*<\/svg>/g,
    replacement: '<Loader2 className="animate-spin h-5 w-5" />',
    import: 'Loader2'
  },
  {
    // Inbox/Mail icon (mx-auto h-16 w-16 text-gray-400 mb-4) - empty messages
    pattern: /<svg\s+className="mx-auto h-16 w-16 text-gray-400 mb-4"\s+fill="none"\s+viewBox="0 0 24 24"\s+stroke="currentColor">\s*<path\s+strokeLinecap="round"\s+strokeLinejoin="round"\s+strokeWidth={2}\s+d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2\.586a1 1 0 00-\.707\.293l-2\.414 2\.414a1 1 0 01-\.707\.293h-3\.172a1 1 0 01-\.707-\.293l-2\.414-2\.414A1 1 0 006\.586 13H4"\s*\/>\s*<\/svg>/g,
    replacement: '<Inbox className="mx-auto h-16 w-16 text-gray-400 mb-4" />',
    import: 'Inbox'
  }
];

// Find JSX files
function findJsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findJsxFiles(filePath, fileList);
    } else if (file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// Add imports to file if not already present
function addImports(content, neededImports) {
  // Check if lucide-react is already imported
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]lucide-react['"];?/;
  const match = content.match(importRegex);
  
  if (match) {
    // Extract existing imports
    const existing = match[1].split(',').map(i => i.trim()).filter(Boolean);
    const combined = [...new Set([...existing, ...neededImports])].sort();
    const newImport = `import { ${combined.join(', ')} } from "lucide-react";`;
    return content.replace(importRegex, newImport);
  } else {
    // Add new import after React import
    const reactImportRegex = /(import\s+React[^\n]+\n)/;
    const reactMatch = content.match(reactImportRegex);
    if (reactMatch) {
      const newImport = `import { ${neededImports.sort().join(', ')} } from "lucide-react";\n`;
      return content.replace(reactImportRegex, reactMatch[0] + newImport);
    } else {
      // Add at the very top
      const newImport = `import { ${neededImports.sort().join(', ')} } from "lucide-react";\n`;
      return newImport + content;
    }
  }
}

// Main function
function main() {
  const srcDir = path.join(__dirname, 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error('❌ Error: src directory not found!');
    return;
  }
  
  console.log('🚀 Starting automatic icon replacement...\n');
  
  const jsxFiles = findJsxFiles(srcDir);
  let filesModified = 0;
  let totalReplacements = 0;
  
  jsxFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileReplacements = 0;
    const neededImports = new Set();
    
    // Apply each replacement
    iconReplacements.forEach(({ pattern, replacement, import: importName }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        neededImports.add(importName);
        fileReplacements += matches.length;
        modified = true;
      }
    });
    
    if (modified) {
      // Add imports
      content = addImports(content, Array.from(neededImports));
      
      // Write back to file
      fs.writeFileSync(filePath, content, 'utf8');
      
      const relativePath = path.relative(srcDir, filePath);
      console.log(`✅ ${relativePath} - ${fileReplacements} replacement(s)`);
      filesModified++;
      totalReplacements += fileReplacements;
    }
  });
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✨ Replacement Complete!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📊 Files modified: ${filesModified}`);
  console.log(`🎯 Total replacements: ${totalReplacements}`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Test your application`);
  console.log(`   2. Check that all icons display correctly`);
  console.log(`   3. Run "node find-svg-icons.js" to find any remaining SVGs\n`);
}

// Run it
main();
