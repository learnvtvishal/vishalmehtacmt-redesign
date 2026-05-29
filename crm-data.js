// =============================================================
//  CRM DATA LAYER — Firebase Firestore with localStorage fallback
//  Used by contact.html (write) and admin.html (read/manage).
//
//  If firebase-config.js has a projectId, the Firebase SDK is
//  loaded ON DEMAND and leads sync to the cloud (all devices).
//  Otherwise everything runs locally in this browser (demo) with
//  NO external dependencies. Always await CRM.ready before use.
// =============================================================
(function () {
  var cfg = window.FIREBASE_CONFIG || {};
  var wantFB = !!cfg.projectId;
  var db = null, auth = null;

  var LS_KEY = 'vm_leads';
  function lsLoad() { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch (e) { return []; } }
  function lsSave(a) { localStorage.setItem(LS_KEY, JSON.stringify(a)); }

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

  window.CRM = {
    mode: 'local',
    DEMO_PASS: 'vishal2026',

    ready: wantFB
      ? initFirebase().catch(function (e) { console.warn('Firebase load failed, using local mode:', e); })
      : Promise.resolve(),

    add: function (lead) {
      if (this.mode === 'firebase') {
        return db.collection('leads').add({
          name: lead.name || '', email: lead.email || '', phone: lead.phone || '',
          type: lead.type || '', message: lead.message || '', source: lead.source || 'Contact form',
          status: 'New', notes: '',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          date: new Date().toISOString()
        });
      }
      var a = lsLoad();
      a.unshift({ id: 'L' + Date.now(), name: lead.name || '', email: lead.email || '', phone: lead.phone || '', type: lead.type || '', message: lead.message || '', source: lead.source || 'Contact form', status: 'New', notes: '', date: new Date().toISOString() });
      lsSave(a);
      return Promise.resolve();
    },

    login: function (email, pass) {
      if (this.mode === 'firebase') return auth.signInWithEmailAndPassword(email, pass);
      if ((pass || '').trim().toLowerCase() === this.DEMO_PASS) { sessionStorage.setItem('vm_admin_ok', '1'); return Promise.resolve(); }
      return Promise.reject(new Error('Incorrect passcode'));
    },
    logout: function () {
      if (this.mode === 'firebase') return auth.signOut();
      sessionStorage.removeItem('vm_admin_ok');
      return Promise.resolve();
    },
    onAuth: function (cb) {
      if (this.mode === 'firebase') { auth.onAuthStateChanged(function (u) { cb(!!u); }); return; }
      cb(sessionStorage.getItem('vm_admin_ok') === '1');
    },

    subscribe: function (cb) {
      if (this.mode === 'firebase') {
        return db.collection('leads').orderBy('date', 'desc').onSnapshot(function (snap) {
          var out = []; snap.forEach(function (doc) { var d = doc.data(); d.id = doc.id; out.push(d); }); cb(out);
        }, function (err) { console.warn('Firestore read error:', err); });
      }
      cb(lsLoad());
      var iv = setInterval(function () { cb(lsLoad()); }, 2000);
      return function () { clearInterval(iv); };
    },

    update: function (id, fields) {
      if (this.mode === 'firebase') return db.collection('leads').doc(id).update(fields);
      var a = lsLoad(), l = a.find(function (x) { return x.id === id; });
      if (l) Object.assign(l, fields); lsSave(a); return Promise.resolve();
    },

    remove: function (id) {
      if (this.mode === 'firebase') return db.collection('leads').doc(id).delete();
      var a = lsLoad().filter(function (x) { return x.id !== id; }); lsSave(a); return Promise.resolve();
    },

    seedDemo: function () {
      var now = Date.now();
      var demo = [
        { name: 'Rohan Mehta', email: 'rohan.m@gmail.com', phone: '+91 98200 11223', type: 'Join Disciplined Traders Academy', message: 'Hi, I am a software engineer trading options part-time for 2 years. I keep blowing up on BankNifty expiry. Want a systematic, rule-based approach. When does the next cohort start?', source: 'Contact form', status: 'New', off: 0.2 },
        { name: 'Priya Sharma', email: 'priya.sharma@outlook.com', phone: '+91 99876 54321', type: 'CMT Guidance', message: 'Preparing for CMT Level I, struggling with Dow Theory and intermarket. Do you offer a structured prep track with mock papers?', source: 'Ask Vishal chat', status: 'Contacted', off: 1.1 },
        { name: 'Aakash Verma', email: 'aakash@quantdesk.in', phone: '', type: 'Algo Trading', message: 'Looking to automate my mean-reversion strategy on NSE. Need help with backtesting and broker API deployment.', source: 'Contact form', status: 'New', off: 2.3 },
        { name: 'Sneha Iyer', email: 'sneha.iyer@finco.com', phone: '+91 91234 56789', type: 'Invite Vishal as a Speaker', message: 'Hosting our annual investor day in Bangalore on Aug 22, ~250 attendees. Would love Vishal for a keynote on systematic trading. Available?', source: 'Contact form', status: 'Converted', off: 5.6 },
        { name: 'Karan Singh', email: 'karan.s@traderscafe.in', phone: '+91 98765 43210', type: 'Trading Consultation', message: 'Need a 1:1 to review portfolio risk management. Currently over-leveraged on commodities.', source: 'Ask Vishal chat', status: 'Closed', off: 9.2 }
      ];
      var a = lsLoad();
      demo.forEach(function (d, i) { a.push({ id: 'L' + (now - Math.round(d.off * 86400000)) + i, name: d.name, email: d.email, phone: d.phone, type: d.type, message: d.message, source: d.source, date: new Date(now - Math.round(d.off * 86400000)).toISOString(), status: d.status, notes: '' }); });
      lsSave(a);
    }
  };
})();
