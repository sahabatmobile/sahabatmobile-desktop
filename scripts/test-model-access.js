const fs = require('fs');
const vm = require('vm');
(async () => {
  const src = fs.readFileSync('main.js', 'utf8');
  const start = src.indexOf('// ---------- Auto-detection paket API key');
  const end = src.indexOf('function blockedModelIds');
  if (start < 0 || end < 0) {
    console.log('penanda section tidak ditemukan di main.js — test dilewati.');
    return;
  }
  const snippet = src.slice(start, end);
  const ctx = { readSettings: () => ({}), console };
  vm.createContext(ctx);
  vm.runInContext(snippet, ctx);

  console.log('packageFromKey:');
  console.log('  sk-hemat-..   :', ctx.packageFromKey('sk-hemat-abc'));
  console.log('  sk-coding-..  :', ctx.packageFromKey('sk-coding-abc'));
  console.log('  sk-minimax-.. :', ctx.packageFromKey('sk-minimax-abc'));
  console.log('  sk-pro-..     :', ctx.packageFromKey('sk-pro-abc'));
  console.log('  PAYG          :', ctx.packageFromKey('sk-sm-abc'));

  console.log('packageFromText:');
  console.log('  "paket hemat" :', ctx.packageFromText('Paket Hemat'));
  console.log('  "paket pro"   :', ctx.packageFromText('Paket Pro'));
  console.log('  "coding"      :', ctx.packageFromText('Paket Coding'));
})();
