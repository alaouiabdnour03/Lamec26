const fs = require('fs');
let code = fs.readFileSync('src/components/EspaceClient.tsx', 'utf-8');

// Task 1: ArrowLeft and text
if (!code.includes('ArrowLeft')) {
  code = code.replace('import { \n  Building2,', 'import { \n  Building2,\n  ArrowLeft,');
}
code = code.replace(/← Retour aux dossiers/g, '<ArrowLeft className="w-4 h-4" /> Retour');

// Task 3: Responsiveness in EspaceClient
code = code.replace(
  '      <header className="w-full bg-[#F4F6F8] px-8 py-5 flex items-center justify-between">',
  '      <header className="w-full bg-[#F4F6F8] px-4 md:px-8 py-5 flex items-center justify-between">'
);

code = code.replace(
  '          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Espace Client Partenaire</h1>',
  '          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 line-clamp-1">Espace Client Partenaire</h1>'
);

code = code.replace(
  '      <div className="flex flex-1 px-8 pb-10 gap-8 max-w-[1600px] mx-auto w-full">',
  '      <div className="flex flex-col xl:flex-row flex-1 px-4 md:px-8 pb-10 gap-6 xl:gap-8 max-w-[1600px] mx-auto w-full">'
);

code = code.replace(
  '        <aside className="w-[300px] flex-shrink-0 flex flex-col gap-6">',
  '        <aside className="w-full xl:w-[300px] flex-shrink-0 flex flex-col gap-4 xl:gap-6">'
);

code = code.replace(
  '          <div className="bg-white rounded-2xl p-3 border border-slate-200/50 shadow-[0_1px_3px_rgba(0,0,0,0.01),0_10px_30px_rgba(0,0,0,0.02)] space-y-1">',
  '          <div className="bg-white rounded-2xl p-3 border border-slate-200/50 shadow-[0_1px_3px_rgba(0,0,0,0.01),0_10px_30px_rgba(0,0,0,0.02)] space-y-1 overflow-hidden">'
);

code = code.replace(
  `            {[
              { id: 'dashboard',     label: 'Tableau de bord',     icon: Home },`,
  `            <div className="flex xl:flex-col overflow-x-auto gap-2 pb-2 xl:pb-0 -mx-1 px-1 custom-scrollbar">
            {[
              { id: 'dashboard',     label: 'Tableau de bord',     icon: Home },`
);

// We need to find the end of the map to close the div
const tabMapEnd = `              );
            })}
          </div>
          <div className="bg-white border border-slate-200/50`;
const tabMapEndNew = `              );
            })}
            </div>
          </div>
          <div className="bg-white border border-slate-200/50`;
code = code.replace(tabMapEnd, tabMapEndNew);

// Adjust button classes in the map
code = code.replace(
  /w-full flex items-center justify-between px-3 py-2\.5 rounded-xl text-sm transition-all border-none/g,
  'min-w-fit xl:w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all border-none gap-4'
);

fs.writeFileSync('src/components/EspaceClient.tsx', code);
console.log('patched layout');
