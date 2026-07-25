const fs = require('fs');
let code = fs.readFileSync('src/lib/supabase.ts', 'utf-8');

code = code.replace(
  `if (!supabaseUrl.startsWith('http')) { supabaseUrl = 'https://' + supabaseUrl; }`,
  `if (!supabaseUrl.startsWith('http')) { supabaseUrl = 'https://' + supabaseUrl; }\n// Remove /rest/v1 or trailing slash if present\nsupabaseUrl = supabaseUrl.replace(/\\/rest\\/v1\\/?$/, '').replace(/\\/$/, '');`
);

fs.writeFileSync('src/lib/supabase.ts', code);
console.log('patched supabase.ts');
