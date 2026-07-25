const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  `import { EspaceClient } from "./components/EspaceClient";`,
  `import { EspaceClient } from "./components/EspaceClient";\nimport { ClientLogin } from "./components/ClientLogin";`
);

code = code.replace(
  `	if (currentView === 'espace-client') {\n		return <EspaceClient onBack={() => setCurrentView('landing')} data={clientData} />;\n	}`,
  `	if (currentView === 'client-login') {\n		return (\n			<ClientLogin\n				onBack={() => setCurrentView('landing')}\n				onSubmit={() => setCurrentView('espace-client')}\n			/>\n		);\n	}\n\n	if (currentView === 'espace-client') {\n		return <EspaceClient onBack={() => setCurrentView('landing')} data={clientData} />;\n	}`
);

code = code.replace(
  `onClick={() => setCurrentView('espace-client')}`,
  `onClick={() => setCurrentView('client-login')}`
);
code = code.replace(
  `setCurrentView('espace-client');`,
  `setCurrentView('client-login');`
);

fs.writeFileSync('src/App.tsx', code);
console.log('patched');
