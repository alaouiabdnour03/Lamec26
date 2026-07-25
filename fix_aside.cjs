const fs = require('fs');
let lines = fs.readFileSync('src/components/EspaceClient.tsx', 'utf-8').split('\n');

lines.splice(195, 0, '          </div>');

fs.writeFileSync('src/components/EspaceClient.tsx', lines.join('\n'));
console.log('fixed aside via splice');
