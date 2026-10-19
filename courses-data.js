// =============================================================
//  COURSE CATALOGUE (shared by courses.html and learn.html)
//  Prices are demo prices in rupees, inclusive of 18% GST.
//  months: access period after purchase (null = lifetime).
//  Lesson videos are real videos from Vishal's YouTube channel.
// =============================================================
window.VM_COURSES = [
  {
    id: 'algo-basics',
    title: 'Algo Trading Basics',
    type: 'free',
    price: 0,
    months: null,
    access: 'Lifetime access',
    level: 'Beginner',
    desc: 'What algo trading really is, how a rule-based strategy is built, and what a normal day looks like when a system does the clicking.',
    outcomes: [
      'Understand what an algo is (and what it is not)',
      'See how an idea becomes a written, testable rule',
      'Know what a systematic trader actually does all day'
    ],
    lessons: [
      { id: 'ab1', title: 'What is algo trading?', mins: 12, video: 'YjjY4nLLQts', free: true },
      { id: 'ab2', title: 'How to create a systematic trading strategy', mins: 18, video: 'Ne2uonwaNOM', free: true },
      { id: 'ab3', title: 'A normal day in the markets with algo trading', mins: 10, video: 'VhtllSYM9Jk', free: true },
      { id: 'ab4', title: 'Chat with systematic traders', mins: 24, video: 'O-_hnjXmuWw', free: true }
    ],
    quiz: [
      { q: 'What makes a strategy "systematic"?', options: ['It uses a costly software platform', 'Every entry, exit and position size follows written rules', 'It trades many times a day'], answer: 1 },
      { q: 'Before an algo goes live, the rules should be…', options: ['Tested on past data and reviewed honestly', 'Kept flexible so you can override them', 'Copied from a tips channel'], answer: 0 },
      { q: 'An algo mainly removes which problem?', options: ['Market risk', 'Emotional, inconsistent execution', 'The need to manage risk'], answer: 1 }
    ]
  },
  {
    id: 'workshop',
    title: 'Saturday Workshop: Trade With Rules',
    type: 'paid',
    price: 999,
    months: 6,
    access: '6 months access',
    level: 'Beginner – Intermediate',
    desc: 'The recorded Saturday workshop: turn gut-feel trading into a short rulebook for entries, exits, position size and review.',
    outcomes: [
      'Write your own one-page trading rulebook',
      'Size every position from a fixed risk per trade',
      'Run a weekly review instead of revenge trading'
    ],
    lessons: [
      { id: 'ws1', title: 'Forget your losses: why rules beat feelings', mins: 14, video: 'bj6hVKjweZ8', free: true },
      { id: 'ws2', title: 'Writing entry and exit rules', mins: 18, video: 'Ne2uonwaNOM', free: false },
      { id: 'ws3', title: 'Position sizing and risk per trade', mins: 15, video: 'YjjY4nLLQts', free: false },
      { id: 'ws4', title: 'Option spikes: having a plan before they happen', mins: 16, video: 'Lm1o1yWSENk', free: false },
      { id: 'ws5', title: 'The trading journal and weekly review', mins: 12, video: 'VhtllSYM9Jk', free: false }
    ],
    quiz: [
      { q: 'A sensible way to size a position is to…', options: ['Use the same quantity every time', 'Fix the rupee risk per trade and size from the stop distance', 'Double up after a loss to recover faster'], answer: 1 },
      { q: 'After three losing trades in a row, a disciplined trader…', options: ['Follows the rulebook and reviews the trades later', 'Increases size to win it back', 'Switches to a new strategy immediately'], answer: 0 },
      { q: 'Why keep a trading journal?', options: ['To show screenshots to friends', 'To find patterns in your own mistakes and fix them', 'Brokers require it'], answer: 1 }
    ]
  },
  {
    id: 'ta2',
    title: 'Technical Analysis 2.0 (self-paced)',
    type: 'paid',
    price: 9999,
    months: 12,
    access: '12 months access',
    level: 'Intermediate',
    desc: 'Technical analysis rebuilt for systematic traders: structure, volatility and backtesting, ending with your own written playbook.',
    outcomes: [
      'Read trend and structure across timeframes',
      'Convert a chart idea into a rule you can backtest',
      'Build a personal playbook you can actually follow'
    ],
    lessons: [
      { id: 'ta1', title: 'The TA 2.0 mindset: process over predictions', mins: 14, video: 'bj6hVKjweZ8', free: true },
      { id: 'ta2l', title: 'Trend, structure and timeframes', mins: 22, video: 'Ne2uonwaNOM', free: false },
      { id: 'ta3', title: 'Volatility and how options behave around it', mins: 20, video: 'Lm1o1yWSENk', free: false },
      { id: 'ta4', title: 'From chart idea to testable rule', mins: 18, video: 'YjjY4nLLQts', free: false },
      { id: 'ta5', title: 'Backtesting without fooling yourself', mins: 21, video: 'VhtllSYM9Jk', free: false },
      { id: 'ta6', title: 'Your personal playbook (with systematic traders)', mins: 26, video: 'O-_hnjXmuWw', free: false }
    ],
    quiz: [
      { q: 'A backtest looks perfect only after many parameter tweaks. This is a sign of…', options: ['A guaranteed edge', 'Curve-fitting to past data', 'Low volatility'], answer: 1 },
      { q: 'Checking a higher timeframe before entering helps you…', options: ['Trade against the dominant structure', 'Understand the context your setup sits in', 'Avoid using a stop-loss'], answer: 1 },
      { q: 'A good playbook entry contains…', options: ['Setup, entry trigger, stop, size and exit rule', 'Only the stock names to watch', 'A daily profit target you must hit'], answer: 0 }
    ]
  },
  {
    id: 'bundle',
    title: 'Workshop + TA 2.0 Bundle',
    type: 'bundle',
    price: 10499,
    was: 10998,
    months: 12,
    access: '12 months access to both',
    level: 'Beginner – Intermediate',
    includes: ['workshop', 'ta2'],
    desc: 'Both paid courses in one checkout: start with the rules workshop, then go deep with Technical Analysis 2.0.',
    outcomes: [
      'Everything in the Saturday Workshop',
      'Everything in Technical Analysis 2.0',
      'One receipt, one access period, save ₹499'
    ],
    lessons: [],
    quiz: []
  }
];

// small helpers shared by both pages
window.VM = {
  course: function (id) { return window.VM_COURSES.find(function (c) { return c.id === id; }) || null; },
  inr: function (n) { return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 }); },
  // lessons + minutes (a bundle adds up its included courses)
  stats: function (c) {
    var list = c.includes ? c.includes.map(window.VM.course) : [c];
    var lessons = 0, mins = 0;
    list.forEach(function (x) { lessons += x.lessons.length; x.lessons.forEach(function (l) { mins += l.mins; }); });
    return { lessons: lessons, mins: mins };
  },
  esc: function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
};
