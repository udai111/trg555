console.log('Node.js is working!');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);
console.log('OS:', process.platform, process.arch);

// Try to test if we can access the file system
try {
  const fs = await import('fs/promises');
  const files = await fs.readdir('.');
  console.log('Files in current directory:', files);
} catch (err) {
  console.error('Error accessing filesystem:', err);
} 