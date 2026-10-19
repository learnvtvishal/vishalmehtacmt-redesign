// =============================================================
//  CRM DATA LAYER
//  Modes (picked automatically, always await CRM.ready first):
//   - 'cloud'    : our Vercel API (window.CRM_API) -> one shared CRM
//                  for every device. This is the default.
//   - 'firebase' : if firebase-config.js has a projectId.
//   - 'local'    : this browser only (fallback / offline demo).
//
//  Also remembers HOW a visitor arrived (utm_* params, referrer) for
//  the whole visit, so every lead carries its ad / channel source.
//  Used by contact.html, masterclass.html, learn.html (write) and
//  admin.html (read / manage).
// =============================================================
(function () {
  var cfg = window.FIREBASE_CONFIG || {};
  var API = window.CRM_API === undefined ? 'https://vm-trial-api.vercel.app/api/leads' : window.CRM_API;
  var wantFB = !!cfg.projectId;
  var wantCloud = !wantFB && !!API;
  var db = null, auth = null;

  // ---------- attribution (which ad / link brought them) ----------
  var ATTR_KEY = 'vm_attr';
  function readAttr() { try { return JSON.parse(sessionStorage.getItem(ATTR_KEY) || 'null'); } catch (e) { return null; } }
  function channelFrom(src, ref) {
    var s = (src || '').toLowerCase();
    var map = { ig: 'Instagram', instagram: 'Instagram', fb: 'Facebook', facebook: 'Facebook', meta: 'Facebook', linkedin: 'LinkedIn', li: 'LinkedIn',
      google: 'Google', youtube: 'YouTube', qr: 'QR code', yt: 'YouTube', whatsapp: 'WhatsApp', wa: 'WhatsApp', email: 'Email', newsletter: 'Email', x: 'X / Twitter', twitter: 'X / Twitter' };
    if (s) return map[s] || (s.charAt(0).toUpperCase() + s.slice(1));
    var r = (ref || '').toLowerCase();
    if (!r) return 'Direct';
    if (r.indexOf('instagram') > -1) return 'Instagram';
    if (r.indexOf('facebook') > -1 || r.indexOf('fb.') > -1) return 'Facebook';
    if (r.indexOf('linkedin') > -1 || r.indexOf('lnkd') > -1) return 'LinkedIn';
    if (r.indexOf('youtube') > -1) return 'YouTube';
    if (r.indexOf('google') > -1) return 'Google';
    if (r.indexOf('whatsapp') > -1 || r.indexOf('wa.me') > -1) return 'WhatsApp';
    if (r.indexOf('t.co') > -1 || r.indexOf('x.com') > -1 || r.indexOf('twitter') > -1) return 'X / Twitter';
    return 'Website';
  }
  (function captureAttr() {
    try {
      var q = new URLSearchParams(location.search);
      var src = q.get('utm_source') || '';
      var ref = document.referrer && document.referrer.indexOf(location.host) === -1 ? document.referrer : '';
      var have = readAttr();
      if (src || !have) {
        sessionStorage.setItem(ATTR_KEY, JSON.stringify({
          utm_source: src, utm_medium: q.get('utm_medium') || '', utm_campaign: q.get('utm_campaign') || '',
          channel: channelFrom(src, ref), landing: location.pathname.split('/').pop() || 'index.html'
        }));
      }
    } catch (e) {}
  })();

  // ---------- local (this browser) ----------
  var LS_KEY = 'vm_leads';
  function lsLoad() { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch (e) { return []; } }
  function lsSave(a) { localStorage.setItem(LS_KEY, JSON.stringify(a)); }

  // ---------- cloud (Vercel API) ----------
  var CODE_KEY = 'vm_admin_code';
  function adminCode() { try { return sessionStorage.getItem(CODE_KEY) || ''; } catch (e) { return ''; } }
  function api(method, query, body, admin) {
    var h = { 'Content-Type': 'application/json' };
    if (admin) h['x-admin-code'] = adminCode();
    return fetch(API + (query || ''), { method: method, headers: h, body: body ? JSON.stringify(body) : undefined })
      .then(function (r) {
        if (r.status === 401) { var e = new Error('Incorrect passcode'); e.code = 401; throw e; }
        return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || ('HTTP ' + r.status)); return d; });
      });
  }

  // ---------- firebase ----------
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = function () { rej(new Error('failed ' + src)); };
      document.head.appendChild(s);
    });
  }
  var FB = 'https://www.gstatic.com/firebasejs/10.12.2/';
  function initFirebase() {
    return loadScript(FB + 'firebase-app-compat.js')
      .then(function () { return loadScript(FB + 'firebase-firestore-compat.js'); })
      .then(function () { return loadScript(FB + 'firebase-auth-compat.js'); })
      .then(function () {
        if (!firebase.apps.length) firebase.initializeApp(cfg);
        db = firebase.firestore(); auth = firebase.auth();
        window.CRM.mode = 'firebase';
      });
  }

  function normalise(lead) {
    var a = readAttr() || {};
    return {
      name: lead.name || '', email: lead.email || '', phone: lead.phone || '', type: lead.type || '', message: lead.message || '',
      source: lead.source || 'Contact form', channel: lead.channel || a.channel || 'Direct',
      utm_source: a.utm_source || '', utm_medium: a.utm_medium || '', utm_campaign: a.utm_campaign || '',
      page: lead.page || (location.pathname.split('/').pop() || 'index.html')
    };
  }

  window.CRM = {
    mode: wantCloud ? 'cloud' : 'local',
    DEMO_PASS: 'vishal2026',
    STATUSES: ['New', 'Contacted', 'Interested', 'Converted', 'Closed'],
    attribution: function () { return readAttr() || {}; },
    channelFrom: channelFrom,

    ready: wantFB
      ? initFirebase().catch(function (e) { console.warn('Firebase load failed, using local mode:', e); })
      : Promise.resolve(),

    // returns {duplicate: bool}
    add: function (lead) {
      var l = normalise(lead);
      if (this.mode === 'cloud') {
        return api('POST', '', l).catch(function (e) {
          console.warn('Cloud CRM unreachable, saved locally:', e);
          window.CRM._addLocal(l); return { duplicate: false, offline: true };
        });
      }
      if (this.mode === 'firebase') {
        return db.collection('leads').add(Object.assign(l, { status: 'New', notes: '', createdAt: firebase.firestore.FieldValue.serverTimestamp(), date: new Date().toISOString() }));
      }
      this._addLocal(l);
      return Promise.resolve({ duplicate: false });
    },
    _addLocal: function (l) {
      var a = lsLoad();
      a.unshift(Object.assign({ id: 'L' + Date.now(), status: 'New', notes: '', owner: '', followup: '', touches: [], date: new Date().toISOString() }, l));
      lsSave(a);
    },

    login: function (email, pass) {
      pass = (pass || '').trim();
      if (this.mode === 'cloud') {
        try { sessionStorage.setItem(CODE_KEY, pass); } catch (e) {}
        return api('POST', '?action=login', {}, true).catch(function (e) { try { sessionStorage.removeItem(CODE_KEY); } catch (x) {} throw e; });
      }
      if (this.mode === 'firebase') return auth.signInWithEmailAndPassword(email, pass);
      if (pass.toLowerCase() === this.DEMO_PASS) { sessionStorage.setItem('vm_admin_ok', '1'); return Promise.resolve(); }
      return Promise.reject(new Error('Incorrect passcode'));
    },
    logout: function () {
      if (this.mode === 'firebase') return auth.signOut();
      try { sessionStorage.removeItem('vm_admin_ok'); sessionStorage.removeItem(CODE_KEY); } catch (e) {}
      return Promise.resolve();
    },
    onAuth: function (cb) {
      if (this.mode === 'cloud') {
        if (!adminCode()) return cb(false);
        api('POST', '?action=login', {}, true).then(function () { cb(true); }, function () { cb(false); });
        return;
      }
      if (this.mode === 'firebase') { auth.onAuthStateChanged(function (u) { cb(!!u); }); return; }
      cb(sessionStorage.getItem('vm_admin_ok') === '1');
    },

    // cb(leads, info) - info.live = true when the cloud answered
    subscribe: function (cb) {
      if (this.mode === 'cloud') {
        var stop = false;
        function tick() {
          if (stop || document.hidden) return;
          api('GET', '', null, true).then(function (d) { if (!stop) cb(d.leads, { live: true }); })
            .catch(function (e) { if (!stop) cb(null, { live: false, error: e }); });
        }
        tick();
        var iv = setInterval(tick, 4000);
        var vis = function () { if (!document.hidden) tick(); };
        document.addEventListener('visibilitychange', vis);
        return function () { stop = true; clearInterval(iv); document.removeEventListener('visibilitychange', vis); };
      }
      if (this.mode === 'firebase') {
        return db.collection('leads').orderBy('date', 'desc').onSnapshot(function (snap) {
          var out = []; snap.forEach(function (doc) { var d = doc.data(); d.id = doc.id; out.push(d); }); cb(out, { live: true });
        }, function (err) { console.warn('Firestore read error:', err); });
      }
      cb(lsLoad(), { live: true });
      var iv2 = setInterval(function () { cb(lsLoad(), { live: true }); }, 2000);
      return function () { clearInterval(iv2); };
    },

    update: function (id, fields) {
      if (this.mode === 'cloud') return api('PATCH', '?id=' + encodeURIComponent(id), fields, true);
      if (this.mode === 'firebase') return db.collection('leads').doc(id).update(fields);
      var a = lsLoad(), l = a.find(function (x) { return x.id === id; });
      if (l) Object.assign(l, fields); lsSave(a); return Promise.resolve();
    },

    remove: function (id) {
      if (this.mode === 'cloud') return api('DELETE', '?id=' + encodeURIComponent(id), null, true);
      if (this.mode === 'firebase') return db.collection('leads').doc(id).delete();
      var a = lsLoad().filter(function (x) { return x.id !== id; }); lsSave(a); return Promise.resolve();
    },

    DEMO_LEADS: [
      { name: 'Rohan Mehta', email: 'rohan.m@example.com', phone: '+91 98200 11223', type: 'Join Disciplined Traders Academy', message: 'Software engineer, trading options part-time for 2 years. Want a rule-based approach. When does the next cohort start?', source: 'Contact form', channel: 'Instagram' },
      { name: 'Priya Sharma', email: 'priya.sharma@example.com', phone: '+91 99876 54321', type: 'Free Masterclass', message: 'Registered for the free masterclass.', source: 'Masterclass funnel', channel: 'Facebook' },
      { name: 'Aakash Verma', email: 'aakash@example.com', phone: '+91 90040 12345', type: 'Algo Trading', message: 'Looking to automate my strategy. Need help with backtesting and broker API deployment.', source: 'Contact form', channel: 'Google' },
      { name: 'Sneha Iyer', email: 'sneha.iyer@example.com', phone: '+91 91234 56789', type: 'Course signup', message: 'Signed up on the student portal (free course).', source: 'Student portal', channel: 'LinkedIn' },
      { name: 'Karan Singh', email: '', phone: '+91 98765 43210', type: 'Trading Consultation', message: 'Messaged on WhatsApp asking about 1:1 sessions.', source: 'WhatsApp', channel: 'WhatsApp' }
    ],
    // demo data: goes through the same capture path as real forms
    seedDemo: function () {
      var self = this;
      return this.DEMO_LEADS.reduce(function (p, d) { return p.then(function () { return self.add(Object.assign({ page: 'demo-data' }, d)); }); }, Promise.resolve());
    }
  };
})();
