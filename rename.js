import fs from 'fs';
import path from 'path';

const projectDir = 'C:\\Users\\yohan\\myspace\\lab\\active\\gemcheck';

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
          if (content.includes('@nikelyh/')) {
            content = content.replace(/@gemcheck\//g, '@nikelyh/');
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`Replaced in ${fullPath}`);
          }
        } catch(e) {}
      }
    }
  }
}

replaceInDir(projectDir);
