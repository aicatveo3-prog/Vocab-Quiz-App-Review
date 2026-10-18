"""한국어 리뷰가 적은 해외 앱만 영어 리뷰(hl=en, gl=US)를 추가로 모은다 → raw_en/"""
import json, os, re
from concurrent.futures import ThreadPoolExecutor
import collect
from apps_meta import EN
H = re.compile(r'[가-힣]')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'raw_en')
os.makedirs(OUT, exist_ok=True)

def need(aid):
    d = json.load(open(os.path.join(collect.OUT, aid + '.json'), encoding='utf-8'))
    return sum(1 for r in d['reviews'] if H.search(r['t'])) < 60

def work(aid):
    p = os.path.join(OUT, aid + '.json')
    if os.path.exists(p):
        return aid, 'skip'
    revs = []
    for sc, w in collect.QUOTA:
        try:
            revs += collect.pull(aid, sc, w, 'en', 'US')
        except Exception as e:
            print('ERR', aid, sc, repr(e), flush=True)
    json.dump({'reviews': revs}, open(p, 'w', encoding='utf-8'), ensure_ascii=False)
    return aid, len(revs)

if __name__ == '__main__':
    ids = [a[0] for a in EN if need(a[0])]
    print(len(ids), 'apps', flush=True)
    with ThreadPoolExecutor(4) as ex:
        for aid, n in ex.map(work, ids):
            print(aid, n, flush=True)
    print('DONE')
