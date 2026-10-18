import json, os, re, sys, time, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor
from apps_meta import KR, EN

OUT = os.path.join(os.path.dirname(__file__), 'raw')
os.makedirs(OUT, exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
      'Accept-Language': 'ko-KR,ko;q=0.9'}
QUOTA = [(1, 100), (2, 50), (3, 30), (4, 60), (5, 100)]


def post(app, score, num, token, hl='ko', gl='KR'):
    inner = json.dumps([None, None, [2, 1, [num, None, token], None, [None, score]], [app, 7]], separators=(',', ':'))
    body = 'f.req=' + urllib.parse.quote(json.dumps([[["UsvDTd", inner, None, "generic"]]], separators=(',', ':')))
    req = urllib.request.Request(
        'https://play.google.com/_/PlayStoreUi/data/batchexecute?rpcids=UsvDTd&source-path=/store/apps/details&hl=%s&gl=%s' % (hl, gl),
        data=body.encode(), headers={**UA, 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'})
    for i in range(3):
        try:
            t = urllib.request.urlopen(req, timeout=40).read().decode()
            line = [l for l in t.split('\n') if l.startswith('[[')][0]
            return json.loads(json.loads(line)[0][2])
        except Exception:
            time.sleep(2 + i * 2)
    return None


def pull(app, score, want, hl='ko', gl='KR'):
    out, token = [], None
    while len(out) < want:
        arr = post(app, score, min(100, want - len(out)), token, hl, gl)
        if not arr or not arr[0]:
            break
        for r in arr[0]:
            out.append({'s': r[2], 't': r[4] or '', 'd': (r[5] or [0])[0], 'up': r[6] or 0})
        token = arr[1][1] if (len(arr) > 1 and arr[1] and len(arr[1]) > 1) else None
        if not token:
            break
        time.sleep(0.3)
    return out


def meta(app):
    req = urllib.request.Request(f'https://play.google.com/store/apps/details?id={app}&hl=ko&gl=KR', headers=UA)
    h = urllib.request.urlopen(req, timeout=40).read().decode()
    dl = re.search(r'class="ClM7O">([^<]*\+)</div><div class="g1rdde">다운로드', h)
    sc = re.search(r'별표 5개 만점에 ([\d.]+)', h)
    plain = re.sub(r'<[^>]*>', ' ', h)
    rv = re.search(r'리뷰\s*([\d.,]+[만천억]?)개', plain)
    return {'dl': dl.group(1) if dl else '', 'score': sc.group(1) if sc else '', 'reviewCount': rv.group(1) if rv else ''}


def work(app):
    path = os.path.join(OUT, app + '.json')
    if os.path.exists(path):
        return app, 'skip'
    try:
        m = meta(app)
    except Exception as e:
        m = {'dl': '', 'score': '', 'reviewCount': ''}
    revs = []
    for sc, w in QUOTA:
        try:
            revs += pull(app, sc, w)
        except Exception as e:
            print('ERR', app, sc, repr(e), flush=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump({'meta': m, 'reviews': revs}, f, ensure_ascii=False)
    return app, len(revs)


if __name__ == '__main__':
    ids = [a[0] for a in EN + KR]
    with ThreadPoolExecutor(4) as ex:
        for app, n in ex.map(work, ids):
            print(app, n, flush=True)
    print('DONE')
