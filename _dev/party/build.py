# 파티 게임 만들기: python3 _dev/party/build.py <허브폴더>
#  _dev/party/kit_template.html(공통 뼈대) + _dev/party/<게임>.js(게임 규칙) → games/<게임id>/index.html
#  <게임>.js 맨 위 주석 블록 /*META {...} META*/ 에 tool·title·emoji·min·sub·rules·ui·css·cssvars 를 적어요.
import json, os, re, sys

root = sys.argv[1] if len(sys.argv) > 1 else '.'
here = os.path.join(root, '_dev', 'party')
tpl = open(os.path.join(here, 'kit_template.html'), encoding='utf-8').read()
for fn in sorted(os.listdir(here)):
    if not fn.endswith('.js'):
        continue
    src = open(os.path.join(here, fn), encoding='utf-8').read()
    m = re.search(r'/\*META(.*?)META\*/', src, re.S)
    meta = json.loads(m.group(1))
    game = src[m.end():].strip()
    cfg = {k: meta[k] for k in ('tool', 'title', 'emoji', 'min', 'max', 'sub', 'rules', 'ui') if k in meta}
    out = (tpl.replace('{{TITLE}}', meta['title'])
              .replace('{{CSSVARS}}', meta['cssvars'])
              .replace('{{EXTRACSS}}', meta.get('css', ''))
              .replace('{{CFG}}', json.dumps(cfg, ensure_ascii=False))
              .replace('{{GAME}}', game))
    d = os.path.join(root, 'games', meta['tool'])
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(out)
    print('built', meta['tool'], len(out))
