(() => {
  'use strict';

  const api = window.sahabat;
  const VIEW_TITLES = { chat: 'Chat', workspace: 'Workspace Developer', models: 'Model', api: 'API & Snippet', extensions: 'Extensions', marketplace: 'Marketplace', desktop: 'Desktop' };
  const RING_DOTS = '<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>';
  const EXT_MODES = {};
  const MODE_MAP = {
    js: 'javascript', mjs: 'javascript', cjs: 'javascript', jsx: 'javascript',
    ts: 'typescript', tsx: 'typescript', py: 'python', html: 'html', htm: 'html',
    css: 'css', scss: 'css', less: 'css', json: 'json', md: 'markdown',
    markdown: 'markdown', sh: 'sh', bash: 'sh', zsh: 'sh', sql: 'sql',
    xml: 'xml', svg: 'xml', yaml: 'yaml', yml: 'yaml', rs: 'rust', go: 'golang',
    php: 'php', rb: 'ruby', java: 'java', c: 'c_cpp', h: 'c_cpp', cpp: 'c_cpp',
    hpp: 'c_cpp', cs: 'csharp', ini: 'ini', conf: 'ini', toml: 'text', txt: 'text'
  };
  const TOOLS = [
    {
      type: 'function',
      function: {
        name: 'list_dir',
        description: 'Lihat isi folder pada explorer aktif (lokal/SSH/FTP).',
        parameters: { type: 'object', properties: { path: { type: 'string', description: 'Path folder, mis. "."' } }, required: ['path'] }
      }
    },
    {
      type: 'function',
      function: {
        name: 'read_file',
        description: 'Baca isi file teks pada explorer aktif.',
        parameters: { type: 'object', properties: { path: { type: 'string', description: 'Path file' } }, required: ['path'] }
      }
    },
    {
      type: 'function',
      function: {
        name: 'write_file',
        description: 'Tulis atau buat file pada explorer aktif. Gunakan untuk membuat/memperbaiki kode.',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Path file' },
            content: { type: 'string', description: 'Isi file lengkap yang baru' }
          },
          required: ['path', 'content']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'run_command',
        description: 'Jalankan perintah shell (lokal atau SSH). Akan dikonfirmasi pengguna. Tidak tersedia untuk FTP.',
        parameters: {
          type: 'object',
          properties: {
            command: { type: 'string', description: 'Perintah yang akan dijalankan' },
            cwd: { type: 'string', description: 'Direktori kerja, opsional' }
          },
          required: ['command']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'server_status',
        description: 'Cek status server: uptime, load, memory, disk, dan layanan yang berjalan. Khusus server (SSH).',
        parameters: { type: 'object', properties: {}, required: [] }
      }
    },
    {
      type: 'function',
      function: {
        name: 'firewall_status',
        description: 'Cek status firewall dan daftar port yang terbuka. Khusus server (SSH).',
        parameters: { type: 'object', properties: {}, required: [] }
      }
    },
    {
      type: 'function',
      function: {
        name: 'firewall_allow',
        description: 'Buka port di firewall server. Akan dikonfirmasi pengguna.',
        parameters: {
          type: 'object',
          properties: {
            port: { type: 'string', description: 'Nomor port, mis. 8080' },
            proto: { type: 'string', description: 'Protokol: tcp atau udp (default tcp)' }
          },
          required: ['port']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'firewall_deny',
        description: 'Tutup port di firewall server. Akan dikonfirmasi pengguna.',
        parameters: {
          type: 'object',
          properties: {
            port: { type: 'string', description: 'Nomor port, mis. 8080' },
            proto: { type: 'string', description: 'Protokol: tcp atau udp (default tcp)' }
          },
          required: ['port']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'service_restart',
        description: 'Restart layanan (service) di server, mis. nginx, mysql, apache2. Akan dikonfirmasi pengguna.',
        parameters: {
          type: 'object',
          properties: { service: { type: 'string', description: 'Nama layanan, mis. nginx' } },
          required: ['service']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'dns_lookup',
        description: 'Query DNS records untuk domain (A, AAAA, CNAME, MX, TXT, NS). Khusus server.',
        parameters: {
          type: 'object',
          properties: {
            domain: { type: 'string', description: 'Nama domain, mis. example.com' },
            type: { type: 'string', description: 'Tipe record: A, AAAA, CNAME, MX, TXT, NS (default A)' }
          },
          required: ['domain']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'dns_propagation',
        description: 'Cek propagasi DNS ke resolver publik (Google, Cloudflare, Quad9).',
        parameters: {
          type: 'object',
          properties: {
            domain: { type: 'string', description: 'Nama domain' },
            type: { type: 'string', description: 'Tipe record (default A)' }
          },
          required: ['domain']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'dns_zone_show',
        description: 'Baca record DNS dari zone file BIND lokal di server.',
        parameters: {
          type: 'object',
          properties: { domain: { type: 'string', description: 'Nama domain/zone' } },
          required: ['domain']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'dns_zone_add',
        description: 'Tambah record DNS ke zone file BIND lokal (update serial + reload).',
        parameters: {
          type: 'object',
          properties: {
            domain: { type: 'string', description: 'Domain/zone, mis. example.com' },
            name: { type: 'string', description: 'Nama record, mis. www (atau @ / *)' },
            type: { type: 'string', description: 'Tipe: A, AAAA, CNAME, MX, TXT, NS' },
            value: { type: 'string', description: 'Nilai record' },
            ttl: { type: 'string', description: 'TTL (default 3600)' }
          },
          required: ['domain', 'name', 'type', 'value']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'dns_zone_delete',
        description: 'Hapus record DNS dari zone file BIND lokal (update serial + reload).',
        parameters: {
          type: 'object',
          properties: {
            domain: { type: 'string' },
            name: { type: 'string', description: 'Nama record yang akan dihapus' },
            type: { type: 'string', description: 'Tipe record (opsional)' }
          },
          required: ['domain', 'name']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'install_nginx',
        description: 'Install Nginx di server (deteksi distro apt/dnf/yum) dan jalankan servisnya.',
        parameters: { type: 'object', properties: {}, required: [] }
      }
    },
    {
      type: 'function',
      function: {
        name: 'install_apache',
        description: 'Install Apache di server (apt: apache2, dnf/yum: httpd) dan jalankan servisnya.',
        parameters: { type: 'object', properties: {}, required: [] }
      }
    },
    {
      type: 'function',
      function: {
        name: 'install_mysql',
        description: 'Install MySQL/MariaDB di server dan jalankan servisnya.',
        parameters: { type: 'object', properties: {}, required: [] }
      }
    },
    {
      type: 'function',
      function: {
        name: 'install_ssl',
        description: 'Install Certbot dan membuat sertifikat SSL Let\'s Encrypt untuk domain.',
        parameters: {
          type: 'object',
          properties: {
            domain: { type: 'string', description: 'Domain, mis. example.com' },
            email: { type: 'string', description: 'Email untuk pendaftaran Let\'s Encrypt' },
            webserver: { type: 'string', description: 'nginx atau apache (default nginx)' }
          },
          required: ['domain', 'email']
        }
      }
    }
  ];

  const S = {
    settings: { baseUrl: 'https://www.sahabatmobile.com/api/v1', hasKey: false, keyHint: '' },
    models: [],
    model: localStorage.getItem('sahabat.model') || '',
    view: localStorage.getItem('sahabat.view') || 'desktop',
    chat: [],
    chatMode: localStorage.getItem('sahabat.chat.mode') || 'auto',
    customTasks: (() => { try { return JSON.parse(localStorage.getItem('sahabat.customTasks') || '[]'); } catch { return []; } })(),
    installedSkills: (() => { try { return JSON.parse(localStorage.getItem('sahabat.skills') || '[]'); } catch { return []; } })(),
    userMode: localStorage.getItem('sahabat.userMode') || 'developer',
    attachments: [],
    update: null,
    busy: false,
    requestId: null,
    local: { root: null, tree: [], expanded: new Set() },
    target: { type: 'local', id: null },
    connections: [],
    savedConnections: [],
    remotes: new Map(),
    editor: null,
    termTabs: [],
    termActiveUid: null,
    termSeq: 0,
    db: { databases: [], tables: {}, expanded: new Set(), lastResult: null },
    tabs: [],
    active: null,

    agent: { messages: [], busy: false, history: [], mode: localStorage.getItem('sahabat.agent.mode') || 'auto' },
    snippet: 'curl',
    cloneDir: null,
    mapTarget: null,
    clipboard: null,
    extensions: [],
    extCatalog: [],
    extApplied: new Set(),
    extSearchTerm: '',
    extSearchTimer: null,
    extMarket: [],
    extMarketLoading: false,
    extMarketLoaded: false,
    extUpdates: {},
    extSelected: null,
    extFilter: 'all',
    ui: {
      sideWidth: parseInt(localStorage.getItem('sahabat.sideWidth'), 10) || 252,
      agentWidth: parseInt(localStorage.getItem('sahabat.agentWidth'), 10) || 344,
      termHeight: parseInt(localStorage.getItem('sahabat.termHeight'), 10) || 220
    }
  };

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const baseName = (p) => String(p || '').split(/[\\/]/).pop();
  const dirName = (p) => String(p || '').replace(/[\\/]+$/, '').split(/[\\/]/).pop() || p;

  const FILE_COLORS = {
    js: '#f7df1e', mjs: '#f7df1e', cjs: '#f7df1e', jsx: '#61dafb', ts: '#3178c6', tsx: '#3178c6',
    html: '#e34c26', htm: '#e34c26', css: '#264de4', scss: '#c6538c', less: '#1d365d',
    json: '#8bc34a', md: '#e8eaf0', txt: '#9e9e9e', php: '#777bb4', py: '#3776ab',
    rb: '#cc342d', go: '#00add8', rs: '#dea584', sql: '#f29111', xml: '#f16529',
    svg: '#ffb13b', png: '#4caf50', jpg: '#4caf50', jpeg: '#4caf50', gif: '#4caf50'
  };
  function fileColor(name) {
    const ext = String(name || '').split('.').pop().toLowerCase();
    return FILE_COLORS[ext] || 'transparent';
  }
  const joinRemote = (dir, name) => (String(dir).replace(/\/+$/, '') || '') + '/' + name;

  const DB_PROTOCOLS = ['mysql', 'postgres', 'sqlite', 'sqlserver', 'mongodb', 'redis', 'elasticsearch'];
  const DB_DEFAULT_PORT = { sftp: 22, ftp: 21, ftps: 21, mysql: 3306, postgres: 5432, sqlserver: 1433, mongodb: 27017, redis: 6379, elasticsearch: 9200 };
  const DB_MODE_MAP = { mysql: 'ace/mode/mysql', postgres: 'ace/mode/pgsql', sqlserver: 'ace/mode/sqlserver', sqlite: 'ace/mode/sql', mongodb: 'ace/mode/json', elasticsearch: 'ace/mode/json', redis: 'ace/mode/plain_text' };

  function isDbProtocol(p) { return DB_PROTOCOLS.includes(String(p || '').toLowerCase()); }
  function protocolDefaultPort(p) { return DB_DEFAULT_PORT[String(p || '').toLowerCase()] || 22; }
  function protocolLabel(p) {
    const s = String(p || 'sftp').toUpperCase();
    return s === 'POSTGRES' ? 'POSTGRESQL' : s;
  }

  function modeFor(name) {
    const ext = String(name || '').split('.').pop().toLowerCase();
    return 'ace/mode/' + (EXT_MODES[ext] || MODE_MAP[ext] || 'text');
  }

  function toast(msg) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 220);
    }, 2400);
  }

  function updateKeyBadge() {
    const on = S.settings.hasKey;
    document.querySelectorAll('.keyBadge').forEach((badge) => {
      badge.textContent = on ? 'Key •••• ' + (S.settings.keyHint || '') : 'Key belum diisi';
      badge.className = 'keyBadge badge ' + (on ? 'on' : 'off');
    });
    updateStatusBar();
  }

  function currentModel() {
    return S.model || (S.models[0] && S.models[0].id) || 'MiniMax-M3';
  }

  function modelSelects() {
    return [$('modelSelect'), $('modelSelectAgent')].filter(Boolean);
  }

  function setModel(id) {
    if (!id) return;
    S.model = id;
    localStorage.setItem('sahabat.model', id);
    for (const sel of modelSelects()) {
      if ([...sel.options].some((o) => o.value === id)) sel.value = id;
    }
    $('apiModel').textContent = id;
    renderSnippet();
    updateThinkingAvailability();
    updateStatusBar();
  }

  function updateThinkingAvailability() {
    const sel = $('agentThinking');
    if (!sel) return;
    const id = currentModel();
    const m = (S.models || []).find((it) => it.id === id);
    // Daftar model belum termuat → biarkan aktif (main tetap menyaring param thinking).
    const capable = m ? Boolean(m.thinking) : true;
    sel.disabled = !capable;
    sel.classList.toggle('disabled', !capable);
    sel.title = capable
      ? 'Thinking (reasoning effort) untuk agent'
      : 'Model ini tidak mendukung thinking — opsi dimatikan';
  }

  function renderModelOptions() {
    const sels = modelSelects();
    for (const sel of sels) sel.innerHTML = '';
    const buildOptions = (sel) => {
      if (!S.models.length) {
        const opt = document.createElement('option');
        opt.value = currentModel();
        opt.textContent = currentModel();
        sel.appendChild(opt);
        return;
      }
      for (const m of S.models) {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.id;
        sel.appendChild(opt);
      }
      sel.value = S.model;
    };
    if (S.models.length && !S.models.some((m) => m.id === S.model)) {
      S.model = S.models[0].id;
      localStorage.setItem('sahabat.model', S.model);
    }
    for (const sel of sels) buildOptions(sel);
    $('apiModel').textContent = currentModel();
    renderSnippet();
    updateThinkingAvailability();
  }

  // ---------- Views ----------
  const VIEW_ICONS = {
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.6A8.6 8.6 0 0 1 4 11.5 8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5z"/></svg>',
    workspace: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 6 2 12 8 18"/><polyline points="16 6 22 12 16 18"/></svg>',
    models: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    api: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
    extensions: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M10 3h4v3a2 2 0 1 0 4 0h3v4h-3a2 2 0 1 0 0 4h3v4h-4v-3a2 2 0 1 0-4 0v3h-4v-3a2 2 0 1 0-4 0v3H3v-4h3a2 2 0 1 0 0-4H3V6h3a2 2 0 1 0 4 0z"/></svg>',
    marketplace: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    desktop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>'
  };

  function switchView(view) {
    S.view = view;
    try { localStorage.setItem('sahabat.view', view); } catch { /* abaikan */ }
    document.querySelectorAll('.act[data-view]').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
    document.querySelectorAll('.view').forEach((v) => v.classList.add('hidden'));
    const target = $('view-' + view);
    if (target) target.classList.remove('hidden');
    if (view === 'marketplace') renderMarketplace();
    if (view === 'desktop') renderDesktop();
    $('viewTitle').textContent = VIEW_TITLES[view] || view;
    if ($('crumbIcon')) $('crumbIcon').innerHTML = VIEW_ICONS[view] || '';
    $('viewTitle').classList.toggle('hidden', view === 'workspace');
    const topbar = document.querySelector('.topbar');
    if (topbar) topbar.classList.toggle('hidden', view === 'workspace');
    const connectionOpen = !$('connectionPane').classList.contains('hidden');
    const showExtensionsPane = view === 'extensions';
    const showWorkspacePane = view === 'workspace';
    $('app').classList.toggle('no-side', !showExtensionsPane && !showWorkspacePane);
    const appEl = document.querySelector('.app');
    appEl.classList.remove('max-explorer', 'max-agent', 'max-terminal', 'max-editor', 'hide-side', 'hide-agent');
    $('explorerRail').classList.add('hidden');
    $('agentRail').classList.add('hidden');
    $('termPane').classList.remove('max');
    if (showWorkspacePane) {
      $('extensionPane').classList.add('hidden');
      $('explorerPane').classList.toggle('hidden', connectionOpen);
      $('connectionPane').classList.toggle('hidden', !connectionOpen);
    } else if (showExtensionsPane) {
      $('explorerPane').classList.add('hidden');
      $('connectionPane').classList.add('hidden');
      $('extensionPane').classList.remove('hidden');
      if (!S.extMarketLoaded) loadRecommendedExtensions(true);
    } else {
      $('explorerPane').classList.add('hidden');
      $('connectionPane').classList.add('hidden');
      $('extensionPane').classList.add('hidden');
    }
    if (view === 'workspace') {
      ensureWorkspace();
    }
    if (view === 'models' && S.settings.hasKey) renderModelList();
    if (view === 'extensions') renderExtensions();
    updateStatusBar();
    updateChatHero();
    setTimeout(() => {
      fitAll();
      try { S.editor && S.editor.resize(true); } catch {}
    }, 80);
  }

  // ---------- Explorer ----------
  function targetValue() {
    return S.target.type === 'local' ? 'local' : S.target.id;
  }

  function renderTargetSelect() {
    const sel = $('targetSelect');
    sel.innerHTML = '';
    const localOpt = document.createElement('option');
    localOpt.value = 'local';
    localOpt.textContent = 'Lokal';
    sel.appendChild(localOpt);

    if (S.savedConnections.length) {
      const group = document.createElement('optgroup');
      group.label = 'Tersimpan';
      for (const profile of S.savedConnections) {
        const opt = document.createElement('option');
        opt.value = 'saved:' + profile.id;
        const isSqlite = String(profile.protocol).toLowerCase() === 'sqlite';
        const protocol = protocolLabel(profile.protocol);
        const port = profile.port || protocolDefaultPort(profile.protocol);
        const label = isSqlite
          ? 'SQLITE · ' + (baseName(profile.filePath) || 'file')
          : protocol + ' · ' + (profile.username || '?') + '@' + (profile.host || '?') + ':' + port;
        opt.textContent = label;
        opt.title = profile.name || label;
        group.appendChild(opt);
      }
      sel.appendChild(group);
    }

    if (S.connections.length) {
      const group = document.createElement('optgroup');
      group.label = 'Terhubung';
      for (const c of S.connections) {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.label;
        group.appendChild(opt);
      }
      sel.appendChild(group);
    }
    sel.value = targetValue();
    updateStatusBar();
  }

  function setSideStatus(text) {
    const label = $('sideStatusText');
    if (label) label.textContent = text;
    else $('sideStatus').textContent = text;
  }

  async function refreshSavedConnections() {
    try {
      const res = await api.listConnections();
      S.savedConnections = res.ok && Array.isArray(res.connections) ? res.connections : [];
    } catch {
      S.savedConnections = [];
    }
    renderTargetSelect();
  }

  function remoteSession() {
    if (S.target.type === 'local') return null;
    return S.remotes.get(S.target.id) || null;
  }

  // ---------- Database (MySQL, PostgreSQL, SQLite, SQL Server, MongoDB, Redis, Elasticsearch) ----------
  let sqlAce = null;

  function sqlEditor() {
    if (sqlAce) return sqlAce;
    sqlAce = ace.edit('sqlEditorHost');
    sqlAce.setTheme('ace/theme/tomorrow_night');
    sqlAce.session.setMode('ace/mode/sql');
    sqlAce.setOptions({ fontSize: 13, tabSize: 2, useSoftTabs: true, showPrintMargin: false });
    sqlAce.commands.addCommand({
      name: 'runQuery',
      bindKey: { win: 'Ctrl-Enter', mac: 'Cmd-Enter' },
      exec: () => runDbQuery()
    });
    return sqlAce;
  }

  function queryText() { return sqlEditor().getValue(); }
  function setQueryText(text) { sqlEditor().setValue(String(text || ''), -1); sqlEditor().focus(); }
  function setSqlEditorMode(protocol) {
    const mode = DB_MODE_MAP[String(protocol || '').toLowerCase()] || 'ace/mode/sql';
    try { sqlEditor().session.setMode(mode); } catch { /* abaikan */ }
  }

  function setDbStatus(text) { $('dbStatus').textContent = text || ''; }
  function clearDbResult() { $('dbResult').innerHTML = ''; $('dbRowCount').textContent = ''; S.db.lastResult = null; }

  function dbErrorBlock(message) {
    $('dbResult').innerHTML = '<div class="db-error">' + esc(message || 'Error tidak dikenal') + '</div>';
    $('dbRowCount').textContent = '';
    S.db.lastResult = null;
  }

  function renderDbResult(res) {
    const box = $('dbResult');
    if (!res || !res.ok) { dbErrorBlock(res && res.error ? res.error : 'Gagal menjalankan query.'); return; }
    const columns = res.columns || [];
    const rows = res.rows || [];
    S.db.lastResult = res;
    if (!columns.length) {
      box.innerHTML = '<div class="db-empty">OK' + (res.note ? ' — ' + esc(res.note) : '') + ' (' + (res.elapsedMs || 0) + ' ms)</div>';
      $('dbRowCount').textContent = '';
      setDbStatus((res.elapsedMs || 0) + ' ms');
      return;
    }
    let html = '<table class="db-table"><thead><tr>' + columns.map((c) => '<th>' + esc(c) + '</th>').join('') + '</tr></thead><tbody>';
    for (const row of rows) {
      html += '<tr>' + columns.map((_, i) => '<td>' + esc(row[i]) + '</td>').join('') + '</tr>';
    }
    html += '</tbody></table>';
    box.innerHTML = html;
    $('dbRowCount').textContent = rows.length + ' baris' + (res.truncated ? ' (dipotong)' : '');
    setDbStatus((res.elapsedMs != null ? res.elapsedMs + ' ms' : '') + (res.note ? ' · ' + res.note : ''));
  }

  function dbQuoteIdent(protocol, name) {
    const s = String(name);
    if (protocol === 'mysql') return '`' + s.replace(/`/g, '``') + '`';
    if (protocol === 'sqlserver') return '[' + s.replace(/]/g, ']]') + ']';
    return '"' + s.replace(/"/g, '""') + '"';
  }

  function defaultDbQuery(protocol, name) {
    const p = String(protocol || '').toLowerCase();
    if (p === 'mongodb') return JSON.stringify({ collection: name, limit: 100 }, null, 2);
    if (p === 'elasticsearch') return JSON.stringify({ index: name, size: 50 }, null, 2);
    if (p === 'redis') return 'TYPE ' + name;
    return 'SELECT * FROM ' + dbQuoteIdent(p, name) + ' LIMIT 100';
  }

  async function runDbQuery() {
    const session = remoteSession();
    if (!session || session.type !== 'db') return;
    const sqlText = queryText().trim();
    if (!sqlText) { setDbStatus('Query kosong.'); return; }
    const database = $('dbDatabase').value || '';
    setDbStatus('Menjalankan...');
    $('dbRun').disabled = true;
    try {
      const res = session.protocol === 'redis'
        ? await api.dbRunQuery(session.id, '', sqlText)
        : await api.dbRunQuery(session.id, database, sqlText);
      renderDbResult(res);
    } finally {
      $('dbRun').disabled = false;
    }
  }

  async function previewDbItem(database, name) {
    const session = remoteSession();
    if (!session || session.type !== 'db') return;
    if (isDbProtocol(session.protocol) && session.protocol === 'redis') {
      setQueryText('GET ' + name);
      setDbStatus('Membaca kunci...');
      const res = await api.dbRedisValue(session.id, name);
      renderDbResult(res);
      return;
    }
    setQueryText(defaultDbQuery(session.protocol, name));
    await runDbQuery();
  }

  async function loadDbTree() {
    const box = $('fileTree');
    const session = remoteSession();
    if (!session || session.type !== 'db') return;
    const res = await api.dbListDatabases(session.id);
    if (!res.ok) {
      box.innerHTML = '<div class="tree-empty">Gagal memuat database: ' + esc(res.error || 'unknown') + '</div>';
      return;
    }
    S.db.databases = res.items || [];
    const dbSel = $('dbDatabase');
    dbSel.innerHTML = '';
    for (const name of S.db.databases) {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      dbSel.appendChild(opt);
    }
    renderDbTree();
  }

  function renderDbTree() {
    const box = $('fileTree');
    const session = remoteSession();
    box.innerHTML = '';
    $('wsRoot').textContent = session ? session.label : 'Database';
    const items = S.db.databases;
    if (!items.length) {
      box.innerHTML = '<div class="tree-empty">Tidak ada database / index yang terlihat.</div>';
      return;
    }
    for (const dbName of items) {
      renderDbNode(box, session, dbName, 0);
    }
  }

  function renderDbNode(box, session, dbName, depth) {
    const open = S.db.expanded.has(dbName);
    const row = document.createElement('div');
    row.className = 'tree-row';
    row.style.paddingLeft = 8 + depth * 14 + 'px';
    row.innerHTML = '<span class="caret">' + (open ? '▾' : '▸') + '</span><span class="fname">' + esc(dbName) + '</span>';
    row.addEventListener('click', async () => {
      if (S.db.expanded.has(dbName)) { S.db.expanded.delete(dbName); renderDbTree(); return; }
      S.db.expanded.add(dbName);
      if (!S.db.tables[dbName]) {
        const res = await api.dbListTables(session.id, dbName);
        S.db.tables[dbName] = res.ok ? (res.items || []) : [];
        if (!res.ok) toast('Gagal memuat tabel: ' + (res.error || 'unknown'));
      }
      renderDbTree();
    });
    row.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showContextMenu(e.clientX, e.clientY, [
        { label: 'Refresh', action: async () => { S.db.tables = {}; $('fileTree').innerHTML = '<div class="tree-empty">Memuat...</div>'; await loadDbTree(); } },
        { label: 'Copy nama', action: () => api.copyText(dbName) }
      ]);
    });
    box.appendChild(row);
    if (!open) return;
    const tables = S.db.tables[dbName] || [];
    if (!tables.length) {
      const empty = document.createElement('div');
      empty.className = 'tree-row';
      empty.style.paddingLeft = 8 + (depth + 1) * 14 + 'px';
      empty.innerHTML = '<span class="caret"></span><span class="muted">(kosong)</span>';
      box.appendChild(empty);
      return;
    }
    for (const t of tables) {
      const trow = document.createElement('div');
      trow.className = 'tree-row';
      trow.style.paddingLeft = 8 + (depth + 1) * 14 + 'px';
      trow.title = t.type ? String(t.type) : '';
      trow.innerHTML = '<span class="caret">·</span><span class="fname">' + esc(t.name) + '</span>' +
        (t.type ? '<span class="db-type muted">' + esc(String(t.type).replace(/^BASE TABLE$/i, 'table')) + '</span>' : '');
      trow.addEventListener('click', () => {
        $('dbDatabase').value = dbName;
        previewDbItem(dbName, t.name);
      });
      box.appendChild(trow);
    }
  }

  function resetDbState() {
    S.db.databases = [];
    S.db.tables = {};
    S.db.expanded = new Set();
    S.db.lastResult = null;
    $('dbDatabase').innerHTML = '';
    clearDbResult();
    setDbStatus('');
  }

  function setDbMode(on) {
    $('editor').classList.toggle('hidden', on);
    $('tabbar').classList.toggle('hidden', on);
    $('dbPane').classList.toggle('hidden', !on);
    if (on) { try { sqlEditor().resize(); } catch { /* abaikan */ } }
  }

  async function enterDbMode() {
    setDbMode(true);
    const session = remoteSession();
    const proto = String(session && session.protocol || 'sql').toLowerCase();
    setSqlEditorMode(proto);
    $('wsRoot').textContent = session ? session.label : 'Database';
    setSideStatus(session ? session.label : 'Database');
    $('fileTree').innerHTML = '<div class="tree-empty">Memuat database...</div>';
    resetDbToolbar();
    await loadDbTree();
  }

  function exitDbMode() { setDbMode(false); }

  function resetDbToolbar() {
    $('dbDatabase').innerHTML = '';
    clearDbResult();
    setDbStatus('');
    setQueryText('');
  }

  function csvEscape(v) {
    const s = String(v == null ? '' : v);
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function resultToCsv(res) {
    if (!res || !res.ok || !Array.isArray(res.columns) || !res.columns.length) return '';
    const lines = [res.columns.map(csvEscape).join(',')];
    for (const row of res.rows || []) lines.push(row.map(csvEscape).join(','));
    return lines.join('\r\n');
  }

  async function exportCsv() {
    const res = S.db.lastResult;
    if (!res || !res.ok || !(res.columns || []).length) { toast('Belum ada hasil query untuk di-export.'); return; }
    const csv = resultToCsv(res);
    const out = await api.saveCsv(csv, 'export-' + Date.now() + '.csv');
    if (out && out.ok) toast('CSV tersimpan: ' + out.path);
    else if (out && !out.cancelled) toast('Gagal menyimpan CSV: ' + (out.error || 'unknown'));
  }

  function renderLocalTree() {
    $('fileTree').innerHTML = '';
    if (!S.local.root) {
      $('wsRoot').textContent = 'Belum ada folder';
      const hint = document.createElement('div');
      hint.className = 'tree-empty';
      hint.textContent = 'Buka folder atau clone repository untuk mulai.';
      $('fileTree').appendChild(hint);
      return;
    }
    $('wsRoot').textContent = S.local.root;
    renderTreeNodes(S.local.tree, 0);
  }

  function renderTreeNodes(nodes, depth) {
    const box = $('fileTree');
    for (const node of nodes) {
      const row = document.createElement('div');
      row.className = 'tree-row';
      row.style.paddingLeft = 8 + depth * 14 + 'px';
      row.title = node.path;
      const dot = '<span class="file-dot" style="background:' + (node.dir ? '#5b8def' : fileColor(node.name)) + '"></span>';
      if (node.dir) {
        const open = S.local.expanded.has(node.path);
        row.innerHTML = '<span class="caret">' + (open ? '▾' : '▸') + '</span><span class="fname">' + dot + esc(node.name) + '</span>';
        row.addEventListener('click', () => {
          if (S.local.expanded.has(node.path)) S.local.expanded.delete(node.path);
          else S.local.expanded.add(node.path);
          $('fileTree').innerHTML = '';
          renderTreeNodes(S.local.tree, 0);
        });
        row.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); showEntryMenu(e.clientX, e.clientY, node); });
        box.appendChild(row);
        if (open) renderTreeNodes(node.children || [], depth + 1);
      } else {
        row.innerHTML = '<span class="caret">·</span><span class="fname">' + dot + esc(node.name) + '</span>';
        row.addEventListener('click', () => openFile(node.path));
        row.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); showEntryMenu(e.clientX, e.clientY, node); });
        box.appendChild(row);
      }
    }
  }

  function renderRemoteTree(dir, items) {
    $('fileTree').innerHTML = '';
    $('wsRoot').textContent = dir;
    const session = remoteSession();
    const status = session ? session.type.toUpperCase() + ' · ' + dir : dir;
    setSideStatus(status);
    if (dir && dir !== '/') {
      const up = document.createElement('div');
      up.className = 'tree-row';
      up.innerHTML = '<span class="caret">↑</span><span class="fname">..</span>';
      up.addEventListener('click', () => {
        const parent = dir.replace(/\/+[^/]+\/?$/, '') || '/';
        loadRemoteDir(parent);
      });
      $('fileTree').appendChild(up);
    }
    for (const item of items) {
      const row = document.createElement('div');
      row.className = 'tree-row';
      row.title = item.path;
      row.innerHTML = '<span class="caret">' + (item.dir ? '▸' : '·') + '</span><span class="fname"><span class="file-dot" style="background:' + (item.dir ? '#5b8def' : fileColor(item.name)) + '"></span>' + esc(item.name) + '</span>';
      row.addEventListener('click', () => {
        if (item.dir) loadRemoteDir(item.path);
        else openFile(item.path);
      });
      row.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); showEntryMenu(e.clientX, e.clientY, item); });
      $('fileTree').appendChild(row);
    }
  }

  function currentTarget() {
    return { type: S.target.type, id: S.target.id };
  }

  function parentPathOf(p) {
    const s = String(p || '');
    if (S.target.type !== 'local') {
      const d = s.replace(/\/+[^/]+\/?$/, '');
      return d || '/';
    }
    const idx = Math.max(s.lastIndexOf('\\'), s.lastIndexOf('/'));
    if (idx < 0) return s;
    if (idx === 2 && /^[A-Za-z]:/.test(s)) return s.slice(0, 3);
    return s.slice(0, idx);
  }

  function joinForTarget(dir, name) {
    if (S.target.type !== 'local') return joinRemote(dir, name);
    return String(dir || '').replace(/[\\/]+$/, '') + '/' + name;
  }

  function hideContextMenu() {
    const menu = $('contextMenu');
    menu.classList.add('hidden');
    menu.innerHTML = '';
  }

  function showContextMenu(x, y, items) {
    const menu = $('contextMenu');
    menu.innerHTML = '';
    for (const item of items) {
      if (item.sep) {
        const sep = document.createElement('div');
        sep.className = 'context-sep';
        menu.appendChild(sep);
        continue;
      }
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'context-item';
      btn.textContent = item.label;
      btn.disabled = Boolean(item.disabled);
      btn.addEventListener('click', async (ev) => {
        ev.stopPropagation();
        hideContextMenu();
        try { await item.action(); } catch (err) { toast(err.message || 'Gagal'); }
      });
      menu.appendChild(btn);
    }
    menu.classList.remove('hidden');
    const rect = menu.getBoundingClientRect();
    menu.style.left = Math.max(6, Math.min(x, window.innerWidth - rect.width - 6)) + 'px';
    menu.style.top = Math.max(6, Math.min(y, window.innerHeight - rect.height - 6)) + 'px';
  }

  function showEntryMenu(x, y, node) {
    const target = currentTarget();
    const folder = node.dir ? node.path : parentPathOf(node.path);
    showContextMenu(x, y, [
      { label: 'Edit', disabled: node.dir, action: () => openFile(node.path) },
      { label: 'Rename', action: () => renameEntry(node) },
      { label: 'Move to...', action: () => moveEntry(node) },
      { sep: true },
      { label: 'Copy', action: () => { S.clipboard = { target, path: node.path, name: node.name, isDir: node.dir, cut: false }; toast('Disalin: ' + node.name); } },
      { label: 'Cut', action: () => { S.clipboard = { target, path: node.path, name: node.name, isDir: node.dir, cut: true }; toast('Siap dipindah: ' + node.name); } },
      { label: 'Paste', disabled: !S.clipboard, action: () => pasteInto(folder) },
      { label: 'Copy path', action: async () => { await api.copyText(node.path); toast('Path disalin'); } },
      { sep: true },
      { label: 'Upload file...', action: () => uploadInto(folder, 'file') },
      { label: 'Upload folder...', action: () => uploadInto(folder, 'folder') },
      { label: 'Download...', action: () => downloadEntryFor(node) },
      { sep: true },
      { label: 'New file', action: () => createEntry('file', folder) },
      { label: 'New folder', action: () => createEntry('dir', folder) },
      { sep: true },
      { label: 'Buka di terminal', disabled: !node.dir, action: () => openInTerminal(node) },
      { label: 'Map drive...', disabled: !node.dir || S.target.type !== 'ssh', action: () => openMapDrive(node) },
      { label: 'Edit koneksi ini...', disabled: !activeSavedSshId(), action: () => openEditConnection(activeSavedSshId()) },
      { label: 'Refresh', action: () => refreshExplorer() },
      { sep: true },
      { label: 'Koneksi SSH baru...', action: () => openConnectionForm() },
      { label: 'Putuskan SSH', disabled: S.target.type !== 'ssh', action: () => disconnectRemote() },
      { sep: true },
      { label: 'Delete', action: () => deleteEntry(node) }
    ]);
  }

  function showBlankMenu(x, y) {
    const session = remoteSession();
    const dir = session ? (session.dir || session.home) : S.local.root;
    showContextMenu(x, y, [
      { label: 'New file', disabled: !dir, action: () => createEntry('file', dir) },
      { label: 'New folder', disabled: !dir, action: () => createEntry('dir', dir) },
      { label: 'Paste', disabled: !S.clipboard || !dir, action: () => pasteInto(dir) },
      { sep: true },
      { label: 'Upload file...', disabled: !dir, action: () => uploadInto(dir, 'file') },
      { label: 'Upload folder...', disabled: !dir, action: () => uploadInto(dir, 'folder') },
      { sep: true },
      { label: 'Buka di terminal', disabled: !dir, action: () => openInTerminal({ path: dir, name: baseName(dir), dir: true }) },
      { label: 'Map drive...', disabled: !dir || S.target.type !== 'ssh', action: () => openMapDrive({ path: dir, name: baseName(dir), dir: true }) },
      { label: 'Edit koneksi ini...', disabled: !activeSavedSshId(), action: () => openEditConnection(activeSavedSshId()) },
      { label: 'Koneksi SSH baru...', action: () => openConnectionForm() },
      { label: 'Putuskan SSH', disabled: S.target.type !== 'ssh', action: () => disconnectRemote() },
      { label: 'Refresh', action: () => refreshExplorer() }
    ]);
  }

  async function deleteEntry(node) {
    const where = S.target.type === 'local' ? 'lokal' : S.target.type.toUpperCase();
    if (!confirm('Hapus ' + (node.dir ? 'folder ' : 'file ') + node.name + ' dari explorer ' + where + '?')) return;
    const res = S.target.type === 'local'
      ? await api.removeFile(node.path)
      : await api.remoteRemove(S.target.id, node.path, node.dir);
    if (!res.ok) { toast(res.error || 'Gagal menghapus'); return; }
    await refreshExplorer();
    toast('Dihapus: ' + node.name);
  }

  async function renameEntry(node) {
    const name = await askText('Rename', 'Nama baru', 'Rename', node.name);
    if (!name || name === node.name) return;
    if (/[\\/]/.test(name)) { toast('Nama tidak boleh mengandung / atau \\'); return; }
    const dstPath = joinForTarget(parentPathOf(node.path), name);
    const res = await api.entryMove({ srcTarget: currentTarget(), srcPath: node.path, dstTarget: currentTarget(), dstPath, isDir: node.dir });
    if (!res.ok) { toast(res.error || 'Gagal rename'); return; }
    for (const tab of S.tabs) {
      if (!node.dir && tab.path === node.path) {
        tab.path = dstPath;
        tab.name = name;
        tab.key = tabKey(tab.target, dstPath);
      } else if (node.dir && tab.path.startsWith(node.path)) {
        tab.path = dstPath + tab.path.slice(node.path.length);
        tab.key = tabKey(tab.target, tab.path);
      }
    }
    renderTabs();
    await refreshExplorer();
    toast('Diubah nama: ' + name);
  }

  async function moveEntry(node) {
    const destDir = await askText('Pindahkan ke folder', 'Path folder tujuan', 'Pindah', parentPathOf(node.path));
    if (!destDir) return;
    const dstPath = joinForTarget(destDir.replace(/[\\/]+$/, ''), node.name);
    if (dstPath === node.path) return;
    const res = await api.entryMove({ srcTarget: currentTarget(), srcPath: node.path, dstTarget: currentTarget(), dstPath, isDir: node.dir });
    if (!res.ok) { toast(res.error || 'Gagal memindahkan'); return; }
    await refreshExplorer();
    toast('Dipindah ke ' + dstPath);
  }

  async function pasteInto(destDir) {
    if (!S.clipboard) { toast('Clipboard kosong'); return; }
    if (!destDir) { toast('Pilih folder tujuan dulu'); return; }
    const src = S.clipboard;
    const res = await api.entryCopy({
      srcTarget: src.target,
      srcPath: src.path,
      dstTarget: currentTarget(),
      dstDir: destDir,
      isDir: src.isDir,
      cut: src.cut
    });
    if (!res.ok) { toast(res.error || 'Gagal paste'); return; }
    if (src.cut) S.clipboard = null;
    await refreshExplorer();
    toast(src.cut ? 'Dipindah' : 'Paste selesai');
  }

  async function refreshExplorer() {
    if (S.target.type === 'local') {
      if (!S.local.root) { renderLocalTree(); return; }
      const info = await api.workspaceTree();
      if (info.ok) { S.local.tree = info.tree; S.local.root = info.root; }
      renderLocalTree();
      setSideStatus('Lokal · ' + (S.local.root || '-'));
    } else if (S.target.type === 'db') {
      // Database: reload daftar DB/tabel.
      S.db.tables = {};
      $('fileTree').innerHTML = '<div class="tree-empty">Memuat database...</div>';
      await loadDbTree();
    } else {
      const session = remoteSession();
      if (!session) return;
      await loadRemoteDir(session.dir || session.home);
    }
  }

  async function loadRemoteDir(dir) {
    const session = remoteSession();
    if (!session) return;
    const res = await api.remoteListDir(session.id, dir);
    if (!res.ok) { toast(res.error || 'Gagal membaca folder remote'); return; }
    session.dir = res.dir;
    renderRemoteTree(res.dir, res.items);
  }

  function updateExplorerChrome() {
    const remote = S.target.type !== 'local';
    $('disconnectRemote').classList.toggle('hidden', !remote);
    $('sshDisconnectTop').classList.toggle('hidden', S.target.type !== 'ssh');
    const activeRemote = remoteSession();
    $('editConnectionTop').title = 'Edit koneksi';
    $('editConnectionTop').classList.toggle('hidden', !((S.target.type === 'ssh' || S.target.type === 'db') && activeRemote && activeRemote.savedId));
    $('mapDriveTop').classList.toggle('hidden', S.target.type !== 'ssh');
    $('openFolder').classList.toggle('hidden', remote);
    $('cloneRepo').classList.toggle('hidden', remote);
    $('newFile').disabled = S.target.type === 'db';
    $('newFolder').disabled = S.target.type === 'db';
    $('agentTarget').textContent = remote
      ? (S.target.type.toUpperCase() + ' ' + (remoteSession() ? String(remoteSession().label).replace(/^(SSH|FTP|SFTP) /i, '') : ''))
      : 'lokal';
  }

  async function ensureWorkspace() {
    if (!S.editor) {
      S.editor = makeEditor('editor');
      S.editor.commands.addCommand({
        name: 'save',
        bindKey: { win: 'Ctrl-S', mac: 'Cmd-S' },
        exec: () => saveActive()
      });
      applyEditorPreferences();
    }
    updateExplorerChrome();
    if (S.target.type === 'local') {
      exitDbMode();
      if (!S.local.root) {
        const info = await api.workspaceInfo();
        if (info.ok) {
          S.local.root = info.root;
          S.local.tree = info.tree;
        }
      }
      renderLocalTree();
      setSideStatus('Lokal · ' + (S.local.root || 'belum ada folder'));
      // Buka satu terminal otomatis saat workspace kosong.
      if (!S.termTabs.length) newLocalTerminal(S.local.root);
    } else if (S.target.type === 'db') {
      await enterDbMode();
    } else {
      exitDbMode();
      const session = remoteSession();
      if (session) {
        await loadRemoteDir(session.dir || session.home);
      }
    }
    setTimeout(() => { fitAll(); try { S.editor && S.editor.resize(true); } catch {} }, 80);
    updateWsWelcome();
    updateStatusBar();
  }

  async function switchTarget(value) {
    if (value.startsWith('saved:')) {
      await connectSavedProfile(value.slice(6));
      return;
    }
    if (value === 'local') {
      S.target = { type: 'local', id: null };
    } else {
      const conn = S.connections.find((c) => c.id === value);
      if (!conn) {
        renderTargetSelect();
        return;
      }
      S.target = { type: conn.type, id: conn.id };
    }
    renderTargetSelect();
    await ensureWorkspace();
  }

  // ---------- Connection ----------
  function syncConnectionFields(profile) {
    const protocol = String($('connProtocol').value || 'sftp').toLowerCase();
    const isSftp = protocol === 'sftp';
    const isDb = isDbProtocol(protocol);
    const isSqlite = protocol === 'sqlite';
    $('connHostField').classList.toggle('hidden', isSqlite);
    $('connPortField').classList.toggle('hidden', isSqlite);
    $('connUserField').classList.toggle('hidden', isSqlite);
    $('connPasswordField').classList.toggle('hidden', isSqlite);
    $('connFileField').classList.toggle('hidden', !isSqlite);
    // Database / index: MySQL, PostgreSQL, SQL Server, MongoDB (opsional).
    $('connDatabaseField').classList.toggle('hidden', !(isDb && !isSqlite && protocol !== 'redis' && protocol !== 'elasticsearch'));
    $('connKeyField').classList.toggle('hidden', !isSftp);
    $('connPassphraseField').classList.toggle('hidden', !isSftp);
    $('connHost').required = !isSqlite;
    $('connUser').required = !isSqlite;
    if (isDb && !profile) {
      $('connPort').value = String(protocolDefaultPort(protocol));
    }
    if (!profile) {
      const hints = {
        sftp: 'Password disimpan terenkripsi di perangkat ini. Untuk SSH bisa memakai private key.',
        ftp: 'FTP tanpa enkripsi — password terkirim sebagai teks. Pertimbangkan FTPS.',
        ftps: 'FTPS: koneksi FTP dengan TLS.',
        mysql: 'Password disimpan terenkripsi di perangkat ini.',
        postgres: 'Password disimpan terenkripsi di perangkat ini.',
        sqlserver: 'Password disimpan terenkripsi di perangkat ini.',
        sqlite: 'File SQLite dibaca/tulis langsung dari disk.',
        mongodb: 'MongoDB: query sebagai JSON, contoh {"collection":"users","filter":{},"limit":50}.',
        redis: 'Redis: perintah langsung di kotak query, contoh PING atau GET nama.',
        elasticsearch: 'Elasticsearch: query sebagai JSON, contoh {"index":"logs-*","size":50}.'
      };
      if (hints[protocol]) $('connHint').textContent = hints[protocol];
    }
    $('connSave').disabled = Boolean(profile);
  }

  function connectionFormValue() {
    const protocol = String($('connProtocol').value || 'sftp').toLowerCase();
    const isDb = isDbProtocol(protocol);
    return {
      id: S.editingConnection ? S.editingConnection.id : undefined,
      protocol,
      name: $('connName').value.trim(),
      host: $('connHost').value.trim(),
      port: Number($('connPort').value) || protocolDefaultPort(protocol),
      username: $('connUser').value.trim(),
      password: $('connPassword').value,
      passphrase: $('connPassphrase').value,
      authType: protocol === 'sftp' && $('connKey').value.trim() ? 'key' : 'password',
      privateKey: $('connKey').value.trim(),
      database: $('connDatabase').value.trim(),
      filePath: $('connFile').value.trim(),
      kind: isDb ? protocol : undefined
    };
  }

  function openConnectionForm(profile) {
    S.editingConnection = profile || null;
    $('explorerPane').classList.add('hidden');
    $('connectionPane').classList.remove('hidden');
    const isEdit = Boolean(profile);
    $('connProtocol').value = profile ? String(profile.protocol || 'sftp').toLowerCase() : 'sftp';
    $('connPort').value = profile ? String(profile.port) : String(protocolDefaultPort($('connProtocol').value));
    $('connHost').value = profile ? (profile.host || '') : '';
    $('connUser').value = profile ? (profile.username || '') : '';
    $('connPassword').value = '';
    $('connKey').value = profile && profile.privateKey ? profile.privateKey : '';
    $('connName').value = profile ? (profile.name || '') : '';
    $('connDatabase').value = profile ? (profile.database || '') : '';
    $('connFile').value = profile && profile.filePath ? profile.filePath : '';
    $('connSave').checked = true;
    $('connPassphrase').value = '';
    $('connectionPaneTitle').textContent = isEdit ? 'EDIT KONEKSI' : 'KONEKSI BARU';
    $('connSubmit').textContent = isEdit ? 'Simpan & Hubungkan' : 'Hubungkan';
    $('connSaveOnly').classList.toggle('hidden', !isEdit);
    $('connHint').classList.toggle('conn-edit-note', isEdit);
    $('connHint').textContent = isEdit
      ? 'Mode edit. Kosongkan password / passphrase untuk mempertahankan nilai yang tersimpan. Klik “Simpan” untuk memperbarui tanpa menghubungkan.'
      : 'Password disimpan terenkripsi di perangkat ini. Untuk SSH bisa memakai private key.';
    syncConnectionFields(profile);
    setTimeout(() => (isEdit ? $('connHost').focus() : $('connHost').focus()), 60);
  }

  async function connectDatabase(payload, editingId) {
    const btn = $('connSubmit');
    btn.disabled = true;
    btn.textContent = 'Menghubungkan...';
    const res = await api.dbConnect({
      ...payload,
      connectionId: editingId || undefined,
      saveConnection: $('connSave').checked || Boolean(editingId)
    });
    btn.disabled = false;
    btn.textContent = editingId ? 'Simpan & Hubungkan' : 'Hubungkan';
    if (!res.ok) { toast('Koneksi gagal: ' + (res.error || 'unknown')); return; }
    const conn = { id: res.id, type: 'db', label: res.label, protocol: res.protocol, host: res.host, port: res.port, username: res.username, savedId: res.savedId };
    S.connections = S.connections.filter((c) => c.id !== conn.id);
    S.connections.push(conn);
    S.remotes.set(res.id, conn);
    if (res.savedId) toast('Koneksi tersimpan');
    if (res.savedId) await refreshSavedConnections();
    renderTargetSelect();
    closeConnectionForm();
    resetDbState();
    S.target = { type: 'db', id: res.id };
    renderTargetSelect();
    await ensureWorkspace();
    switchView('workspace');
    toast('Terhubung: ' + res.label);
  }

  function closeConnectionForm() {
    S.editingConnection = null;
    $('connectionPane').classList.add('hidden');
    $('explorerPane').classList.remove('hidden');
  }

  async function connectRemote(e) {
    e.preventDefault();
    const btn = $('connSubmit');
    const payload = connectionFormValue();
    const editingId = S.editingConnection ? S.editingConnection.id : null;
    if (isDbProtocol(payload.protocol)) {
      await connectDatabase(payload, editingId);
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Menghubungkan...';
    const res = await api.remoteConnect({
      ...payload,
      connectionId: editingId || undefined,
      saveConnection: $('connSave').checked || Boolean(editingId)
    });
    btn.disabled = false;
    btn.textContent = editingId ? 'Simpan & Hubungkan' : 'Hubungkan';
    if (!res.ok) { toast('Koneksi gagal: ' + (res.error || 'unknown')); return; }
    const conn = { id: res.id, type: res.type, label: res.label, home: res.home, dir: res.home, host: res.host, port: res.port, username: res.username, savedId: res.saved && res.saved.id };
    S.connections = S.connections.filter((c) => c.id !== conn.id);
    S.connections.push(conn);
    S.remotes.set(res.id, conn);
    if (res.saved) toast('Koneksi tersimpan: ' + res.saved.name);
    if (res.saved) await refreshSavedConnections();
    renderTargetSelect();
    closeConnectionForm();
    await switchTarget(res.id);
    if (res.type === 'ssh' && !S.termTabs.some((t) => t.kind === 'ssh' && t.sessionId === res.id)) newSshTerminal(res.id);
    switchView('workspace');
    toast('Terhubung: ' + res.label);
  }

  async function saveConnectionOnly() {
    if (!S.editingConnection) return;
    const btn = $('connSaveOnly');
    btn.disabled = true;
    btn.textContent = 'Menyimpan...';
    const res = await api.updateConnection(connectionFormValue());
    btn.disabled = false;
    btn.textContent = 'Simpan';
    if (!res.ok) { toast('Gagal menyimpan: ' + (res.error || 'unknown')); return; }
    await refreshSavedConnections();
    if (!$('connectionsModal').classList.contains('hidden')) await renderSavedConnections();
    S.remotes.forEach((c) => {
      if (c.savedId === res.connection.id) {
        c.label = savedProfileLabel(res.connection);
        c.host = res.connection.host; c.port = res.connection.port; c.username = res.connection.username;
      }
    });
    renderTargetSelect();
    toast('Koneksi diperbarui');
    closeConnectionForm();
  }

  async function openEditConnection(id) {
    const res = await api.getConnection(id);
    if (!res.ok) { toast(res.error || 'Gagal memuat koneksi'); return; }
    closeSavedConnections();
    switchView('workspace');
    openConnectionForm(res.connection);
  }

  function openSavedConnections() {
    renderSavedConnections();
    $('connectionsModal').classList.remove('hidden');
  }

  function closeSavedConnections() {
    $('connectionsModal').classList.add('hidden');
  }

  function savedProfileLabel(item) {
    if (String(item.protocol || '').toLowerCase() === 'sqlite') return 'SQLITE · ' + (baseName(item.filePath) || '(file)');
    return protocolLabel(item.protocol) + ' · ' + (item.username || '?') + '@' + (item.host || '?') + ':' + (item.port || protocolDefaultPort(item.protocol));
  }

  function savedProfileAuth(item) {
    if (String(item.protocol || '').toLowerCase() === 'sqlite') return 'SQLite file lokal';
    if (item.authType === 'key') return 'Private key' + (item.privateKeyName ? ' · ' + item.privateKeyName : '');
    return item.hasPassword ? 'Password' : 'Tanpa password';
  }

  async function renderSavedConnections() {
    const box = $('connectionsList');
    box.innerHTML = '<div class="tree-empty">Memuat koneksi...</div>';
    const res = await api.listConnections();
    if (!res.ok) {
      box.innerHTML = '<div class="tree-empty">Gagal memuat: ' + esc(res.error || 'unknown') + '</div>';
      return;
    }
    box.innerHTML = '';
    const items = res.connections || [];
    if (!items.length) {
      box.innerHTML = '<div class="tree-empty">Belum ada koneksi tersimpan. Isi form “Koneksi baru” dan centang Simpan.</div>';
      return;
    }
    for (const item of items) {
      const card = document.createElement('div');
      card.className = 'connection-item';
      const subtitle = savedProfileLabel(item);
      const auth = savedProfileAuth(item);
      const last = item.lastConnected ? ' · Terakhir dipakai: ' + new Date(item.lastConnected).toLocaleString('id-ID') : '';
      card.innerHTML = '<div class="connection-main"><strong>' + esc(item.name) + '</strong><span>' + esc(subtitle) + '</span><small>' + esc(auth + last) + '</small></div>';
      const actions = document.createElement('div');
      actions.className = 'connection-actions';
      const connect = document.createElement('button');
      connect.className = 'primary small';
      connect.textContent = 'Hubungkan';
      connect.addEventListener('click', async () => {
        connect.disabled = true;
        await connectSavedProfile(item.id);
      });
      const edit = document.createElement('button');
      edit.className = 'ghost small';
      edit.textContent = 'Edit';
      edit.addEventListener('click', () => openEditConnection(item.id));
      const remove = document.createElement('button');
      remove.className = 'ghost small danger';
      remove.textContent = 'Hapus';
      remove.addEventListener('click', async () => {
        if (!confirm('Hapus koneksi "' + item.name + '" dari penyimpanan?')) return;
        const result = await api.removeConnection(item.id);
        if (!result.ok) { toast(result.error || 'Gagal menghapus koneksi'); return; }
        await renderSavedConnections();
        await refreshSavedConnections();
        toast('Koneksi dihapus');
      });
      actions.appendChild(connect);
      actions.appendChild(edit);
      actions.appendChild(remove);
      card.appendChild(actions);
      box.appendChild(card);
    }
  }

  async function connectSavedProfile(id) {
    const profile = S.savedConnections.find((p) => p.id === id);
    if (profile && isDbProtocol(profile.protocol)) {
      const res = await api.dbConnect({ connectionId: id });
      if (!res.ok) { toast('Koneksi gagal: ' + (res.error || 'unknown')); return; }
      const conn = { id: res.id, type: 'db', label: res.label, protocol: res.protocol, host: res.host, port: res.port, username: res.username, savedId: id };
      S.connections = S.connections.filter((c) => c.id !== conn.id);
    S.connections.push(conn);
      S.remotes.set(res.id, conn);
      renderTargetSelect();
      closeSavedConnections();
      resetDbState();
      S.target = { type: 'db', id: res.id };
      renderTargetSelect();
      await ensureWorkspace();
      switchView('workspace');
      toast('Terhubung: ' + res.label);
      return;
    }
    const res = await api.connectSaved(id);
    if (!res.ok) { toast('Koneksi gagal: ' + (res.error || 'unknown')); return; }
    const conn = { id: res.id, type: res.type, label: res.label, home: res.home, dir: res.home, host: res.host, port: res.port, username: res.username, savedId: id };
    S.connections = S.connections.filter((c) => c.id !== conn.id);
    S.connections.push(conn);
    S.remotes.set(res.id, conn);
    renderTargetSelect();
    closeSavedConnections();
    await switchTarget(res.id);
    if (res.type === 'ssh' && !S.termTabs.some((t) => t.kind === 'ssh' && t.sessionId === res.id)) newSshTerminal(res.id);
    switchView('workspace');
    toast('Terhubung: ' + res.label);
  }

  async function disconnectRemote() {
    if (S.target.type === 'db') {
      const id = S.target.id;
      const conn = S.remotes.get(id);
      await api.dbDisconnect(id);
      S.connections = S.connections.filter((c) => c.id !== id);
      S.remotes.delete(id);
      S.target = { type: 'local', id: null };
      exitDbMode();
      renderTargetSelect();
      await ensureWorkspace();
      toast('Koneksi database diputus' + (conn ? ': ' + conn.label : ''));
      return;
    }
    if (S.target.type === 'local') return;
    const id = S.target.id;
    closeAllSshTabs(id);
    await api.remoteDisconnect(id);
    S.connections = S.connections.filter((c) => c.id !== id);
    S.remotes.delete(id);
    S.tabs = S.tabs.filter((t) => t.target.id !== id);
    if (S.active && S.active.target.id === id) {
      S.active = S.tabs[S.tabs.length - 1] || null;
      setActiveSession(S.active);
    }
    renderTabs();
    S.target = { type: 'local', id: null };
    renderTargetSelect();
    await ensureWorkspace();
    toast('Koneksi diputus');
  }

  // ---------- Editor ----------
  function aceSetup() {
    ace.config.set('basePath', 'vendor/ace');
    ace.config.set('modePath', 'vendor/ace');
    ace.config.set('themePath', 'vendor/ace');
    ace.config.set('workerPath', 'vendor/ace');
  }

  function editorThemeName() {
    return localStorage.getItem('sahabat.editorTheme') || 'tomorrow_night';
  }

  function makeEditor(elId) {
    const editor = ace.edit(elId);
    editor.setTheme('ace/theme/' + editorThemeName());
    editor.session.setUseWorker(false);
    editor.setReadOnly(false);
    editor.setOptions({
      fontSize: '13px',
      fontFamily: 'Consolas, ui-monospace, monospace',
      showPrintMargin: false,
      useSoftTabs: true,
      tabSize: 2,
      wrap: false,
      highlightActiveLine: true,
      displayIndentGuides: true,
      showFoldWidgets: true,
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: false
    });
    editor.commands.addCommand({
      name: 'gotoLineCustom',
      bindKey: { win: 'Ctrl-G', mac: 'Cmd-G' },
      exec: () => gotoEditorLine()
    });
    editor.container.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showEditorMenu(e.clientX, e.clientY);
    });
    return editor;
  }

  function applyEditorPreferences() {
    if (!S.editor) return;
    const fontSize = localStorage.getItem('sahabat.editorFontSize') || '13';
    const fontFamily = localStorage.getItem('sahabat.editorFontFamily') || 'Consolas, ui-monospace, monospace';
    const tabSize = parseInt(localStorage.getItem('sahabat.editorTabSize'), 10) || 2;
    const wrap = localStorage.getItem('sahabat.editorWordWrap') === '1';
    try {
      S.editor.setOptions({ fontSize: fontSize + 'px', fontFamily, tabSize, wrap });
    } catch { /* abaikan */ }
    const keymap = localStorage.getItem('sahabat.editorKeymap') || 'vscode';
    try {
      S.editor.setKeyboardHandler('ace/keyboard/' + keymap);
    } catch { /* abaikan */ }
  }

  function tabKey(target, filePath) {
    return (target.id || 'local') + ':' + filePath;
  }

  function renderTabs() {
    const bar = $('tabbar');
    bar.innerHTML = '';
    for (const tab of S.tabs) {
      const el = document.createElement('div');
      el.className = 'tab' + (tab === S.active ? ' active' : '');
      const badge = tab.target.type === 'local' ? '' : '<span class="tab-badge">' + tab.target.type.toUpperCase() + '</span>';
      el.innerHTML = badge + '<span class="tab-name">' + esc(tab.name) + (tab.dirty ? ' •' : '') + '</span><span class="tab-close">×</span>';
      el.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-close')) { closeTab(tab); return; }
        S.active = tab;
        S.editor.setSession(tab.session);
        renderTabs();
        S.editor.focus();
      });
      bar.appendChild(el);
    }
    const maxBtn = document.createElement('button');
    maxBtn.className = 'icon-btn tabbar-max';
    maxBtn.id = 'editorMax';
    maxBtn.type = 'button';
    maxBtn.title = document.querySelector('.app').classList.contains('max-editor')
      ? 'Kembalikan workspace developer' : 'Perbesar workspace developer (sembunyikan terminal)';
    maxBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 4h6M4 4v6M4 4l6 6M20 20h-6M20 20v-6M20 20l-6-6"/></svg>';
    maxBtn.addEventListener('click', () => toggleMaxAppClass('max-editor'));
    bar.appendChild(maxBtn);
  }

  function setActiveSession(tab) {
    if (tab) S.editor.setSession(tab.session);
    else S.editor.setSession(ace.createEditSession(''));
  }

  async function openFile(filePath) {
    const target = { type: S.target.type, id: S.target.id };
    const key = tabKey(target, filePath);
    const existing = S.tabs.find((t) => t.key === key);
    if (existing) {
      S.active = existing;
      S.editor.setSession(existing.session);
      renderTabs();
      S.editor.focus();
      return;
    }
    const res = target.type === 'local'
      ? await api.readFile(filePath)
      : await api.remoteReadFile(target.id, filePath);
    if (!res.ok) { toast(res.error || 'Gagal membuka file'); return; }
    const session = ace.createEditSession(res.content);
    session.setMode(modeFor(filePath));
    session.setUseWorker(false);
    const tab = { key, path: filePath, name: baseName(filePath), session, dirty: false, target };
    session.on('change', () => { if (!tab.dirty) { tab.dirty = true; renderTabs(); } });
    S.tabs.push(tab);
    S.active = tab;
    S.editor.setSession(session);
    renderTabs();
    updateWsWelcome();
    setTimeout(() => S.editor.focus(), 30);
  }

  function closeTab(tab) {
    if (tab.dirty && !confirm('File "' + tab.name + '" belum disimpan. Tutup saja?')) return;
    const idx = S.tabs.indexOf(tab);
    S.tabs.splice(idx, 1);
    if (S.active === tab) {
      S.active = S.tabs[Math.max(0, idx - 1)] || null;
      setActiveSession(S.active);
    }
    renderTabs();
    updateWsWelcome();
  }

  async function saveActive() {
    const tab = S.active;
    if (!tab) return;
    const content = S.editor.getValue();
    const res = tab.target.type === 'local'
      ? await api.writeFile(tab.path, content)
      : await api.remoteWriteFile(tab.target.id, tab.path, content);
    if (!res.ok) { toast(res.error || 'Gagal menyimpan'); return; }
    tab.dirty = false;
    renderTabs();
    await refreshExplorer();
    toast('Tersimpan: ' + tab.name);
  }

  async function createEntry(kind, targetDir) {
    const name = await askText(kind === 'file' ? 'Nama file baru' : 'Nama folder baru', kind === 'file' ? 'mis. index.html' : 'mis. src');
    if (!name) return;
    if (/[\\/]/.test(name)) { toast('Nama tidak boleh mengandung / atau \\'); return; }
    const session = remoteSession();
    let created;
    let full;
    if (session) {
      const parent = targetDir || session.dir || session.home;
      full = joinRemote(parent, name);
      created = kind === 'file' ? await api.remoteWriteFile(session.id, full, '') : await api.remoteMkdir(session.id, full);
    } else {
      if (!S.local.root) { toast('Buka folder dulu.'); return; }
      const parent = targetDir || S.local.root;
      full = joinForTarget(parent, name);
      created = kind === 'file' ? await api.writeFile(full, '') : await api.mkdir(full);
    }
    if (!created.ok) { toast(created.error || 'Gagal membuat'); return; }
    await refreshExplorer();
    if (kind === 'file') openFile(full);
  }

  // ---------- Editor context menu ----------
  function insertAtCursor(text) {
    if (!S.editor) return;
    S.editor.session.insert(S.editor.getCursorPosition(), text);
    S.editor.focus();
  }

  async function gotoEditorLine() {
    const value = await askText('Ke baris', 'Nomor baris', 'Ke baris');
    const line = parseInt(value, 10);
    if (line > 0 && S.editor) {
      S.editor.gotoLine(line, 0, true);
      S.editor.focus();
    }
  }

  function showEditorMenu(x, y) {
    const ed = S.editor;
    if (!ed) return;
    const hasSel = ed.getSelectedText().length > 0;
    showContextMenu(x, y, [
      { label: 'Undo', action: () => { ed.undo(); ed.focus(); } },
      { label: 'Redo', action: () => { ed.redo(); ed.focus(); } },
      { sep: true },
      {
        label: 'Cut', disabled: !hasSel, action: async () => {
          await api.copyText(ed.getSelectedText());
          ed.session.remove(ed.getSelectionRange());
          ed.focus();
        }
      },
      { label: 'Copy', disabled: !hasSel, action: async () => { await api.copyText(ed.getSelectedText()); ed.focus(); } },
      {
        label: 'Paste', action: async () => {
          const res = await api.readClipboard();
          if (res.ok && res.text) insertAtCursor(res.text);
        }
      },
      {
        label: 'Delete', action: () => {
          if (hasSel) ed.session.remove(ed.getSelectionRange());
          else {
            const pos = ed.getCursorPosition();
            ed.session.remove({ start: pos, end: { row: pos.row, column: pos.column + 1 } });
          }
          ed.focus();
        }
      },
      { label: 'Select all', action: () => { ed.selectAll(); ed.focus(); } },
      { sep: true },
      { label: 'Find', action: () => { ed.focus(); ed.execCommand('find'); } },
      { label: 'Replace', action: () => { ed.focus(); ed.execCommand('replace'); } },
      { label: 'Go to line', action: () => gotoEditorLine() },
      { label: 'Toggle comment', action: () => { ed.toggleCommentLines(); ed.focus(); } },
      { sep: true },
      { label: 'Save', disabled: !S.active, action: () => saveActive() }
    ]);
  }

  // ---------- Command Palette ----------
  const PALETTE_ICONS = {
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.6A8.6 8.6 0 0 1 4 11.5 8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5z"/></svg>',
    workspace: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 6 2 12 8 18"/><polyline points="16 6 22 12 16 18"/></svg>',
    models: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    api: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
    extensions: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M10 3h4v3a2 2 0 1 0 4 0h3v4h-3a2 2 0 1 0 0 4h3v4h-4v-3a2 2 0 1 0-4 0v3h-4v-3a2 2 0 1 0-4 0v3H3v-4h3a2 2 0 1 0 0-4H3V6h3a2 2 0 1 0 4 0z"/></svg>',
    folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    terminal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
    panel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="15" y1="4" x2="15" y2="20"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
    conn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="10" rx="2"/><path d="M6 12h2M16 12h2"/></svg>',
    key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 5l2 2M14 8l2 2"/></svg>'
  };

  let paletteItems = [];
  let paletteIndex = 0;
  let paletteOpen = false;

  function paletteActions() {
    const acts = [
      { group: 'Navigasi', icon: 'chat', label: 'Buka Chat', run: () => switchView('chat') },
      { group: 'Navigasi', icon: 'workspace', label: 'Buka Workspace Developer', run: () => switchView('workspace') },
      { group: 'Navigasi', icon: 'models', label: 'Buka Daftar Model', run: () => switchView('models') },
      { group: 'Navigasi', icon: 'api', label: 'Buka API & Snippet', run: () => switchView('api') },
      { group: 'Navigasi', icon: 'extensions', label: 'Buka Extensions', run: () => switchView('extensions') },
      { group: 'Aksi', icon: 'folder', label: 'Buka Folder…', run: () => openFolder() },
      { group: 'Aksi', icon: 'folder', label: 'Clone Repository…', run: () => { const b = $('cloneRepo'); if (b) b.click(); } },
      { group: 'Aksi', icon: 'terminal', label: 'Terminal Baru', run: () => newLocalTerminal(S.local.root) },
      { group: 'Aksi', icon: 'key', label: 'Isi / Ganti API Key', run: () => openSettings() },
      { group: 'Panel', icon: 'panel', label: 'Tampilkan / Sembunyikan Terminal', run: () => toggleTerminalPanel() },
      { group: 'Panel', icon: 'panel', label: 'Tampilkan / Sembunyikan Agent', run: () => toggleAgentPanel() },
      { group: 'Panel', icon: 'panel', label: 'Maksimalkan / Restores Terminal', hint: 'full width', run: () => toggleMaxAppClass('max-terminal') },
      { group: 'Panel', icon: 'panel', label: 'Maksimalkan / Restores Workspace', hint: 'full width', run: () => toggleMaxAppClass('max-editor') },
      { group: 'Panel', icon: 'panel', label: 'Maksimalkan / Restores Agent', hint: 'full width', run: () => toggleMaxAppClass('max-agent') }
    ];
    for (const m of S.models || []) {
      acts.push({
        group: 'Model', icon: 'models', label: 'Pakai model ' + (m.name || m.id), hint: m.id,
        run: () => { setModel(m.id); toast('Model aktif: ' + (m.name || m.id)); }
      });
    }
    for (const c of S.savedConnections || []) {
      acts.push({
        group: 'Koneksi', icon: 'conn', label: 'Hubungkan ' + c.name, hint: (c.protocol || '').toUpperCase() + ' · ' + c.host,
        run: () => { switchView('workspace'); openSavedConnections(); }
      });
    }
    acts.push({ group: 'Pengaturan', icon: 'settings', label: 'Pengaturan…', run: () => openSettings() });
    return acts;
  }

  function paletteSearch(items, q) {
    q = String(q || '').toLowerCase().trim();
    if (!q) return items;
    return items.filter((it) => (it.label + ' ' + (it.hint || '') + ' ' + it.group).toLowerCase().includes(q));
  }

  function updatePaletteActive() {
    document.querySelectorAll('#paletteResults .palette-item').forEach((el, i) => {
      el.classList.toggle('active', i === paletteIndex);
    });
    const active = document.querySelector('#paletteResults .palette-item.active');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }

  function renderPaletteResults(query) {
    const box = $('paletteResults');
    const items = paletteSearch(paletteActions(), query);
    paletteItems = items;
    paletteIndex = 0;
    box.innerHTML = '';
    if (!items.length) {
      box.innerHTML = '<div class="palette-empty">Tidak ada hasil untuk &quot;' + esc(query) + '&quot;</div>';
      $('paletteCount').textContent = '';
      return;
    }
    let lastGroup = '';
    for (const it of items) {
      if (it.group !== lastGroup) {
        lastGroup = it.group;
        const g = document.createElement('div');
        g.className = 'palette-group';
        g.textContent = it.group;
        box.appendChild(g);
      }
      const btn = document.createElement('button');
      btn.className = 'palette-item';
      btn.innerHTML = '<span class="pi-icon">' + (PALETTE_ICONS[it.icon] || PALETTE_ICONS.panel) + '</span>' +
        '<span class="pi-label">' + esc(it.label) + '</span>' +
        (it.hint ? '<span class="pi-hint">' + esc(it.hint) + '</span>' : '');
      btn.addEventListener('click', () => runPaletteItem(it));
      btn.addEventListener('mouseenter', () => { paletteIndex = items.indexOf(it); updatePaletteActive(); });
      box.appendChild(btn);
    }
    $('paletteCount').textContent = items.length + ' hasil';
    updatePaletteActive();
  }

  function runPaletteItem(item) {
    if (!item) return;
    closePalette();
    try { item.run(); } catch (err) { toast('Gagal: ' + (err && err.message ? err.message : err)); }
  }

  function openPalette() {
    paletteOpen = true;
    $('palette').classList.remove('hidden');
    $('paletteInput').value = '';
    renderPaletteResults('');
    setTimeout(() => $('paletteInput').focus(), 20);
  }

  function closePalette() {
    paletteOpen = false;
    $('palette').classList.add('hidden');
    $('paletteInput').blur();
  }

  function paletteKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); paletteIndex = Math.min(paletteIndex + 1, paletteItems.length - 1); updatePaletteActive(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); paletteIndex = Math.max(paletteIndex - 1, 0); updatePaletteActive(); }
    else if (e.key === 'Enter') { e.preventDefault(); runPaletteItem(paletteItems[paletteIndex]); }
    else if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
  }

  // ---------- Status bar ----------
  function updateStatusBar() {
    const sb = $('statusbar');
    if (!sb) return;
    // Target
    const target = S.target || {};
    let targetText = 'Belum ada folder';
    let targetDot = '';
    if (target.type === 'local') {
      targetText = S.local.root ? ('Lokal · ' + S.local.root) : 'Belum ada folder';
      targetDot = S.local.root ? 'ok' : '';
    } else if (target.type === 'ssh' || target.type === 'ftp') {
      const s = remoteSession();
      targetText = s ? (s.label || 'Remote') : 'Remote tidak terhubung';
      targetDot = s ? 'ok' : 'err';
    } else if (target.type === 'db') {
      targetText = 'Database';
      targetDot = 'ok';
    }
    $('sbTargetText').textContent = targetText;
    $('sbTargetDot').className = 'sb-dot ' + targetDot;
    $('sbTargetText').title = targetText;
    // Model
    $('sbModelText').textContent = currentModel();
    // Koneksi
    const activeConn = (S.connections || []).find((c) => c.connected);
    if (activeConn) {
      $('sbConnText').textContent = (activeConn.label || 'Remote');
      $('sbConnDot').className = 'sb-dot ok';
    } else {
      $('sbConnText').textContent = 'Lokal';
      $('sbConnDot').className = 'sb-dot';
    }
    // Key
    const hasKey = S.settings && S.settings.hasKey;
    $('sbKeyText').textContent = hasKey ? ('Key •••• ' + (S.settings.keyHint || '')) : 'Key belum diisi';
    $('sbKeyDot').className = 'sb-dot ' + (hasKey ? 'ok' : 'warn');
    // Versi
    $('sbUpdateText').textContent = 'v' + ((S.settings && S.settings.version) || '1.1.0');
  }

  // ---------- Hero (empty state) ----------
  function updateChatHero() {
    const hero = $('chatHero');
    if (hero) hero.classList.toggle('hidden', (S.chat || []).length > 0);
  }

  function bindHero() {
    document.querySelectorAll('[data-hero]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const act = btn.dataset.hero;
        if (act === 'openFolder') openFolder();
        else if (act === 'workspace') switchView('workspace');
        else if (act === 'settings') openSettings();
        else if (act === 'conn') { switchView('workspace'); openSavedConnections(); }
        else if (act === 'models') switchView('models');
      });
    });
    document.querySelectorAll('[data-ws]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const act = btn.dataset.ws;
        if (act === 'openFolder') openFolder();
        else if (act === 'clone') { const b = $('cloneRepo'); if (b) b.click(); }
        else if (act === 'conn') openSavedConnections();
        else if (act === 'terminal') newLocalTerminal(S.local.root);
        else if (act === 'db') openSavedConnections();
      });
    });
    document.querySelectorAll('[data-agent-prompt]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const input = $('agentInput');
        if (!input) return;
        input.value = btn.dataset.agentPrompt || '';
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      });
    });
  }

  function updateWsWelcome() {
    const w = $('wsWelcome');
    if (!w) return;
    const noRoot = !S.local.root;
    const noTabs = (S.tabs || []).length === 0;
    w.classList.toggle('hidden', !(noRoot || noTabs));
    w.classList.toggle('compact', !noRoot && noTabs);
    const p = w.querySelector('p');
    if (p) {
      p.textContent = noRoot
        ? 'Buka folder atau clone repository untuk mulai. Editor kode, terminal, dan agent AI siap bekerja bersama.'
        : 'Pilih file dari Explorer di kiri untuk mulai editing, atau buat file baru dari sana.';
    }
  }

  // ---------- Panel resize ----------
  function applySideWidth(width, persist) {
    const max = Math.max(200, Math.min(560, window.innerWidth - 620));
    const w = Math.max(168, Math.min(width, max));
    S.ui.sideWidth = w;
    const panel = $('sidepanel');
    panel.style.width = w + 'px';
    panel.style.flex = '0 0 ' + w + 'px';
    if (persist) localStorage.setItem('sahabat.sideWidth', String(w));
    try { S.editor && S.editor.resize(true); } catch {}
  }

  function applyAgentWidth(width, persist) {
    const max = Math.max(260, window.innerWidth - 380);
    const w = Math.max(120, Math.min(width, max));
    S.ui.agentWidth = w;
    document.documentElement.style.setProperty('--agent-width', w + 'px');
    if (persist) localStorage.setItem('sahabat.agentWidth', String(w));
    try { S.editor && S.editor.resize(true); } catch {}
  }

  function applyTermHeight(height, persist) {
    const max = Math.max(140, window.innerHeight - 240);
    const h = Math.max(80, Math.min(height, max));
    S.ui.termHeight = h;
    document.documentElement.style.setProperty('--term-height', h + 'px');
    const pane = $('termPane');
    if (pane) pane.classList.remove('collapsed');
    if (persist) localStorage.setItem('sahabat.termHeight', String(h));
    setTimeout(fitAll, 60);
  }

  function bindResizers() {
    // onDelta(startValue, delta, persist) — startValue diambil SEKALI saat pointerdown
    // agar perubahan 1:1 dengan gerakan mouse (tidak menumpuk).
    const attach = (el, getStart, onDelta, onReset) => {
      if (!el) return;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startVal = getStart();
        el.setPointerCapture(e.pointerId);
        document.body.classList.add('resizing');
        let lastDelta = 0;
        const move = (ev) => {
          lastDelta = ev.clientX - startX;
          onDelta(startVal, lastDelta, false);
        };
        const finish = () => {
          el.removeEventListener('pointermove', move);
          el.removeEventListener('pointerup', finish);
          el.removeEventListener('pointercancel', finish);
          document.body.classList.remove('resizing');
          onDelta(startVal, lastDelta, true);
        };
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerup', finish);
        el.addEventListener('pointercancel', finish);
      });
      el.addEventListener('dblclick', onReset);
    };
    attach($('resizeLeft'), () => S.ui.sideWidth, (start, delta, persist) => {
      applySideWidth(start + delta, persist);
    }, () => applySideWidth(252, true));
    attach($('resizeAgent'), () => S.ui.agentWidth, (start, delta, persist) => {
      applyAgentWidth(start - delta, persist);
    }, () => applyAgentWidth(344, true));
    // Resizer tinggi terminal (vertikal)
    const termEl = $('resizeTerm');
    if (termEl) {
      termEl.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const startY = e.clientY;
        const startH = S.ui.termHeight;
        termEl.setPointerCapture(e.pointerId);
        document.body.classList.add('resizing-term');
        let lastDelta = 0;
        const move = (ev) => {
          lastDelta = ev.clientY - startY;
          applyTermHeight(startH - lastDelta, false);
        };
        const finish = () => {
          termEl.removeEventListener('pointermove', move);
          termEl.removeEventListener('pointerup', finish);
          termEl.removeEventListener('pointercancel', finish);
          document.body.classList.remove('resizing-term');
          applyTermHeight(startH - lastDelta, true);
        };
        termEl.addEventListener('pointermove', move);
        termEl.addEventListener('pointerup', finish);
        termEl.addEventListener('pointercancel', finish);
      });
      termEl.addEventListener('dblclick', () => applyTermHeight(220, true));
    }
  }

  // ---------- Extensions ----------
  function formatDownloads(value) {
    const n = Number(value || 0);
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + ' M unduhan';
    if (n >= 1000) return Math.round(n / 1000).toLocaleString('id-ID') + ' Ribu unduhan';
    return n.toLocaleString('id-ID') + ' unduhan';
  }

  function formatRating(value) {
    const n = Number(value || 0);
    if (!n) return 'Belum ada rating';
    return n.toFixed(1) + ' dari 5 (' + Math.round(n * 10) / 10 + '/5)';
  }

  function extMatches(ext, query) {
    if (!query) return true;
    return (ext.id + ' ' + (ext.name || '') + ' ' + (ext.description || '') + ' ' + (ext.publisher || ext.namespace || '')).toLowerCase().includes(query);
  }

  function openVsxUrl(ext) {
    if (ext.repository && /^https?:\/\//i.test(ext.repository)) return ext.repository;
    if (ext.namespace && ext.name) return 'https://open-vsx.org/extension/' + ext.namespace + '/' + ext.name;
    return 'https://open-vsx.org';
  }

  function extIconHtml(ext, className) {
    if (ext.iconDataUrl) return '<img class="' + className + '" src="' + esc(ext.iconDataUrl) + '" alt="" />';
    if (ext.icon) return '<img class="' + className + '" src="' + esc(ext.icon) + '" alt="" />';
    let hash = 0;
    for (const ch of String(ext.id || ext.name || '?')) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    const hue = hash % 360;
    const letter = String(ext.name || ext.id || '?').trim().charAt(0).toUpperCase() || '?';
    return '<div class="' + className + ' ext-avatar" style="background:hsl(' + hue + ' 65% 34%)">' + esc(letter) + '</div>';
  }

  function findExtension(id) {
    return S.extensions.find((ext) => ext.id === id)
      || S.extCatalog.find((ext) => ext.id === id)
      || S.extMarket.find((ext) => ext.id === id)
      || null;
  }

  function extKindOf(ext) {
    if (S.extensions.includes(ext)) return 'installed';
    if (S.extCatalog.includes(ext)) return 'catalog';
    return 'market';
  }

  function extensionSourceLabel(ext) {
    if (!ext.source) return 'Lokal';
    if (ext.source.registry === 'openvsx') return 'Open VSX';
    if (ext.source.registry === 'folder') return 'Folder';
    if (ext.source.registry === 'vsix') return 'VSIX';
    return 'Ekstensi';
  }

  function addExtAction(container, ext, kind, compact) {
    const source = ext.source || {};
    const update = S.extUpdates[ext.id];
    const makeButton = (label, className, action, title) => {
      const btn = document.createElement('button');
      btn.className = className;
      btn.textContent = label;
      btn.title = title || label;
      btn.addEventListener('click', async (event) => {
        event.stopPropagation();
        btn.disabled = true;
        try { await action(btn); } finally { btn.disabled = false; }
      });
      return btn;
    };

    if (kind === 'installed') {
      if (source.registry === 'openvsx') {
        container.appendChild(makeButton(update ? 'Update v' + update.latest : 'Periksa update', update ? 'primary small' : 'ghost small', async () => {
          await installOpenVsxExtension(source.namespace, source.name, update ? update.latest : undefined);
        }));
      } else if (S.extUpdates[ext.id]) {
        container.appendChild(makeButton('Update v' + S.extUpdates[ext.id].latest, 'primary small', async () => {
          await installOpenVsxExtension(source.namespace, source.name, S.extUpdates[ext.id].latest);
        }));
      }
      container.appendChild(makeButton(ext.enabled ? 'Disable' : 'Enable', 'ghost small', async () => {
        const res = await api.extSetEnabled(ext.id, !ext.enabled);
        if (!res.ok) { toast(res.error || 'Gagal mengubah status'); return; }
        await refreshExtensions();
        toast(ext.enabled ? 'Dinonaktifkan: ' + ext.name : 'Diaktifkan: ' + ext.name);
      }));
      container.appendChild(makeButton('Hapus', 'ghost small danger', async () => {
        if (!confirm('Hapus ekstensi ' + ext.name + '?')) return;
        const res = await api.extRemove(ext.id);
        if (!res.ok) { toast(res.error || 'Gagal menghapus'); return; }
        if (S.extSelected === ext.id) S.extSelected = null;
        await refreshExtensions();
        toast('Dihapus: ' + ext.name);
      }));
    } else if (kind === 'catalog') {
      container.appendChild(makeButton('Install', 'primary small', async () => {
        const res = await api.extInstallBuiltin(ext.id);
        if (!res.ok) { toast(res.error || 'Gagal install'); return; }
        await refreshExtensions();
        toast('Terpasang: ' + ext.name);
      }));
    } else {
      container.appendChild(makeButton('Install', 'primary small', async () => {
        await installOpenVsxExtension(ext.namespace, ext.name, ext.version);
      }));
      container.appendChild(makeButton('Open VSX', 'ghost small', async () => {
        const res = await api.extOpenExternal(openVsxUrl(ext));
        if (!res.ok) toast(res.error || 'Gagal membuka Open VSX');
      }));
    }
  }

  async function installOpenVsxExtension(namespace, name, version) {
    const button = document.querySelector('#extUpdateAll');
    const previous = button && button.textContent;
    if (button) { button.disabled = true; button.textContent = 'Mengunduh...'; }
    try {
      const res = await api.extInstallOpenVsx({ namespace, name, version });
      if (!res.ok) { toast(res.error || 'Gagal install dari Open VSX'); return; }
      await refreshExtensions();
      S.extSelected = res.id;
      renderExtensions();
      toast('Terpasang: ' + (res.name || name));
    } finally {
      if (button) { button.disabled = false; button.textContent = previous || ('Update semua (' + Object.keys(S.extUpdates).length + ')'); }
    }
  }

  function selectExtension(id) {
    S.extSelected = id;
    renderExtensions();
    renderExtensionDetail();
  }

  function extSideItem(ext, kind) {
    const row = document.createElement('div');
    row.className = 'ext-side-item' + (S.extSelected === ext.id ? ' selected' : '');
    row.setAttribute('role', 'button');
    row.tabIndex = 0;
    row.title = ext.id;

    const icon = extIconHtml(ext, 'ext-icon');
    const verified = ext.verified ? '<span class="ext-verified" title="Penerbit terverifikasi">✓</span>' : '';
    const source = extensionSourceLabel(ext);
    const update = S.extUpdates[ext.id];
    const downloadText = ext.downloadCount ? formatDownloads(ext.downloadCount) : '';

    row.innerHTML = icon
      + '<div class="ext-side-main">'
      + '<div class="ext-name-line"><span class="ext-name">' + esc(ext.name) + '</span>'
      + (update ? '<span class="ext-version-update">v' + esc(update.latest) + '</span>' : '<span class="ext-version">v' + esc(ext.version || '1.0.0') + '</span>')
      + '</div>'
      + '<div class="ext-byline">' + verified + '<span>' + esc(ext.publisher || ext.namespace || 'unknown') + '</span><span>·</span><span>' + esc(source) + '</span>'
      + (downloadText ? '<span class="ext-download">' + esc(downloadText) + '</span>' : '')
      + '</div>'
      + '<div class="ext-description">' + esc(ext.description || '') + '</div>'
      + '</div>'
      + '<div class="ext-row-action"></div>';

    const action = row.querySelector('.ext-row-action');
    if (kind === 'installed' && S.extUpdates[ext.id]) {
      const source = ext.source || {};
      const btn = document.createElement('button');
      btn.className = 'primary small';
      btn.textContent = 'Update';
      btn.title = 'Update ke v' + S.extUpdates[ext.id].latest;
      btn.addEventListener('click', async (event) => {
        event.stopPropagation();
        btn.disabled = true;
        await installOpenVsxExtension(source.namespace, source.name, S.extUpdates[ext.id].latest);
      });
      action.appendChild(btn);
    } else if (kind === 'catalog') {
      const btn = document.createElement('button');
      btn.className = 'primary small';
      btn.textContent = 'Install';
      btn.addEventListener('click', async (event) => {
        event.stopPropagation();
        btn.disabled = true;
        const res = await api.extInstallBuiltin(ext.id);
        btn.disabled = false;
        if (!res.ok) { toast(res.error || 'Gagal install'); return; }
        await refreshExtensions();
      });
      action.appendChild(btn);
    } else if (kind === 'market') {
      const btn = document.createElement('button');
      btn.className = 'primary small';
      btn.textContent = 'Install';
      btn.addEventListener('click', async (event) => {
        event.stopPropagation();
        btn.disabled = true;
        await installOpenVsxExtension(ext.namespace, ext.name, ext.version);
      });
      action.appendChild(btn);
    }
    row.addEventListener('click', () => selectExtension(ext.id));
    row.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectExtension(ext.id);
      }
    });
    return row;
  }

  function updateAllButton() {
    const count = Object.keys(S.extUpdates).length;
    const btn = $('extUpdateAll');
    if (!btn) return;
    btn.classList.toggle('hidden', count === 0);
    btn.textContent = 'Update semua (' + count + ')';
  }

  function renderExtensions() {
    const box = $('extList');
    const status = $('extStatus');
    if (!box) return;
    box.innerHTML = '';
    const query = S.extSearchTerm.toLowerCase().trim();
    const match = (ext) => extMatches(ext, query);
    const filter = S.extFilter || 'all';
    const installed = S.extensions.filter(match);
    const catalog = S.extCatalog.filter((ext) => !ext.installed && match(ext));
    const market = S.extMarket;
    const updates = installed.filter((ext) => S.extUpdates[ext.id]);
    const showInstalledSection = filter === 'all' || filter === 'installed' || filter === 'updates';
    const showCatalogSection = filter === 'all' || filter === 'recommended' || filter === 'builtin';
    const showMarketSection = filter === 'all' || filter === 'recommended';

    const addGroup = (name, count) => {
      const head = document.createElement('div');
      head.className = 'ext-group';
      head.textContent = count === undefined ? name : name + ' · ' + count;
      box.appendChild(head);
    };
    if (showInstalledSection) {
      const rows = filter === 'updates' ? updates : installed;
      if (rows.length) {
        addGroup(filter === 'updates' ? 'UPDATE TERSEDIA' : 'TERPASANG', rows.length);
        for (const ext of rows) box.appendChild(extSideItem(ext, 'installed'));
      }
    }
    if (showCatalogSection && catalog.length) {
      addGroup('REKOMENDASI BAWAAN', catalog.length);
      for (const ext of catalog) box.appendChild(extSideItem(ext, 'catalog'));
    }
    if (showMarketSection) {
      addGroup(query ? 'OPEN VSX' : 'REKOMENDASI TERATAS', S.extMarketLoading ? 'mencari...' : market.length);
      if (S.extMarketLoading) {
        const note = document.createElement('div');
        note.className = 'tree-empty';
        note.textContent = 'Memuat ekstensi dari Open VSX...';
        box.appendChild(note);
      } else if (market.length) {
        for (const ext of market) box.appendChild(extSideItem(ext, 'market'));
      } else {
        const note = document.createElement('div');
        note.className = 'tree-empty';
        note.textContent = 'Tidak ada ekstensi cocok di Open VSX.';
        box.appendChild(note);
      }
    }
    if (!box.children.length) {
      const empty = document.createElement('div');
      empty.className = 'tree-empty';
      if (filter === 'updates') empty.textContent = 'Semua ekstensi sudah terbaru.';
      else if (query) empty.textContent = 'Tidak ada hasil untuk "' + query + '".';
      else empty.textContent = 'Belum ada ekstensi. Klik Install atau cari di Open VSX.';
      box.appendChild(empty);
    }
    if (status) {
      const enabled = S.extensions.filter((ext) => ext.enabled).length;
      status.textContent = S.extensions.length + ' terpasang · ' + enabled + ' aktif · ' + Object.keys(S.extUpdates).length + ' update';
    }
    updateAllButton();
  }

  function renderExtensionDetail() {
    const target = $('extDetail');
    if (!target) return;
    const ext = S.extSelected ? findExtension(S.extSelected) : null;
    if (!ext) {
      target.innerHTML = '<div class="ext-welcome"><div class="ext-welcome-icon"><svg viewBox="0 0 24 24"><path d="M10 3h4v3a2 2 0 1 0 4 0h3v4h-3a2 2 0 1 0 0 4h3v4h-4v-3a2 2 0 1 0-4 0v3h-4v-3a2 2 0 1 0-4 0v3H3v-4h3a2 2 0 1 0 0-4H3V6h3a2 2 0 1 0 4 0z"/></svg></div>'
        + '<h1>Extensions</h1><p>Pasang snippet dan bahasa untuk mempercepat kerja.</p>'
        + '<div class="ext-welcome-grid"><div class="ext-welcome-item"><strong>Cari</strong><span>Ketik nama bahasa, mis. python, php, react.</span></div>'
        + '<div class="ext-welcome-item"><strong>Install</strong><span>Ambil langsung dari Open VSX atau dari file .zip.</span></div>'
        + '<div class="ext-welcome-item"><strong>Update</strong><span>Informasi update muncul otomatis.</span></div></div></div>';
      return;
    }
    const kind = extKindOf(ext);
    const byline = (ext.verified ? '<span class="ext-verified-large">✓ Terverifikasi</span>' : '')
      + '<span>' + esc(ext.publisher || ext.namespace || 'Unknown') + '</span>'
      + '<span>·</span><span>' + esc(extensionSourceLabel(ext)) + '</span>';
    const languages = (ext.contributes && ext.contributes.languages) ? Object.keys(ext.contributes.languages).slice(0, 12) : [];
    const snippetScopes = ext.snippets ? Object.keys(ext.snippets) : Object.keys((ext.contributes && ext.contributes.snippets) || {});
    target.innerHTML = '<div class="ext-detail-header">' + extIconHtml(ext, 'ext-icon-large')
      + '<div class="ext-detail-title"><div class="ext-detail-name">' + esc(ext.name) + '</div>'
      + '<div class="ext-detail-byline">' + byline + '</div></div>'
      + '<div class="ext-detail-actions" id="extDetailActions"></div></div>'
      + '<div class="ext-detail-stats">'
      + '<div><label>Versi</label><strong>' + esc(ext.version || '-') + '</strong></div>'
      + '<div><label>Download</label><strong>' + esc(formatDownloads(ext.downloadCount || 0)) + '</strong></div>'
      + '<div><label>Rating</label><strong>' + esc(formatRating(ext.rating)) + '</strong></div>'
      + '<div><label>Source</label><strong>' + esc(extensionSourceLabel(ext)) + '</strong></div>'
      + '</div>'
      + '<div class="ext-detail-section"><h2>Deskripsi</h2><p>' + esc(ext.description || 'Tidak ada deskripsi.') + '</p></div>'
      + '<div class="ext-detail-section"><h2>Kontribusi</h2><div class="ext-contribute-list">'
      + (languages.length ? languages.map((name) => '<span class="ext-badge">.' + esc(name) + '</span>').join('') : '<span class="muted">Tidak memetakan ekstensi file.</span>')
      + (snippetScopes.length ? '<div class="ext-scopes"><label>Snippet</label><div>' + snippetScopes.map((scope) => '<span class="ext-badge">' + esc(scope) + '</span>').join('') + '</div></div>' : '')
      + '</div></div>'
      + '<div class="ext-detail-section"><h2>Kemampuan</h2><ul class="ext-detail-list"><li>Autocomplete berbasis snippet Ace</li><li>Pewarnaan sintaks untuk bahasa yang tersedia</li><li>Install/update/hapus tanpa restart penuh</li></ul></div>';
    const actions = target.querySelector('#extDetailActions');
    addExtAction(actions, ext, kind, false);
  }

  function scheduleMarketplaceSearch(query) {
    const q = String(query || '').trim();
    S.extSearchTerm = q;
    clearTimeout(S.extSearchTimer);
    S.extMarket = [];
    S.extMarketLoading = q.length >= 2;
    renderExtensions();
    if (q.length < 2) return;
    S.extSearchTimer = setTimeout(async () => {
      const res = await api.extSearchOpenVsx(q);
      if (S.extSearchTerm !== q) return;
      S.extMarketLoading = false;
      if (!res.ok) { toast(res.error || 'Gagal mencari di Open VSX'); renderExtensions(); return; }
      S.extMarket = res.extensions || [];
      renderExtensions();
    }, 350);
  }

  async function loadRecommendedExtensions(force) {
    if (!force && S.extMarketLoaded && S.extSearchTerm === '') return;
    S.extMarketLoading = true;
    S.extMarket = [];
    renderExtensions();
    const res = await api.extSearchOpenVsx('snippets');
    S.extMarketLoading = false;
    if (!res.ok) { toast(res.error || 'Gagal memuat Open VSX'); renderExtensions(); return; }
    S.extMarketLoaded = true;
    S.extMarket = res.extensions || [];
    renderExtensions();
  }

  async function refreshExtensions() {
    const res = await api.extList();
    if (!res.ok) { toast(res.error || 'Gagal memuat ekstensi'); return; }
    S.extensions = res.extensions || [];
    S.extCatalog = res.catalog || [];
    renderExtensions();
    renderExtensionDetail();
    applyExtensions();
    checkExtensionUpdates();
  }

  async function checkExtensionUpdates() {
    const res = await api.extCheckUpdates();
    if (!res.ok) return;
    S.extUpdates = {};
    for (const item of res.updates || []) S.extUpdates[item.id] = item;
    renderExtensions();
    renderExtensionDetail();
  }

  function applyExtensions() {
    for (const key of Object.keys(EXT_MODES)) delete EXT_MODES[key];
    const snippetManager = (ace.require('ace/snippets') || {}).snippetManager;
    for (const ext of S.extensions) {
      if (!ext.enabled) continue;
      const langs = (ext.contributes && ext.contributes.languages) || {};
      for (const [extName, mode] of Object.entries(langs)) {
        if (mode) EXT_MODES[extName] = mode;
      }
      const stamp = ext.id + '@' + (ext.version || '1');
      if (S.extApplied.has(stamp)) continue;
      if (snippetManager && typeof snippetManager.parseSnippetFile === 'function') {
        for (const [scope, text] of Object.entries(ext.snippets || {})) {
          try {
            const parsed = snippetManager.parseSnippetFile(text);
            if (parsed && parsed.length) snippetManager.register(parsed, scope);
          } catch {}
        }
      }
      if (ext.contributes && ext.contributes.editorTheme && !localStorage.getItem('sahabat.editorTheme')) {
        const theme = String(ext.contributes.editorTheme).replace('ace/theme/', '');
        localStorage.setItem('sahabat.editorTheme', theme);
        try { S.editor && S.editor.setTheme('ace/theme/' + theme); } catch {}
      }
      S.extApplied.add(stamp);
    }
    if (S.active) S.editor && S.editor.session.setMode(modeFor(S.active.path));
  }

  async function installExtension(kind) {
    const res = kind === 'folder' ? await api.extInstallFolder() : await api.extInstallZip();
    if (res.canceled) return;
    if (!res.ok) { toast(res.error || 'Gagal install'); return; }
    await refreshExtensions();
    toast('Terpasang: ' + (res.name || res.id) + ' v' + (res.version || ''));
    switchView('extensions');
  }

  // ---------- Explorer actions ----------
  function targetFolder(node) {
    return node.dir ? node.path : parentPathOf(node.path);
  }

  async function uploadInto(folder, mode) {
    const res = await api.uploadEntry({ mode, dstTarget: currentTarget(), dstDir: folder });
    if (res.canceled) return;
    if (!res.ok) { toast(res.error || 'Gagal mengunggah'); return; }
    await refreshExplorer();
    toast((res.uploaded || []).length + ' item diunggah ke ' + folder);
  }

  async function downloadEntryFor(node) {
    const res = await api.downloadEntry({
      srcTarget: currentTarget(),
      srcPath: node.path,
      isDir: node.dir,
      name: node.name
    });
    if (res.canceled) return;
    if (!res.ok) { toast(res.error || 'Gagal mengunduh'); return; }
    toast('Diunduh: ' + (res.path || node.name));
  }

  async function openInTerminal(node) {
    if (!node.dir) { toast('Pilih folder untuk dibuka di terminal.'); return; }
    if (S.target.type === 'local') {
      await newLocalTerminal(node.path);
      toast('Terminal dibuka di ' + node.path);
      return;
    }
    if (S.target.type === 'db') { toast('Koneksi database tidak mendukung terminal.'); return; }
    if (S.target.type !== 'ssh') { toast('Terminal remote hanya tersedia untuk SSH.'); return; }
    const safe = String(node.path).replace(/'/g, `'\''`);
    const tab = await newSshTerminal(S.target.id);
    if (!tab) return;
    setTimeout(() => {
      try { api.remoteInput(S.target.id, tab.shellId, 'cd ' + safe + '\r'); } catch { }
    }, 350);
    toast('Terminal SSH dibuka di ' + node.path);
  }

  function syncMapDrivePathLabel() {
    $('mapDrivePath').textContent = $('mapRoot').checked ? '/' : (S.mapTarget || '/');
  }

  async function renderMapRequirement() {
    const box = $('mapRequirement');
    if (!box) return;
    const method = $('mapMethod').value;
    if (method === 'smb') { box.classList.add('hidden'); return; }
    const res = await api.mapRequirements();
    const rclone = res.ok && res.rclone;
    const winfsp = res.ok && res.winfsp;
    const sshfs = res.ok && res.sshfs;
    const missing = method === 'sshfs'
      ? [...(sshfs ? [] : ['SSHFS-Win']), ...(winfsp ? [] : ['WinFsp'])]
      : [...(rclone ? [] : ['rclone']), ...(winfsp ? [] : ['WinFsp'])];
    box.classList.toggle('hidden', missing.length === 0);
    $('mapRequirementText').textContent = missing.length
      ? 'Mount butuh ' + missing.join(' dan ') + '.'
      : '';
    $('mapInstallRclone').classList.toggle('hidden', method === 'sshfs');
    $('mapInstallRclone').disabled = Boolean(rclone);
    $('mapInstallRclone').textContent = rclone ? 'rclone terinstall ✓' : 'Install rclone otomatis';
    $('mapInstallWinFsp').disabled = Boolean(winfsp);
    $('mapInstallWinFsp').textContent = winfsp ? 'WinFsp terinstall ✓' : 'Install WinFsp...';
    $('mapInstallSshfs').classList.toggle('hidden', method !== 'sshfs');
    $('mapInstallSshfs').disabled = Boolean(sshfs);
    $('mapInstallSshfs').textContent = sshfs ? 'SSHFS-Win terinstall ✓' : 'Install SSHFS-Win...';
  }

  async function installMapRequirement(kind) {
    const button = $(kind === 'rclone' ? 'mapInstallRclone' : 'mapInstallWinFsp');
    const label = button.textContent;
    button.disabled = true;
    button.textContent = kind === 'rclone' ? 'Mengunduh rclone...' : 'Mengunduh WinFsp...';
    const res = kind === 'rclone' ? await api.mapInstallRclone() : await api.mapInstallWinFsp();
    button.disabled = false;
    if (!res.ok) {
      $('mapHint').textContent = res.error || 'Gagal install';
      button.textContent = label;
      return;
    }
    $('mapHint').textContent = res.message || 'Terpasang.';
    toast(res.message || 'Terpasang');
    await renderMapRequirement();
  }

  function syncMapMethod() {
    const method = $('mapMethod').value;
    const sshLike = method === 'rclone' || method === 'sshfs';
    $('mapRcloneSection').classList.toggle('hidden', !sshLike);
    $('mapSmbSection').classList.toggle('hidden', method !== 'smb');
    $('mapKeyRow').classList.toggle('hidden', method === 'sshfs');
    $('mapCacheRow').classList.toggle('hidden', method === 'sshfs');
    $('mapRcloneHint').classList.toggle('hidden', method === 'sshfs');
    $('mapSshfsNote').classList.toggle('hidden', method !== 'sshfs');
    $('mapPassword').placeholder = method === 'sshfs'
      ? 'Kosongkan untuk pakai %USERPROFILE%\\.ssh\\id_rsa'
      : 'Kosongkan untuk pakai SSH agent / private key';
    $('mapHint').textContent = '';
    renderMapRequirement();
  }

  // ID koneksi tersimpan (profil) milik sesi SSH/DB yang aktif, atau null.
  function activeSavedSshId() {
    if (S.target.type !== 'ssh' && S.target.type !== 'db') return null;
    const s = remoteSession();
    return s && s.savedId ? s.savedId : null;
  }

  function openMapDrive(node) {
    if (node && !node.dir) { toast('Pilih folder VPS untuk map drive.'); return; }
    if (S.target.type !== 'ssh') { toast('Map drive VPS hanya tersedia untuk koneksi SSH/SFTP.'); return; }
    const conn = S.connections.find((item) => item.id === S.target.id) || {};
    S.mapTarget = node ? node.path : '/';
    $('mapRoot').checked = true;
    syncMapDrivePathLabel();
    $('mapMethod').value = 'sshfs';
    $('mapNetworkMode').checked = true;
    $('mapCacheMode').value = 'full';
    $('mapHost').value = conn.host || '';
    $('mapPort').value = conn.port || 22;
    $('mapUser').value = conn.username || '';
    $('mapPassword').value = '';
    $('mapKey').value = '';
    $('mapUnc').value = conn.host ? '\\\\' + conn.host + '\\share' + (node && node.path ? '\\' + node.path.replace(/^\/+/, '').replace(/\//g, '\\') : '') : '';
    $('mapSmbUser').value = conn.username || '';
    $('mapSmbPassword').value = '';
    $('mapHint').textContent = '';
    syncMapMethod();
    $('mapModal').classList.remove('hidden');
    setTimeout(() => $('mapHost').focus(), 60);
  }

  function closeMapDrive() {
    $('mapModal').classList.add('hidden');
    S.mapTarget = null;
  }

  async function submitMapDrive() {
    const method = $('mapMethod').value;
    const drive = $('mapDriveLetter').value;
    const submit = $('mapSubmit');
    submit.disabled = true;
    submit.textContent = 'Membuat drive...';
    const payload = { method, drive, remotePath: $('mapRoot').checked ? '/' : (S.mapTarget || '/'), networkMode: $('mapNetworkMode').checked };

    if (method === 'rclone' || method === 'sshfs') {
      payload.host = $('mapHost').value.trim();
      payload.port = Number($('mapPort').value) || 22;
      payload.username = $('mapUser').value.trim();
      payload.password = $('mapPassword').value;
      if (method === 'rclone') {
        payload.privateKey = $('mapKey').value.trim();
        payload.cacheMode = $('mapCacheMode').value;
      }
    } else {
      payload.unc = $('mapUnc').value.trim();
      payload.username = $('mapSmbUser').value.trim();
      payload.password = $('mapSmbPassword').value;
      payload.persistent = $('mapPersistent').checked;
    }

    const res = await api.mapDrive(payload);
    submit.disabled = false;
    submit.textContent = 'Map drive';
    if (!res.ok) { $('mapHint').textContent = res.error || 'Gagal membuat drive'; return; }
    toast('Drive ' + drive + ': terpasang');
    closeMapDrive();
  }

  // ---------- Terminal (multi-tab, unlimited) ----------
  const TERM_THEME = { background: '#0b0e13', foreground: '#e6e9ef', cursor: '#3b82f6', selectionBackground: '#264f78', black: '#0b0e13', brightBlack: '#6b7280' };

  function activeTerm() { return S.termTabs.find((t) => t.uid === S.termActiveUid) || null; }

  function fitActiveTerm() {
    const t = activeTerm();
    if (t) { try { t.fit.fit(); } catch {} }
  }

  function fitAll() { for (const tab of S.termTabs) { try { tab.fit.fit(); } catch {} } }

  function setTermPaneClosed(closed) {
    $('termPane').classList.toggle('closed', closed);
    $('openTerminal').classList.toggle('hidden', !closed);
    setTimeout(fitActiveTerm, 80);
    updateTermFoot();
  }

  function showTermPane() { setTermPaneClosed(false); }

  function setTermLabel() {
    const t = activeTerm();
    $('termLabel').textContent = t ? (t.kind === 'ssh' ? 'SSH · ' : '') + t.label : '';
    syncMenuTerminals();
    updateTermFoot();
  }

  // ---------- Terminal: status bar + indikator bekerja (ala VS Code) ----------
  function updateTermFoot() {
    const foot = $('termFoot');
    if (!foot) return;
    const tab = activeTerm();
    const dot = $('termFootDot');
    const shellEl = $('termFootShell');
    const cwdEl = $('termFootCwd');
    const stateEl = $('termFootState');
    if (!tab) {
      dot.className = 'term-foot-dot';
      shellEl.textContent = '';
      cwdEl.textContent = '';
      stateEl.textContent = '';
      stateEl.className = 'term-foot-state';
      return;
    }
    dot.className = 'term-foot-dot ' + tab.kind;
    shellEl.textContent = tab.kind === 'ssh' ? 'ssh' : (tab.shellName || 'powershell');
    cwdEl.textContent = tab.cwd || '';
    cwdEl.title = tab.cwd || '';
    const dead = (tab.kind === 'local' && tab.ptyId === null) || (tab.kind === 'ssh' && !tab.shellId);
    if (dead) {
      stateEl.textContent = 'berhenti';
      stateEl.className = 'term-foot-state dead';
    } else if (tab.busy) {
      stateEl.textContent = 'bekerja';
      stateEl.className = 'term-foot-state busy';
    } else {
      stateEl.textContent = 'siap';
      stateEl.className = 'term-foot-state idle';
    }
  }

  function markTermActivity(tab) {
    if (!tab) return;
    tab.lastActivity = Date.now();
    const wasBusy = tab.busy;
    tab.busy = true;
    if (!wasBusy) {
      const chip = document.querySelector('.term-tab[data-uid="' + tab.uid + '"]');
      if (chip) {
        const dot = chip.querySelector('.term-dot, .term-spinner');
        if (dot) dot.outerHTML = '<span class="term-spinner"></span>';
      }
      updateTermFoot();
    }
    clearTimeout(tab.busyTimer);
    tab.busyTimer = setTimeout(() => {
      tab.busy = false;
      const chip = document.querySelector('.term-tab[data-uid="' + tab.uid + '"]');
      if (chip) {
        const spin = chip.querySelector('.term-spinner');
        if (spin) spin.outerHTML = '<span class="term-dot ' + tab.kind + '"></span>';
      }
      updateTermFoot();
    }, 1500);
  }

  function syncMenuTerminals() {
    try {
      api.menuSyncTerminals(S.termTabs.map((t) => ({ uid: t.uid, label: t.label, kind: t.kind, active: t.uid === S.termActiveUid })));
    } catch { /* abaikan */ }
  }

  function renderTermTabs() {
    const box = $('termTabs');
    const ph = $('termPlaceholder');
    if (ph) ph.classList.toggle('hidden', S.termTabs.length > 0);
    box.innerHTML = '';
    if (!S.termTabs.length) {
      box.innerHTML = '<span class="term-empty">Belum ada terminal. Klik + untuk terminal lokal; koneksi SSH menambah tab SSH.</span>';
      setTermLabel();
      return;
    }
    for (const tab of S.termTabs) {
      const chip = document.createElement('button');
      chip.className = 'term-tab' + (tab.uid === S.termActiveUid ? ' active' : '');
      chip.dataset.uid = tab.uid;
      chip.title = (tab.kind === 'ssh' ? 'SSH · ' : 'Lokal · ') + tab.label + (tab.cwd ? ' — ' + tab.cwd : '');
      const dotOrSpin = tab.busy
        ? '<span class="term-spinner"></span>'
        : '<span class="term-dot ' + tab.kind + '"></span>';
      chip.innerHTML = dotOrSpin + '<span>' + esc(tab.label) + '</span><span class="term-tab-close" data-close="1">×</span>';
      chip.addEventListener('click', (e) => {
        if (e.target && e.target.closest && e.target.closest('[data-close]')) { closeTerminalTab(tab.uid); return; }
        activateTerminalTab(tab.uid);
      });
      box.appendChild(chip);
    }
    setTermLabel();
  }

  function activateTerminalTab(uid) {
    S.termActiveUid = uid;
    for (const tab of S.termTabs) {
      const on = tab.uid === uid;
      tab.host.classList.toggle('active', on);
      if (on) { try { tab.fit.fit(); tab.term.focus(); } catch {} }
    }
    renderTermTabs();
  }

  function makeTermHost() {
    const host = document.createElement('div');
    host.className = 'term-host-tab';
    $('termHosts').appendChild(host);
    return host;
  }

  function createXterm(host, convertEol) {
    const term = new Terminal({
      fontSize: 12,
      fontFamily: 'Consolas, ui-monospace, monospace',
      cursorBlink: true,
      convertEol: Boolean(convertEol),
      theme: TERM_THEME
    });
    const fit = new FitAddon.FitAddon();
    term.loadAddon(fit);
    term.open(host);
    return { term, fit };
  }

  function sshTabLabel(sessionId) {
    const s = S.remotes.get(sessionId);
    const base = s ? String(s.label || '').replace(/^(SSH|FTP|SFTP)\s*[·:]?\s*/i, '') || 'SSH' : 'SSH';
    const count = S.termTabs.filter((t) => t.kind === 'ssh' && t.sessionId === sessionId).length;
    return count ? base + ' #' + (count + 1) : base;
  }

  function addLocalTab(ptyId, label, cwd) {
    const uid = 't' + (++S.termSeq);
    const host = makeTermHost();
    const made = createXterm(host, true);
    const tab = { uid, kind: 'local', ptyId, shellId: null, sessionId: null, label: label || 'Lokal', cwd: cwd || '', host, term: made.term, fit: made.fit, busy: false, lastActivity: 0, busyTimer: null };
    made.term.onData((d) => { if (tab.ptyId) api.terminalInput(tab.ptyId, d); });
    made.term.onResize(({ cols, rows }) => { if (tab.ptyId) api.termResize(tab.ptyId, cols, rows); });
    S.termTabs.push(tab);
    renderTermTabs();
    activateTerminalTab(uid);
    return tab;
  }

  function addSshTab(shellId, sessionId, cwd) {
    const uid = 't' + (++S.termSeq);
    const host = makeTermHost();
    const made = createXterm(host, false);
    const tab = { uid, kind: 'ssh', ptyId: null, shellId, sessionId, label: sshTabLabel(sessionId), cwd: cwd || '', host, term: made.term, fit: made.fit, busy: false, lastActivity: 0, busyTimer: null };
    made.term.onData((d) => { if (tab.shellId) api.remoteInput(tab.sessionId, tab.shellId, d); });
    made.term.onResize(({ cols, rows }) => { if (tab.shellId) api.remoteResize(tab.sessionId, tab.shellId, cols, rows); });
    S.termTabs.push(tab);
    renderTermTabs();
    activateTerminalTab(uid);
    return tab;
  }

  async function newLocalTerminal(cwd) {
    showTermPane();
    const dir = cwd || S.local.root || undefined;
    const res = await api.startTerminal({ cwd: dir });
    if (!res.ok) { toast('Gagal membuka terminal: ' + (res.error || 'unknown')); return null; }
    const tab = addLocalTab(res.id, dir ? (baseName(dir) || 'Lokal') : 'Lokal', res.cwd || dir || '');
    tab.shellName = res.shell ? baseName(res.shell).replace(/\.exe$/i, '') : 'powershell';
    tab.term.writeln('SahabatMobile terminal - ' + (res.shell || 'shell'));
    updateTermFoot();
    return tab;
  }

  async function newSshTerminal(sessionId) {
    const session = S.remotes.get(sessionId);
    if (!session || session.type !== 'ssh') { toast('Terminal SSH hanya untuk koneksi SSH.'); return null; }
    showTermPane();
    const res = await api.remoteShell(sessionId, 120, 30);
    if (!res.ok) { toast('Gagal membuka shell SSH: ' + (res.error || 'unknown')); return null; }
    const tab = addSshTab(res.shellId, sessionId, session ? (session.dir || session.home || '') : '');
    try {
      tab.fit.fit();
      api.remoteResize(sessionId, res.shellId, tab.term.cols, tab.term.rows);
    } catch { /* abaikan */ }
    return tab;
  }

  async function closeTerminalTab(uid) {
    const i = S.termTabs.findIndex((t) => t.uid === uid);
    if (i < 0) return;
    const tab = S.termTabs[i];
    S.termTabs.splice(i, 1);
    try { if (tab.kind === 'local' && tab.ptyId) await api.stopTerminal(tab.ptyId); } catch { /* abaikan */ }
    try { if (tab.kind === 'ssh' && tab.sessionId && tab.shellId) await api.remoteCloseShell(tab.sessionId, tab.shellId); } catch { /* abaikan */ }
    try { clearTimeout(tab.busyTimer); } catch { /* abaikan */ }
    tab.busy = false;
    try { tab.term.dispose(); } catch { /* abaikan */ }
    try { tab.host.remove(); } catch { /* abaikan */ }
    if (S.termActiveUid === uid) {
      const next = S.termTabs[i - 1] || S.termTabs[i] || null;
      S.termActiveUid = next ? next.uid : null;
      if (next) activateTerminalTab(next.uid); else renderTermTabs();
    } else {
      renderTermTabs();
    }
  }

  function closeAllSshTabs(sessionId) {
    for (const tab of [...S.termTabs]) {
      if (tab.kind === 'ssh' && tab.sessionId === sessionId) closeTerminalTab(tab.uid);
    }
  }

  // ---------- Menu bar (File / Edit / View / Terminal / Help) ----------
  function toggleSidebarPanel() {
    const app = document.querySelector('.app');
    if (app.classList.contains('hide-side')) { app.classList.remove('hide-side'); $('explorerRail').classList.add('hidden'); }
    else { app.classList.add('hide-side'); $('explorerRail').classList.remove('hidden'); }
    setTimeout(() => { try { S.editor && S.editor.resize(true); } catch {} }, 80);
  }

  function toggleAgentPanel() {
    const app = document.querySelector('.app');
    if (app.classList.contains('hide-agent')) { app.classList.remove('hide-agent'); $('agentRail').classList.add('hidden'); }
    else { app.classList.add('hide-agent'); $('agentRail').classList.remove('hidden'); }
    setTimeout(() => { try { S.editor && S.editor.resize(true); } catch {} }, 80);
  }

  function toggleTerminalPanel() {
    const pane = $('termPane');
    if (pane.classList.contains('closed')) { setTermPaneClosed(false); if (!S.termTabs.length) newLocalTerminal(S.local.root); }
    else setTermPaneClosed(true);
  }

  function toggleTerminalSplit() {
    const hosts = $('termHosts');
    const on = hosts.classList.toggle('split-mode');
    if (on && S.termTabs.length < 2) newLocalTerminal(S.local.root);
    setTimeout(fitAll, 120);
    toast(on ? 'Terminal di-split (semua tab berdampingan)' : 'Split dimatikan');
  }

  function shellQuote(p) {
    return "'" + String(p || '').replace(/'/g, "'\\''") + "'";
  }

  const RUN_EXECUTORS = { js: 'node', mjs: 'node', cjs: 'node', py: 'python', sh: 'bash', bash: 'bash', ps1: 'powershell -File', bat: '', cmd: '', rb: 'ruby', php: 'php' };

  function runActiveFile() {
    const tab = S.active;
    if (!tab) { toast('Tidak ada file aktif.'); return; }
    const ext = String(tab.name.split('.').pop() || '').toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(RUN_EXECUTORS, ext)) { toast('File .' + ext + ' tidak bisa di-run langsung dari sini.'); return; }
    const exe = RUN_EXECUTORS[ext];
    const cmd = (exe ? exe + ' ' : '') + shellQuote(tab.path);
    if (tab.target && tab.target.type === 'ssh') {
      newSshTerminal(tab.target.id).then((newTab) => {
        if (!newTab) return;
        setTimeout(() => { try { api.remoteInput(tab.target.id, newTab.shellId, cmd + '\r'); } catch {} }, 350);
      });
      return;
    }
    if (tab.target && tab.target.type !== 'local') { toast('Run hanya untuk file lokal atau SSH.'); return; }
    newLocalTerminal(dirName(tab.path)).then((newTab) => {
      if (!newTab) return;
      setTimeout(() => { try { api.terminalInput(newTab.ptyId, cmd + '\r'); } catch {} }, 350);
    });
  }

  function runSelectedText() {
    let text = '';
    try { text = S.editor && S.editor.getSelectedText ? S.editor.getSelectedText() : ''; } catch { /* abaikan */ }
    if (!String(text || '').trim()) { toast('Tidak ada teks terpilih.'); return; }
    const payload = String(text).replace(/\r?\n/g, '\r') + '\r';
    const t = activeTerm();
    if (t) {
      if (t.kind === 'local' && t.ptyId) api.terminalInput(t.ptyId, payload);
      else if (t.shellId) api.remoteInput(t.sessionId, t.shellId, payload);
      return;
    }
    newLocalTerminal(S.local.root).then((newTab) => {
      if (!newTab) return;
      setTimeout(() => { try { api.terminalInput(newTab.ptyId, payload); } catch {} }, 400);
    });
  }

  function handleMenuEvent(msg) {
    const m = msg || {};
    switch (m.action) {
      case 'openFolder': openFolder(); break;
      case 'cloneRepo': openClone(); break;
      case 'save': saveActive(); break;
      case 'view': if (m.view) switchView(m.view); break;
      case 'toggleSidebar': toggleSidebarPanel(); break;
      case 'toggleAgent': toggleAgentPanel(); break;
      case 'toggleTerminal': toggleTerminalPanel(); break;
      case 'newTerminal': showTermPane(); newLocalTerminal(S.local.root); break;
      case 'splitTerminal': toggleTerminalSplit(); break;
      case 'runActiveFile': runActiveFile(); break;
      case 'runSelectedText': runSelectedText(); break;
      case 'killTerminal': { const t = activeTerm(); if (t) closeTerminalTab(t.uid); } break;
      case 'clearTerminal': { const t = activeTerm(); if (t) t.term.clear(); } break;
      case 'closeTerminalPanel': setTermPaneClosed(true); break;
      case 'focusTerminal': if (m.uid) { setTermPaneClosed(false); activateTerminalTab(m.uid); } break;
      case 'about': toast('SahabatMobile Desktop v' + ((S.settings && S.settings.version) || '') + ' — SahabatMobile'); break;
      case 'shortcutGuide': openShortcutGuide(); break;
      default: break;
    }
  }

  function openShortcutGuide() {
    const modal = $('shortcutModal');
    if (modal) modal.classList.remove('hidden');
  }

  // ---------- Fokus panel: tutup / perbesar / perkecil ----------
  function toggleMaxAppClass(name) {
    const app = document.querySelector('.app');
    const on = !app.classList.contains(name);
    app.classList.remove('max-explorer', 'max-agent', 'max-terminal', 'max-editor');
    $('termPane').classList.remove('max');
    if (on) {
      app.classList.add(name);
      if (name === 'max-terminal') $('termPane').classList.add('max');
    }
    setTimeout(() => { fitAll(); try { S.editor && S.editor.resize(true); } catch {} }, 90);
  }

  // ---------- Agent ----------
  function agentLog(html, cls) {
    const empty = $('agentLog').querySelector('.agent-empty');
    if (empty) empty.remove();
    const el = document.createElement('div');
    const isUser = cls === 'user' && /^\s*<div class="agent-user"/.test(html);
    const isAi = cls === 'ai' && /^\s*<div class="agent-ai/.test(html);
    if (isUser) {
      el.className = 'agent-item user';
      el.innerHTML = '<div class="agent-item-header"><span class="agent-avatar">You</span><span class="agent-username">Anda</span></div><div class="agent-item-body">' + html + '</div>';
    } else if (isAi) {
      el.className = 'agent-item ai';
      el.innerHTML = '<div class="agent-item-header"><span class="agent-avatar agent-avatar-ai">AI</span><span class="agent-username">AI</span></div><div class="agent-item-body">' + html + '</div>';
    } else {
      el.className = cls || '';
      el.innerHTML = html;
    }
    const log = $('agentLog');
    log.appendChild(el);
    trimAgentLog();
    agentScrollToEnd('auto');
    return el;
  }

  // ---------- Agent: riwayat tugas, cari & export ----------
  const AGENT_HISTORY_STORE = 'sahabat.agent.history.v1';

  function loadAgentHistory() {
    try {
      const raw = localStorage.getItem(AGENT_HISTORY_STORE);
      const arr = raw ? JSON.parse(raw) : [];
      S.agent.history = Array.isArray(arr) ? arr : [];
    } catch { S.agent.history = []; }
  }

  function saveAgentHistory() {
    try { localStorage.setItem(AGENT_HISTORY_STORE, JSON.stringify(S.agent.history.slice(-20))); } catch { /* abaikan */ }
  }

  function agentContentText(content) {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content.map((p) => (p && p.type === 'text' && p.text) ? p.text : '').join(' ');
    }
    return '';
  }

  function agentHistoryTitle(messages) {
    const first = (messages || []).find((m) => m.role === 'user');
    const text = agentContentText(first && first.content);
    return String(text || 'Tugas agent').replace(/\s+/g, ' ').trim().slice(0, 60) || 'Tugas agent';
  }

  function saveCurrentAgentToHistory() {
    const msgs = (S.agent.messages || []).filter((m) => m.role !== 'system');
    if (!msgs.length) return;
    S.agent.history.push({
      id: 'agt-' + Date.now(),
      title: agentHistoryTitle(msgs),
      ts: Date.now(),
      target: S.target.type,
      messages: msgs.slice(-80)
    });
    S.agent.history = S.agent.history.slice(-20);
    saveAgentHistory();
  }

  function agentEmptyState() {
    return '<div class="agent-empty">' +
      '<div class="hero-logo" style="width:46px;height:46px;border-radius:13px;">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:24px;height:24px;color:#fff;"><path d="M9.5 2a7.5 7.5 0 0 0-5.6 12.6l-.9 4.4 4.4-.9A7.5 7.5 0 1 0 9.5 2z"/></svg>' +
      '</div>' +
      '<div class="agent-empty-title">Agent</div>' +
      '<p>Memahami tugas kompleks, memperbaiki bug, dan membuat project baru.</p>' +
      '<ul>' +
        '<li>Membaca dan menulis file di explorer aktif</li>' +
        '<li>Menjalankan perintah (dengan konfirmasi)</li>' +
        '<li>Bekerja di folder lokal, SSH/SFTP, atau FTP</li>' +
      '</ul>' +
      '<div class="agent-quick">' + agentQuickActions() + '</div>' +
    '</div>';
  }

  function resetAgentLog() {
    $('agentLog').innerHTML = agentEmptyState();
  }

  function newAgentTask() {
    if (S.agent.busy) { toast('Tunggu agent selesai dulu.'); return; }
    saveCurrentAgentToHistory();
    S.agent.messages = [];
    resetAgentLog();
    $('agentInput').value = '';
    $('agentInput').focus();
    toast('Tugas baru dimulai');
  }

  function openAgentHistory() {
    const list = $('agentHistoryList');
    const hist = S.agent.history || [];
    if (!hist.length) {
      list.innerHTML = '<div class="agent-history-empty">Belum ada riwayat tugas.</div>';
    } else {
      list.innerHTML = '';
      for (const item of hist.slice().reverse()) {
        const d = new Date(item.ts);
        const meta = d.toLocaleString('id-ID') + ' · ' + (item.messages || []).length + ' pesan';
        const el = document.createElement('div');
        el.className = 'agent-history-item';
        el.innerHTML = '<span class="agent-history-title">' + esc(item.title) + '</span><span class="agent-history-meta">' + esc(meta) + '</span>';
        el.addEventListener('click', () => loadAgentHistoryItem(item));
        list.appendChild(el);
      }
    }
    $('agentHistoryModal').classList.remove('hidden');
  }

  function loadAgentHistoryItem(item) {
    if (S.agent.busy) { toast('Tunggu agent selesai dulu.'); return; }
    saveCurrentAgentToHistory();
    S.agent.messages = (item.messages || []).slice();
    $('agentLog').innerHTML = '';
    for (const m of S.agent.messages) {
      if (m.role === 'user') agentLog('<div class="agent-user">' + esc(agentContentText(m.content)) + '</div>', 'user');
      else if (m.role === 'assistant') agentLog('<div class="agent-ai markdown">' + renderChatMarkdown(agentContentText(m.content)) + '</div>', 'ai');
      else if (m.role === 'tool') agentLog('<div class="agent-note">Tool: ' + esc(agentContentText(m.content).slice(0, 500)) + '</div>', 'tool');
    }
    $('agentHistoryModal').classList.add('hidden');
    agentScrollToEnd('auto');
    toast('Riwayat tugas dimuat');
  }

  function openAgentSearch() {
    $('agentSearchInput').value = '';
    $('agentSearchResults').innerHTML = '<div class="agent-search-empty">Ketik kata kunci untuk mencari di chat ini.</div>';
    $('agentSearchModal').classList.remove('hidden');
    setTimeout(() => $('agentSearchInput').focus(), 50);
  }

  function runAgentSearch() {
    const q = $('agentSearchInput').value.trim().toLowerCase();
    const box = $('agentSearchResults');
    if (!q) {
      box.innerHTML = '<div class="agent-search-empty">Ketik kata kunci untuk mencari di chat ini.</div>';
      return;
    }
    const nodes = Array.from($('agentLog').querySelectorAll('.agent-item, .agent-step, .agent-note, .agent-thinking, .agent-pending'));
    const hits = nodes.filter((n) => (n.textContent || '').toLowerCase().includes(q));
    if (!hits.length) {
      box.innerHTML = '<div class="agent-search-empty">Tidak ada hasil untuk "' + esc(q) + '".</div>';
      return;
    }
    box.innerHTML = '';
    hits.forEach((n, i) => {
      const txt = (n.textContent || '').replace(/\s+/g, ' ').trim();
      const snippet = txt.length > 120 ? txt.slice(0, 120) + '…' : txt;
      const el = document.createElement('div');
      el.className = 'agent-search-result';
      el.innerHTML = '<span class="as-role">#' + (i + 1) + '</span>' + esc(snippet);
      el.addEventListener('click', () => {
        $('agentSearchModal').classList.add('hidden');
        n.classList.remove('agent-hit');
        void n.offsetWidth;
        n.scrollIntoView({ behavior: 'smooth', block: 'center' });
        n.classList.add('agent-hit');
      });
      box.appendChild(el);
    });
  }

  async function exportAgentChat() {
    const msgs = (S.agent.messages || []).filter((m) => m.role !== 'system');
    if (!msgs.length) { toast('Belum ada chat untuk di-export.'); return; }
    const lines = [];
    const stamp = new Date();
    lines.push('# SahabatMobile Agent Chat');
    lines.push('');
    lines.push('Tanggal: ' + stamp.toLocaleString('id-ID'));
    lines.push('Target: ' + (S.target.type === 'local' ? 'folder lokal' : S.target.type));
    lines.push('');
    for (const m of msgs) {
      if (m.role === 'user') lines.push('## Anda\n\n' + agentContentText(m.content));
      else if (m.role === 'assistant') lines.push('## AI\n\n' + agentContentText(m.content));
      else if (m.role === 'tool') lines.push('### Tool\n\n' + agentContentText(m.content));
      lines.push('');
    }
    const out = await api.saveFile(
      lines.join('\n'),
      'agent-chat-' + stamp.getTime() + '.md',
      [{ name: 'Markdown', extensions: ['md'] }, { name: 'Teks', extensions: ['txt'] }],
      'Export Chat Agent'
    );
    if (out && out.ok) toast('Chat di-export: ' + out.path);
    else if (!out || !out.cancelled) toast('Gagal export chat');
  }

  // Batasi riwayat pesan agent agar payload API tidak membengkak.
  function trimAgentMessages(max = 40) {
    const list = S.agent.messages;
    if (!Array.isArray(list) || list.length <= max) return;
    S.agent.messages = list.slice(-max);
  }

  // Batasi DOM agent agar tidak membengkak saat tugas panjang.
  function trimAgentLog(max = 250) {
    const log = $('agentLog');
    const items = Array.from(log.children);
    if (items.length <= max) return;
    const removeCount = items.length - max;
    for (let i = 0; i < removeCount; i++) items[i].remove();
    if (!log.querySelector('.agent-trim-note')) {
      const note = document.createElement('div');
      note.className = 'agent-note agent-trim-note';
      note.textContent = 'Riwayat lama disembunyikan untuk menjaga performa.';
      log.insertBefore(note, log.firstChild);
    }
  }

  function agentTargetPayload() {
    return S.target.type === 'local' ? { type: 'local' } : { type: S.target.type, id: S.target.id };
  }

  function agentBasePath() {
    if (S.target.type === 'local') return S.local.root || '(belum dibuka)';
    const s = remoteSession();
    return s ? (s.dir || s.home) : '(tidak terhubung)';
  }

  function agentSystemPrompt(text) {
    const targetLabel = S.target.type === 'local' ? 'folder lokal' : (S.target.type === 'ssh' ? 'server SSH' : 'server FTP');
    const lines = [
      'Anda adalah agen coding di dalam aplikasi SahabatMobile Desktop.',
      'Target explorer aktif: ' + targetLabel + '.',
      'Base path: ' + agentBasePath(),
      'Gunakan tools untuk membaca/menulis file dan menjalankan perintah.',
      'Path bisa absolut sesuai base path atau relatif terhadapnya.',
      S.target.type === 'ftp' ? 'FTP tidak mendukung run_command; gunakan baca/tulis file saja.' : 'Gunakan run_command hanya bila perlu; pengguna akan mengonfirmasi.',
      'Kerjakan tugas langkah demi langkah, lalu jelaskan hasil akhir secara singkat dalam Bahasa Indonesia.'
    ];
    const mode = effectiveAgentMode(text);
    if (mode === 'web') {
      lines.unshift('MODE WEB DEV: Fokus membangun dan mengedit website.');
      lines.splice(1, 0, 'Prioritaskan HTML/CSS/JS, struktur halaman, responsif, dan tampilan modern.');
      lines.splice(2, 0, 'Jika perlu, jalankan perintah build/dev server, lalu jelaskan cara membukanya.');
    } else if (mode === 'vps') {
      lines.unshift('MODE VPS & SERVER: Fokus administrasi server.');
      lines.splice(1, 0, 'Tangani firewall (ufw/iptables), DNS, SSH, Webmin, mail server, dan instalasi service (n8n, Hermes, OpenClaw, DeepSearch, OpenHand, WhatsApp API).');
      lines.splice(2, 0, 'Untuk tindakan berisiko, jelaskan dampaknya dan minta konfirmasi.');
    }
    return lines.join('\n');
  }

  async function execTool(name, args) {
    const target = agentTargetPayload();
    if (name === 'list_dir') return api.agentListDir(args.path || (S.target.type === 'local' ? '.' : agentBasePath()), target);
    if (name === 'read_file') return api.agentReadFile(args.path, target);
    if (name === 'write_file') return api.agentWriteFile(args.path, args.content ?? '', target);
    if (name === 'run_command') {
      const mode = (S.settings && S.settings.agentApproval) || 'manual';
      return api.agentRunCommand(args.command, args.cwd, 120000, target, undefined, mode);
    }
    if (name === 'server_status') return api.agentServerStatus(target);
    if (name === 'firewall_status') return api.agentFirewallStatus(target);
    if (name === 'firewall_allow') {
      const mode = (S.settings && S.settings.agentApproval) || 'manual';
      return api.agentFirewallAllow(args.port, args.proto || 'tcp', target, mode);
    }
    if (name === 'firewall_deny') {
      const mode = (S.settings && S.settings.agentApproval) || 'manual';
      return api.agentFirewallDeny(args.port, args.proto || 'tcp', target, mode);
    }
    if (name === 'service_restart') {
      const mode = (S.settings && S.settings.agentApproval) || 'manual';
      return api.agentServiceRestart(args.service, target, mode);
    }
    if (name === 'dns_lookup') return api.agentDnsLookup(args.domain, args.type || 'A', target);
    if (name === 'dns_propagation') return api.agentDnsPropagation(args.domain, args.type || 'A', target);
    if (name === 'dns_zone_show') return api.agentDnsZoneShow(args.domain, target);
    if (name === 'dns_zone_add') {
      const mode = (S.settings && S.settings.agentApproval) || 'manual';
      return api.agentDnsZoneAdd(args.domain, args.name, args.type, args.value, args.ttl, target, mode);
    }
    if (name === 'dns_zone_delete') {
      const mode = (S.settings && S.settings.agentApproval) || 'manual';
      return api.agentDnsZoneDelete(args.domain, args.name, args.type, target, mode);
    }
    if (name === 'install_nginx' || name === 'install_apache' || name === 'install_mysql') {
      const mode = (S.settings && S.settings.agentApproval) || 'manual';
      if (name === 'install_nginx') return api.agentInstallNginx(target, mode);
      if (name === 'install_apache') return api.agentInstallApache(target, mode);
      return api.agentInstallMysql(target, mode);
    }
    if (name === 'install_ssl') {
      const mode = (S.settings && S.settings.agentApproval) || 'manual';
      return api.agentInstallSsl(args.domain, args.email, args.webserver || 'nginx', target, mode);
    }
    return { ok: false, error: 'Tool tidak dikenal: ' + name };
  }

  // ---------- Agent: tampilan ala OpenCode (thinking + step rows + follow scroll) ----------
  let agentStickToBottom = true;
  let agentProgrammatic = false;
  let agentScrollTimer = null;
  const TOOL_META = {
    run_command: { label: 'Perintah', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17l6-5-6-5"/><path d="M12 19h8"/></svg>' },
    read_file: { label: 'Baca file', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h9l4 4v16H6z"/><path d="M9 13h6M9 17h6"/></svg>' },
    write_file: { label: 'Tulis file', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>' },
    list_dir: { label: 'List folder', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>' }
  };

  function toolArgsPreview(name, args) {
    args = args || {};
    if (name === 'run_command') return String(args.command || '');
    if (name === 'read_file' || name === 'write_file') return String(args.path || '');
    if (name === 'list_dir') return String(args.path || '.');
    try { return JSON.stringify(args); } catch { return String(args); }
  }

  function truncateOut(text, limit) {
    const s = String(text == null ? '' : text);
    if (s.length <= limit) return { text: s, truncated: false };
    return { text: s.slice(0, limit), truncated: true };
  }

  function splitThink(text) {
    const s = String(text || '');
    const m = s.match(/<think>([\s\S]*?)<\/think>/i);
    if (!m) return { reasoning: '', content: s };
    return { reasoning: m[1].trim(), content: s.replace(m[0], '').trim() };
  }

  function agentScrollToEnd(behavior) {
    if (!agentStickToBottom) return;
    const log = $('agentLog');
    // Selalu scroll instan (tanpa animasi) — animasi smooth membuat flag follow ter-reset
    // saat konten baru terus bermunculan, sehingga tombol ↓ muncul berulang kali.
    agentProgrammatic = true;
    const jump = () => log.scrollTo({ top: log.scrollHeight, behavior: 'auto' });
    jump();
    requestAnimationFrame(jump);
    clearTimeout(agentScrollTimer);
    agentScrollTimer = setTimeout(() => { agentProgrammatic = false; }, 80);
    $('agentJump').classList.add('hidden');
  }

  function updateAgentJump() {
    $('agentJump').classList.toggle('hidden', agentStickToBottom);
  }

  function addAgentThinking(text) {
    const el = document.createElement('div');
    el.className = 'agent-thinking';
    el.innerHTML =
      '<button type="button" class="agent-thinking-toggle">' +
        '<span class="thinking-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2a7.5 7.5 0 0 0-5.6 12.6l-.9 4.4 4.4-.9A7.5 7.5 0 1 0 9.5 2z"/></svg></span>' +
        '<span class="agent-thinking-title">Thinking</span>' +
        '<span class="agent-thinking-caret">▾</span>' +
      '</button>' +
      '<pre class="agent-thinking-body">' + esc(text) + '</pre>';
    el.querySelector('.agent-thinking-toggle').addEventListener('click', () => {
      el.classList.toggle('collapsed');
    });
    $('agentLog').appendChild(el);
    agentScrollToEnd('auto');
    return el;
  }

  function addAgentThinkingAction(text, model) {
    const el = document.createElement('div');
    el.className = 'agent-thinking agent-thinking-action';
    el.innerHTML =
      '<button type="button" class="agent-thinking-toggle">' +
        '<span class="thinking-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/></svg></span>' +
        '<span class="agent-thinking-title">Thinking</span>' +
        '<span class="agent-thinking-model">' + esc(model || '') + '</span>' +
        '<span class="agent-thinking-caret">▾</span>' +
      '</button>' +
      '<pre class="agent-thinking-body">' + esc(text) + '</pre>';
    el.querySelector('.agent-thinking-toggle').addEventListener('click', () => {
      el.classList.toggle('collapsed');
    });
    $('agentLog').appendChild(el);
    agentScrollToEnd('auto');
    return el;
  }

  function addAgentPending() {
    const el = document.createElement('div');
    el.className = 'agent-pending';
    el.innerHTML = '<span class="ring-spinner" role="status" aria-label="Memikirkan">' + RING_DOTS + '</span>';
    $('agentLog').appendChild(el);
    agentScrollToEnd('auto');
    return el;
  }

  function addAgentStep(name, args) {
    const meta = TOOL_META[name] || { label: name, icon: TOOL_META.run_command.icon };
    const el = document.createElement('div');
    el.className = 'agent-step agent-step-running agent-step--' + String(name || 'other').replace(/[^a-z0-9]+/gi, '-');
    el.innerHTML =
      '<div class="agent-step-head">' +
        '<span class="agent-step-icon">' + meta.icon + '</span>' +
        '<span class="agent-step-title">' + esc(meta.label) + '</span>' +
        '<code class="agent-step-cmd" title="' + esc(toolArgsPreview(name, args)) + '">' + esc(toolArgsPreview(name, args)) + '</code>' +
        '<span class="agent-step-state"><span class="ring-spinner ring-spinner--xs" role="status" aria-label="Menjalankan">' + RING_DOTS + '</span><span class="agent-step-running-text">Menjalankan...</span></span>' +
      '</div>' +
      '<div class="agent-step-out hidden"></div>';
    $('agentLog').appendChild(el);
    agentScrollToEnd('auto');
    return el;
  }

  function finishAgentStep(el, name, args, result) {
    const ok = result && result.ok !== false;
    el.classList.remove('agent-step-running');
    el.classList.add(ok ? 'agent-step-ok' : 'agent-step-err');
    const state = el.querySelector('.agent-step-state');
    const code = result && typeof result.code === 'number' ? result.code : null;
    if (ok && code !== null && code !== 0) {
      state.innerHTML = '<span class="agent-step-text warn">exit ' + esc(String(code)) + '</span>';
    } else if (ok) {
      state.innerHTML = '<span class="agent-step-text ok">selesai</span>';
    } else {
      state.innerHTML = '<span class="agent-step-text err">gagal</span>';
    }
    const body = el.querySelector('.agent-step-out');
    let outText = '';
    if (name === 'run_command' && result) {
      const denied = result.denied === true;
      outText = denied ? String(result.output || 'Pengguna menolak eksekusi perintah.')
        : (result.error ? String(result.error)
          : String(result.output !== undefined ? result.output : JSON.stringify(result, null, 2)));
      if (!denied && result.code !== undefined && result.code !== 0) outText = 'exit code ' + result.code + '\n' + outText;
    } else if (name === 'read_file' && result) {
      outText = result.ok ? String(result.content || '(kosong)') : String(result.error || 'Gagal membaca file');
    } else if (name === 'write_file' && result) {
      outText = result.ok ? 'Tersimpan: ' + String(result.path || (args && args.path) || '') : String(result.error || 'Gagal menulis file');
    } else if (name === 'list_dir' && result && result.ok) {
      const items = result.items || [];
      outText = items.slice(0, 200).map((i) => (i.type === 'dir' ? '[dir]  ' : '[file] ') + i.name).join('\n') || '(folder kosong)';
      if (result.path) outText = result.path + '\n\n' + outText;
    } else if (result && result.ok === false) {
      outText = String(result.error || 'Gagal');
    } else {
      try { outText = JSON.stringify(result, null, 2); } catch { outText = String(result); }
    }
    const t = truncateOut(outText, 1800);
    body.innerHTML =
      '<pre class="agent-out-inner"' + (t.truncated ? ' data-full="' + esc(outText) + '"' : '') + '>' + esc(t.text) + '</pre>' +
      (t.truncated ? '<button type="button" class="agent-showmore">Tampilkan semua (' + outText.length + ' karakter)</button>' : '');
    body.classList.remove('hidden');
    agentScrollToEnd('auto');
  }

  function failAgentStep(el, err) {
    el.classList.remove('agent-step-running');
    el.classList.add('agent-step-err');
    const state = el.querySelector('.agent-step-state');
    state.innerHTML = '<span class="agent-step-text err">gagal</span>';
    const body = el.querySelector('.agent-step-out');
    body.innerHTML = '<pre class="agent-out-inner">' + esc(err && err.message ? err.message : String(err)) + '</pre>';
    body.classList.remove('hidden');
    agentScrollToEnd('auto');
  }

  const THINKING_SPINNER = '<span class="ring-spinner ring-spinner--inline" role="status" aria-label="Memikirkan">' + RING_DOTS + '</span>';

  function setAgentStatus(text) {
    const el = $('agentStatus');
    if (!text) { el.innerHTML = ''; return; }
    if (/^(Memikirkan|Menjalankan)/i.test(text)) { el.innerHTML = THINKING_SPINNER; return; }
    el.textContent = text;
  }

  function setChatStatus(text) {
    const el = $('chatStatus');
    if (!text) { el.innerHTML = ''; return; }
    if (/^(Menghubungi|Mengetik)/i.test(text)) { el.innerHTML = THINKING_SPINNER; return; }
    el.textContent = text;
  }

  async function sendAgent() {
    const input = $('agentInput');
    const text = input.value.trim();
    if (!text || S.agent.busy) return;
    if (!S.settings.hasKey) { openSettings(); return; }
    if (S.target.type === 'local' && !S.local.root) { toast('Buka folder kerja dulu.'); return; }
    if (S.target.type !== 'local' && !remoteSession()) { toast('Koneksi remote tidak aktif.'); return; }
    rememberInput('agent', text);
    stopVoiceChat();
    input.value = '';
    updateAgentModeChip();
    S.agent.busy = true;
    $('agentSend').classList.add('hidden');
    setAgentStatus('Memikirkan…');
    S.agent.messages.push({ role: 'user', content: text });
    agentLog('<div class="agent-user">' + esc(text) + '</div>', 'user');

    const messages = [{ role: 'system', content: agentSystemPrompt(text) }, ...S.agent.messages];
    let loops = 0;
    let wrote = false;
    let lastSig = null;
    let repeatCount = 0;
    let stalled = false;
    S.agent.abort = false;
    S.agent.currentReq = null;
    $('agentStop').classList.remove('hidden');
    try {
      while (true) {
        if (S.agent.abort) {
          agentLog('<div class="agent-note">Dihentikan oleh pengguna.</div>', 'ai');
          break;
        }
        loops += 1;
        const pending = addAgentPending('Memikirkan...');
        const requestId = 'agent_' + Date.now() + '_' + loops;
        S.agent.currentReq = requestId;
        let res;
        try {
          res = await api.completeChat({ model: currentModel(), messages, tools: TOOLS, maxTokens: 8192, reasoningEffort: (S.settings && S.settings.agentThinking) || 'default', requestId });
        } catch (err) {
          pending.remove();
          agentLog('<div class="agent-error">' + esc((err && err.message) || String(err)) + '</div>', 'error');
          break;
        }
        pending.remove();
        if (res && res.aborted) {
          agentLog('<div class="agent-note">Dihentikan oleh pengguna.</div>', 'ai');
          break;
        }
        if (!res.ok) {
          const err = (res.error && res.error.message) || 'Gagal memanggil model.';
          agentLog('<div class="agent-error">' + esc(err) + '</div>', 'error');
          break;
        }
        const msg = res.message || {};
        const content = String(msg.content || '');
        if (res.toolsDisabled) {
          agentLog('<div class="agent-note">Model ini tidak mendukung tools di gateway — jawaban diberikan tanpa eksekusi tools. Untuk eksekusi tools, ganti ke model seperti <strong>MiniMax-M3</strong> atau model Claude.</div>', 'ai');
        } else if (res.note) {
          agentLog('<div class="agent-note">' + esc(res.note) + '</div>', 'ai');
        }
        const reasoning = String(res.reasoning || splitThink(content).reasoning || '').trim();
        if (reasoning) attachCopy(addAgentThinking(reasoning), reasoning);
        if (content.trim()) {
          const aiEl = agentLog('<div class="agent-ai markdown">' + renderChatMarkdown(content) + '</div>', 'ai');
          attachCopy(aiEl, content);
        }
        const assistantMsg = { role: 'assistant', content: content || '' };
        if (msg.tool_calls) assistantMsg.tool_calls = msg.tool_calls;
        messages.push(assistantMsg);
        S.agent.messages.push(assistantMsg);
        const calls = (msg.tool_calls || []).filter((c) => c && c.function && c.function.name);
        if (!calls.length) {
          if (res.finishReason === 'length') {
            agentLog('<div class="agent-note">Output terpotong karena mencapai batas token. Kirim pesan <strong>lanjutkan</strong> untuk meneruskan tugas.</div>', 'ai');
          } else if (!content.trim() && !reasoning) {
            agentLog('<div class="agent-note">Model tidak memberikan respons. Kirim ulang pesan Anda atau ganti model di daftar atas.</div>', 'ai');
          }
          break;
        }
        for (const call of calls) {
          const fn = (call.function && call.function.name) || '';
          let args = {};
          try { args = JSON.parse((call.function && call.function.arguments) || '{}'); } catch {}
          // Deteksi macet: perintah identik diulang 3x berturut-turut = loop tanpa hasil.
          const sig = fn + '|' + JSON.stringify(args);
          if (sig === lastSig) repeatCount += 1; else { lastSig = sig; repeatCount = 0; }
          addAgentThinkingAction('Menjalankan ' + toolArgsPreview(fn, args), currentModel());
          const stepEl = addAgentStep(fn, args);
          let result;
          try { result = await execTool(fn, args); } catch (err) { result = { ok: false, error: (err && err.message) || String(err) }; }
          finishAgentStep(stepEl, fn, args, result || { ok: false, error: 'Tanpa respons' });
          const output = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
          const toolId = call.id || ('call_' + Date.now() + '_' + loops);
          messages.push({ role: 'tool', tool_call_id: toolId, content: output });
          S.agent.messages.push({ role: 'tool', tool_call_id: toolId, content: output });
          if (fn === 'write_file' && result && result.ok) wrote = true;
          setAgentStatus('Memikirkan...');
          if (repeatCount >= 3) {
            stalled = true;
            break;
          }
        }
        trimAgentMessages();
        if (stalled) {
          agentLog('<div class="agent-note">Terdeteksi perintah yang sama diulang 3x berturut-turut - agent berhenti agar tidak berputar tanpa hasil. Kirim instruksi yang berbeda untuk melanjutkan.</div>', 'ai');
          break;
        }
        if (wrote) {
          wrote = false;
          await refreshExplorer();
        }
      }
    } catch (err) {
      try { agentLog('<div class="agent-error">' + esc((err && err.message) || String(err)) + '</div>', 'error'); } catch {}
    } finally {
      S.agent.busy = false;
      S.agent.currentReq = null;
      setAgentStatus('');
      $('agentSend').classList.remove('hidden');
      $('agentStop').classList.add('hidden');
      try { await refreshExplorer(); } catch {}
    }
  }

  function stopAgent() {
    if (!S.agent.busy) return;
    S.agent.abort = true;
    try { if (S.agent.currentReq) api.chatCancel(S.agent.currentReq); } catch {}
    setAgentStatus('Menghentikan...');
  }
  // ---------- Chat ----------
  const CHAT_STORE = 'sahabat.chat.v1';

  // ---------- Riwayat input (navigasi panah atas/bawah) ----------
  const INPUT_HISTORY = {
    chat: { key: 'sahabat.input.history.chat.v1', items: [], index: 0, draft: '' },
    agent: { key: 'sahabat.input.history.agent.v1', items: [], index: 0, draft: '' }
  };

  function loadInputHistory(kind) {
    const h = INPUT_HISTORY[kind];
    if (!h) return;
    try {
      const raw = localStorage.getItem(h.key);
      const arr = raw ? JSON.parse(raw) : [];
      h.items = (Array.isArray(arr) ? arr : []).filter((x) => typeof x === 'string' && x.trim()).slice(-50);
    } catch {
      h.items = [];
    }
    h.index = h.items.length;
    h.draft = '';
  }

  function saveInputHistory(kind) {
    const h = INPUT_HISTORY[kind];
    if (!h) return;
    try { localStorage.setItem(h.key, JSON.stringify(h.items.slice(-50))); } catch { /* abaikan */ }
  }

  function rememberInput(kind, text) {
    const h = INPUT_HISTORY[kind];
    if (!h) return;
    const t = String(text || '').trim();
    if (!t) return;
    if (h.items[h.items.length - 1] !== t) h.items.push(t);
    if (h.items.length > 50) h.items = h.items.slice(-50);
    h.index = h.items.length;
    h.draft = '';
    saveInputHistory(kind);
  }

  function bindInputHistory(textarea, kind) {
    const h = INPUT_HISTORY[kind];
    if (!textarea || !h) return;
    loadInputHistory(kind);
    textarea.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
      if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
      if (!h.items.length) return;
      // Hanya alihkan di baris pertama/terakhir agar editing multi-baris tetap normal.
      const sameCaret = textarea.selectionStart === textarea.selectionEnd;
      const pos = textarea.selectionStart;
      const onFirstLine = sameCaret && textarea.value.slice(0, pos).indexOf('\n') === -1;
      const onLastLine = sameCaret && textarea.value.slice(pos).indexOf('\n') === -1;
      if (e.key === 'ArrowUp' && !onFirstLine) return;
      if (e.key === 'ArrowDown' && !onLastLine) return;
      e.preventDefault();
      if (e.key === 'ArrowUp') {
        if (h.index === h.items.length) h.draft = textarea.value;
        if (h.index > 0) h.index -= 1;
      } else if (h.index < h.items.length) {
        h.index += 1;
      }
      textarea.value = h.index >= h.items.length ? (h.draft || '') : h.items[h.index];
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    });
    // Ketikan baru mengakhiri navigasi riwayat.
    textarea.addEventListener('input', () => {
      h.draft = textarea.value;
      h.index = h.items.length;
    });
  }

  // ---------- Mode & tujuan chat (persona + system prompt) ----------
  const CHAT_MODES = [
    {
      id: 'auto', label: 'Otomatis', desc: 'Deteksi tujuan dari isi pesan',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 4.6 4.6 1.9-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z"/><path d="M18.5 15l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/></svg>',
      keywords: [], prompt: ''
    },
    {
      id: 'web', label: 'Web Dev', desc: 'Desain & bangun website',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 6 2 12 8 18"/><polyline points="16 6 22 12 16 18"/></svg>',
      keywords: ['website', 'web site', 'landing page', 'landingpage', 'situs', 'halaman', 'web dev', 'webdev', 'frontend', 'front-end', 'backend', 'back-end', 'html', 'css', 'javascript', 'react', 'vue', 'tailwind', 'responsif', 'responsive', 'portofolio', 'portfolio', 'blog', 'desain web', 'ui design', 'aplikasi web', 'tampilan'],
      prompt: [
        'Anda adalah spesialis Web Dev dalam aplikasi SahabatMobile Desktop.',
        'Tugas Anda membantu merancang dan membangun website: struktur halaman, layout, HTML/CSS/JS, tampilan responsif, dan estetika modern.',
        'Beri kode lengkap yang siap salin bila diminta, dan jelaskan keputusan desain secara singkat.',
        'Utamakan hasil yang langsung bisa dipakai. Selalu jawab dalam Bahasa Indonesia.'
      ].join('\n')
    },
    {
      id: 'vps', label: 'VPS & Server', desc: 'Perbaikan, firewall, DNS, SSH, install service',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/><path d="M7 7.5h.01M7 16.5h.01"/></svg>',
      keywords: ['vps', 'server', 'firewall', 'ufw', 'iptables', 'nftables', 'dns', 'domain', 'ssh', 'sshd', 'webmin', 'virtualmin', 'cpanel', 'plesk', 'hosting', 'nginx', 'apache', 'httpd', 'php-fpm', 'mysql', 'mariadb', 'postgres', 'postfix', 'dovecot', 'mail server', 'email server', 'certbot', 'systemd', 'systemctl', 'crontab', 'docker', 'n8n', 'hermes', 'openclaw', 'deepsearch', 'openhand', 'whatsapp api', 'linux', 'ubuntu', 'debian', 'centos', 'error server', 'server down', 'perbaikan server'],
      prompt: [
        'Anda adalah administrator server (VPS) dalam aplikasi SahabatMobile Desktop.',
        'Tugas Anda membantu merawat dan mengelola server: perbaikan layanan, firewall (ufw/iptables), DNS, SSH, Webmin, mail server, serta instalasi dan konfigurasi service (n8n, Hermes, OpenClaw, DeepSearch, OpenHand, WhatsApp API, dan lainnya).',
        'Beri perintah yang jelas dan aman, jelaskan risikonya, dan sarankan langkah verifikasi.',
        'Untuk tindakan berisiko (menghapus data, mengubah firewall, restart layanan), jelaskan dampaknya dan minta konfirmasi.',
        'Selalu jawab dalam Bahasa Indonesia.'
      ].join('\n')
    },
    {
      id: 'off', label: 'Nonaktif', desc: 'Tanpa mode khusus',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M5.5 5.5l13 13"/></svg>',
      keywords: [], prompt: ''
    }
  ];

  function chatModeById(id) {
    return CHAT_MODES.find((m) => m.id === id) || CHAT_MODES[0];
  }

  function detectChatMode(text) {
    const t = ' ' + String(text || '').toLowerCase() + ' ';
    let best = 'auto';
    let bestScore = 0;
    for (const mode of CHAT_MODES) {
      if (!mode.keywords || !mode.keywords.length) continue;
      let score = 0;
      for (const raw of mode.keywords) {
        const kw = String(raw).toLowerCase().trim();
        if (!kw) continue;
        if (kw.indexOf(' ') !== -1) {
          if (t.indexOf(kw) !== -1) score += 2;
        } else {
          const re = new RegExp('(^|[^a-z0-9])' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z0-9]|$)');
          if (re.test(t)) score += 1;
        }
      }
      if (score > bestScore) { bestScore = score; best = mode.id; }
    }
    return best;
  }

  function effectiveChatMode(text) {
    if (S.chatMode && S.chatMode !== 'auto') return S.chatMode;
    return detectChatMode(text);
  }

  function setChatMode(modeId) {
    S.chatMode = chatModeById(modeId).id;
    try { localStorage.setItem('sahabat.chat.mode', S.chatMode); } catch { /* abaikan */ }
    renderChatModePop();
    updateChatModeChip();
  }

  function renderChatModePop() {
    const list = $('chatModeList');
    if (!list) return;
    list.innerHTML = '';
    for (const mode of CHAT_MODES) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mode-opt' + (S.chatMode === mode.id ? ' active' : '');
      btn.dataset.mode = mode.id;
      btn.innerHTML =
        '<span class="ao-icon">' + mode.icon + '</span>' +
        '<span class="ao-text"><span class="ao-title">' + esc(mode.label) + '</span>' +
        '<span class="ao-desc">' + esc(mode.desc) + '</span></span>' +
        '<span class="ao-check">✓</span>';
      btn.addEventListener('click', () => {
        setChatMode(mode.id);
        closeChatModePop();
      });
      list.appendChild(btn);
    }
    const label = $('chatModeBtnLabel');
    if (label) label.textContent = S.chatMode === 'auto' ? 'Otomatis' : chatModeById(S.chatMode).label;
    const btn = $('chatModeBtn');
    if (btn) btn.classList.toggle('active', S.chatMode !== 'auto');
  }

  function updateChatModeChip() {
    const chip = $('chatModeChip');
    if (!chip) return;
    const input = $('chatInput');
    const mode = chatModeById(effectiveChatMode(input ? input.value : ''));
    if (mode.id === 'auto' || mode.id === 'off') { chip.classList.add('hidden'); return; }
    chip.classList.remove('hidden');
    chip.classList.toggle('auto', S.chatMode === 'auto');
    const icon = $('chatModeChipIcon');
    if (icon) icon.innerHTML = mode.icon;
    const label = $('chatModeChipLabel');
    if (label) label.textContent = mode.label;
  }

  function openChatModePop() {
    renderChatModePop();
    const pop = $('chatModePop');
    if (pop) pop.classList.remove('hidden');
  }

  function closeChatModePop() {
    const pop = $('chatModePop');
    if (pop) pop.classList.add('hidden');
  }

  // ---------- Mode Agent (Web Dev / VPS) ----------
  function effectiveAgentMode(text) {
    if (S.agent.mode === 'web' || S.agent.mode === 'vps' || S.agent.mode === 'off') return S.agent.mode;
    return detectChatMode(text);
  }

  function setAgentMode(modeId) {
    S.agent.mode = chatModeById(modeId).id;
    try { localStorage.setItem('sahabat.agent.mode', S.agent.mode); } catch { /* abaikan */ }
    renderAgentModePop();
    updateAgentModeChip();
    if ($('agentLog') && $('agentLog').querySelector('.agent-empty')) resetAgentLog();
  }

  function renderAgentModePop() {
    const list = $('agentModeList');
    if (!list) return;
    list.innerHTML = '';
    for (const mode of CHAT_MODES) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mode-opt' + (S.agent.mode === mode.id ? ' active' : '');
      btn.dataset.mode = mode.id;
      btn.innerHTML =
        '<span class="ao-icon">' + mode.icon + '</span>' +
        '<span class="ao-text"><span class="ao-title">' + esc(mode.label) + '</span>' +
        '<span class="ao-desc">' + esc(mode.desc) + '</span></span>' +
        '<span class="ao-check">✓</span>';
      btn.addEventListener('click', () => {
        setAgentMode(mode.id);
        closeAgentModePop();
      });
      list.appendChild(btn);
    }
    const label = $('agentModeBtnLabel');
    if (label) label.textContent = S.agent.mode === 'auto' ? 'Otomatis' : chatModeById(S.agent.mode).label;
    const btn = $('agentModeBtn');
    if (btn) btn.classList.toggle('active', S.agent.mode !== 'auto');
  }

  function updateAgentModeChip() {
    const chip = $('agentModeChip');
    if (!chip) return;
    const input = $('agentInput');
    const mode = chatModeById(effectiveAgentMode(input ? input.value : ''));
    if (mode.id === 'auto' || mode.id === 'off') { chip.classList.add('hidden'); return; }
    chip.classList.remove('hidden');
    chip.classList.toggle('auto', S.agent.mode === 'auto');
    const icon = $('agentModeChipIcon');
    if (icon) icon.innerHTML = mode.icon;
    const label = $('agentModeChipLabel');
    if (label) label.textContent = mode.label;
  }

  function openAgentModePop() {
    renderAgentModePop();
    const pop = $('agentModePop');
    if (pop) pop.classList.remove('hidden');
  }

  function closeAgentModePop() {
    const pop = $('agentModePop');
    if (pop) pop.classList.add('hidden');
  }

  // ---------- Task per mode (Umum / Web Dev / VPS) ----------
  const AGENT_TASKS = {
    general: [
      { label: 'Jelaskan struktur project', desc: 'Analisis struktur & arsitektur', prompt: 'Jelaskan struktur project ini secara singkat dan jelas.' },
      { label: 'Cari bug di kode', desc: 'Temukan bug & masalah potensial', prompt: 'Cari bug atau masalah di kode saya, lalu sarankan perbaikannya.' },
      { label: 'Buat README.md', desc: 'Dokumentasi project', prompt: 'Buat file README.md yang informatif untuk project ini.' },
      { label: 'Jalankan dev server', desc: 'Start development server', prompt: 'Jalankan perintah untuk memulai development server, lalu jelaskan cara mengaksesnya.' }
    ],
    web: [
      { label: 'Website (HTML/CSS/JS)', desc: 'Website statis multi-halaman', prompt: 'Buat project website baru (HTML/CSS/JS) di folder ini. Buat struktur folder dan file dasar (index.html, style.css, script.js), lalu jelaskan cara menjalankannya.' },
      { label: 'Landing Page', desc: 'Halaman promosi responsif', prompt: 'Buat landing page baru yang responsif dan modern. Buat file HTML/CSS/JS-nya, lalu jelaskan cara membukanya.' },
      { label: 'React (Vite)', desc: 'Aplikasi React modern', prompt: 'Buat project React baru (Vite) di folder ini. Setup struktur dasar, install dependencies, dan jalankan dev server.' },
      { label: 'Node.js / Express', desc: 'API/backend sederhana', prompt: 'Buat project Node.js/Express baru di folder ini. Setup struktur dasar, package.json, dan cara menjalankannya.' },
      { label: 'Python', desc: 'Script/backend Python', prompt: 'Buat project Python baru di folder ini. Setup struktur dasar, virtual environment, dan file utama.' },
      { label: 'Jalankan dev server', desc: 'Start dev server & preview', prompt: 'Jalankan perintah untuk memulai development server, lalu jelaskan cara mengaksesnya.' }
    ],
    vps: [
      { label: 'Cek status server', desc: 'Uptime, load, disk, memory', prompt: 'Cek status server: jalankan uptime, df -h, free -h, dan sebutkan layanan yang sedang berjalan. Laporkan hasilnya.' },
      { label: 'Cek firewall', desc: 'Port & aturan aktif', prompt: 'Cek status firewall (ufw status atau iptables) dan sebutkan port yang terbuka.' },
      { label: 'Buka port', desc: 'Tambah aturan firewall', prompt: 'Buka port di firewall. Tanyakan dulu port dan protokol yang dibutuhkan, konfirmasi, lalu jalankan.' },
      { label: 'Update & upgrade', desc: 'Perbarui paket sistem', prompt: 'Update dan upgrade paket sistem. Konfirmasi dulu sebelum menjalankan, lalu laporkan hasilnya.' },
      { label: 'Setting DNS', desc: 'Record A/CNAME/MX/dll.', prompt: 'Atur DNS server. Tanyakan dulu domain dan record (A/CNAME/MX/dll.) yang dibutuhkan, konfirmasi, lalu terapkan.' },
      { label: 'Install Webmin', desc: 'Panel administrasi', prompt: 'Install Webmin di server ini, lalu jelaskan cara mengaksesnya dan langkah keamanan dasar.' },
      { label: 'Install mail server', desc: 'Postfix/Dovecot', prompt: 'Install mail server (Postfix/Dovecot) di server ini, lalu jelaskan konfigurasi dasar dan cara mengamankannya.' },
      { label: 'Install service lain', desc: 'n8n, Hermes, OpenClaw, dll.', prompt: 'Install sebuah service di server. Tanyakan dulu nama service yang dibutuhkan (mis. n8n, Hermes, OpenClaw, DeepSearch, OpenHand, WhatsApp API), lalu install dan konfigurasikan.' },
      { label: 'Install Nginx', desc: 'Web server', prompt: 'Install Nginx di server ini (deteksi distro), jalankan dan enable servisnya, lalu laporkan cara verifikasinya.' },
      { label: 'Install Apache', desc: 'Web server', prompt: 'Install Apache di server ini (deteksi distro), jalankan dan enable servisnya, lalu laporkan cara verifikasinya.' },
      { label: 'Install MySQL', desc: 'Database server', prompt: 'Install MySQL/MariaDB di server ini (deteksi distro), jalankan dan enable servisnya, lalu jelaskan langkah pengamanan dasar.' },
      { label: 'Install SSL', desc: 'Certbot / Let\'s Encrypt', prompt: 'Install Certbot dan buat sertifikat SSL Let\'s Encrypt. Tanyakan dulu domain, email, dan webserver (nginx/apache) yang dipakai.' },
      { label: 'Tambah record DNS', desc: 'Zone BIND lokal', prompt: 'Tambah record DNS. Tanyakan dulu domain, nama record, tipe (A/CNAME/MX/TXT/dll.), dan nilai record, konfirmasi, lalu terapkan.' },
      { label: 'Hapus record DNS', desc: 'Zone BIND lokal', prompt: 'Hapus record DNS. Tanyakan dulu domain dan nama record yang akan dihapus, konfirmasi, lalu terapkan.' }
    ]
  };

  function agentTasksForMode() {
    const mode = effectiveAgentMode($('agentInput') ? $('agentInput').value : '');
    const base = mode === 'web' ? AGENT_TASKS.web : mode === 'vps' ? AGENT_TASKS.vps : AGENT_TASKS.general;
    return base.concat(S.customTasks || []);
  }

  function agentTaskTitle() {
    const mode = effectiveAgentMode($('agentInput') ? $('agentInput').value : '');
    if (mode === 'web') return 'Task Web Dev';
    if (mode === 'vps') return 'Task VPS & Server';
    return 'Task Umum';
  }

  function renderAgentTasks() {
    const list = $('agentTaskList');
    if (!list) return;
    list.innerHTML = '';
    for (const task of agentTasksForMode()) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mode-opt';
      btn.dataset.taskPrompt = task.prompt;
      btn.innerHTML =
        '<span class="ao-text"><span class="ao-title">' + esc(task.label) + '</span>' +
        '<span class="ao-desc">' + esc(task.desc) + '</span></span>';
      list.appendChild(btn);
    }
    const head = $('agentTaskHead');
    if (head) head.textContent = agentTaskTitle();
  }

  function openAgentTaskPop() {
    renderAgentTasks();
    const pop = $('agentTaskPop');
    if (pop) pop.classList.remove('hidden');
  }

  function closeAgentTaskPop() {
    const pop = $('agentTaskPop');
    if (pop) pop.classList.add('hidden');
  }

  function applyAgentTask(prompt) {
    const input = $('agentInput');
    if (!input) return;
    input.value = prompt || '';
    input.focus();
    input.dispatchEvent(new Event('input', { bubbles: true }));
    closeAgentTaskPop();
  }

  function agentQuickActions() {
    let html = '';
    for (const task of agentTasksForMode()) {
      html += '<button class="chip-action" data-agent-prompt="' + esc(task.prompt) + '">' + esc(task.label) + '</button>';
    }
    return html;
  }

  // ---------- Panduan Maintenance VPS ----------
  const VPS_GUIDE_TOOLS = [
    'server_status', 'firewall_status', 'firewall_allow', 'firewall_deny', 'service_restart',
    'dns_lookup', 'dns_propagation', 'dns_zone_show', 'dns_zone_add', 'dns_zone_delete',
    'install_nginx', 'install_apache', 'install_mysql', 'install_ssl'
  ];

  function renderVpsGuide() {
    const body = $('vpsGuideBody');
    if (!body) return;
    let html = '<p class="muted">Pilih mode <strong>VPS &amp; Server</strong> di panel Agent, lalu klik task di bawah — prompt-nya langsung terisi di input agent.</p>';
    html += '<div class="vps-guide-list">';
    for (const t of AGENT_TASKS.vps) {
      html += '<button class="vps-guide-item" type="button" data-guide-prompt="' + esc(t.prompt) + '">' +
        '<span class="vps-guide-label">' + esc(t.label) + '</span>' +
        '<span class="vps-guide-desc">' + esc(t.desc) + '</span></button>';
    }
    html += '</div>';
    html += '<h4>Tool yang tersedia</h4>' +
      '<p class="muted">Perintah berisiko (firewall, install, restart, DNS tulis) selalu meminta konfirmasi.</p>' +
      '<div class="vps-guide-tools">';
    for (const name of VPS_GUIDE_TOOLS) {
      html += '<span class="vps-guide-tool">' + esc(name) + '</span>';
    }
    html += '</div>';
    body.innerHTML = html;
  }

  function openVpsGuide() {
    renderVpsGuide();
    const m = $('vpsGuideModal');
    if (m) m.classList.remove('hidden');
  }

  function closeVpsGuide() {
    const m = $('vpsGuideModal');
    if (m) m.classList.add('hidden');
  }

  // ---------- Onboarding / Preferences ----------
  const OB_STEPS = 3;
  let obStep = 1;

  function renderOnboarding() {
    document.querySelectorAll('#onboardingModal .onboarding-step').forEach((el) => {
      el.classList.toggle('hidden', Number(el.dataset.step) !== obStep);
    });
    const dots = $('onboardingDots');
    if (dots) {
      dots.innerHTML = '';
      for (let i = 1; i <= OB_STEPS; i++) {
        const d = document.createElement('span');
        d.className = 'onboarding-dot' + (i === obStep ? ' active' : '');
        dots.appendChild(d);
      }
    }
    const back = $('onboardingBack');
    if (back) back.classList.toggle('hidden', obStep === 1);
    const next = $('onboardingNext');
    if (next) next.textContent = obStep === OB_STEPS ? 'Mulai' : 'Continue';
    const titles = ['Preferences', 'Keybindings', 'Plugins & Fitur'];
    const subs = [
      'Import IDE settings in one click and choose your keymap',
      'Select a keymap scheme. Menerapkan skema lain akan mengganti sebagian shortcut bawaan.',
      'Aktifkan paket bawaan & plugin Open VSX'
    ];
    const t = $('obTitle');
    if (t) t.textContent = titles[obStep - 1];
    const s = $('obSubtitle');
    if (s) s.textContent = subs[obStep - 1];
  }

  function renderObPacks() {
    const box = $('obPacks');
    if (!box) return;
    const builtin = [
      { id: 'php-pack', name: 'PHP Snippets' },
      { id: 'python-pack', name: 'Python Snippets' },
      { id: 'web-pack', name: 'Web Snippets' },
      { id: 'js-pack', name: 'JavaScript Snippets' }
    ];
    const installed = new Set((S.extensions || []).map((e) => e.id));
    box.innerHTML = '';
    for (const p of builtin) {
      const label = document.createElement('label');
      label.className = 'ob-pack';
      const checked = installed.has(p.id);
      label.innerHTML = '<input type="checkbox" data-pack="' + p.id + '"' + (checked ? ' checked disabled' : '') + ' />' +
        '<span>' + esc(p.name) + '</span><span class="ob-pack-meta">' + (checked ? 'terpasang' : 'snippet') + '</span>';
      box.appendChild(label);
    }
  }

  async function openOnboarding() {
    obStep = 1;
    const hint = $('obImportHint');
    if (hint) { hint.textContent = 'Membaca settings VS Code...'; hint.dataset.json = ''; }
    renderOnboarding();
    renderObPacks();
    const m = $('onboardingModal');
    if (m) m.classList.remove('hidden');
    try {
      const res = await api.readVsCodeSettings();
      if (res && res.ok) {
        if (hint) { hint.textContent = 'VS Code settings ditemukan: ' + res.path; hint.dataset.json = res.content || ''; }
      } else if (hint) {
        hint.textContent = 'VS Code settings tidak ditemukan — kamu bisa mulai fresh.';
      }
    } catch {
      if (hint) hint.textContent = 'VS Code settings tidak ditemukan — kamu bisa mulai fresh.';
    }
  }

  function closeOnboarding() {
    const m = $('onboardingModal');
    if (m) m.classList.add('hidden');
  }

  function applyVsCodeImport() {
    const hint = $('obImportHint');
    const raw = hint ? (hint.dataset.json || '') : '';
    if (!raw) return;
    try {
      const s = JSON.parse(raw);
      const set = (key, val) => { if (val !== undefined && val !== null) localStorage.setItem(key, String(val)); };
      set('sahabat.editorFontSize', s['editor.fontSize']);
      set('sahabat.editorFontFamily', s['editor.fontFamily']);
      set('sahabat.editorTabSize', s['editor.tabSize']);
      if (s['editor.wordWrap'] === 'on' || s['editor.wordWrap'] === true) localStorage.setItem('sahabat.editorWordWrap', '1');
      else if (s['editor.wordWrap'] === 'off' || s['editor.wordWrap'] === false) localStorage.setItem('sahabat.editorWordWrap', '0');
      const theme = s['workbench.colorTheme'] || s['editor.theme'];
      if (theme) {
        const map = {
          'Default Dark+': 'tomorrow_night',
          'Default Light+': 'chrome',
          'Monokai': 'monokai',
          'Solarized Dark': 'solarized_dark',
          'Solarized Light': 'solarized_light',
          'Dracula': 'dracula',
          'Nord': 'nord_dark',
          'GitHub Dark': 'github_dark',
          'GitHub Light': 'github_light_default',
          'Abyss': 'abyss',
          'Textmate': 'xcode'
        };
        const aceTheme = map[theme] || String(theme).toLowerCase().replace(/\s+/g, '_');
        localStorage.setItem('sahabat.editorTheme', aceTheme);
      }
      if (S.editor) S.editor.setTheme('ace/theme/' + editorThemeName());
      applyEditorPreferences();
    } catch { /* abaikan */ }
  }

  async function finishOnboarding() {
    if ($('obImport') && $('obImport').value === 'vscode') applyVsCodeImport();
    if ($('obKeymap')) localStorage.setItem('sahabat.editorKeymap', $('obKeymap').value);
    applyEditorPreferences();
    const packs = Array.from(document.querySelectorAll('#obPacks input[data-pack]:checked:not(:disabled)')).map((i) => i.dataset.pack);
    for (const id of packs) {
      try { await api.extInstallBuiltin(id); } catch { /* abaikan */ }
    }
    if (packs.length) await refreshExtensions();
    localStorage.setItem('sahabat.onboarded', '1');
    closeOnboarding();
    toast('Preferences tersimpan');
  }

  // ---------- Marketplace ----------
  const MARKETPLACE = {
    plugins: [
      { id: 'fb', name: 'Facebook', desc: 'Posting ke Halaman & Profil via Meta Graph API', icon: '📘', cat: 'marketing', badge: 'Free' },
      { id: 'tiktok', name: 'TikTok', desc: 'Upload & jadwalkan video TikTok', icon: '🎵', cat: 'marketing', badge: 'Free' },
      { id: 'youtube', name: 'YouTube Reels', desc: 'Upload Shorts/Reels via YouTube Data API', icon: '▶️', cat: 'marketing', badge: 'Free' },
      { id: 'cloudflare', name: 'Cloudflare', desc: 'Kelola DNS, firewall, dan cache Cloudflare', icon: '☁️', cat: 'developer', badge: 'Free' },
      { id: 'chrome-devtools', name: 'Chrome DevTools', desc: 'Debug & inspeksi halaman web', icon: '🛠️', cat: 'developer', badge: 'Free' }
    ],
    skills: [
      { id: 'ide-konten', name: 'Ide Konten', desc: 'Generate 10 ide konten marketing sesuai niche & tren', icon: '💡', cat: 'marketing', badge: 'Free', prompt: 'Buatkan 10 ide konten marketing yang relevan dengan niche saya. Tanyakan dulu niche dan target audiens.' },
      { id: 'caption-hashtag', name: 'Caption & Hashtag', desc: 'Tulis caption menarik + hashtag yang relevan', icon: '✍️', cat: 'marketing', badge: 'Free', prompt: 'Tulis caption menarik beserta hashtag yang relevan untuk konten saya. Tanyakan dulu topik dan tone of voice.' },
      { id: 'jadwal-posting', name: 'Jadwal Posting', desc: 'Susun jadwal posting mingguan', icon: '📅', cat: 'marketing', badge: 'Free', prompt: 'Susun jadwal posting mingguan untuk media sosial saya. Tanyakan dulu platform dan frekuensi posting.' },
      { id: 'kalender-konten', name: 'Kalender Konten', desc: 'Buat kalender konten sebulan penuh', icon: '🗓️', cat: 'marketing', badge: 'Free', prompt: 'Buatkan kalender konten sebulan penuh. Tanyakan dulu niche, platform, dan tanggal penting.' },
      { id: 'template-konten', name: 'Template Konten', desc: 'Template carousel, reel, dan video pendek', icon: '📄', cat: 'content', badge: 'Free', prompt: 'Buatkan template konten (carousel/reel/video pendek) untuk topik saya.' },
      { id: 'analitik', name: 'Analitik Sosmed', desc: 'Ringkas performa & sarankan perbaikan', icon: '📊', cat: 'marketing', badge: 'Free', prompt: 'Ringkaskan performa media sosial saya dan sarankan perbaikan. Tanyakan dulu data atau akses analytics.' }
    ],
    mcp: [
      { id: 'mcp-fb', name: 'Facebook MCP', desc: 'Sambungkan agent ke Facebook via MCP server', icon: '🔌', cat: 'marketing', badge: 'Local' },
      { id: 'mcp-supabase', name: 'Supabase MCP', desc: 'Akses database Supabase langsung dari agent', icon: '🔌', cat: 'developer', badge: 'Local' },
      { id: 'mcp-postgres', name: 'PostgreSQL MCP', desc: 'Akses database PostgreSQL langsung dari agent', icon: '🔌', cat: 'developer', badge: 'Local' }
    ]
  };

  let mkTab = 'plugins';
  let mkCat = 'all';
  let mkQuery = '';

  function renderMarketplace() {
    const grid = $('mkGrid');
    if (!grid) return;
    const items = MARKETPLACE[mkTab] || [];
    const q = String(mkQuery || '').toLowerCase();
    const list = items.filter((it) => {
      if (mkCat !== 'all' && it.cat !== mkCat) return false;
      if (q && !(String(it.name).toLowerCase().includes(q) || String(it.desc).toLowerCase().includes(q))) return false;
      return true;
    });
    grid.innerHTML = '';
    if (!list.length) {
      grid.innerHTML = '<p class="mk-empty">Tidak ada item yang cocok.</p>';
      return;
    }
    const installed = new Set(S.installedSkills || []);
    for (const it of list) {
      const card = document.createElement('div');
      card.className = 'mk-card';
      const isSkill = mkTab === 'skills';
      const isInstalled = isSkill && installed.has(it.id);
      card.innerHTML =
        '<div class="mk-icon">' + it.icon + '</div>' +
        '<div class="mk-info"><div class="mk-name">' + esc(it.name) + '</div>' +
        '<div class="mk-desc">' + esc(it.desc) + '</div></div>' +
        '<div class="mk-actions"><span class="mk-badge' + (it.badge === 'Local' ? ' local' : '') + '">' + esc(it.badge) + '</span>' +
        '<button class="mk-install' + (isInstalled ? ' installed' : '') + '" type="button">' + (isInstalled ? 'Pakai' : 'Install') + '</button></div>';
      card.querySelector('.mk-install').addEventListener('click', () => {
        if (isInstalled) useMarketplaceSkill(it);
        else installMarketplaceItem(it);
      });
      grid.appendChild(card);
    }
  }

  function installMarketplaceItem(it) {
    if (mkTab === 'skills') {
      S.installedSkills = S.installedSkills || [];
      if (!S.installedSkills.includes(it.id)) S.installedSkills.push(it.id);
      try { localStorage.setItem('sahabat.skills', JSON.stringify(S.installedSkills)); } catch { /* abaikan */ }
      if (it.prompt) {
        S.customTasks = S.customTasks || [];
        if (!S.customTasks.some((t) => t.label === it.name)) {
          S.customTasks.push({ label: it.name, desc: it.desc, prompt: it.prompt });
        }
        try { localStorage.setItem('sahabat.customTasks', JSON.stringify(S.customTasks)); } catch { /* abaikan */ }
      }
      toast('Skill terpasang: ' + it.name + ' — klik "Pakai" untuk memakainya.');
      renderMarketplace();
    } else {
      toast(it.name + ' segera hadir.');
    }
  }

  function useMarketplaceSkill(it) {
    switchView('workspace');
    const app = document.querySelector('.app');
    if (app && app.classList.contains('hide-agent')) {
      app.classList.remove('hide-agent');
      const rail = $('agentRail');
      if (rail) rail.classList.add('hidden');
    }
    const input = $('agentInput');
    if (input) {
      input.value = it.prompt || '';
      input.focus();
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    toast('Skill dipakai: ' + it.name);
  }

  // ---------- Mode Developer / Advance ----------
  function setUserMode(mode) {
    S.userMode = mode === 'advance' ? 'advance' : 'developer';
    try { localStorage.setItem('sahabat.userMode', S.userMode); } catch { /* abaikan */ }
    document.querySelectorAll('.mode-opt').forEach((b) => b.classList.toggle('active', b.dataset.mode === S.userMode));
    document.body.classList.toggle('mode-advance', S.userMode === 'advance');
    document.body.classList.toggle('mode-developer', S.userMode === 'developer');
  }

  // ---------- Desktop / Dashboard ----------
  function renderDesktop() {
    const g = $('dskGreeting');
    if (g) {
      const h = new Date().getHours();
      const salam = h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 19 ? 'Selamat sore' : 'Selamat malam';
      g.textContent = salam;
    }
    const d = $('dskDate');
    if (d) d.textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const srv = $('dskServer');
    if (srv) {
      if (S.target.type === 'local') srv.textContent = 'Target: lokal · ' + (S.local.root || 'belum ada folder');
      else if (S.target.type === 'ssh' || S.target.type === 'ftp') srv.textContent = 'Target: ' + S.target.type.toUpperCase() + ' · ' + (remoteSession() ? remoteSession().label : 'terputus');
      else srv.textContent = 'Belum ada koneksi.';
    }
    const tk = $('dskTasks');
    if (tk) {
      const n = (agentTasksForMode() || []).length;
      tk.textContent = n + ' task tersedia' + (S.installedSkills && S.installedSkills.length ? ' · ' + S.installedSkills.length + ' skill terpasang' : '');
    }
    const recent = $('dskRecent');
    if (recent) {
      recent.innerHTML = '';
      const tabs = (S.tabs || []).slice(-6).reverse();
      if (!tabs.length) recent.innerHTML = '<p class="dsk-muted">Belum ada file.</p>';
      for (const t of tabs) {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'dsk-recent-item';
        item.textContent = baseName(t.path || '');
        item.addEventListener('click', () => { switchView('workspace'); setActiveSession(t); });
        recent.appendChild(item);
      }
    }
    const st = $('dskStatus');
    if (st) {
      const key = S.settings && S.settings.hasKey ? 'API key aktif' : 'API key belum diisi';
      const model = S.model || (S.models[0] && S.models[0].id) || '-';
      st.innerHTML =
        '<div><span>Key</span><strong>' + esc(key) + '</strong></div>' +
        '<div><span>Model</span><strong>' + esc(model) + '</strong></div>' +
        '<div><span>Target</span><strong>' + esc(S.target.type === 'local' ? 'Lokal' : S.target.type.toUpperCase()) + '</strong></div>' +
        '<div><span>Versi</span><strong>' + esc('v' + ((S.settings && S.settings.version) || '1.2.0')) + '</strong></div>';
    }
    renderScheduleWidget();
    loadWeatherWidget();
    loadServerWidget();
  }

  const DSK_CITIES = [
    ['Jakarta', -6.2088, 106.8456],
    ['Surabaya', -7.2575, 112.7521],
    ['Bandung', -6.9175, 107.6191],
    ['Medan', 3.5952, 98.6722],
    ['Semarang', -6.9932, 110.4203],
    ['Yogyakarta', -7.7956, 110.3695],
    ['Makassar', -5.1477, 119.4327],
    ['Denpasar', -8.6705, 115.2126],
    ['Palembang', -2.9761, 104.7754],
    ['Balikpapan', -1.2379, 116.8529]
  ];

  async function loadServerWidget() {
    const body = $('dskServerBody');
    if (!body) return;
    if (S.target.type !== 'ssh' || !remoteSession()) {
      body.textContent = 'Hubungkan server (SSH) untuk melihat status.\nBuka Workspace → Koneksi SSH/FTP.';
      return;
    }
    body.textContent = 'Memuat status server…';
    try {
      const res = await api.agentServerStatus(agentTargetPayload());
      body.textContent = (res && res.ok) ? (res.output || '(tanpa output)') : ('Gagal: ' + ((res && res.error) || 'terjadi kesalahan'));
    } catch (e) {
      body.textContent = 'Gagal: ' + ((e && e.message) || e);
    }
  }

  function renderScheduleWidget() {
    const body = $('dskSchedule');
    if (!body) return;
    const plan = [
      ['Sen', '09:00', 'Feed edukasi'],
      ['Sel', '12:00', 'Feed promo'],
      ['Rab', '19:00', 'Reels / TikTok'],
      ['Kam', '09:00', 'Feed tips'],
      ['Jum', '17:00', 'Testimoni'],
      ['Sab', '10:00', 'Feed ringan'],
      ['Min', '—', 'Istirahat']
    ];
    let html = '<div class="dsk-schedule">';
    for (const [day, time, note] of plan) {
      html += '<div class="dsk-schedule-row"><span class="dsk-schedule-day">' + day + '</span>' +
        '<span class="dsk-schedule-time">' + time + '</span>' +
        '<span class="dsk-schedule-note">' + note + '</span></div>';
    }
    body.innerHTML = html + '</div>';
  }

  async function loadWeatherWidget(cityName) {
    const body = $('dskWeatherBody');
    if (!body) return;
    const sel = $('dskWeatherCity');
    const chosen = cityName || (sel && sel.value) || localStorage.getItem('sahabat.weatherCity') || 'Jakarta';
    const city = DSK_CITIES.find((c) => c[0] === chosen) || DSK_CITIES[0];
    body.textContent = 'Memuat cuaca…';
    try {
      const res = await api.getWeather(city[1], city[2]);
      const cw = (res && res.ok && res.current) || null;
      if (!cw) throw new Error((res && res.error) || 'tidak ada data');
      const code = Number(cw.weathercode);
      const map = { 0: ['☀️', 'Cerah'], 1: ['🌤️', 'Sebagian cerah'], 2: ['⛅', 'Berawan sebagian'], 3: ['☁️', 'Berawan'], 45: ['🌫️', 'Berkabut'], 48: ['🌫️', 'Kabut tebal'], 51: ['🌦️', 'Gerimis ringan'], 53: ['🌦️', 'Gerimis'], 55: ['🌧️', 'Gerimis lebat'], 61: ['🌧️', 'Hujan ringan'], 63: ['🌧️', 'Hujan'], 65: ['🌧️', 'Hujan lebat'], 71: ['🌨️', 'Salju ringan'], 73: ['🌨️', 'Salju'], 75: ['🌨️', 'Salju lebat'], 80: ['🌦️', 'Hujan rintik'], 81: ['🌧️', 'Hujan sedang'], 82: ['⛈️', 'Hujan deras'], 95: ['⛈️', 'Badai petir'], 96: ['⛈️', 'Badai + hail'], 99: ['⛈️', 'Badai lebat'] };
      const [icon, desc] = map[code] || ['🌡️', 'Lainnya'];
      body.innerHTML = '<div class="dsk-weather"><span class="dsk-weather-icon">' + icon + '</span>' +
        '<span class="dsk-weather-temp">' + Math.round(cw.temperature) + '°C</span>' +
        '<span class="dsk-weather-desc">' + desc + '</span></div>' +
        '<span class="dsk-weather-city-label">' + esc(city[0]) + ' · angin ' + Math.round(cw.windspeed || 0) + ' km/j</span>';
      try { localStorage.setItem('sahabat.weatherCity', city[0]); } catch { /* abaikan */ }
    } catch (e) {
      body.innerHTML = '<p class="dsk-muted">Gagal memuat cuaca.</p>';
    }
  }

  function renderChatMarkdown(text) {
    const src = String(text || '');
    if (!src) return '';
    const parts = src.split(/```/);
    let html = '';
    for (let i = 0; i < parts.length; i += 1) {
      if (i % 2 === 1) {
        let body = parts[i];
        let lang = '';
        const nl = body.indexOf('\n');
        if (nl !== -1) {
          const first = body.slice(0, nl).trim();
          if (first.length <= 20 && /^[a-zA-Z0-9_+#.-]*$/.test(first)) lang = first;
          body = body.slice(nl + 1);
        }
        const code = body.replace(/\n$/, '');
        html +=
          '<div class="code-head"><span>' + esc(lang || 'kode') + '</span>' +
          '<button class="copy-code" type="button">Salin</button></div>' +
          '<pre class="code"><code>' + esc(code) + '</code></pre>';
      } else {
        let chunk = esc(parts[i]);
        chunk = chunk.replace(/`([^`\n]+)`/g, '<code>$1</code>');
        chunk = chunk.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
        chunk = chunk.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
        chunk = chunk.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
        // Aksen struktur laporan: heading (#), nomor list (1.), dan bullet (-, *).
        chunk = chunk.replace(/(^|\n)(#{1,6})(\s+)([^\n]+)/g, '$1<span class="md-h">$4</span>');
        chunk = chunk.replace(/(^|\n)(\s*)(\d+\.)(\s+)/g, '$1$2<span class="md-li-num">$3</span>$4');
        chunk = chunk.replace(/(^|\n)(\s*)([-*])(\s+)/g, '$1$2<span class="md-li-bullet">$3</span>$4');
        chunk = chunk.replace(/\n/g, '<br>');
        html += chunk;
      }
    }
    return html;
  }

  const COPY_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';

  function attachCopy(el, text) {
    if (!el) return;
    const btn = document.createElement('button');
    btn.className = 'msg-copy';
    btn.title = 'Salin teks ini (bisa juga blok teks lalu Ctrl+C)';
    btn.innerHTML = COPY_SVG;
    btn.addEventListener('click', async () => {
      try {
        await api.copyText(String(text || ''));
        toast('Teks disalin — tempel dengan Ctrl+V');
      } catch { /* abaikan */ }
    });
    el.appendChild(btn);
  }

  const SPEAK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  const STOP_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';

  function attachSpeak(el, text) {
    if (!el || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    const btn = document.createElement('button');
    btn.className = 'msg-copy msg-speak';
    btn.title = 'Bacakan suara (text-to-speech)';
    btn.innerHTML = SPEAK_SVG;
    let speaking = false;
    btn.addEventListener('click', () => {
      if (speaking) {
        window.speechSynthesis.cancel();
        speaking = false;
        btn.innerHTML = SPEAK_SVG;
        return;
      }
      const u = new SpeechSynthesisUtterance(String(text || ''));
      u.lang = 'id-ID';
      u.rate = 1;
      u.onend = () => { speaking = false; btn.innerHTML = SPEAK_SVG; };
      u.onerror = () => { speaking = false; btn.innerHTML = SPEAK_SVG; };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      speaking = true;
      btn.innerHTML = STOP_SVG;
    });
    el.appendChild(btn);
  }

  // ---------- Voice chat (record + transkripsi via gateway ASR) ----------
  let mediaRecorder = null;
  let audioChunks = [];
  let voiceRecording = false;
  let voiceTarget = 'chatInput';

  function setVoiceRecording(on) {
    voiceRecording = on;
    ['voiceChatBtn', 'voiceAgentBtn'].forEach((id) => {
      const btn = $(id);
      if (btn) {
        btn.classList.toggle('recording', on);
        btn.title = on ? 'Berhenti merekam (klik lagi)' : 'Voice chat — bicara (record + transkripsi)';
      }
    });
    const st = $('chatStatus');
    if (st) st.textContent = on ? 'Merekam suara...' : '';
    const ast = $('agentStatus');
    if (ast) ast.textContent = on ? 'Merekam suara...' : '';
  }

  function stopVoiceChat() {
    setVoiceRecording(false);
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try { mediaRecorder.stop(); } catch { /* abaikan */ }
    }
  }

  async function startVoiceRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast('Browser tidak mendukung akses microphone.');
      return;
    }
    if (typeof MediaRecorder === 'undefined') {
      toast('Browser tidak mendukung perekaman audio.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data && e.data.size) audioChunks.push(e.data); };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => { try { t.stop(); } catch { /* abaikan */ } });
        await transcribeRecording();
      };
      mediaRecorder.start();
      setVoiceRecording(true);
      toast('Merekam... klik lagi untuk berhenti.');
    } catch (e) {
      const msg = e && (e.name === 'NotAllowedError' || e.name === 'SecurityError')
        ? 'Izin microphone ditolak.'
        : ('Gagal mengakses microphone: ' + (e && e.message ? e.message : e));
      toast(msg);
      setVoiceRecording(false);
    }
  }

  function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  }

  function audioBufferToWav(buffer) {
    const numCh = Math.min(2, buffer.numberOfChannels || 1);
    const sampleRate = buffer.sampleRate || 16000;
    const samples = buffer.length;
    const dataLen = samples * numCh * 2;
    const wav = new ArrayBuffer(44 + dataLen);
    const view = new DataView(wav);
    const writeStr = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + dataLen, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numCh, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numCh * 2, true);
    view.setUint16(32, numCh * 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, dataLen, true);
    let off = 44;
    for (let i = 0; i < samples; i++) {
      for (let ch = 0; ch < numCh; ch++) {
        let s = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i] || 0));
        view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        off += 2;
      }
    }
    return wav;
  }

  async function transcribeRecording() {
    setVoiceRecording(false);
    const mime = (mediaRecorder && mediaRecorder.mimeType) || 'audio/webm';
    const blob = new Blob(audioChunks, { type: mime });
    if (!blob.size) { toast('Tidak ada suara terrekam.'); return; }
    setChatStatus('Mengirim audio ke model ASR...');
    try {
      const arrayBuf = await blob.arrayBuffer();
      const AC = window.AudioContext || window.webkitAudioContext;
      let wav = arrayBuf;
      let format = mime.replace(/^audio\//, '').split(';')[0];
      try {
        const ctx = new AC();
        const audioBuf = await ctx.decodeAudioData(arrayBuf);
        wav = audioBufferToWav(audioBuf);
        format = 'wav';
        if (ctx.close) ctx.close();
      } catch { /* kirim format asli bila decode gagal */ }
      const b64 = arrayBufferToBase64(wav);
      const res = await api.transcribeAudio(b64, format);
      if (res && res.ok) {
        const text = String(res.text || '').trim();
        if (text) {
          const input = $(voiceTarget);
          if (input) {
            input.value = text;
            input.focus();
          }
          toast('Transkripsi: ' + (text.length > 60 ? text.slice(0, 60) + '…' : text));
        } else {
          toast('Tidak ada teks yang dikenali.');
        }
      } else {
        toast((res && res.error) || 'Transkripsi gagal.');
      }
    } catch (e) {
      toast('Gagal memproses audio: ' + (e && e.message ? e.message : e));
    } finally {
      setChatStatus('');
    }
  }

  function toggleVoiceChat(target) {
    voiceTarget = target || 'chatInput';
    if (voiceRecording) { stopVoiceChat(); return; }
    startVoiceRecording();
  }

  function chatAdd(role, text, images) {
    const empty = $('chat').querySelector('.empty');
    if (empty) empty.remove();
    updateChatHero();
    trimChat();
    const row = document.createElement('div');
    row.className = 'message ' + role;
    const name = role === 'user' ? 'Anda' : role === 'error' ? 'Error' : 'AI';
    row.innerHTML = '<div class="message-header"><div class="avatar">' + (role === 'user' ? 'You' : role === 'error' ? '!' : 'AI') + '</div><span class="message-username">' + name + '</span></div><div class="bubble"></div>';
    const bubble = row.querySelector('.bubble');
    if (images && images.length) {
      const wrap = document.createElement('div');
      wrap.className = 'msg-images';
      for (const img of images) {
        const el = document.createElement('img');
        el.src = img.dataUrl;
        el.alt = img.name || 'gambar';
        wrap.appendChild(el);
      }
      bubble.appendChild(wrap);
    }
    const body = document.createElement('div');
    body.className = 'chat-body';
    if (role === 'assistant') body.innerHTML = renderChatMarkdown(text || '');
    else body.textContent = text || '';
    bubble.appendChild(body);
    if (role !== 'error' && text) attachCopy(bubble, text);
    if (role === 'assistant' && text) attachSpeak(bubble, text);
    $('chat').appendChild(row);
    $('chat').scrollTop = $('chat').scrollHeight;
    return body;
  }

  // Batasi DOM & riwayat chat agar sesi panjang tetap ringan.
  function trimChat(max = 120) {
    const box = $('chat');
    if (!box) return;
    const msgs = Array.from(box.querySelectorAll('.message'));
    if (msgs.length > max) {
      const removeCount = msgs.length - max;
      for (let i = 0; i < removeCount; i++) msgs[i].remove();
      if (!box.querySelector('.chat-trim-note')) {
        const note = document.createElement('div');
        note.className = 'agent-note chat-trim-note';
        note.textContent = 'Pesan lama disembunyikan untuk menjaga performa.';
        box.insertBefore(note, box.firstChild);
      }
    }
    if (Array.isArray(S.chat) && S.chat.length > max) S.chat = S.chat.slice(-max);
  }

  function persistChat() {
    try {
      localStorage.setItem(CHAT_STORE, JSON.stringify(S.chat.slice(-60)));
    } catch {
      try {
        const textOnly = S.chat.slice(-60).map((m) => {
          if (typeof m.content === 'string') return m;
          const parts = Array.isArray(m.content) ? m.content : [];
          const txt = parts.filter((p) => p.type === 'text').map((p) => p.text).join('\n');
          const nImg = parts.filter((p) => p.type === 'image_url').length;
          return {
            role: m.role,
            content: (txt ? txt + '\n' : '') + (nImg ? '[gambar x' + nImg + ']' : '')
          };
        });
        localStorage.setItem(CHAT_STORE, JSON.stringify(textOnly));
      } catch {}
    }
  }

  function loadChat() {
    try {
      const raw = localStorage.getItem(CHAT_STORE);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  function renderChatHistory() {
    for (const m of S.chat) {
      let text = '';
      if (typeof m.content === 'string') text = m.content;
      else if (Array.isArray(m.content)) text = m.content.filter((p) => p.type === 'text').map((p) => p.text).join('\n');
      chatAdd(m.role === 'assistant' ? 'assistant' : 'user', text);
    }
  }

  function newChat() {
    if (S.busy) { toast('Tunggu respons selesai atau tekan Stop.'); return; }
    S.chat = [];
    S.attachments = [];
    persistChat();
    $('chat').innerHTML = '';
    renderAttachments();
    setChatStatus('');
    $('chatInput').focus();
    toast('Chat baru');
  }

  function renderAttachments() {
    const box = $('chatAttachments');
    box.innerHTML = '';
    box.classList.toggle('hidden', S.attachments.length === 0);
    for (const a of S.attachments) {
      const item = document.createElement('div');
      item.className = 'attachment';
      item.innerHTML =
        '<img alt="' + esc(a.name) + '" src="' + a.dataUrl + '" />' +
        '<span class="attachment-size">' + Math.max(1, Math.round(a.size / 1024)) + ' KB</span>' +
        '<button class="remove-attachment" type="button" title="Hapus gambar">&times;</button>';
      item.querySelector('.remove-attachment').addEventListener('click', () => {
        S.attachments = S.attachments.filter((x) => x.id !== a.id);
        renderAttachments();
      });
      box.appendChild(item);
    }
  }

  function addChatImages(list) {
    const files = Array.from(list || []).filter((f) => f && /^image\//.test(f.type));
    if (!files.length) return;
    for (const file of files) {
      if (file.size > 8 * 1024 * 1024) {
        toast('Gambar ' + (file.name || '') + ' terlalu besar (maks 8 MB).');
        continue;
      }
      const id = 'att-' + Date.now() + '-' + Math.random().toString(16).slice(2, 8);
      const reader = new FileReader();
      reader.onload = () => {
        S.attachments.push({
          id,
          name: file.name || 'gambar.png',
          size: file.size,
          dataUrl: String(reader.result || '')
        });
        renderAttachments();
      };
      reader.onerror = () => toast('Gagal membaca gambar.');
      reader.readAsDataURL(file);
    }
  }

  async function sendChat() {
    const input = $('chatInput');
    const text = input.value.trim();
    const images = S.attachments.slice();
    if ((!text && !images.length) || S.busy) return;
    if (!S.settings.hasKey) { openSettings(); return; }
    if (text) rememberInput('chat', text);
    stopVoiceChat();
    input.value = '';
    updateChatModeChip();
    S.attachments = [];
    renderAttachments();
    S.busy = true;
    $('sendChat').classList.add('hidden');
    $('stopChat').classList.remove('hidden');
    setChatStatus('Menghubungi model...');
    const contentParts = [];
    if (text) contentParts.push({ type: 'text', text });
    for (const img of images) contentParts.push({ type: 'image_url', image_url: { url: img.dataUrl } });
    const content = images.length ? contentParts : text;
    S.chat.push({ role: 'user', content });
    chatAdd('user', text, images);
    const body = chatAdd('assistant', '');
    body.innerHTML =
      '<span class="agent-thinking-row">' +
        '<span class="ring-spinner agent-thinking-spinner" role="status" aria-label="Memikirkan">' + RING_DOTS + '</span>' +
        '<span class="agent-thinking-label">Memikirkan…</span>' +
      '</span>';
    const requestId = 'req-' + Date.now();
    S.requestId = requestId;
    let full = '';
    const offChunk = api.onChunk((d) => {
      if (d.requestId !== requestId) return;
      full += d.delta || '';
      body.innerHTML = renderChatMarkdown(full);
      $('chat').scrollTop = $('chat').scrollHeight;
      setChatStatus('Mengetik...');
    });
    const offDone = api.onDone((d) => {
      if (d.requestId !== requestId) return;
      cleanup();
      if (d.aborted) setChatStatus('Dihentikan');
      else {
        S.chat.push({ role: 'assistant', content: full });
        persistChat();
        setChatStatus('');
      }
    });
    const offErr = api.onError((d) => {
      if (d.requestId !== requestId) return;
      cleanup();
      body.closest('.message').classList.add('error');
      body.textContent = d.message || 'Terjadi kesalahan.';
      setChatStatus('');
    });
    function cleanup() {
      offChunk(); offDone(); offErr();
      S.busy = false;
      S.requestId = null;
      $('sendChat').classList.remove('hidden');
      $('stopChat').classList.add('hidden');
    }
    const mode = chatModeById(effectiveChatMode(text));
    const apiMessages = S.chat.slice(-20);
    if (mode.prompt) apiMessages.unshift({ role: 'system', content: mode.prompt });
    const res = await api.startChat({ requestId, model: currentModel(), messages: apiMessages });
    if (!res || !res.ok) {
      cleanup();
      body.closest('.message').classList.add('error');
      body.textContent = (res && res.error && res.error.message) || 'Gagal mengirim.';
      setChatStatus('');
    }
  }

  // ---------- Models & snippets ----------
  function renderModelList() {
    const q = ($('modelSearch').value || '').toLowerCase();
    const list = S.models.filter((m) => !q || m.id.toLowerCase().includes(q) || (m.name || '').toLowerCase().includes(q));
    const box = $('modelList');
    box.innerHTML = '';
    if (!list.length) {
      box.innerHTML = '<p class="muted">' + (S.settings.hasKey ? 'Tidak ada model yang cocok.' : 'Isi API key dulu untuk memuat model.') + '</p>';
      return;
    }
    const activeId = currentModel();
    for (const m of list) {
      const isAktif = activeId === m.id;
      const badges = [];
      if (isAktif) badges.push('<span class="m-badge aktif">aktif</span>');
      if (m.thinking) badges.push('<span class="m-badge">thinking</span>');
      if (m.owner) badges.push('<span class="m-badge netral">' + esc(m.owner) + '</span>');
      const row = document.createElement('div');
      row.className = 'model-row' + (isAktif ? ' model-aktif' : '');
      row.innerHTML =
        '<div class="model-info">' +
          '<div class="model-name">' + esc(m.name || m.id) + '</div>' +
          '<div class="model-id">' + esc(m.id) + '</div>' +
          (badges.length ? '<div class="model-badges">' + badges.join('') + '</div>' : '') +
        '</div>' +
        '<div class="model-actions"><button class="ghost small use"' + (isAktif ? ' disabled' : '') + '>' + (isAktif ? 'Aktif' : 'Pakai') + '</button><button class="ghost small copy">Salin</button></div>';
      row.querySelector('.use').addEventListener('click', () => { setModel(m.id); toast('Model aktif: ' + m.id); });
      row.querySelector('.copy').addEventListener('click', async () => { await api.copyText(m.id); toast('ID disalin'); });
      box.appendChild(row);
    }
  }

  async function loadModels() {
    const res = await api.listModels();
    if (!res.ok) {
      S.models = [];
      renderModelOptions();
      renderModelList();
      if (S.settings.hasKey) toast((res.error && res.error.message) || 'Gagal memuat model');
      return;
    }
    S.models = res.models || [];
    if (res.access && res.access.note) S.modelAccessNote = res.access.note;
    renderModelOptions();
    renderModelList();
  }

  function renderSnippet() {
    const base = S.settings.baseUrl || 'https://www.sahabatmobile.com/api/v1';
    const model = currentModel();
    $('snippetCode').textContent = buildSnippet(S.snippet, base, model);
    $('apiBase').textContent = base;
    $('apiModel').textContent = model;
  }

  function buildSnippet(kind, base, model) {
    if (kind === 'python') {
      return [
        'from openai import OpenAI',
        '',
        'client = OpenAI(',
        '    base_url="' + base + '",',
        '    api_key="sk-..."',
        ')',
        '',
        'resp = client.chat.completions.create(',
        '    model="' + model + '",',
        '    messages=[{"role": "user", "content": "Halo!"}],',
        ')',
        'print(resp.choices[0].message.content)'
      ].join('\n');
    }
    if (kind === 'node') {
      return [
        'import OpenAI from "openai";',
        '',
        'const client = new OpenAI({',
        '  baseURL: "' + base + '",',
        '  apiKey: "sk-...",',
        '});',
        '',
        'const resp = await client.chat.completions.create({',
        '  model: "' + model + '",',
        '  messages: [{ role: "user", content: "Halo!" }],',
        '});',
        'console.log(resp.choices[0].message.content);'
      ].join('\n');
    }
    if (kind === 'opencode') {
      return JSON.stringify({
        $schema: 'https://opencode.ai/config.json',
        provider: {
          sahabatmobile: {
            npm: '@ai-sdk/openai-compatible',
            name: 'SahabatMobile',
            options: { baseURL: base, apiKey: '{env:SAHABAT_API_KEY}' },
            models: { [model]: { name: model } }
          }
        }
      }, null, 2);
    }
    return [
      'curl ' + base + '/chat/completions \\',
      '  -H "Content-Type: application/json" \\',
      '  -H "Authorization: Bearer sk-..." \\',
      '  -d \'{"model":"' + model + '","messages":[{"role":"user","content":"Halo!"}]}\''
    ].join('\n');
  }

  // ---------- Settings / modals ----------
  function setModelAccessInfo(text) {
    const el = $('modelAccessInfo');
    if (el) el.textContent = text || '';
  }

  function renderModelAccessInfo(access) {
    if (!access) return;
    const total = access.total != null ? access.total : '?';
    const shown = access.shown != null ? access.shown : '?';
    const hidden = access.hidden != null ? access.hidden : 0;
    const blocked = access.blockedCount || 0;
    const parts = [access.note || 'Model sesuai paket Anda.'];
    if (access.plan) parts.push('Paket: ' + access.plan + '.');
    const det = access.detected === false ? '(tidak terdeteksi — tampil semua)' : '(terdeteksi)';
    parts.push('Ditampilkan ' + shown + '/' + total + ' model' + (hidden ? ' · ' + hidden + ' disembunyikan' : '') + (blocked ? ' · ' + blocked + ' model pernah ditolak gateway' : '') + ' ' + det);
    if (S.settings && S.settings.modelAccessAll) {
      parts.unshift('⚠ Filter paket NONAKTIF ("Tampilkan semua model" aktif) — model di luar paket akan memotong saldo wallet.');
    }
    setModelAccessInfo(parts.join(' '));
  }

  function openSettings() {
    $('apiKeyInput').value = '';
    $('baseUrlInput').value = S.settings.baseUrl || '';
    $('editorThemeSelect').value = editorThemeName();
    $('appVersion').textContent = 'v' + (S.settings.version || '1.0.0');
    $('updateFeedInput').value = S.settings.updateFeed || '';
    $('autoUpdateCheck').checked = S.settings.autoUpdate !== false;
    $('modelAccessModeSelect').value = (S.settings && S.settings.modelAccessMode) || 'auto';
    $('modelAccessAllCheck').checked = !!(S.settings && S.settings.modelAccessAll);
    setModelAccessInfo(S.modelAccessNote || 'Deteksi model yang diizinkan paket Anda…');
    if (S.update && S.update.hasUpdate) {
      setUpdateStatus('Versi baru ' + S.update.latest + ' tersedia (sekarang v' + S.update.current + ').');
    }
    $('settingsModal').classList.remove('hidden');
    setTimeout(() => $('apiKeyInput').focus(), 50);
  }

  async function saveSettings() {
    const payload = {
      baseUrl: $('baseUrlInput').value.trim(),
      updateFeed: $('updateFeedInput').value.trim(),
      autoUpdate: $('autoUpdateCheck').checked,
      modelAccessMode: $('modelAccessModeSelect').value || 'auto',
      modelAccessAll: $('modelAccessAllCheck').checked
    };
    const key = $('apiKeyInput').value.trim();
    if (key) payload.apiKey = key;
    S.settings = await api.saveSettings(payload);
    updateKeyBadge();
    const theme = $('editorThemeSelect').value || 'tomorrow_night';
    localStorage.setItem('sahabat.editorTheme', theme);
    try { S.editor && S.editor.setTheme('ace/theme/' + theme); } catch {}
    $('settingsModal').classList.add('hidden');
    if (S.settings.hasKey) loadModels();
  }

  let keyDetectTimer = null;
  function autoDetectKey() {
    clearTimeout(keyDetectTimer);
    keyDetectTimer = setTimeout(async () => {
      const key = $('apiKeyInput').value.trim();
      if (key.length < 8) return;
      setModelAccessInfo('API key dimasukkan — mendeteksi model & paket…');
      try {
        const payload = {
          baseUrl: $('baseUrlInput').value.trim(),
          modelAccessMode: $('modelAccessModeSelect').value || 'auto',
          modelAccessAll: $('modelAccessAllCheck').checked
        };
        if (key) payload.apiKey = key;
        S.settings = await api.saveSettings(payload);
        updateKeyBadge();
        const res = await api.listModels();
        if (res && res.access) renderModelAccessInfo(res.access);
        if (res && res.ok) {
          S.models = res.models || [];
          S.modelAccessNote = res.access && res.access.note ? res.access.note : S.modelAccessNote;
          renderModelOptions();
          renderModelList();
        } else if (res && res.error) {
          setModelAccessInfo('Gagal memuat model: ' + res.error);
        }
      } catch (err) {
        setModelAccessInfo('Gagal mendeteksi: ' + (err && err.message ? err.message : String(err)));
      }
    }, 700);
  }

  async function detectModelAccess() {
    setModelAccessInfo('Mendeteksi model yang diizinkan paket Anda…');
    const res = await api.listModels();
    if (res && res.access) renderModelAccessInfo(res.access);
    else setModelAccessInfo('Deteksi tidak mengembalikan data model.');
    if (res && res.ok) {
      S.models = res.models || [];
      S.modelAccessNote = res.access && res.access.note ? res.access.note : S.modelAccessNote;
      renderModelOptions();
      renderModelList();
      toast('Model dideteksi: ' + (res.models || []).length + ' model');
    }
  }

  // ---------- Auto-update ----------
  function setUpdateStatus(text) {
    const el = $('updateStatus');
    if (el) el.textContent = text || '';
  }

  async function checkUpdates(manual) {
    if (manual) {
      setUpdateStatus('Memeriksa pembaruan...');
      $('checkUpdate').disabled = true;
    }
    let res;
    try {
      res = await api.checkUpdate();
    } catch (err) {
      res = { ok: false, error: 'Gagal cek pembaruan: ' + err.message };
    }
    if (manual) $('checkUpdate').disabled = false;
    if (!res.ok) {
      setUpdateStatus(res.error || 'Gagal cek pembaruan.');
      if (manual) toast(res.error || 'Gagal cek pembaruan.');
      return res;
    }
    S.update = res;
    if (res.hasUpdate) {
      $('updateBadge').classList.remove('hidden');
      $('updateBadge').textContent = 'Update ' + res.latest;
      setUpdateStatus('Versi baru ' + res.latest + ' tersedia (sekarang v' + res.current + ').');
      if (manual) toast('Update tersedia: v' + res.latest);
    } else {
      $('updateBadge').classList.add('hidden');
      setUpdateStatus(res.noFeed
        ? 'Feed pembaruan belum tersedia.'
        : 'Aplikasi sudah versi terbaru (v' + res.current + ').');
      if (manual) toast(res.noFeed ? 'Feed pembaruan belum tersedia' : 'Sudah versi terbaru');
    }
    return res;
  }

  async function downloadUpdate(skipConfirm) {
    const res = S.update;
    if (!res || !res.hasUpdate) return;
    if (!res.url) { toast('Feed tidak menyertakan URL unduhan.'); return; }
    if (!skipConfirm && !window.confirm('Unduh pembaruan v' + res.latest + ' sekarang?')) return;
    setUpdateStatus('Mengunduh... 0%');
    const off = api.onUpdateProgress((d) => {
      const pct = d.total ? d.percent : null;
      setUpdateStatus('Mengunduh... ' + (pct === null ? Math.round(d.received / 1024) + ' KB' : pct + '%'));
    });
    const out = await api.downloadUpdate(res.url);
    off();
    if (!out.ok) {
      setUpdateStatus(out.error || 'Gagal mengunduh.');
      toast(out.error || 'Gagal mengunduh');
      return;
    }
    setUpdateStatus('Unduhan selesai: ' + out.name);
    if (window.confirm('Unduhan selesai. Jalankan installer sekarang? Aplikasi akan ditutup setelah installer dibuka.')) {
      const r = await api.installUpdate(out.path);
      if (!r.ok) { toast(r.error || 'Gagal membuka installer'); return; }
      setTimeout(() => window.close(), 600);
    }
  }

  function openUpdateBadge() {
    if (!S.update || !S.update.hasUpdate) { checkUpdates(true); return; }
    const notes = String(S.update.notes || '').slice(0, 700);
    const msg = 'Pembaruan v' + S.update.latest + ' tersedia (sekarang v' + S.update.current + ').\n\n' +
      (notes ? notes + '\n\n' : '') + 'Unduh sekarang?';
    if (window.confirm(msg)) downloadUpdate(true);
  }

  let promptResolve = null;
  function askText(title, placeholder, okLabel, defaultValue) {
    $('promptTitle').textContent = title;
    $('promptInput').value = defaultValue || '';
    $('promptInput').placeholder = placeholder || '';
    $('promptOk').textContent = okLabel || 'Buat';
    $('promptModal').classList.remove('hidden');
    setTimeout(() => {
      $('promptInput').focus();
      if (defaultValue) $('promptInput').select();
    }, 50);
    return new Promise((resolve) => { promptResolve = resolve; });
  }

  function closePrompt(value) {
    $('promptModal').classList.add('hidden');
    if (promptResolve) { promptResolve(value || null); promptResolve = null; }
  }

  function openClone() {
    S.cloneDir = null;
    $('cloneUrl').value = '';
    $('cloneDir').textContent = 'Belum dipilih';
    $('cloneModal').classList.remove('hidden');
    setTimeout(() => $('cloneUrl').focus(), 50);
  }

  async function pickCloneDir() {
    const res = await api.pickDirectory();
    if (!res.ok) return;
    S.cloneDir = res.path;
    $('cloneDir').textContent = res.path;
  }

  async function startClone() {
    const url = $('cloneUrl').value.trim();
    if (!url) { toast('Isi URL repository.'); return; }
    if (!S.cloneDir) { toast('Pilih folder tujuan.'); return; }
    const btn = $('cloneStart');
    btn.disabled = true;
    btn.textContent = 'Meng-clone...';
    const res = await api.cloneRepo(url, S.cloneDir);
    btn.disabled = false;
    btn.textContent = 'Clone';
    if (!res.ok) { toast('Clone gagal: ' + (res.error || '').slice(0, 300)); return; }
    S.local.root = res.root;
    S.local.tree = res.tree;
    S.local.expanded.clear();
    S.target = { type: 'local', id: null };
    renderTargetSelect();
    $('cloneModal').classList.add('hidden');
    switchView('workspace');
    await ensureWorkspace();
    toast('Repository di-clone: ' + dirName(res.root));
  }

  function setAgentApprovalMode(mode) {
    const opt = document.querySelector('.agent-approval-opt[data-mode="' + mode + '"]');
    if (!opt) return;
    document.querySelectorAll('.agent-approval-opt').forEach((o) => o.classList.toggle('active', o === opt));
    const title = opt.querySelector('.ao-title');
    const icon = opt.querySelector('.ao-icon');
    $('agentApprovalLabel').textContent = title ? title.textContent : mode;
    $('agentApprovalIcon').innerHTML = icon ? icon.innerHTML : '';
    if (S.settings) S.settings.agentApproval = mode;
    try { api.saveSettings({ agentApproval: mode }); } catch { /* abaikan */ }
  }

  // ---------- Bind ----------
  function bind() {
    document.querySelectorAll('.act[data-view]').forEach((b) => b.addEventListener('click', () => switchView(b.dataset.view)));
    $('actSettings').addEventListener('click', openSettings);
    document.querySelectorAll('.openSettings').forEach((btn) => btn.addEventListener('click', openSettings));
    $('cancelSettings').addEventListener('click', () => $('settingsModal').classList.add('hidden'));
    $('saveSettings').addEventListener('click', saveSettings);
    $('openPreferences').addEventListener('click', () => {
      $('settingsModal').classList.add('hidden');
      openOnboarding();
    });
    $('modelAccessModeSelect').addEventListener('change', () => {
      const v = $('modelAccessModeSelect').value;
      if (v && v !== 'auto') {
        // Mode paket eksplisit → matikan "tampilkan semua" agar filter benar-benar berlaku.
        $('modelAccessAllCheck').checked = false;
      }
    });
    $('detectModels').addEventListener('click', detectModelAccess);
    $('apiKeyInput').addEventListener('input', autoDetectKey);
    $('resetBlockedModels').addEventListener('click', async () => {
      try { S.settings = await api.resetBlockedModels(); } catch { /* abaikan */ }
      toast('Model yang sebelumnya ditolak kini ditampilkan lagi. Deteksi ulang untuk memuatnya.');
      setModelAccessInfo('Reset selesai. Klik "Deteksi ulang" untuk memuat ulang daftar model.');
    });
    $('settingsModal').addEventListener('click', (e) => { if (e.target.id === 'settingsModal') $('settingsModal').classList.add('hidden'); });

    $('targetSelect').addEventListener('change', (e) => switchTarget(e.target.value));
    $('newConnection').addEventListener('click', () => openConnectionForm());
    $('closeConnection').addEventListener('click', closeConnectionForm);
    $('connForm').addEventListener('submit', connectRemote);
    $('connSaveOnly').addEventListener('click', saveConnectionOnly);
    $('editConnectionTop').addEventListener('click', () => {
      const remote = remoteSession();
      if (remote && remote.savedId) openEditConnection(remote.savedId);
      else toast('Koneksi ini tidak tersimpan, jadi belum bisa diedit.');
    });
    $('connProtocol').addEventListener('change', () => {
      const proto = String($('connProtocol').value || 'sftp').toLowerCase();
      $('connPort').value = String(protocolDefaultPort(proto));
      syncConnectionFields(S.editingConnection);
    });
    $('connFileBrowse').addEventListener('click', async () => {
      const res = await api.openFileDialog({ title: 'Pilih file SQLite', filters: [{ name: 'SQLite database', extensions: ['db', 'sqlite', 'sqlite3', 'db3'] }, { name: 'Semua file', extensions: ['*'] }] });
      if (res && res.ok) $('connFile').value = res.path;
    });
    $('dbRun').addEventListener('click', runDbQuery);
    $('dbRefresh').addEventListener('click', async () => {
      S.db.tables = {};
      $('fileTree').innerHTML = '<div class="tree-empty">Memuat database...</div>';
      await loadDbTree();
      setDbStatus('Dimuat ulang');
    });
    $('dbExport').addEventListener('click', exportCsv);
    $('dbDatabase').addEventListener('change', () => { clearDbResult(); setDbStatus(''); });
    $('disconnectRemote').addEventListener('click', disconnectRemote);
    $('openFolder').addEventListener('click', openFolder);
    $('cloneRepo').addEventListener('click', openClone);
    $('refreshExplorer').addEventListener('click', refreshExplorer);
    $('newFile').addEventListener('click', () => createEntry('file'));
    $('newFolder').addEventListener('click', () => createEntry('dir'));
    $('fileTree').addEventListener('contextmenu', (e) => {
      if (e.target.closest('.tree-row')) return;
      e.preventDefault();
      showBlankMenu(e.clientX, e.clientY);
    });
    document.addEventListener('click', hideContextMenu);
    document.addEventListener('scroll', hideContextMenu, true);

    $('extSearch').addEventListener('input', (e) => scheduleMarketplaceSearch(e.target.value));
    $('mapInstallRclone').addEventListener('click', () => installMapRequirement('rclone'));
    $('mapInstallWinFsp').addEventListener('click', () => installMapRequirement('winfsp'));
    $('mapInstallSshfs').addEventListener('click', () => {
      api.extOpenExternal('https://github.com/winfsp/sshfs-win/releases');
    });
    $('mapCancel').addEventListener('click', closeMapDrive);
    $('mapModal').addEventListener('click', (e) => { if (e.target.id === 'mapModal') closeMapDrive(); });
    $('mapSubmit').addEventListener('click', submitMapDrive);
    $('mapMethod').addEventListener('change', () => syncMapMethod());
    $('mapRoot').addEventListener('change', syncMapDrivePathLabel);
    $('sshDisconnectTop').addEventListener('click', disconnectRemote);
    $('mapDriveTop').addEventListener('click', () => openMapDrive(null));
    $('savedConnections').addEventListener('click', openSavedConnections);
    $('closeConnections').addEventListener('click', closeSavedConnections);
    $('connectionsModal').addEventListener('click', (e) => {
      if (e.target.id === 'connectionsModal') closeSavedConnections();
    });
    $('extFilter').addEventListener('change', (e) => { S.extFilter = e.target.value; renderExtensions(); });
    $('extRefreshSide').addEventListener('click', async () => {
      await refreshExtensions();
      if (S.extSearchTerm === '') await loadRecommendedExtensions(true);
      toast('Daftar ekstensi diperbarui');
    });
    $('extInstallFolder').addEventListener('click', () => installExtension('folder'));
    $('extInstallZip').addEventListener('click', () => installExtension('zip'));
    $('extUpdateAll').addEventListener('click', async () => {
      const btn = $('extUpdateAll');
      btn.disabled = true;
      const previous = btn.textContent;
      btn.textContent = 'Memperbarui...';
      const res = await api.extUpdateAll();
      btn.disabled = false;
      if (!res.ok) { toast(res.error || 'Gagal update ekstensi'); btn.textContent = previous; return; }
      await refreshExtensions();
      const okCount = (res.results || []).filter((r) => r.ok).length;
      const failCount = (res.results || []).filter((r) => !r.ok).length;
      toast(failCount ? `${okCount} ekstensi diperbarui, ${failCount} gagal` : `${okCount || 0} ekstensi diperbarui`);
    });
    $('extOpenDir').addEventListener('click', async () => {
      const res = await api.extOpenDir();
      if (!res.ok) toast(res.error || 'Gagal membuka folder ekstensi');
    });
    bindResizers();

    $('clonePick').addEventListener('click', pickCloneDir);
    $('cloneCancel').addEventListener('click', () => $('cloneModal').classList.add('hidden'));
    $('cloneStart').addEventListener('click', startClone);

    $('promptOk').addEventListener('click', () => closePrompt($('promptInput').value.trim()));
    $('promptCancel').addEventListener('click', () => closePrompt(null));
    $('promptInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); closePrompt($('promptInput').value.trim()); }
      if (e.key === 'Escape') closePrompt(null);
    });

    $('sendChat').addEventListener('click', sendChat);
    $('stopChat').addEventListener('click', () => { if (S.requestId) api.abortChat(S.requestId); });
    $('newChat').addEventListener('click', newChat);
    $('chatInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); }
    });
    bindInputHistory($('chatInput'), 'chat');
    renderChatModePop();
    updateChatModeChip();
    $('chatModeBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      const pop = $('chatModePop');
      if (!pop) return;
      if (pop.classList.contains('hidden')) openChatModePop(); else closeChatModePop();
    });
    $('chatModeChipClear').addEventListener('click', () => setChatMode('auto'));
    $('chatInput').addEventListener('input', updateChatModeChip);
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.mode-wrap')) closeChatModePop();
    });
    $('attachChat').addEventListener('click', () => $('chatFiles').click());
    $('voiceChatBtn').addEventListener('click', () => toggleVoiceChat('chatInput'));
    $('voiceAgentBtn').addEventListener('click', () => toggleVoiceChat('agentInput'));
    $('chatFiles').addEventListener('change', (e) => {
      addChatImages(e.target.files);
      e.target.value = '';
    });
    $('chatInput').addEventListener('paste', (e) => {
      const files = e.clipboardData && e.clipboardData.files;
      if (!files || !files.length) return;
      if (Array.from(files).some((f) => /^image\//.test(f.type))) {
        e.preventDefault();
        addChatImages(files);
      }
    });
    const chatView = $('view-chat');
    chatView.addEventListener('dragover', (e) => { e.preventDefault(); });
    chatView.addEventListener('drop', (e) => {
      const files = e.dataTransfer && e.dataTransfer.files;
      if (!files || !files.length) return;
      if (Array.from(files).some((f) => /^image\//.test(f.type))) {
        e.preventDefault();
        addChatImages(files);
      }
    });
    $('chat').addEventListener('click', async (e) => {
      const btn = e.target.closest('.copy-code');
      if (!btn) return;
      const pre = btn.closest('.code-head') && btn.closest('.code-head').nextElementSibling;
      if (!pre) return;
      const code = pre.querySelector('code');
      await api.copyText(code ? code.textContent : pre.textContent);
      const old = btn.textContent;
      btn.textContent = 'Tersalin';
      setTimeout(() => { btn.textContent = old; }, 1200);
    });
    $('checkUpdate').addEventListener('click', () => checkUpdates(true));
    $('updateBadge').addEventListener('click', openUpdateBadge);
    modelSelects().forEach((sel) => sel.addEventListener('change', (e) => setModel(e.target.value)));
    $('refreshModels').addEventListener('click', loadModels);
    $('modelSearch').addEventListener('input', renderModelList);

    $('agentSend').addEventListener('click', sendAgent);
    $('agentStop').addEventListener('click', stopAgent);
    $('agentClear').addEventListener('click', () => {
      if (S.agent.busy) { toast('Tunggu agent selesai dulu.'); return; }
      S.agent.messages = [];
      resetAgentLog();
      toast('Riwayat agent dibersihkan');
    });
    $('agentNew').addEventListener('click', newAgentTask);
    $('agentHistory').addEventListener('click', openAgentHistory);
    $('agentSearch').addEventListener('click', openAgentSearch);
    $('agentExport').addEventListener('click', exportAgentChat);
    $('agentHistoryClose').addEventListener('click', () => $('agentHistoryModal').classList.add('hidden'));
    $('agentSearchClose').addEventListener('click', () => $('agentSearchModal').classList.add('hidden'));
    $('agentHistoryModal').addEventListener('click', (e) => { if (e.target.id === 'agentHistoryModal') $('agentHistoryModal').classList.add('hidden'); });
    $('agentSearchModal').addEventListener('click', (e) => { if (e.target.id === 'agentSearchModal') $('agentSearchModal').classList.add('hidden'); });
    $('agentSearchInput').addEventListener('input', runAgentSearch);
    $('agentLog').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-agent-prompt]');
      if (!btn) return;
      const input = $('agentInput');
      if (!input) return;
      input.value = btn.dataset.agentPrompt || '';
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    loadAgentHistory();
    $('agentApprovalBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      $('agentApprovalPop').classList.toggle('hidden');
    });
    $('agentApprovalPop').addEventListener('click', (e) => {
      const opt = e.target.closest('.agent-approval-opt');
      if (!opt) return;
      setAgentApprovalMode(opt.dataset.mode);
      $('agentApprovalPop').classList.add('hidden');
      const title = opt.querySelector('.ao-title');
      toast('Mode persetujuan: ' + (title ? title.textContent : opt.dataset.mode));
    });
    $('agentApprovalLearn').addEventListener('click', (e) => {
      e.preventDefault();
      toast('Manual: semua aksi dikonfirmasi. Auto: aksi berisiko dikonfirmasi. Full: tanpa konfirmasi. Custom: atur di sahabat.agent.json.');
    });
    document.addEventListener('click', (e) => {
      const pop = $('agentApprovalPop');
      if (pop && !pop.classList.contains('hidden') && !e.target.closest('.agent-approval')) {
        pop.classList.add('hidden');
      }
    });
    document.querySelectorAll('.shortcut-help-btn').forEach((b) => b.addEventListener('click', openShortcutGuide));
    $('closeShortcut').addEventListener('click', () => $('shortcutModal').classList.add('hidden'));
    $('shortcutModal').addEventListener('click', (e) => { if (e.target.id === 'shortcutModal') $('shortcutModal').classList.add('hidden'); });
    $('agentThinking').addEventListener('change', async () => {
      const v = $('agentThinking').value;
      S.settings.agentThinking = v;
      try { await api.saveSettings({ agentThinking: v }); } catch { /* abaikan */ }
      toast('Thinking agent: ' + v.charAt(0).toUpperCase() + v.slice(1));
    });
    $('agentInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAgent(); }
    });
    bindInputHistory($('agentInput'), 'agent');
    renderAgentModePop();
    updateAgentModeChip();
    $('agentModeBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      const pop = $('agentModePop');
      if (!pop) return;
      if (pop.classList.contains('hidden')) openAgentModePop(); else closeAgentModePop();
    });
    $('agentModeChipClear').addEventListener('click', () => setAgentMode('auto'));
    $('agentInput').addEventListener('input', updateAgentModeChip);
    $('agentTaskBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      const pop = $('agentTaskPop');
      if (!pop) return;
      if (pop.classList.contains('hidden')) openAgentTaskPop(); else closeAgentTaskPop();
    });
    $('agentTaskPop').addEventListener('click', (e) => {
      const task = e.target.closest('[data-task-prompt]');
      if (task) applyAgentTask(task.dataset.taskPrompt);
    });
    $('agentGuideBtn').addEventListener('click', openVpsGuide);
    $('vpsGuideClose').addEventListener('click', closeVpsGuide);
    $('vpsGuideModal').addEventListener('click', (e) => { if (e.target.id === 'vpsGuideModal') closeVpsGuide(); });
    $('vpsGuideBody').addEventListener('click', (e) => {
      const item = e.target.closest('[data-guide-prompt]');
      if (!item) return;
      const input = $('agentInput');
      if (input) {
        input.value = item.dataset.guidePrompt || '';
        input.focus();
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      closeVpsGuide();
    });
    $('onboardingNext').addEventListener('click', async () => {
      if (obStep < OB_STEPS) { obStep += 1; renderOnboarding(); }
      else { await finishOnboarding(); }
    });
    $('onboardingBack').addEventListener('click', () => {
      if (obStep > 1) { obStep -= 1; renderOnboarding(); }
    });
    document.querySelectorAll('#view-marketplace .mk-tab').forEach((b) => b.addEventListener('click', () => {
      mkTab = b.dataset.mkt;
      document.querySelectorAll('#view-marketplace .mk-tab').forEach((x) => x.classList.toggle('active', x === b));
      renderMarketplace();
    }));
    document.querySelectorAll('#view-marketplace .mk-cat').forEach((b) => b.addEventListener('click', () => {
      mkCat = b.dataset.cat;
      document.querySelectorAll('#view-marketplace .mk-cat').forEach((x) => x.classList.toggle('active', x === b));
      renderMarketplace();
    }));
    if ($('mkSearch')) $('mkSearch').addEventListener('input', (e) => { mkQuery = e.target.value || ''; renderMarketplace(); });
    if ($('mkManage')) $('mkManage').addEventListener('click', () => switchView('extensions'));
    document.querySelectorAll('.mode-opt').forEach((b) => b.addEventListener('click', () => {
      setUserMode(b.dataset.mode);
      toast(b.dataset.mode === 'advance' ? 'Mode Advance: no prompting' : 'Mode Developer');
    }));
    document.querySelectorAll('#view-desktop [data-go]').forEach((b) => b.addEventListener('click', () => switchView(b.dataset.go)));
    if ($('dskNewChat')) $('dskNewChat').addEventListener('click', () => { switchView('chat'); newChat(); });
    if ($('dskServerRefresh')) $('dskServerRefresh').addEventListener('click', loadServerWidget);
    if ($('dskWeatherRefresh')) $('dskWeatherRefresh').addEventListener('click', () => loadWeatherWidget());
    if ($('dskWeatherCity')) $('dskWeatherCity').addEventListener('change', (e) => loadWeatherWidget(e.target.value));
    if ($('dskScheduleBtn')) $('dskScheduleBtn').addEventListener('click', () => {
      useMarketplaceSkill({ name: 'Jadwal Posting', prompt: 'Susun jadwal posting mingguan untuk media sosial saya. Tanyakan dulu platform dan frekuensi posting.' });
    });
    const citySel = $('dskWeatherCity');
    if (citySel) {
      citySel.innerHTML = '';
      for (const [name] of DSK_CITIES) {
        const o = document.createElement('option');
        o.value = name;
        o.textContent = name;
        citySel.appendChild(o);
      }
      citySel.value = localStorage.getItem('sahabat.weatherCity') || 'Jakarta';
    }
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#agentModePop') && !e.target.closest('#agentModeBtn')) closeAgentModePop();
      if (!e.target.closest('#agentTaskPop') && !e.target.closest('#agentTaskBtn')) closeAgentTaskPop();
    });

    $('termNewTab').addEventListener('click', () => { newLocalTerminal(S.local.root); });
    $('termToggle').addEventListener('click', () => {
      const pane = $('termPane');
      pane.classList.toggle('collapsed');
      setTimeout(fitActiveTerm, 80);
    });
    $('termMax').addEventListener('click', () => toggleMaxAppClass('max-terminal'));
    $('termClose').addEventListener('click', () => setTermPaneClosed(true));
    $('openTerminal').addEventListener('click', () => setTermPaneClosed(false));
    $('termClear').addEventListener('click', () => {
      const t = activeTerm();
      if (t) t.term.clear();
    });
    $('explorerClose').addEventListener('click', () => {
      document.querySelector('.app').classList.add('hide-side');
      $('explorerRail').classList.remove('hidden');
    });
    $('explorerRail').addEventListener('click', () => {
      document.querySelector('.app').classList.remove('hide-side');
      $('explorerRail').classList.add('hidden');
      setTimeout(() => { try { S.editor && S.editor.resize(true); } catch {} }, 60);
    });
    $('explorerMax').addEventListener('click', () => toggleMaxAppClass('max-explorer'));
    $('agentClose').addEventListener('click', () => {
      document.querySelector('.app').classList.add('hide-agent');
      $('agentRail').classList.remove('hidden');
    });
    $('agentRail').addEventListener('click', () => {
      document.querySelector('.app').classList.remove('hide-agent');
      $('agentRail').classList.add('hidden');
      setTimeout(() => { try { S.editor && S.editor.resize(true); } catch {} }, 60);
    });
    $('agentMax').addEventListener('click', () => toggleMaxAppClass('max-agent'));

    $('snippetChips').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-snippet]');
      if (!btn) return;
      S.snippet = btn.dataset.snippet;
      document.querySelectorAll('#snippetChips .chip').forEach((c) => c.classList.toggle('active', c === btn));
      renderSnippet();
    });
    $('copyBase').addEventListener('click', async () => { await api.copyText(S.settings.baseUrl); toast('Base URL disalin'); });
    $('copySnippet').addEventListener('click', async () => { await api.copyText($('snippetCode').textContent); toast('Snippet disalin'); });

    window.addEventListener('resize', () => {
      fitAll();
      applySideWidth(S.ui.sideWidth, false);
      applyAgentWidth(S.ui.agentWidth, false);
      applyTermHeight(S.ui.termHeight, false);
    });
    document.addEventListener('keydown', (e) => {
      const mod = e.ctrlKey || e.metaKey;
      const k = (e.key || '').toLowerCase();
      // Command palette: Ctrl+K / Ctrl+P
      if (mod && (k === 'k' || k === 'p')) {
        e.preventDefault();
        if (paletteOpen) closePalette(); else openPalette();
        return;
      }
      if (paletteOpen) { paletteKey(e); return; }
      // Shortcut panel (Ctrl+B sidebar, Ctrl+J agent, Ctrl+` terminal)
      if (mod && k === 'b') { e.preventDefault(); toggleSidebarPanel(); return; }
      if (mod && k === 'j') { e.preventDefault(); toggleAgentPanel(); return; }
      if (mod && (e.key === '`' || k === '`')) { e.preventDefault(); toggleTerminalPanel(); return; }
      if (mod && e.shiftKey && (e.key === '5' || k === '5')) { e.preventDefault(); toggleTerminalSplit(); return; }
      if (e.key === 'Escape') {
        hideContextMenu();
        if (!$('shortcutModal').classList.contains('hidden')) $('shortcutModal').classList.add('hidden');
        if (!$('mapModal').classList.contains('hidden')) closeMapDrive();
        if (!$('connectionsModal').classList.contains('hidden')) closeSavedConnections();
        if (!$('promptModal').classList.contains('hidden')) closePrompt(null);
        if (!$('cloneModal').classList.contains('hidden')) $('cloneModal').classList.add('hidden');
        if (!$('settingsModal').classList.contains('hidden')) $('settingsModal').classList.add('hidden');
        if (!$('vpsGuideModal').classList.contains('hidden')) closeVpsGuide();
      }
    });

    // Command palette bindings
    if ($('paletteInput')) {
      $('paletteInput').addEventListener('input', (e) => renderPaletteResults(e.target.value));
      $('paletteInput').addEventListener('keydown', paletteKey);
    }
    if ($('palette')) {
      $('palette').addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('palette-backdrop')) closePalette();
      });
    }
    if ($('sbPaletteBtn')) $('sbPaletteBtn').addEventListener('click', openPalette);
    if ($('topPalette')) $('topPalette').addEventListener('click', openPalette);
    if ($('sbModel')) $('sbModel').addEventListener('click', () => switchView('models'));
    if ($('sbTarget')) $('sbTarget').addEventListener('click', () => switchView('workspace'));
    if ($('sbKey')) $('sbKey').addEventListener('click', openSettings);
    if ($('sbUpdates')) $('sbUpdates').addEventListener('click', checkUpdates);
    if ($('sbConn')) $('sbConn').addEventListener('click', () => { switchView('workspace'); openSavedConnections(); });
  }

  async function openFolder() {
    const res = await api.openFolder();
    if (!res.ok) return;
    S.local.root = res.root;
    S.local.tree = res.tree;
    S.local.expanded.clear();
    S.target = { type: 'local', id: null };
    renderTargetSelect();
    await ensureWorkspace();
    updateWsWelcome();
    toast('Folder dibuka: ' + dirName(res.root));
  }

  async function init() {
    aceSetup();
    bind();
    setUserMode(S.userMode);
    applySideWidth(S.ui.sideWidth, false);
    applyAgentWidth(S.ui.agentWidth, false);
    applyTermHeight(S.ui.termHeight, false);
    await refreshExtensions();
    S.settings = await api.getSettings();
    $('agentThinking').value = (S.settings && S.settings.agentThinking) || 'default';
    setAgentApprovalMode((S.settings && S.settings.agentApproval) || 'manual');
    updateKeyBadge();
    renderModelOptions();
    S.chat = loadChat();
    if (S.chat.length) renderChatHistory();
    renderAttachments();
    const versionEl = $('appVersion');
    if (versionEl) versionEl.textContent = 'v' + (S.settings.version || '1.0.0');
    await refreshSavedConnections();
    renderSnippet();
    updateThinkingAvailability();
    renderTabs();
    bindHero();
    updateChatHero();
    updateWsWelcome();
    updateStatusBar();
    if ($('statusbar')) $('statusbar').classList.remove('hidden');
    if (S.view && S.view !== 'chat') switchView(S.view);
    if ($('crumbIcon')) $('crumbIcon').innerHTML = VIEW_ICONS[S.view || 'chat'] || '';
    if ($('viewTitle')) $('viewTitle').textContent = VIEW_TITLES[S.view || 'chat'] || 'Chat';

    const agentLogEl = $('agentLog');
    agentLogEl.addEventListener('scroll', () => {
      if (agentProgrammatic) return; // scroll program sendiri — jangan dianggap user
      const dist = agentLogEl.scrollHeight - agentLogEl.scrollTop - agentLogEl.clientHeight;
      agentStickToBottom = dist < 48;
      updateAgentJump();
    });
    agentLogEl.addEventListener('wheel', (e) => {
      // User scroll ke atas → berhenti mengikuti + hentikan animasi turun yang berjalan.
      if (e.deltaY < 0) {
        agentStickToBottom = false;
        agentProgrammatic = false;
        clearTimeout(agentScrollTimer);
        agentLogEl.scrollTo({ top: agentLogEl.scrollTop });
        updateAgentJump();
      }
    }, { passive: true });
    $('agentJump').addEventListener('click', () => {
      agentStickToBottom = true;
      updateAgentJump();
      agentScrollToEnd('smooth');
    });
    agentLogEl.addEventListener('click', (e) => {
      const btn = e.target && e.target.closest && e.target.closest('.agent-showmore');
      if (!btn) return;
      const pre = btn.closest('.agent-step-out') && btn.closest('.agent-step-out').querySelector('.agent-out-inner');
      if (pre && pre.dataset.full) pre.textContent = pre.dataset.full;
      btn.remove();
      agentScrollToEnd('auto');
    });
    api.onMenuEvent(handleMenuEvent);
    api.onTermData((d) => {
      for (const tab of S.termTabs) {
        if (tab.kind === 'local' && tab.ptyId === d.id) { tab.term.write(d.data); markTermActivity(tab); break; }
      }
    });
    api.onTermExit((d) => {
      const tab = S.termTabs.find((t) => t.kind === 'local' && t.ptyId === d.id);
      if (!tab) return;
      tab.ptyId = null;
      tab.busy = false;
      clearTimeout(tab.busyTimer);
      tab.term.writeln('\r\n[terminal berhenti, kode ' + d.code + ']');
      renderTermTabs();
      updateTermFoot();
    });
    api.onRemoteData((d) => {
      for (const tab of S.termTabs) {
        if (tab.kind === 'ssh' && tab.sessionId === d.id && tab.shellId === d.shellId) { tab.term.write(d.data); markTermActivity(tab); break; }
      }
    });
    api.onRemoteExit((d) => {
      const tab = S.termTabs.find((t) => t.kind === 'ssh' && t.sessionId === d.id && t.shellId === d.shellId);
      if (tab) tab.term.writeln('\r\n[shell SSH selesai]');
    });
    api.onRemoteClosed((d) => {
      closeAllSshTabs(d.id);
      S.connections = S.connections.filter((c) => c.id !== d.id);
      S.remotes.delete(d.id);
      S.tabs = S.tabs.filter((t) => t.target.id !== d.id);
      if (S.active && S.active.target.id === d.id) {
        S.active = S.tabs[S.tabs.length - 1] || null;
        setActiveSession(S.active);
        renderTabs();
      }
      if (S.target.id === d.id) {
        S.target = { type: 'local', id: null };
        renderTargetSelect();
        ensureWorkspace();
      }
      toast('Koneksi remote terputus');
    });

    if (S.settings.hasKey) loadModels();
    else setTimeout(openSettings, 400);

    if (S.settings.autoUpdate !== false) {
      setTimeout(() => { checkUpdates(false).catch(() => {}); }, 2500);
    }
    if (!localStorage.getItem('sahabat.onboarded')) {
      setTimeout(() => openOnboarding(), 700);
    }
  }

  window.addEventListener('DOMContentLoaded', init);
})();
