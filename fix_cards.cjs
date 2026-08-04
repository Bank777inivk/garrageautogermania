const fs = require('fs');
const path = require('path');

function fixCards(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Grounded Total Summary Card
    content = content.replace(
        /className="rounded-3xl p-10 text-white shadow-\[0_30px_60px_rgba\(0,0,0,0\.2\)\] overflow-hidden relative group bg-gradient-to-br from-\[\#021024\] via-\[\#052659\] to-\[\#021024\] border border-white\/10"/g,
        'className="rounded-3xl p-10 text-slate-900 overflow-hidden relative group bg-white border border-slate-200 shadow-sm"'
    );
    
    // Assistance Card (Conciergerie)
    content = content.replace(
        /className="rounded-3xl p-8 text-white shadow-\[0_30px_60px_rgba\(0,0,0,0\.2\)\] overflow-hidden relative group bg-gradient-to-br from-\[\#021024\] via-\[\#052659\] to-\[\#021024\] border border-\[\#FCA311\]\/30"/g,
        'className="rounded-3xl p-8 text-slate-900 overflow-hidden relative group bg-white border border-slate-200 shadow-sm"'
    );

    // Inner text and background tweaks for light mode in these specific blocks
    // Instead of doing global replaces, I'll just change the main dark mode classes globally as they shouldn't exist anymore in the light theme dashboard.
    content = content.replace(/text-white/g, 'text-slate-900');
    content = content.replace(/text-slate-400/g, 'text-slate-500');
    content = content.replace(/text-slate-300/g, 'text-slate-600');
    content = content.replace(/bg-white\/5/g, 'bg-slate-50');
    content = content.replace(/border-white\/5/g, 'border-slate-100');
    content = content.replace(/border-white\/10/g, 'border-slate-100');
    content = content.replace(/bg-\[\#5483B3\]\/10/g, 'bg-blue-50');
    content = content.replace(/bg-amber-500\/20/g, 'bg-amber-50');
    content = content.replace(/bg-[#052659]/g, 'bg-blue-600');
    content = content.replace(/bg-\[\#021024\]/g, 'bg-slate-50');
    content = content.replace(/text-emerald-400/g, 'text-emerald-600');

    // Clean up specific glow effects
    content = content.replace(/shadow-\[0_30px_60px_rgba\(0,0,0,0\.2\)\]/g, 'shadow-sm');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Refactored ${filePath}`);
}

fixCards(path.join(__dirname, 'client/src/pages/dashboard/OrderDetails.jsx'));
