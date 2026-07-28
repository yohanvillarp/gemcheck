import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const root = process.cwd();
const dashboardDir = path.join(root, 'packages', '@nikelyh', 'dashboard');
const cliDir = path.join(root, 'packages', '@nikelyh', 'cli');
const viteBin = path.join(dashboardDir, 'node_modules', 'vite', 'bin', 'vite.js');
const copyUiScript = path.join(cliDir, 'scripts', 'copy-ui.js');

console.log('Cleaning old builds...');
fs.rmSync(path.join(dashboardDir, 'dist'), { recursive: true, force: true });
fs.rmSync(path.join(cliDir, 'dist', 'ui'), { recursive: true, force: true });

console.log('Building dashboard...');
// Use custom build-vite.js to bypass silent failures
execFileSync(process.execPath, ['build-vite.js'], { cwd: dashboardDir, stdio: 'inherit' });

console.log('Copying UI to CLI dist...');
execFileSync(process.execPath, [copyUiScript], { cwd: cliDir, stdio: 'inherit' });

console.log('Done.');
