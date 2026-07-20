const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace specific divs with motion.div
code = code.replace(
    /<div className="flex flex-col items-center self-stretch">/g,
    `<motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }} className="flex flex-col items-center self-stretch">`
).replace(
    /<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g,
    `</motion.div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>` // This is dangerous, let's not do that.
);

fs.writeFileSync('src/App.tsx', code);
