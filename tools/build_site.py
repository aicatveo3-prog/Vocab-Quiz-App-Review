"""raw/*.json (collect.py), raw_en/*.json (collect_en.py) → 사이트용 data/*.js 로 변환한다.
리뷰 작성자 이름·사진·개발사 답글은 버리고, 별점·본문·날짜·공감수만 남긴다.
사용법: python build_site.py <review-site 폴더>"""
import json, os, re, sys, datetime
from apps_meta import KR, EN

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, 'raw')
RAW_EN = os.path.join(HERE, 'raw_en')
SITE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'site')
os.makedirs(os.path.join(SITE, 'data', 'r'), exist_ok=True)

HANGUL = re.compile(r'[가-힣]')
LATIN = re.compile(r'[A-Za-z]{3}')

# (코드, 표시 이름, 한국어 정규식, 영어 정규식)
NEG = [
    ('pay',   '결제·구독·가격',   r'유료|결제|구독|환불|비싸|비싼|가격|과금|무료체험|요금|돈',
                                   r'subscri|paywall|\bpay(ing|ment)?\b|price|expensive|refund|charged|\bmoney\b|premium|free trial|\bcost'),
    ('ad',    '광고',            r'광고', r'\bads?\b|advert'),
    ('bug',   '오류·튕김·느림',   r'오류|버그|튕|멈춤|멈추|멈춰|렉|느려|느리|안 ?돼|안돼|먹통|로딩|꺼져|꺼짐|에러|작동|실행이 안|열리지|접속',
                                   r'\bbug|crash|glitch|freez|\blag|slow|doesn.?t (work|load)|not working|\berror|stuck|loading|broken|won.?t'),
    ('data',  '로그인·데이터 손실', r'로그인|사라|날아|동기화|백업|계정|초기화',
                                   r'log ?in|sign ?in|account|lost (my )?(progress|data)|progress (lost|gone)|\bsync|backup|reset'),
    ('wrong', '뜻·예문·오타 오류', r'오타|틀린|잘못|오답|뜻이 (이상|다르|틀)|번역이 (이상|잘못)|예문이 (없|이상|부족)|품사',
                                   r'typo|wrong (answer|translation|definition)|incorrect|mistake|inaccurate'),
    ('lack',  '단어·콘텐츠 부족',  r'단어가 (적|부족|없)|단어 수|콘텐츠가|내용이 (적|부족)|양이 (적|부족)|업데이트가 (안|없)',
                                   r'not enough|few words|limited|no (new )?(content|words)|need more'),
    ('voice', '음성·발음 인식',   r'음성|발음|인식|마이크|녹음',
                                   r'speech|pronunciation|microphone|voice recognition|\bmic\b'),
    ('lock',  '잠금화면·알림·배터리', r'잠금|알림|권한|배터리|알람|발열|팝업|데이터 (소모|사용량)',
                                   r'notification|battery|lock ?screen|permission|pop-?up'),
    ('repeat','반복·지루함',       r'반복|지루|똑같|같은 (문제|단어)|단조',
                                   r'repeat|same (word|question|thing)|boring|repetitive'),
    ('ui',    '화면·사용 불편',    r'불편|UI|디자인|화면|인터페이스|버튼|글씨',
                                   r'\bui\b|interface|design|layout|button|confusing|annoying|hard to use'),
    ('cs',    '고객센터·피드백',   r'고객센터|문의|답변|답장|피드백',
                                   r'customer (service|support)|support team|contact|no response'),
    ('wish',  '건의·바라는 점',    r'있었으면|있으면 좋겠|해주세요|해 주세요|추가해|개선|바랍니다|바라요',
                                   r'\bwish\b|please add|should (add|have)|would be (nice|great)|i hope|please fix|improve'),
]
POS = [
    ('effect','효과 있음(외워짐)', r'늘었|늘고|늘어|도움|효과|외워|외우|암기가|기억에|실력',
                                   r'helped|helps|helpful|effective|remember|memoriz|improved|improving|learned|learning a lot'),
    ('short', '간단·짧게·자투리', r'간단|쉽게|짧|부담|편해|편하|편리|간편|심플|10분|5분|자투리|틈틈|출퇴근|지하철',
                                   r'\beasy\b|simple|\bquick|short|minutes|convenient|bite'),
    ('review','복습·반복',        r'복습|망각|반복|까먹|잊', r'review|spaced|repetition|flashcard|forget'),
    ('fun',   '재미·게임 요소',   r'재미|게임|리그|캐릭터|랭킹|지루하지|동기부여', r'\bfun\b|game|enjoy|addict|motivat|streak|compet'),
    ('listen','발음·듣기',        r'발음|듣기|음성|리스닝', r'pronunciation|listening|audio|accent'),
    ('exam',  '시험·학원 연계',   r'토익|수능|시험|기출|공무원|편입|텝스|학원|숙제|수행', r'\bgre\b|toefl|\bsat\b|ielts|toeic|exam|\btest|school|class'),
    ('habit', '꾸준히·습관',      r'꾸준|매일|습관|루틴|연속', r'daily|habit|every day|consistent|streak'),
    ('free',  '무료·광고 적음',   r'무료|공짜|광고가 (없|적)|광고 없', r'\bfree\b|no ads|without ads|ad-free'),
    ('custom','나만의 단어장',    r'나만의|직접 (만|추가|입력)|단어장 (만|추가)|내 단어장', r'custom|own (words|cards|deck)|create (my|your)|add (my|your) own'),
    ('lockp', '잠금화면·알림',    r'잠금|알림|알람', r'widget|notification|reminder|lock ?screen'),
    ('wish',  '건의·바라는 점',   r'있었으면|있으면 좋겠|해주세요|해 주세요|추가해|개선|바랍니다|바라요',
                                   r'\bwish\b|please add|should (add|have)|would be (nice|great)|i hope|improve'),
]


def compile_sets(idx):
    return ([(c, re.compile(t[idx], re.I)) for t in NEG for c in [t[0]]],
            [(c, re.compile(t[idx], re.I)) for t in POS for c in [t[0]]])


RX = {'ko': compile_sets(2), 'en': compile_sets(3)}


def dl_num(s):
    m = re.match(r'([\d,\.]+)\s*(억|만|천)?\+?', s or '')
    if not m:
        return 0
    n = float(m.group(1).replace(',', ''))
    return int(n * {'억': 1e8, '만': 1e4, '천': 1e3}.get(m.group(2), 1))


def tags_of(lang, s, text):
    neg_rx, pos_rx = RX[lang]
    out = []
    if s <= 3:
        out += [c for c, rx in neg_rx if rx.search(text)]
    if s >= 3:
        out += ['+' + c for c, rx in pos_rx if rx.search(text)]
    return out


def clean(lang, raw_reviews):
    seen, revs = set(), []
    for r in raw_reviews:
        t = re.sub(r'\s+', ' ', r['t']).strip()
        if lang == 'ko':
            if len(t) < 10 or not HANGUL.search(t):
                continue
        else:
            if len(t) < 20 or HANGUL.search(t) or not LATIN.search(t):
                continue
        if t in seen:
            continue
        seen.add(t)
        ym = datetime.datetime.fromtimestamp(r['d']).strftime('%Y-%m') if r['d'] else ''
        revs.append([r['s'], t, ym, r['up'], ','.join(tags_of(lang, r['s'], t))])
    revs.sort(key=lambda x: -x[3])
    return revs


def summarize(revs):
    neg = [r for r in revs if r[0] <= 2]
    mid = [r for r in revs if r[0] == 3]
    pos = [r for r in revs if r[0] >= 4]

    def share(rs, plus):
        cnt = {}
        for r in rs:
            for t in r[4].split(','):
                if t and t.startswith('+') == plus:
                    cnt[t] = cnt.get(t, 0) + 1
        return sorted(([k, v, round(v * 100 / len(rs))] for k, v in cnt.items()), key=lambda x: -x[1])[:5] if rs else []
    return ({'neg': len(neg), 'mid': len(mid), 'pos': len(pos), 'total': len(revs)}, share(neg, False), share(pos, True))


def write_js(name, key, aid, revs):
    js = 'window.%s=window.%s||{};window.%s[%s]=%s;' % (
        key, key, key, json.dumps(aid), json.dumps(revs, ensure_ascii=False, separators=(',', ':')))
    open(os.path.join(SITE, 'data', 'r', name), 'w', encoding='utf-8').write(js)


RECENT_FROM = '2025-10'   # "최근 12개월" 기준(수집일 2026-10 기준)


def build_summary(aid, revs):
    """tools/summary/<앱id>.json (사람이 읽고 묶은 주장 목록) → 건수·최근 건수를 계산해 data/summary/<앱id>.js 로 내보낸다.
    idx 는 data/r/<앱id>.js 안의 리뷰 번호(공감 많은 순)라서, 다시 수집해 순서가 바뀌면 sourceFirst 검사에서 멈춘다."""
    p = os.path.join(HERE, 'summary', aid + '.json')
    if not os.path.exists(p):
        return None
    d = json.load(open(p, encoding='utf-8'))
    if not revs or not revs[0][1].startswith(d['sourceFirst']):
        raise SystemExit('요약의 리뷰 번호가 낡았습니다: ' + aid + ' (리뷰 순서가 바뀜). summary/*.json 을 다시 만들어야 합니다.')

    def enrich(item):
        idx = sorted(set(item['idx']))
        bad = [i for i in idx if i >= len(revs)]
        if bad:
            raise SystemExit('범위 밖 리뷰 번호 %s: %s' % (aid, bad))
        years = {}
        for i in idx:
            y = revs[i][2][:4]
            years[y] = years.get(y, 0) + 1
        out = dict(item)
        out['idx'] = idx
        out['n'] = len(idx)
        out['recent'] = sum(1 for i in idx if revs[i][2] >= RECENT_FROM)
        out['years'] = years
        return out

    out = {'total': len(revs), 'recentFrom': RECENT_FROM, 'oneLine': d['oneLine'], 'scopeNote': d['scopeNote'],
           'learn': d.get('learn', []), 'avoid': d.get('avoid', [])}
    for k in ('neg', 'pos', 'wish', 'facts', 'timeline'):
        out[k] = [enrich(x) for x in d.get(k, [])]
    for k in ('neg', 'pos', 'wish'):
        out[k].sort(key=lambda x: -x['n'])
    if d.get('exam'):
        out['exam'] = enrich(d['exam'])
    if d.get('handsOn'):
        out['handsOn'] = d['handsOn']   # 직접 써 본 결과(화면 캡처 목록 포함)는 그대로 내보낸다
    os.makedirs(os.path.join(SITE, 'data', 'summary'), exist_ok=True)
    js = 'window.SUM=window.SUM||{};window.SUM[%s]=%s;' % (json.dumps(aid), json.dumps(out, ensure_ascii=False, separators=(',', ':')))
    open(os.path.join(SITE, 'data', 'summary', aid + '.js'), 'w', encoding='utf-8').write(js)
    return {'neg': [out['neg'][0]['title'], out['neg'][0]['n']], 'pos': [out['pos'][0]['title'], out['pos'][0]['n']]}


def build(group, rows):
    apps = []
    for aid, name, dev, kind in rows:
        p = os.path.join(RAW, aid + '.json')
        if not os.path.exists(p):
            continue
        d = json.load(open(p, encoding='utf-8'))
        ko = clean('ko', d['reviews'])
        n, nt, pt = summarize(ko)
        sm = build_summary(aid, ko)
        write_js(aid + '.js', 'RV', aid, ko)
        app = {'id': aid, 'name': name, 'dev': dev, 'kind': kind, 'group': group,
               'dl': d['meta']['dl'], 'dlNum': dl_num(d['meta']['dl']),
               'score': d['meta']['score'], 'reviewCount': d['meta']['reviewCount'],
               'n': n, 'negTags': nt, 'posTags': pt, 'en': None,
               'summary': bool(sm), 'sumTop': sm}
        pe = os.path.join(RAW_EN, aid + '.json')
        if os.path.exists(pe):
            en = clean('en', json.load(open(pe, encoding='utf-8'))['reviews'])
            if len(en) >= 5:
                en_n, ent, ept = summarize(en)
                write_js(aid + '.en.js', 'RVE', aid, en)
                app['en'] = {'n': en_n, 'negTags': ent, 'posTags': ept}
        app['lang'] = 'ko' if (n['total'] >= 30 or not app['en']) else 'en'
        apps.append(app)
    apps.sort(key=lambda a: -a['dlNum'])
    for i, a in enumerate(apps, 1):
        a['rank'] = i
    return apps


kr, en = build('kr', KR), build('en', EN)
meta = {
    'collected': datetime.date.today().isoformat(),
    'tags': {'neg': [{'c': t[0], 'l': t[1]} for t in NEG], 'pos': [{'c': '+' + t[0], 'l': t[1]} for t in POS]},
    'kr': kr, 'en': en,
}
open(os.path.join(SITE, 'data', 'apps.js'), 'w', encoding='utf-8').write(
    'window.SITE_DATA=' + json.dumps(meta, ensure_ascii=False, separators=(',', ':')) + ';')
tot = sum(a['n']['total'] + (a['en']['n']['total'] if a['en'] else 0) for a in kr + en)
print('apps kr', len(kr), 'en', len(en), 'reviews', tot)
for a in kr + en:
    k = a['n']['total'] if a['lang'] == 'ko' else a['en']['n']['total']
    if k < 15:
        print('few:', a['name'], a['lang'], k)
