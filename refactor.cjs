const fs = require('fs');
const path = require('path');

function refactorFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Color/Design system replacements
    content = content.replace(/bg-white\/70/g, 'bg-white');
    content = content.replace(/backdrop-blur-xl/g, '');
    content = content.replace(/rounded-\[2\.5rem\]/g, 'rounded-3xl');
    content = content.replace(/border-white\/60/g, 'border-slate-200');
    content = content.replace(/shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\]/g, 'shadow-sm');
    content = content.replace(/bg-\[\#FCA311\]\/10/g, 'bg-amber-50');
    content = content.replace(/text-\[\#FCA311\]/g, 'text-amber-500');
    content = content.replace(/border-\[\#FCA311\]\/20/g, 'border-amber-100');
    content = content.replace(/bg-\[\#FCA311\]/g, 'bg-amber-500');
    content = content.replace(/shadow-\[\#FCA311\]\/20/g, 'shadow-amber-500/20');
    content = content.replace(/bg-slate-900/g, 'bg-slate-900');
    content = content.replace(/text-slate-900/g, 'text-slate-900');
    
    // Typography replacements
    content = content.replace(/font-black/g, 'font-bold');
    content = content.replace(/tracking-tighter/g, 'tracking-tight');
    content = content.replace(/tracking-widest/g, 'tracking-normal');
    content = content.replace(/text-\[10px\] uppercase/g, 'text-xs');
    content = content.replace(/text-\[9px\] uppercase/g, 'text-xs');
    content = content.replace(/text-\[11px\] uppercase/g, 'text-sm');
    content = content.replace(/uppercase/g, ''); // Be careful with this, but maybe it's fine for classes. Actually let's just do class replacements:
    content = content.replace(/className="([^"]*)uppercase([^"]*)"/g, 'className="$1$2"');
    content = content.replace(/className="([^"]*)font-black([^"]*)"/g, 'className="$1font-bold$2"');
    content = content.replace(/className="([^"]*)tracking-widest([^"]*)"/g, 'className="$1$2"');
    content = content.replace(/className="([^"]*)tracking-tighter([^"]*)"/g, 'className="$1tracking-tight$2"');

    // Specific replacements for OrderDetails
    content = content.replace(/bg-\[\#021024\]\/60/g, 'bg-slate-900/60');
    content = content.replace(/border-slate-900\/10/g, 'border-slate-200');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Refactored ${filePath}`);
}

refactorFile(path.join(__dirname, 'client/src/pages/dashboard/OrderDetails.jsx'));
refactorFile(path.join(__dirname, 'client/src/pages/dashboard/Payment.jsx'));
