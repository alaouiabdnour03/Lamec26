const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  `import { ClientLogin } from "./components/ClientLogin";`,
  `import { ClientLogin } from "./components/ClientLogin";\nimport { supabase } from "./lib/supabase";`
);

const oldLogin = `			<ClientLogin
				onBack={() => setCurrentView('landing')}
				onSubmit={() => setCurrentView('espace-client')}
			/>`;

const newLogin = `			<ClientLogin
				onBack={() => setCurrentView('landing')}
				onSubmit={async (creds) => {
					const { data, error } = await supabase
						.from('clients')
						.select('*')
						.eq('ice', creds.ice)
						.eq('access_code', creds.code)
						.single();
					if (error || !data) {
						throw new Error('Identifiants invalides');
					}
					
					// Re-map to what EspaceClient expects
					setClientData({
						companyName: data.company_name,
						ice: data.ice,
						cnssEmployees: data.cnss_employees,
						email: data.email,
						phone: data.phone,
						ca: data.ca,
						sector: data.sector,
						activity: data.activity,
						customActivity: data.custom_activity,
						id: data.id,
						accessCode: data.access_code
					});
					setCurrentView('espace-client');
				}}
			/>`;

code = code.replace(oldLogin, newLogin);
fs.writeFileSync('src/App.tsx', code);
console.log('patched app');
