import fs from 'fs';
import path from 'path';

const projectDir = 'C:\\Users\\yohan\\myspace\\lab\\active\\gemcheck';

const replacements = {
  '@nikelyh/gemcheck': '@nikelyh/gemcheck',
  '@nikelyh/gemcheck-domain': '@nikelyh/gemcheck-domain',
  '@nikelyh/gemcheck-application': '@nikelyh/gemcheck-application',
  '@nikelyh/gemcheck-infrastructure': '@nikelyh/gemcheck-infrastructure',
  '@nikelyh/gemcheck-dashboard': '@nikelyh/gemcheck-dashboard'
};

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist', '.changeset'].includes(file)) {
        replaceInDir(fullPath);
      }
    } else {
      if (!fullPath.endsWith('pnpm-lock.yaml') && !fullPath.endsWith('.png') && !fullPath.endsWith('.svg') && !fullPath.endsWith('.woff') && !fullPath.endsWith('.woff2')) {
        try {
          let content = fs.readFileSync(fullPath, 'utf8');
          let modified = false;
          
          for (const [oldName, newName] of Object.entries(replacements)) {
            if (content.includes(oldName)) {
              content = content.split(oldName).join(newName);
              modified = true;
            }
          }

          if (modified) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`Replaced in ${fullPath}`);
          }
        } catch(e) {}
      }
    }
  }
}

replaceInDir(projectDir);
