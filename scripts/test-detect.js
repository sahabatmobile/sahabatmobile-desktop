// Tes logika auto-detection paket (tanpa electron, dengan mock fetch).
const fs = require('fs');
const vm = require('vm');

const src = fs.readFileSync('main.js', 'utf8');
const start = src.indexOf('// ---------- Auto-detection paket API key');
const end = src.indexOf('function blockedModelIds');
const snippet = src.slice(start, end);

function makeCtx({ key, settings, probeOk, probeStatus, probeBody, meStatus }) {
  const ctx = {
    readSettings: () => settings || {},
    getBaseUrl: () => 'https://api.test/v1',
    authHeaders: () => ({}),
    fetch: async (url) => {
      if (url && String(url).endsWith('/me/status')) {
        if (!meStatus || meStatus.fail) {
          return { ok: false, status: 403, text: async () => '{"error":{"message":"forbidden"}}' };
        }
        return { ok: true, status: 200, text: async () => JSON.stringify(meStatus) };
      }
      return {
        ok: probeOk,
        status: probeStatus || (probeOk ? 200 : 403),
        text: async () => probeBody || (probeOk ? '{"choices":[{"message":{"content":"hi"}}]}' : '{"error":{"message":"403 model_requires_package"}}'),
      };
    },
  };
  Object.defineProperty(ctx, 'storedKey', { value: key, writable: true });
  vm.createContext(ctx);
  vm.runInContext(snippet, ctx);
  return ctx;
}

(async () => {
  // 1) Prefix sk-hemat- -> Paket Hemat (tanpa probe)
  let ctx = makeCtx({ key: 'sk-hemat-abc123' });
  let r = await ctx.detectModelAccess();
  console.log('1 prefix hemat   :', r.plan, '|', r.allowed && r.allowed.join(','), '| src=' + r.source);

  // 2) Prefix sk-minimax- -> Paket MiniMax
  ctx = makeCtx({ key: 'sk-minimax-xyz' });
  r = await ctx.detectModelAccess();
  console.log('2 prefix minimax :', r.plan, '|', r.allowed && r.allowed.slice(0, 3).join(','), '| src=' + r.source);

  // 3) Key sk-sm- + akun PAYG di /me/status -> PAYG (semua model)
  ctx = makeCtx({ key: 'sk-sm-plain', meStatus: { ada_paket: false, nama_paket: null } });
  r = await ctx.detectModelAccess();
  console.log('3 me PAYG          :', r.plan, '| allowed=' + r.allowed, '| src=' + r.source);

  // 3b) Key sk-sm- + /me/status gagal + probe 403 -> PAYG
  ctx = makeCtx({ key: 'sk-sm-plain', probeOk: false, probeStatus: 403, probeBody: '{"error":{"message":"403 model_requires_package"}}' });
  r = await ctx.detectModelAccess();
  console.log('3b probe no-paket :', r.plan, '| allowed=' + r.allowed, '| src=' + r.source);

  // 4) Key sk-sm- + /me/status menyatakan paket -> paket terbaca
  ctx = makeCtx({ key: 'sk-sm-paket', meStatus: { ada_paket: true, nama_paket: 'Paket Hemat' } });
  r = await ctx.detectModelAccess();
  console.log('4 me + plan        :', r.plan, '|', r.allowed && r.allowed.join(','), '| src=' + r.source);

  // 4b) Key sk-sm- + /me/status menyatakan Paket Claude Dev
  ctx = makeCtx({ key: 'sk-sm-claude', meStatus: { ada_paket: true, nama_paket: 'Claude Dev' } });
  r = await ctx.detectModelAccess();
  console.log('4b me Claude Dev  :', r.plan, '|', r.allowed && r.allowed.join(','), '| src=' + r.source);

  // 5) /me/status gagal + probe OK tanpa plan -> union model paket
  ctx = makeCtx({ key: 'sk-sm-unknown', probeOk: true });
  r = await ctx.detectModelAccess();
  console.log('5 probe paket?   :', r.plan, '|', (r.allowed ? r.allowed.length + ' model' : 'all'), '| src=' + r.source);

  // 6) Mode manual coding
  ctx = makeCtx({ key: 'sk-sm-x', settings: { modelAccessMode: 'coding' } });
  r = await ctx.detectModelAccess();
  console.log('6 mode coding    :', r.plan, '|', r.allowed && r.allowed.length + ' model', '| src=' + r.source);
})();
