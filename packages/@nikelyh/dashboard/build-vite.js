import { build } from 'vite';

async function runBuild() {
  try {
    await build({
      root: process.cwd(),
    });
    console.log('Build completed');
  } catch (err) {
    console.error('Build failed', err);
  }
}

runBuild();
