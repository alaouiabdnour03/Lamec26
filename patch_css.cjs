const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf-8');

if (!code.includes('Inter')) {
  code = `@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

@theme {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}
` + code.replace('@import "tailwindcss";', '');
  fs.writeFileSync('src/index.css', code);
  console.log('patched css');
} else {
  console.log('css already patched');
}
