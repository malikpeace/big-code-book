#!/usr/bin/env python3
# Merge glossary-additions/*.json into glossary.json, then delete the additions.
import json, glob, os
g = json.load(open('glossary.json'))
for f in sorted(glob.glob('glossary-additions/*.json')):
    add = json.load(open(f))
    for slug, entry in add.items():
        if slug not in g:
            g[slug] = {'term': entry['term'], 'levels': []}
        have = {l['ch'] for l in g[slug]['levels']}
        for l in entry['levels']:
            if l['ch'] not in have:
                g[slug]['levels'].append(l); have.add(l['ch'])
        g[slug]['levels'].sort(key=lambda l: l['ch'])
    os.remove(f); print('merged', f)
json.dump(g, open('glossary.json', 'w'), indent=2, ensure_ascii=False)
print(len(g), 'terms')
