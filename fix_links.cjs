// Script to fix all remaining broken links
// Run with: node fix_links.cjs from the project root

const fs = require('fs');
const path = require('path');

const fixes = [
  // ===== COMPONENTS =====
  {
    file: 'client/src/components/HeroSection.jsx',
    importLine: "import { useNavigate } from 'react-router-dom';",
    importReplacement: "import { useNavigate } from 'react-router-dom';\nimport useLangNavigate from '../hooks/useLangNavigate';",
    hookLine: "  const navigate = useNavigate();",
    hookReplacement: "  const navigate = useNavigate();\n  const { langNavigate } = useLangNavigate();",
    replacements: [
      { from: "navigate('/catalogue')", to: "langNavigate('/catalogue')" }
    ]
  },
  {
    file: 'client/src/components/VehicleCard.jsx',
    importLine: "import { Link",
    hookLine: null,
    replacements: [
      { from: 'to="/connexion"', to: 'to={langPath(\'/connexion\')}' }
    ],
    addImport: "import useLangNavigate from '../hooks/useLangNavigate';",
    addHook: "  const { langPath } = useLangNavigate();",
    hookAnchor: "const VehicleCard"
  },
  {
    file: 'client/src/pages/Home.jsx',
    importLine: null,
    hookLine: "  const { langPath } = useLangNavigate();",
    hookReplacement: "  const { langPath, langNavigate } = useLangNavigate();",
    replacements: [
      { from: "navigate('/catalogue')", to: "langNavigate('/catalogue')" }
    ]
  },
  {
    file: 'client/src/pages/Checkout.jsx',
    addImport: "import useLangNavigate from '../hooks/useLangNavigate';",
    addHook: "  const { langPath } = useLangNavigate();",
    hookAnchor: "const Checkout",
    replacements: [
      { from: 'to="/panier"', to: "to={langPath('/panier')}" }
    ]
  },
  {
    file: 'client/src/pages/VehicleDetails.jsx',
    addImport: "import useLangNavigate from '../hooks/useLangNavigate';",
    addHook: "  const { langPath } = useLangNavigate();",
    hookAnchor: "const VehicleDetails",
    replacements: [
      { from: 'to="/catalogue"', to: "to={langPath('/catalogue')}", all: true },
      { from: 'to="/connexion"', to: "to={langPath('/connexion')}", all: true }
    ]
  },
  {
    file: 'client/src/pages/Login.jsx',
    addImport: "import useLangNavigate from '../hooks/useLangNavigate';",
    addHook: "  const { langNavigate } = useLangNavigate();",
    hookAnchor: "const Login",
    replacements: [
      { from: "navigate('/dashboard')", to: "langNavigate('/dashboard')" }
    ]
  },
  {
    file: 'client/src/pages/Register.jsx',
    addImport: "import useLangNavigate from '../hooks/useLangNavigate';",
    addHook: "  const { langNavigate } = useLangNavigate();",
    hookAnchor: "const Register",
    replacements: [
      { from: "navigate('/dashboard')", to: "langNavigate('/dashboard')" }
    ]
  },
  {
    file: 'client/src/pages/PublicTracking.jsx',
    addImport: "import useLangNavigate from '../hooks/useLangNavigate';",
    addHook: "  const { langPath } = useLangNavigate();",
    hookAnchor: "const PublicTracking",
    replacements: [
      { from: 'to="/contact"', to: "to={langPath('/contact')}" }
    ]
  },
  {
    file: 'client/src/pages/Dashboard.jsx',
    hookLine: "  const { lang } = useLangNavigate();",
    hookReplacement: "  const { lang, langPath, langNavigate } = useLangNavigate();",
    replacements: [
      { from: "navigate('/connexion')", to: "langNavigate('/connexion')" },
      { from: 'to="/dashboard/favorites"', to: "to={langPath('/dashboard/favorites')}" },
      { from: 'to="/dashboard/orders"', to: "to={langPath('/dashboard/orders')}" }
    ]
  },
  // ===== DASHBOARD PAGES =====
  {
    file: 'client/src/pages/dashboard/Billing.jsx',
    addImport: "import useLangNavigate from '../../hooks/useLangNavigate';",
    addHook: "  const { langNavigate } = useLangNavigate();",
    hookAnchor: "const Billing",
    replacements: [
      { from: "navigate('/connexion')", to: "langNavigate('/connexion')" }
    ]
  },
  {
    file: 'client/src/pages/dashboard/History.jsx',
    addImport: "import useLangNavigate from '../../hooks/useLangNavigate';",
    addHook: "  const { langNavigate } = useLangNavigate();",
    hookAnchor: "const History",
    replacements: [
      { from: "navigate('/connexion')", to: "langNavigate('/connexion')" }
    ]
  },
  {
    file: 'client/src/pages/dashboard/Orders.jsx',
    addImport: "import useLangNavigate from '../../hooks/useLangNavigate';",
    addHook: "  const { langNavigate } = useLangNavigate();",
    hookAnchor: "const Orders",
    replacements: [
      { from: "navigate('/connexion')", to: "langNavigate('/connexion')" }
    ]
  },
  {
    file: 'client/src/pages/dashboard/Profile.jsx',
    addImport: "import useLangNavigate from '../../hooks/useLangNavigate';",
    addHook: "  const { langNavigate } = useLangNavigate();",
    hookAnchor: "const Profile",
    replacements: [
      { from: "navigate('/connexion')", to: "langNavigate('/connexion')" }
    ]
  },
  {
    file: 'client/src/pages/dashboard/Payment.jsx',
    addImport: "import useLangNavigate from '../../hooks/useLangNavigate';",
    addHook: "  const { langNavigate } = useLangNavigate();",
    hookAnchor: "const Payment",
    replacements: [
      { from: "navigate('/dashboard')", to: "langNavigate('/dashboard')" },
      { from: "navigate('/dashboard/billing')", to: "langNavigate('/dashboard/billing')" }
    ]
  },
  {
    file: 'client/src/pages/dashboard/OrderDetails.jsx',
    addImport: "import useLangNavigate from '../../hooks/useLangNavigate';",
    addHook: "  const { langPath, langNavigate } = useLangNavigate();",
    hookAnchor: "const OrderDetails",
    replacements: [
      { from: "navigate('/dashboard')", to: "langNavigate('/dashboard')" },
      { from: 'to="/dashboard/orders"', to: "to={langPath('/dashboard/orders')}", all: true }
    ]
  },
  {
    file: 'client/src/pages/dashboard/OrderTracking.jsx',
    addImport: "import useLangNavigate from '../../hooks/useLangNavigate';",
    addHook: "  const { langPath } = useLangNavigate();",
    hookAnchor: "const OrderTracking",
    replacements: [
      { from: 'to="/dashboard/orders"', to: "to={langPath('/dashboard/orders')}", all: true },
      { from: 'to="/contact"', to: "to={langPath('/contact')}" }
    ]
  },
  {
    file: 'client/src/pages/dashboard/TrackingList.jsx',
    addImport: "import useLangNavigate from '../../hooks/useLangNavigate';",
    addHook: "  const { langPath } = useLangNavigate();",
    hookAnchor: "const TrackingList",
    replacements: [
      { from: 'to="/catalogue"', to: "to={langPath('/catalogue')}" }
    ]
  },
  {
    file: 'client/src/components/dashboard/DashboardHeader.jsx',
    addImport: "import useLangNavigate from '../../hooks/useLangNavigate';",
    addHook: "  const { langPath } = useLangNavigate();",
    hookAnchor: "const DashboardHeader",
    replacements: [
      { from: 'to="/dashboard/profile"', to: "to={langPath('/dashboard/profile')}" }
    ]
  }
];

let totalFixed = 0;

for (const fix of fixes) {
  const filePath = path.join(__dirname, fix.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Not found: ${fix.file}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Add import if not present
  if (fix.addImport && !content.includes('useLangNavigate')) {
    // Find last import line and insert after it
    const lastImportIdx = content.lastIndexOf("\nimport ");
    const endOfLastImport = content.indexOf('\n', lastImportIdx + 1);
    content = content.slice(0, endOfLastImport) + '\n' + fix.addImport + content.slice(endOfLastImport);
  }

  // Replace existing hook line
  if (fix.hookLine && fix.hookReplacement && content.includes(fix.hookLine)) {
    content = content.replace(fix.hookLine, fix.hookReplacement);
  }

  // Add hook inside component if needed
  if (fix.addHook && fix.hookAnchor && !content.includes(fix.addHook.trim())) {
    const anchorIdx = content.indexOf(fix.hookAnchor);
    if (anchorIdx !== -1) {
      // Find the opening { of the component
      const braceIdx = content.indexOf('{', anchorIdx);
      const lineEnd = content.indexOf('\n', braceIdx);
      // Find the first line after opening brace
      const nextLine = content.indexOf('\n', lineEnd + 1);
      content = content.slice(0, nextLine) + '\n' + fix.addHook + content.slice(nextLine);
    }
  }

  // Apply replacements
  if (fix.replacements) {
    for (const r of fix.replacements) {
      if (r.all) {
        content = content.split(r.from).join(r.to);
      } else {
        content = content.replace(r.from, r.to);
      }
    }
  }

  // Also replace import if specified
  if (fix.importLine && fix.importReplacement) {
    content = content.replace(fix.importLine, fix.importReplacement);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${fix.file}`);
    totalFixed++;
  } else {
    console.log(`ℹ️  No changes: ${fix.file}`);
  }
}

console.log(`\n🎉 Done! Fixed ${totalFixed} files.`);
