const fs = require('fs');
let code = fs.readFileSync('src/components/EspaceClient.tsx', 'utf-8');

code = code.replace(
  'text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-3 mb-2.5',
  'text-xs font-bold text-slate-400 uppercase tracking-widest block px-3 mb-2.5'
);

code = code.replace(
  'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all',
  'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all'
);

code = code.replace(
  /text-\[9px\]/g,
  'text-[11px]'
);

code = code.replace(
  'text-[10px] text-slate-400 font-semibold leading-relaxed',
  'text-xs text-slate-400 font-semibold leading-relaxed'
);

code = code.replace(
  'text-[15px] font-bold text-slate-900',
  'text-base font-bold text-slate-900'
);

code = code.replace(
  /text-\[10px\] (bg-[a-z]+-100)/g,
  'text-[11px] $1'
);

// Espace Client title was text-xl, let's make it text-2xl
code = code.replace(
  'text-xl font-extrabold tracking-tight text-slate-900',
  'text-2xl font-extrabold tracking-tight text-slate-900'
);

fs.writeFileSync('src/components/EspaceClient.tsx', code);
console.log('patched espace fonts');
