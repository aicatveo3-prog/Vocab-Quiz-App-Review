/* 영단어 앱 리뷰 모음 — 정적 페이지.
   data/apps.js : 앱 목록·통계, data/r/<앱id>.js : 앱별 리뷰(상세 화면에서 그때 불러옴).
   리뷰 한 줄 = [별점, 본문, 'YYYY-MM', 공감수, '태그,태그'] — 본문은 항상 textContent로 넣는다. */
(function () {
  'use strict';
  var D = window.SITE_DATA;
  var view = document.getElementById('view');
  var APPS = D.kr.concat(D.en);
  var BY_ID = {}; APPS.forEach(function (a) { BY_ID[a.id] = a; });
  var TAGNAME = {};
  D.tags.neg.concat(D.tags.pos).forEach(function (t) { TAGNAME[t.c] = t.l; });
  var COLORS = ['#2f6bff', '#1f8a5b', '#d9822b', '#8e5bd9', '#d94f7a', '#2a9bb5', '#6b7a8f', '#b5762a'];
  var PAGE = 25;

  /* ── 작은 DOM 도우미 ── */
  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'text') e.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function colorOf(id) { var s = 0; for (var i = 0; i < id.length; i++) s = (s * 31 + id.charCodeAt(i)) >>> 0; return COLORS[s % COLORS.length]; }
  function icon(a) { var e = h('div', { class: 'ico', text: (a.name.match(/[A-Za-z가-힣0-9]/) || ['?'])[0].toUpperCase() }); e.style.background = colorOf(a.id); return e; }
  function stars(s) { var c = s <= 2 ? 'n' : s === 3 ? 'm' : 'p'; return h('span', { class: 'stars ' + c, text: '★★★★★'.slice(0, s) + '☆☆☆☆☆'.slice(0, 5 - s) }); }
  /* 앱의 기본 언어(한국어 리뷰가 적은 해외 앱은 영어)에 맞는 통계 */
  function statsOf(a, lang) { var l = lang || a.lang; return l === 'en' && a.en ? a.en : a; }
  function chip(txt, cls) { return h('span', { class: 'chip ' + cls, text: txt }); }

  /* ── 홈 ── */
  var TAKE_POS = [
    '"효과 있음"과 "간단·짧게"가 칭찬의 약 40% — 기능이 많다는 칭찬보다 부담 없이 외워진다는 칭찬이 훨씬 큼',
    '자동 복습, 아는 단어/헷갈리는 단어 분류, 효과음·게임 요소가 호평',
    '클래스카드: 암기→리콜→스펠→매칭 단계 학습 + 광고 없음이 칭찬 포인트',
    '무료 공무원 기출 앱(1인 개발): 제한 시간 + 바로 해설이 호평'
  ];
  var TAKE_NEG = [
    '결제·구독·환불이 불만 1위 — 갑작스러운 전면 유료화, 취소·환불이 어려운 연 결제',
    '악질적인 광고(버튼 위치에 광고 생성, 앱 밖 팝업)와 잠금화면형의 배터리·데이터 소모',
    '같은 문제만 반복, 복습량을 조절 못 함',
    '오타·잘못된 뜻 하나가 앱 전체에 대한 신뢰를 깨뜨림',
    '업데이트 후 화면이 나빠짐, 건의할 창구가 없음'
  ];

  /* 우리 앱과 가장 비슷한 공무원 시험용 앱(다운로드 많은 순). 국내 목록에서는 북마크로 강조하고 별도 탭에도 모아 보여준다 */
  var PICK = ['com.hackers.app.hackersvoca', 'com.hackers.app.gosivoca4800', 'com.planb.englishStudy', 'com.eduspa.voca.prof23'];

  function appCard(a) {
    var S = statsOf(a), neg = S.negTags[0], pos = S.posTags[0];
    var chips = h('div', { class: 'chips' });
    if (a.sumTop && a.lang === 'ko') {
      var cut = function (t) { return t.length > 24 ? t.slice(0, 24) + '…' : t; };
      chips.appendChild(chip('AI 요약', 'kind'));
      chips.appendChild(chip('불만 1위 · ' + cut(a.sumTop.neg[0]), 'neg'));
    } else {
      if (neg && S.n.neg >= 5) chips.appendChild(chip('불만 · ' + TAGNAME[neg[0]], 'neg'));
      if (pos && S.n.pos >= 5) chips.appendChild(chip('칭찬 · ' + TAGNAME[pos[0]], 'pos'));
    }
    var isPick = PICK.indexOf(a.id) >= 0;
    return h('a', { class: 'app' + (isPick ? ' pick' : ''), href: '#/app/' + encodeURIComponent(a.id), 'data-q': (a.name + ' ' + a.dev + ' ' + a.kind).toLowerCase() }, [
      isPick ? h('span', { class: 'bm', title: '공무원 시험용', 'aria-label': '공무원 시험용' }) : null,
      h('div', { class: 'app-top' }, [
        icon(a),
        h('div', { class: 'app-id' }, [h('div', { class: 'app-name', text: a.name }), h('div', { class: 'app-sub', text: a.dev + ' · ' + a.kind })]),
        h('div', { class: 'rank', text: a.rank })
      ]),
      h('div', { class: 'stats' }, [
        h('span', null, [h('b', { text: a.dl || '-' }), ' 다운로드']),
        h('span', null, ['★ ', h('b', { text: a.score || '-' })]),
        h('span', null, ['리뷰 ', h('b', { text: statsOf(a).n.total + (a.lang === 'en' ? ' (영어)' : '') })])
      ]),
      chips.children.length ? chips : null
    ]);
  }

  function renderHome() {
    clear(view);
    document.title = '영단어 앱 리뷰 모음';
    view.appendChild(h('h1', { text: '영단어 앱 리뷰 모음' }));
    view.appendChild(h('p', { class: 'lead', text: '국내·해외 영단어 앱의 구글 플레이 리뷰를 앱별로 모았어요. 앱을 누르면 칭찬과 불만 리뷰를 따로 볼 수 있습니다.' }));

    var li = function (t) { return h('li', { text: t }); };
    if (window.COMPARE) view.appendChild(h('a', { class: 'cmp-link', href: '#/compare' }, [
      h('b', { text: '우리 앱과 비교 · 가져올 점·피할 점' }),
      h('span', { text: '해커스공무원 기출보카·말해보카·저절로암기·해커스보카를 우리 앱(Ver2)과 견줘 정리했어요' })
    ]));
    view.appendChild(h('details', { class: 'take-d' }, [
      h('summary', { text: '한눈에 보기 · 사람들이 좋아하는 것과 싫어하는 것' }),
      h('div', { class: 'take' }, [
        h('div', { class: 'tk pos' }, [h('h3', { text: '좋아하는 것' }), h('ul', null, TAKE_POS.map(li))]),
        h('div', { class: 'tk neg' }, [h('h3', { text: '싫어하는 것' }), h('ul', null, TAKE_NEG.map(li))])
      ]),
      h('div', { class: 'note', text: '수집한 리뷰(별점 1~5점 섞음)를 읽고 키워드로 센 결과예요. 1~2점 리뷰를 일부러 많이 모아서 불만 비율이 실제보다 커 보일 수 있어요.' })
    ]));

    var q = h('input', { class: 'search', type: 'search', placeholder: '앱 이름 검색 (예: 말해보카, 잠금화면)', 'aria-label': '앱 검색' });
    var state = { tab: 'kr' };
    var segBox = h('div', { class: 'seg', role: 'tablist' });
    view.appendChild(h('div', { class: 'tools' }, [segBox, q]));

    var pickApps = D.kr.filter(function (a) { return PICK.indexOf(a.id) >= 0; }).sort(function (a, b) { return PICK.indexOf(a.id) - PICK.indexOf(b.id); });
    var secs = [['kr', '국내에서 만든 앱', D.kr], ['en', '해외에서 만든 앱', D.en], ['pick', '공무원 시험용 앱', pickApps]].map(function (s) {
      var grid = h('div', { class: 'grid' }, s[2].map(appCard));
      var cnt = h('span', { class: 'cnt', text: s[0] === 'pick' ? '우리 앱과 가장 비슷한 앱 · 다운로드 많은 순' : '다운로드 많은 순' });
      var head = h('div', { class: 'sec-h' }, [h('h2', { text: s[1] }), cnt]);
      var sec = h('section', { id: 'sec-' + s[0] }, [head, grid]);
      view.appendChild(sec);
      return { id: s[0], sec: sec, grid: grid, head: head, total: s[2].length, name: s[1] };
    });

    function apply() {
      var k = q.value.trim().toLowerCase();
      clear(segBox);
      [['kr', '국내 앱', D.kr.length], ['en', '해외 앱', D.en.length], ['pick', '공무원 시험', pickApps.length]].forEach(function (t) {
        segBox.appendChild(h('button', { class: 'seg-b' + (!k && state.tab === t[0] ? ' on' : ''), type: 'button', role: 'tab', onclick: function () { q.value = ''; state.tab = t[0]; apply(); } }, [t[1], h('small', { text: t[2] })]));
      });
      secs.forEach(function (s) {
        var n = 0;
        [].forEach.call(s.grid.children, function (c) { var ok = !k || c.getAttribute('data-q').indexOf(k) >= 0; c.style.display = ok ? '' : 'none'; if (ok) n++; });
        // 검색 중에는 두 목록을 모두, 아니면 선택한 탭만 보여준다
        // 공무원 시험 탭은 국내 목록과 같은 앱이라, 검색 중에는 중복되지 않게 숨긴다
        s.sec.style.display = (k ? (n > 0 && s.id !== 'pick') : state.tab === s.id) ? '' : 'none';
        s.head.style.display = k ? '' : 'none';
      });
    }
    q.addEventListener('input', apply);
    apply();
  }
  /* ── 상세 ── */
  var loaded = {};
  function loadReviews(id, lang, cb) {
    var store = lang === 'en' ? 'RVE' : 'RV', key = store + ':' + id;
    if (window[store] && window[store][id]) return cb(window[store][id]);
    if (loaded[key]) { loaded[key].push(cb); return; }
    loaded[key] = [cb];
    var s = document.createElement('script');
    s.src = 'data/r/' + id + (lang === 'en' ? '.en' : '') + '.js';
    var done = function () { var l = loaded[key]; delete loaded[key]; l.forEach(function (f) { f((window[store] && window[store][id]) || []); }); };
    s.onload = done; s.onerror = done;
    document.head.appendChild(s);
  }

  function mark(text, q) {
    var frag = document.createDocumentFragment();
    if (!q) { frag.appendChild(document.createTextNode(text)); return frag; }
    var low = text.toLowerCase(), ql = q.toLowerCase(), i = 0, j;
    while ((j = low.indexOf(ql, i)) >= 0) {
      if (j > i) frag.appendChild(document.createTextNode(text.slice(i, j)));
      frag.appendChild(h('mark', { text: text.slice(j, j + q.length) }));
      i = j + q.length;
    }
    if (i < text.length) frag.appendChild(document.createTextNode(text.slice(i)));
    return frag;
  }

  /* 리뷰 한 장 (요약의 근거 보기·원문 목록 공용). q 가 있으면 검색어를 강조한다. */
  function rvCard(r, q, withTags) {
    var long = r[1].length > 220, full = r[1], open = false;
    var t = h('div', { class: 'rv-t' });
    function setText() { clear(t); t.appendChild(mark(long && !open ? full.slice(0, 220) + '…' : full, q || '')); }
    setText();
    var kids = [h('div', { class: 'rv-h' }, [stars(r[0]), h('span', { text: r[2] }), r[3] ? h('span', { text: '👍 ' + r[3] }) : null]), t];
    if (long) {
      var btn = h('button', { class: 'more', type: 'button', text: '전체 보기', onclick: function () { open = !open; btn.textContent = open ? '접기' : '전체 보기'; setText(); } });
      kids.push(btn);
    }
    if (withTags) {
      var tg = r[4].split(',').filter(Boolean);
      if (tg.length) kids.push(h('div', { class: 'chips' }, tg.map(function (c) { return chip(TAGNAME[c], c.charAt(0) === '+' ? 'pos' : 'neg'); })));
    }
    return h('div', { class: 'rv' }, kids);
  }

  var sumLoaded = {};
  function loadSummary(id, cb) {
    if (window.SUM && window.SUM[id]) return cb(window.SUM[id]);
    if (sumLoaded[id]) { sumLoaded[id].push(cb); return; }
    sumLoaded[id] = [cb];
    var s = document.createElement('script');
    s.src = 'data/summary/' + id + '.js';
    var done = function () { var l = sumLoaded[id]; delete sumLoaded[id]; l.forEach(function (f) { f((window.SUM && window.SUM[id]) || null); }); };
    s.onload = done; s.onerror = done;
    document.head.appendChild(s);
  }

  /* 주장 한 줄 = 제목 + 건수 + 최근 건수 + 연도 분포 + 설명 + 대표 리뷰 2개 + 근거 리뷰 펼치기 */
  function claimCard(item, kind, revs, total, rank, maxN, open) {
    var body = h('div', { class: 'cl-body' });
    body.style.display = open ? '' : 'none';
    var years = Object.keys(item.years).sort(), maxY = Math.max.apply(null, years.map(function (y) { return item.years[y]; }));
    var yrs = h('div', { class: 'yrs', title: '연도별 건수' }, years.map(function (y) {
      var bar = h('i'); bar.style.height = Math.max(3, Math.round(item.years[y] / maxY * 26)) + 'px';
      return h('div', { class: 'yr' }, [h('span', { class: 'yn', text: item.years[y] }), bar, h('span', { class: 'yl', text: y.slice(2) })]);
    }));
    body.appendChild(h('div', { class: 'cl-meta' }, [
      h('span', { text: '표본 ' + total + '개 중 약 ' + Math.round(item.n * 100 / total) + '%' }),
      h('span', { text: '최근 12개월 ' + item.recent + '건' })
    ]));
    body.appendChild(yrs);
    if (item.detail) body.appendChild(h('p', { class: 'cl-d', text: item.detail }));
    var quotes = item.idx.slice(0, 2).map(function (i) {
      var r = revs[i];
      return h('blockquote', { class: 'q' }, [
        h('div', { class: 'q-h' }, [stars(r[0]), h('span', { text: r[2] }), r[3] ? h('span', { text: '👍 ' + r[3] }) : null]),
        r[1].length > 170 ? r[1].slice(0, 170) + '…' : r[1]
      ]);
    });
    if (quotes.length) body.appendChild(h('div', { class: 'qs' }, quotes));
    var ev = h('div', { class: 'ev' }), shown = 0, btn, closeBtn;
    function label() {
      btn.textContent = shown ? '근거 리뷰 더 보기 (' + (item.idx.length - shown) + '건 남음)' : '근거 리뷰 ' + item.n + '건 모두 보기';
      btn.style.display = shown >= item.idx.length ? 'none' : '';
      closeBtn.style.display = shown ? '' : 'none';
    }
    btn = h('button', { class: 'ev-btn', type: 'button', onclick: function () {
      item.idx.slice(shown, shown + 6).forEach(function (i) { ev.appendChild(rvCard(revs[i], '', false)); });
      shown = Math.min(item.idx.length, shown + 6);
      label();
    } });
    closeBtn = h('button', { class: 'ev-btn', type: 'button', text: '접기', onclick: function () { clear(ev); shown = 0; label(); } });
    label();
    body.appendChild(h('div', { class: 'ev-row' }, [btn, closeBtn]));
    body.appendChild(ev);

    var chev = h('span', { class: 'cl-chev', text: open ? '▴' : '▾' });
    var head = h('button', { class: 'cl-head', type: 'button', 'aria-expanded': open ? 'true' : 'false', onclick: function () {
      var show = body.style.display === 'none';
      body.style.display = show ? '' : 'none';
      chev.textContent = show ? '▴' : '▾';
      head.setAttribute('aria-expanded', show ? 'true' : 'false');
    } }, [
      h('span', { class: 'cl-rank', text: rank }),
      h('span', { class: 'cl-mid' }, [h('span', { class: 'cl-t', text: item.title }), (function () { var b = h('span', { class: 'cl-bar' }, [h('i')]); b.firstChild.style.width = Math.round(item.n / maxN * 100) + '%'; return b; })()]),
      h('span', { class: 'cl-n' }, [h('b', { text: item.n }), '건']),
      chev
    ]);
    return h('div', { class: 'claim ' + kind }, [head, body]);
  }

  function wishRow(item, revs) {
    var ev = h('div', { class: 'ev' }), open = false;
    var btn = h('button', { class: 'wish-b', type: 'button', onclick: function () {
      open = !open; clear(ev);
      if (open) item.idx.forEach(function (i) { ev.appendChild(rvCard(revs[i], '', false)); });
      btn.setAttribute('aria-expanded', open);
    } }, [h('span', { class: 'wish-t', text: item.title }), h('span', { class: 'wish-n', text: item.n + '건' })]);
    return h('div', { class: 'wish' }, [btn, ev]);
  }

  /* 캡처 확대 보기: items = [{file, caption, title, text}] 묶음 안에서 ←/→ 로 넘기고, 설명 글을 옆에 같이 보여준다.
     바깥을 누르거나 Esc 로 닫는다. */
  function openShot(items, start) {
    var i = start || 0, imgEl = h('img', { alt: '' }), cap = h('div', { class: 'lb-c' });
    var ttl = h('div', { class: 'lb-title' }), body = h('div', { class: 'lb-body' }), cnt = h('div', { class: 'lb-cnt' });
    var prev = h('button', { class: 'lb-nav lb-prev', type: 'button', 'aria-label': '이전 화면', text: '‹', onclick: function (e) { e.stopPropagation(); go(-1); } });
    var next = h('button', { class: 'lb-nav lb-next', type: 'button', 'aria-label': '다음 화면', text: '›', onclick: function (e) { e.stopPropagation(); go(1); } });
    var side = h('div', { class: 'lb-side' }, [cnt, ttl, body, cap]);
    var ov = h('div', { class: 'lb', role: 'dialog', 'aria-label': '화면 확대' }, [
      h('div', { class: 'lb-in', onclick: function (e) { e.stopPropagation(); } }, [
        h('div', { class: 'lb-fig' }, [imgEl]),
        side
      ]),
      prev, next
    ]);
    function show() {
      var it = items[i];
      imgEl.src = it.file; imgEl.alt = it.caption || '';
      ttl.textContent = it.title || ''; ttl.style.display = it.title ? '' : 'none';
      body.textContent = it.text || ''; body.style.display = it.text ? '' : 'none';
      cap.textContent = it.caption || '';
      cnt.textContent = items.length > 1 ? (i + 1) + ' / ' + items.length + '  ← → 키로 넘겨요' : '';
      prev.style.display = next.style.display = items.length > 1 ? '' : 'none';
      side.scrollTop = 0;
      [i - 1, i + 1].forEach(function (k) { if (items[k]) { var p = new Image(); p.src = items[k].file; } });
    }
    function go(d) { var n = i + d; if (n < 0 || n >= items.length) return; i = n; show(); }
    function close() { document.removeEventListener('keydown', onKey); if (ov.parentNode) ov.parentNode.removeChild(ov); }
    function onKey(e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    }
    ov.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    show();
    document.body.appendChild(ov);
  }

  var STATUS = { ok: ['리뷰와 같음', 'ok'], diff: ['리뷰와 다름', 'diff'], part: ['일부만 확인', 'part'] };
  function buildHandsOn(H) {
    var byId = {}; H.shots.forEach(function (x) { byId[x.id] = x; });
    var cnt = { ok: 0, diff: 0, part: 0 };
    H.findings.forEach(function (f) { cnt[f.status] = (cnt[f.status] || 0) + 1; });
    var cards = H.findings.map(function (f) {
      var st = STATUS[f.status] || STATUS.part;
      var group = f.shots.map(function (id) {
        var sh = byId[id];
        return { file: sh.file, caption: sh.caption, title: st[0] + ' · ' + f.claim, text: f.text };
      });
      var thumbs = h('div', { class: 'ho-th' }, f.shots.map(function (id, gi) {
        var sh = byId[id];
        return h('button', { class: 'ho-img', type: 'button', title: sh.caption, onclick: function () { openShot(group, gi); } }, [
          h('img', { src: sh.file, alt: sh.caption, loading: 'lazy' }),
          h('span', { text: sh.caption })
        ]);
      }));
      return h('div', { class: 'ho-card' }, [
        h('div', { class: 'ho-h' }, [h('span', { class: 'ho-st ' + st[1], text: st[0] }), h('span', { class: 'ho-claim', text: f.claim })]),
        h('p', { class: 'ho-t', text: f.text }),
        thumbs
      ]);
    });
    return h('section', { class: 'sum-sec', id: 's-hands' }, [
      h('h2', { text: '직접 써 봤더니' }),
      h('p', { class: 'meta', text: '리뷰에서 나온 주장을 실제 앱에서 확인한 결과예요. 화면을 누르면 크게 볼 수 있어요.' }),
      h('div', { class: 'card ho-top' }, [
        h('div', { class: 'ho-sum' }, [
          h('span', { class: 'ho-st ok', text: '리뷰와 같음 ' + cnt.ok }),
          h('span', { class: 'ho-st diff', text: '리뷰와 다름 ' + cnt.diff }),
          h('span', { class: 'ho-st part', text: '일부만 확인 ' + cnt.part })
        ]),
        h('p', { class: 'ho-env', text: H.date + ' · ' + H.env }),
        h('p', { class: 'ho-no', text: '확인하지 못한 것: ' + H.notChecked })
      ])
    ].concat(cards));
  }

  /* 앱 소개 보고서: 한 장 요약 + 단계별 화면 + 표 */
  function buildOverview(O, shots) {
    var byId = {}; shots.forEach(function (x) { byId[x.id] = x; });
    /* group: 같은 섹션의 캡처 묶음(확대 화면에서 ←/→ 로 넘기는 범위), gi: 묶음 안 순서 */
    function shotBtn(id, big, group, gi) {
      var sh = byId[id]; if (!sh) return null;
      return h('button', { class: 'ho-img' + (big ? ' ov-big' : ''), type: 'button', title: sh.caption, onclick: function () { openShot(group, gi); } }, [
        h('img', { src: sh.file, alt: sh.caption, loading: 'lazy' }),
        big ? null : h('span', { text: sh.caption })
      ]);
    }
    var parts = [
      h('div', { class: 'ov-head' }, [h('h2', { text: O.title }), h('p', { class: 'meta', text: O.sub })]),
      h('div', { class: 'card ov-kv' }, O.kv.map(function (r) {
        return h('div', { class: 'ov-row' }, [h('div', { class: 'ov-k', text: r[0] }), h('div', { class: 'ov-v', text: r[1] })]);
      }))
    ];
    O.sections.forEach(function (sec) {
      var kids = [h('div', { class: 'ov-sh' }, [h('h3', { text: sec.title }), sec.badge ? h('span', { class: 'ov-badge', text: sec.badge }) : null])];
      if (sec.intro) kids.push(h('p', { class: 'meta', text: sec.intro }));
      if (sec.steps) {
        var sgroup = sec.steps.map(function (st, i) {
          var s = byId[st.shot] || {};
          return { file: s.file, caption: s.caption, title: (i + 1) + '. ' + st.title, text: st.text };
        });
        kids.push(h('div', { class: 'ov-steps' }, sec.steps.map(function (st, i) {
          return h('div', { class: 'ov-step' }, [
            shotBtn(st.shot, true, sgroup, i),
            h('div', { class: 'ov-st' }, [h('span', { class: 'ov-n', text: i + 1 }), h('b', { text: st.title })]),
            h('p', { text: st.text })
          ]);
        })));
      }
      if (sec.bullets) kids.push(h('ul', { class: 'ov-ul' }, sec.bullets.map(function (b) { return h('li', { text: b }); })));
      if (sec.shots) {
        var btxt = (sec.bullets || []).map(function (b) { return '• ' + b; }).join('\n');
        var ggroup = sec.shots.map(function (id) {
          var s = byId[id] || {};
          return { file: s.file, caption: s.caption, title: sec.title, text: btxt };
        });
        kids.push(h('div', { class: 'ov-shots' }, sec.shots.map(function (id, gi) { return shotBtn(id, false, ggroup, gi); })));
      }
      parts.push(h('div', { class: 'ov-sec' }, kids));
    });
    if (O.compare) {
      var C = O.compare;
      parts.push(h('div', { class: 'ov-sec' }, [
        h('div', { class: 'ov-sh' }, [h('h3', { text: C.title })]),
        h('div', { class: 'ov-tw' }, [h('table', { class: 'ov-t' }, [
          h('thead', null, [h('tr', null, C.head.map(function (x) { return h('th', { text: x }); }))]),
          h('tbody', null, C.rows.map(function (r) { return h('tr', null, r.map(function (c, i) { return h(i ? 'td' : 'th', { text: c, scope: i ? null : 'row' }); })); }))
        ])]),
        C.note ? h('p', { class: 'ov-note', text: C.note }) : null
      ]));
    }
    if (O.limits) parts.push(h('p', { class: 'note', text: '한계: ' + O.limits }));
    return h('section', { class: 'overview', id: 's-overview' }, parts);
  }

  function buildSummary(a, revs, S, box) {
    var total = S.total;
    function sec(title, sub, kids, key) { return h('section', { class: 'sum-sec', id: 's-' + (key || '') }, [h('h2', { text: title }), sub ? h('p', { class: 'meta', text: sub }) : null].concat(kids)); }
    if (S.overview) box.appendChild(buildOverview(S.overview, S.handsOn ? S.handsOn.shots : []));
    box.appendChild(h('div', { class: 'card sum-top' }, [
      h('div', { class: 'sum-tag', text: 'AI가 리뷰를 읽고 정리한 요약' }),
      h('p', { class: 'one', text: S.oneLine }),
      h('p', { class: 'note', text: S.scopeNote })
    ]));
    var navItems = (S.overview ? [['overview', '앱 소개']] : []).concat(S.handsOn ? [['hands', '직접 체험']] : []).concat([['neg', '불만'], ['pos', '칭찬'], ['wish', '건의'], ['exam', '시험 준비'], ['facts', '사실'], ['tl', '시간 흐름'], ['learn', '시사점'], ['raw', '원문']]);
    var nav = h('nav', { class: 'subnav' }, navItems.map(function (n) {
      return h('a', { href: '#s-' + n[0], onclick: function (e) { e.preventDefault(); var el = document.getElementById('s-' + n[0]); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } , text: n[1] });
    }));
    box.appendChild(nav);
    if (S.handsOn) box.appendChild(buildHandsOn(S.handsOn));
    function claimList(kind, items, firstN) {
      var wrap = h('div'), rest = h('div'), moreBtn;
      var maxN = items[0].n;
      items.forEach(function (it, i) { (i < firstN ? wrap : rest).appendChild(claimCard(it, kind, revs, total, i + 1, maxN, i === 0)); });
      rest.style.display = 'none';
      var out = h('div', null, [wrap, rest]);
      if (items.length > firstN) {
        moreBtn = h('button', { class: 'loadmore', type: 'button', text: '나머지 ' + (items.length - firstN) + '개 주장 더 보기', onclick: function () {
          var show = rest.style.display === 'none'; rest.style.display = show ? '' : 'none';
          moreBtn.textContent = show ? '접기' : '나머지 ' + (items.length - firstN) + '개 주장 더 보기';
        } });
        out.appendChild(moreBtn);
      }
      return out;
    }
    box.appendChild(sec('불만 — 어떤 점이 어떻게 불만인가', '같은 말을 하는 리뷰를 묶고, 많이 나온 순으로 보여줘요. 카드를 열면 근거가 된 리뷰 원문을 볼 수 있어요.', [claimList('neg', S.neg, 6)], 'neg'));
    box.appendChild(sec('칭찬 — 어떤 점이 좋다고 하나', null, [claimList('pos', S.pos, 5)], 'pos'));
    box.appendChild(sec('건의 — 사용자가 "이런 기능이 있었으면" 하고 요구한 것', '우리 앱 아이디어 창고로 쓸 수 있어요. 누르면 해당 리뷰가 펼쳐져요.', [h('div', null, S.wish.map(function (w) { return wishRow(w, revs); }))], 'wish'));
    if (S.exam) {
      box.appendChild(sec('시험 준비하는 사용자의 의견', null, [h('div', { class: 'card' }, [h('h3', { class: 'ex-t', text: S.exam.title }), h('p', { text: S.exam.text }), wishRow({ title: '근거 리뷰', n: S.exam.n, idx: S.exam.idx }, revs)])], 'exam'));
    }
    if (S.facts.length) {
      box.appendChild(sec('확인할 수 있는 사실 (리뷰에 적힌 내용이며 공식 확인은 아니에요)', null, [h('div', { class: 'facts' }, S.facts.map(function (f) {
        return h('div', { class: 'fact' }, [h('div', { class: 'fact-l', text: f.label }), h('div', { class: 'fact-v', text: f.value }), wishRow({ title: '근거 리뷰', n: f.n, idx: f.idx }, revs)]);
      }))], 'facts'));
    }
    if (S.timeline.length) {
      box.appendChild(sec('시간 흐름', null, [h('div', { class: 'tl' }, S.timeline.map(function (t) {
        return h('div', { class: 'tl-i' }, [h('div', { class: 'tl-w', text: t.when }), h('div', null, [h('div', { text: t.text }), wishRow({ title: '근거 리뷰', n: t.n, idx: t.idx }, revs)])]);
      }))], 'tl'));
    }
    var li = function (t) { return h('li', { text: t }); };
    box.appendChild(sec('우리 앱에 주는 시사점', null, [h('div', { class: 'take' }, [
      h('div', { class: 'card pos' }, [h('h3', { text: '배울 점' }), h('ul', null, S.learn.map(li))]),
      h('div', { class: 'card neg' }, [h('h3', { text: '피할 점' }), h('ul', null, S.avoid.map(li))])
    ])], 'learn'));
    box.appendChild(h('h2', { class: 'raw-h', id: 's-raw', text: '원문 리뷰 (근거 자료)' }));
  }

  function renderApp(id) {
    var a = BY_ID[id];
    clear(view);
    if (!a) { view.appendChild(h('p', { class: 'empty', text: '없는 앱이에요.' })); view.appendChild(h('a', { class: 'back', href: '#/', text: '← 목록으로' })); return; }
    document.title = a.name + ' 리뷰 · 영단어 앱 리뷰 모음';
    view.appendChild(h('a', { class: 'back', href: '#/', text: '← 목록으로' }));
    view.appendChild(h('div', { class: 'head' }, [icon(a), h('div', null, [
      h('h1', { text: a.name }),
      h('div', { class: 'meta', text: a.dev + ' · ' + (a.group === 'kr' ? '국내 앱' : '해외 앱') + ' · ' + a.kind })
    ])]));
    view.appendChild(h('div', { class: 'stats' }, [
      h('span', null, ['다운로드 ', h('b', { text: a.dl || '-' })]),
      h('span', null, ['플레이스토어 평점 ', h('b', { text: a.score ? '★' + a.score : '-' })]),
      h('span', null, ['전체 리뷰 ', h('b', { text: a.reviewCount || '-' })])
    ]));
    var langBox = h('div', { class: 'tabs' }), body = h('div');
    if (a.en && a.n.total > 0) view.appendChild(langBox);
    view.appendChild(body);
    function show(lang) {
      clear(langBox); clear(body);
      [['ko', '한국어 리뷰 ' + a.n.total], ['en', 'English 리뷰 ' + (a.en ? a.en.n.total : 0)]].forEach(function (l) {
        langBox.appendChild(h('button', { class: 'tab' + (lang === l[0] ? ' on' : ''), type: 'button', text: l[1], onclick: function () { show(l[0]); } }));
      });
      body.appendChild(h('p', { class: 'empty', text: '리뷰를 불러오는 중…' }));
      loadReviews(id, lang, function (revs) { clear(body); buildDetail(a, revs, body, lang); });
    }
    show(a.lang);
  }

  function buildDetail(a, revs, root, lang) {
    var S = statsOf(a, lang);
    if (!revs.length) { root.appendChild(h('p', { class: 'empty', text: '수집된 리뷰가 없어요.' })); return; }
    if (lang === 'en') root.appendChild(h('p', { class: 'meta', text: '영어 원문 그대로예요. 주제 분류는 영어 키워드로 계산했습니다.' }));
    var hasSum = lang === 'ko' && a.summary;
    var sumBox = h('div', { class: 'sum' });
    var st = { tab: S.n.neg ? 'neg' : (S.n.pos ? 'pos' : 'all'), tag: '', sort: 'up', q: '', shown: PAGE };
    var inTab = { neg: function (r) { return r[0] <= 2; }, pos: function (r) { return r[0] >= 4; }, mid: function (r) { return r[0] === 3; }, all: function () { return true; } };
    var listBox = h('div'), tagBox = h('div', { class: 'tagrow' }), tabBox = h('div', { class: 'tabs' }), barBox = h('div', { class: 'two' });

    function bars(kind, label, rows, total) {
      var box = h('div', { class: 'card bars ' + kind }, [h('h3', { text: label })]);
      if (!rows.length || total < 5) { box.appendChild(h('div', { class: 'meta', text: '리뷰가 적어서 집계하지 않았어요.' })); return box; }
      rows.forEach(function (r) {
        var b = h('button', { class: 'bar' + (st.tag === r[0] ? ' on' : ''), type: 'button', onclick: function () { st.tab = kind; st.tag = st.tag === r[0] ? '' : r[0]; st.shown = PAGE; draw(); } }, [
          h('div', { class: 'bar-l' }, [h('span', { text: TAGNAME[r[0]] }), h('span', { text: r[2] + '% · ' + r[1] + '개' })]),
          h('div', { class: 'bar-t' }, [h('i')])
        ]);
        b.querySelector('i').style.width = Math.min(100, r[2]) + '%';
        box.appendChild(b);
      });
      return box;
    }

    function pass() {
      var f = inTab[st.tab], q = st.q.toLowerCase();
      var out = revs.filter(function (r) {
        if (!f(r)) return false;
        if (st.tag && r[4].split(',').indexOf(st.tag) < 0) return false;
        if (q && r[1].toLowerCase().indexOf(q) < 0) return false;
        return true;
      });
      if (st.sort === 'new') out.sort(function (x, y) { return y[2] < x[2] ? -1 : y[2] > x[2] ? 1 : y[3] - x[3]; });
      else if (st.sort === 'low') out.sort(function (x, y) { return x[0] - y[0] || y[3] - x[3]; });
      else if (st.sort === 'high') out.sort(function (x, y) { return y[0] - x[0] || y[3] - x[3]; });
      else out.sort(function (x, y) { return y[3] - x[3]; });
      return out;
    }

    function reviewEl(r) { return rvCard(r, st.q, true); }

    function draw() {
      // 탭
      clear(tabBox);
      [['neg', '불만 (1~2점)', S.n.neg], ['pos', '칭찬 (4~5점)', S.n.pos], ['mid', '보통 (3점)', S.n.mid], ['all', '전체', S.n.total]].forEach(function (t) {
        tabBox.appendChild(h('button', { class: 'tab' + (st.tab === t[0] ? ' on' : ''), type: 'button', onclick: function () { st.tab = t[0]; st.tag = ''; st.shown = PAGE; draw(); } }, [t[1], h('small', { text: t[2] })]));
      });
      // 주제 칩 (현재 탭에 실제로 있는 것만)
      clear(tagBox);
      var f = inTab[st.tab], cnt = {};
      revs.forEach(function (r) { if (f(r)) r[4].split(',').forEach(function (c) { if (c) cnt[c] = (cnt[c] || 0) + 1; }); });
      var tgs = Object.keys(cnt).sort(function (x, y) { return cnt[y] - cnt[x]; });
      if (tgs.length) tagBox.appendChild(h('span', { class: 'meta', text: '주제:' }));
      tgs.forEach(function (c) {
        tagBox.appendChild(h('button', { class: 'tg' + (st.tag === c ? ' on' : ''), type: 'button', text: TAGNAME[c] + ' ' + cnt[c], onclick: function () { st.tag = st.tag === c ? '' : c; st.shown = PAGE; draw(); } }));
      });
      // 막대
      clear(barBox);
      barBox.appendChild(bars('neg', '불만 주제 (1~2점 리뷰 중)', S.negTags, S.n.neg));
      barBox.appendChild(bars('pos', '칭찬 주제 (4~5점 리뷰 중)', S.posTags, S.n.pos));
      // 목록
      clear(listBox);
      var list = pass();
      if (!list.length) listBox.appendChild(h('p', { class: 'empty', text: '조건에 맞는 리뷰가 없어요.' }));
      list.slice(0, st.shown).forEach(function (r) { listBox.appendChild(reviewEl(r)); });
      if (list.length > st.shown) listBox.appendChild(h('button', { class: 'loadmore', type: 'button', text: '더 보기 (' + (list.length - st.shown) + '개 남음)', onclick: function () { st.shown += PAGE; draw(); } }));
      resultNote.textContent = list.length + '개 리뷰';
    }

    var resultNote = h('span', { class: 'meta' });
    var qIn = h('input', { class: 'search', type: 'search', placeholder: lang === 'en' ? '리뷰 안에서 검색 (예: ads, refund)' : '리뷰 안에서 검색 (예: 광고, 환불)', 'aria-label': '리뷰 검색' });
    var timer;
    qIn.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { st.q = qIn.value.trim(); st.shown = PAGE; draw(); }, 200); });
    var sortSel = h('select', { 'aria-label': '정렬', onchange: function () { st.sort = sortSel.value; st.shown = PAGE; draw(); } }, [
      h('option', { value: 'up', text: '공감 많은 순' }), h('option', { value: 'new', text: '최신순' }),
      h('option', { value: 'low', text: '별점 낮은 순' }), h('option', { value: 'high', text: '별점 높은 순' })
    ]);

    if (hasSum) {
      root.appendChild(sumBox);
      sumBox.appendChild(h('p', { class: 'empty', text: '요약을 불러오는 중…' }));
      loadSummary(a.id, function (SUM) {
        clear(sumBox);
        if (SUM) buildSummary(a, revs, SUM, sumBox);
      });
    } else {
      root.appendChild(barBox);
    }
    root.appendChild(tabBox);
    root.appendChild(h('div', { class: 'filters' }, [qIn, sortSel, resultNote]));
    root.appendChild(tagBox);
    root.appendChild(listBox);
    root.appendChild(h('div', { class: 'note', text: '표시한 리뷰는 앱마다 별점별로 공감이 많은 순으로 일부만 모은 표본이에요. 전체 리뷰의 비율과는 다를 수 있어요.' }));
    draw();
  }

  /* ── 우리 앱과 비교 (data/compare.js 의 글을 그린다) ── */
  function renderCompare() {
    var C = window.COMPARE;
    clear(view);
    if (!C) { renderHome(); return; }
    document.title = C.title + ' · 영단어 앱 리뷰 모음';
    view.appendChild(h('a', { class: 'back', href: '#/', text: '← 목록으로' }));
    var box = h('div', { class: 'overview cmp' });
    view.appendChild(box);
    box.appendChild(h('div', { class: 'ov-head' }, [h('h2', { text: C.title }), h('p', { class: 'meta', text: C.sub })]));
    box.appendChild(h('ul', { class: 'ov-ul' }, C.basis.map(function (t) { return h('li', { text: t }); })));

    var srcLinks = function (src) {
      var kids = [h('span', { class: 'cmp-k', text: '근거 앱' })];
      src.forEach(function (x) { kids.push(h('a', { class: 'cmp-src', href: '#/app/' + encodeURIComponent(x[1]), text: x[0] })); });
      return h('div', { class: 'cmp-srcs' }, kids);
    };
    var row = function (k, v) { return v ? h('div', { class: 'ov-row' }, [h('div', { class: 'ov-k', text: k }), h('div', { class: 'ov-v', text: v })]) : null; };

    box.appendChild(h('div', { class: 'ov-sec' }, [h('h3', { text: '한눈에 비교' })]));
    var T = C.table, thead = h('thead', null, [h('tr', null, T.head.map(function (x) { return h('th', { text: x }); }))]);
    var tbody = h('tbody', null, T.rows.map(function (r) {
      return h('tr', null, r.map(function (c, i) { return h(i === 0 ? 'th' : 'td', { text: c }); }));
    }));
    box.lastChild.appendChild(h('div', { class: 'ov-tw' }, [h('table', { class: 'ov-t' }, [thead, tbody])]));

    box.appendChild(h('div', { class: 'ov-sec' }, [h('h3', { text: '먼저 알아야 할 점' }),
      h('ul', { class: 'ov-ul' }, C.facts.map(function (t) { return h('li', { text: t }); }))]));

    box.appendChild(h('h2', { class: 'cmp-h', text: '가져올 점' }));
    C.take.forEach(function (g) {
      var sec = h('div', { class: 'ov-sec' }, [h('div', { class: 'ov-sh' }, [h('span', { class: 'cmp-pri', text: g.id }), h('h3', { text: g.name })])]);
      g.items.forEach(function (it) {
        sec.appendChild(h('div', { class: 'card cmp-it' }, [
          h('div', { class: 'cmp-t' }, [h('b', { text: it.title }), h('span', { class: 'ov-badge', text: '크기 ' + it.size })]),
          row('근거', it.why), row('우리 앱', it.now), row('할 일', it.todo), row('주의', it.warn),
          srcLinks(it.src)
        ]));
      });
      box.appendChild(sec);
    });

    box.appendChild(h('h2', { class: 'cmp-h', text: '피할 점' }));
    var asec = h('div', { class: 'ov-sec' });
    C.avoid.forEach(function (it) {
      asec.appendChild(h('div', { class: 'card cmp-it' }, [
        h('div', { class: 'cmp-t' }, [h('b', { text: it.title })]),
        row('다른 앱', it.from), row('우리 앱', it.ours), row('할 일', it.todo), srcLinks(it.src)
      ]));
    });
    box.appendChild(asec);

    box.appendChild(h('div', { class: 'ov-sec' }, [h('h3', { text: '이미 앞서 있어서 지킬 점' }),
      h('ul', { class: 'ov-ul' }, C.keep.map(function (t) { return h('li', { text: t }); }))]));
    box.appendChild(h('div', { class: 'ov-sec' }, [h('h3', { text: '제안 순서' }),
      h('ol', { class: 'ov-ul' }, C.plan.map(function (t) { return h('li', { text: t }); }))]));
    box.appendChild(h('div', { class: 'ov-sec' }, [h('h3', { text: '정해 주실 것' }),
      h('ul', { class: 'ov-ul' }, C.decide.map(function (t) { return h('li', { text: t }); }))]));
  }

  /* ── 라우터 ── */
  function route() {
    var m = (location.hash || '').match(/^#\/app\/(.+)$/);
    if (m) renderApp(decodeURIComponent(m[1]));
    else if (location.hash === '#/compare') renderCompare();
    else renderHome();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  document.getElementById('top-sub').textContent = '구글 플레이 공개 리뷰 · ' + D.collected + ' 수집';
  document.getElementById('foot').textContent =
    '구글 플레이 스토어의 공개 리뷰(한국어)를 앱마다 별점별로 공감이 많은 순으로 일부만 모았습니다. 작성자 이름과 개발사 답글은 싣지 않았어요. ' +
    '주제 분류는 키워드로 자동 계산한 것이라 정확하지 않을 수 있습니다. 해외 앱은 한국어로 쓴 리뷰만 담았어요.';
  route();
})();
