const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
    /import React, \{useState\} from "react";/,
    `import React, { useState, useEffect } from "react";`
);

code = code.replace(
    /export default function App\(\) \{\s*const \[input1, onChangeInput1\] = useState\(''\);\s*return \(\s*<div className="flex flex-col bg-white">/,
    `export default function App() {
\tconst [input1, onChangeInput1] = useState('');
\tconst [scale, setScale] = useState(1);

\tuseEffect(() => {
\t\tconst handleResize = () => {
\t\t\tconst width = window.innerWidth;
\t\t\tif (width < 1920) {
\t\t\t\tsetScale(width / 1920);
\t\t\t} else {
\t\t\t\tsetScale(1);
\t\t\t}
\t\t};
\t\twindow.addEventListener('resize', handleResize);
\t\thandleResize();
\t\treturn () => window.removeEventListener('resize', handleResize);
\t}, []);

\treturn (
\t\t<div className="w-full min-h-screen overflow-x-hidden flex justify-center items-start bg-[#FAFCFA]">
\t\t\t<div style={{ zoom: scale, width: '1920px', flexShrink: 0, transformOrigin: 'top center' }}>
\t\t\t\t<div className="flex flex-col bg-white w-full">`
);

code = code.replace(
    /\)\s*\}\s*$/,
    `\t\t\t</div>\n\t\t</div>\n\t);\n}`
);

fs.writeFileSync('src/App.tsx', code);
