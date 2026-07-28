const fs = require('fs');
const path = require('path');
const dir = process.cwd();
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
files.forEach(f => {
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/className="border-2 border-black dark:border-white p-8 text-center bg-\S+ dark:bg-\S+( text-black dark:text-white)?"/g, 'className="neo-card text-center"');
  c = c.replace(/className="border-2 border-black dark:border-white p-6 bg-\S+ dark:bg-[^\s"]+ (flex [^"]*)"/g, 'className="neo-card $1"');
  c = c.replace(/className="border-2 border-black dark:border-white p-6 bg-\S+ dark:bg-[^\s"]+"/g, 'className="neo-card"');
  c = c.replace(/className="border-2 border-black dark:border-white p-6 md:col-span-2"/g, 'className="neo-card md:col-span-2"');
  c = c.replace(/className="border-2 border-black dark:border-white p-4 md:p-8 bg-white dark:bg-black"/g, 'className="neo-card !p-4 md:!p-8"');
  c = c.replace(/className="border-2 border-black dark:border-white bg-white dark:bg-black p-6"/g, 'className="neo-card"');
  c = c.replace(/className="border-2 border-black dark:border-white p-6 flex flex-col justify-between"/g, 'className="neo-card flex flex-col justify-between"');
  c = c.replace(/className="border-2 border-black dark:border-white p-6"/g, 'className="neo-card"');
  
  // Custom for specific files that still use borders
  c = c.replace(/className="border-2 border-black dark:border-white"/g, 'className="neo-card !p-0"');
  fs.writeFileSync(p, c);
});
console.log('Fixed classes in ', files.length, ' files');
