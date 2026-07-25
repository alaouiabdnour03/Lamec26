const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf-8');

code = code.replace("@import \"tailwindcss\";\n@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');", "");

code = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');\n@import \"tailwindcss\";\n" + code;

fs.writeFileSync('src/index.css', code);
console.log('fixed css');
