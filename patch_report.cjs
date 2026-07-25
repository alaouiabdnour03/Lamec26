const fs = require('fs');
let code = fs.readFileSync('src/ReportGenerator.tsx', 'utf-8');

const oldCheck = `      if (!Array.isArray(content.observe) || !Array.isArray(content.processes)) {
        throw new Error('Structure de contenu Gemini invalide (observe/processes manquants).');
      }`;

const newCheck = `      if (!Array.isArray(content.observe) || !Array.isArray(content.processes)) {
        throw new Error('Structure de contenu Gemini invalide (observe/processes manquants).');
      }

      // Sanitize content.observe to ensure it only contains valid integers (1-5)
      // This prevents the Python backend from crashing with "invalid literal for int() with base 10: ''"
      content.observe = content.observe.map(val => {
        let num = parseInt(val, 10);
        if (isNaN(num)) num = 3;
        if (num < 1) num = 1;
        if (num > 5) num = 5;
        return num;
      });
      
      // Ensure we have exactly 7 integers
      while (content.observe.length < 7) {
        content.observe.push(3);
      }
      if (content.observe.length > 7) {
        content.observe = content.observe.slice(0, 7);
      }`;

code = code.replace(oldCheck, newCheck);
fs.writeFileSync('src/ReportGenerator.tsx', code);
console.log('patched report.tsx');
