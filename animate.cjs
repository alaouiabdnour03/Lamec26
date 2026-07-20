const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add useEffect for IntersectionObserver
code = code.replace(
    /useEffect\(\(\) => \{/,
    `useEffect(() => {
\t\tconst observer = new IntersectionObserver((entries) => {
\t\t\tentries.forEach(entry => {
\t\t\t\tif (entry.isIntersecting) {
\t\t\t\t\tentry.target.style.opacity = '1';
\t\t\t\t\tentry.target.style.transform = 'translateY(0)';
\t\t\t\t}
\t\t\t});
\t\t}, { threshold: 0.1 });

\t\tsetTimeout(() => {
\t\t\tdocument.querySelectorAll('.scroll-animate').forEach(el => {
\t\t\t\tobserver.observe(el);
\t\t\t});
\t\t}, 100);
`
);

// Add cleanup
code = code.replace(
    /return \(\) => window\.removeEventListener\('resize', handleResize\);/,
    `return () => {
\t\t\twindow.removeEventListener('resize', handleResize);
\t\t\tobserver.disconnect();
\t\t};`
);

// 2. Add .scroll-animate class to interesting sections
// The design has many `<div className="flex flex-col items-center pt-...">` and `<div className="flex flex-col items-start pr-...">`
// Let's replace some classes to add scroll-animate
code = code.replace(/className="text-\[#1B2A4A\] text-\[70px\]/g, 'className="scroll-animate text-[#1B2A4A] text-[70px]');
code = code.replace(/className="text-\[#1B2A4A\] text-\[56px\]/g, 'className="scroll-animate text-[#1B2A4A] text-[56px]');
code = code.replace(/className="text-white text-\[56px\]/g, 'className="scroll-animate text-white text-[56px]');
code = code.replace(/className="text-\[#1B2A4A\] text-\[48px\]/g, 'className="scroll-animate text-[#1B2A4A] text-[48px]');
code = code.replace(/className="text-\[#1B2A4A\] text-base/g, 'className="scroll-animate text-[#1B2A4A] text-base');
code = code.replace(/className="flex flex-col items-center bg-white rounded-3xl/g, 'className="scroll-animate flex flex-col items-center bg-white rounded-3xl');
code = code.replace(/className="flex flex-col items-start bg-white rounded-3xl/g, 'className="scroll-animate flex flex-col items-start bg-white rounded-3xl');
code = code.replace(/className="bg-\[#1B2A4A\] h-\[427px\]/g, 'className="scroll-animate bg-[#1B2A4A] h-[427px]');


fs.writeFileSync('src/App.tsx', code);

// 3. Add CSS for scroll-animate
let css = fs.readFileSync('src/index.css', 'utf8');
if (!css.includes('.scroll-animate')) {
    css += `\n.scroll-animate {\n  opacity: 0;\n  transform: translateY(30px);\n  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);\n}\n`;
    fs.writeFileSync('src/index.css', css);
}

