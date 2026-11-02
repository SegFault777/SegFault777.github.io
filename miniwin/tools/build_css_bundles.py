#!/usr/bin/env python3
"""Build one stylesheet per MiniWin look (css/bundles/<look>.css).

Why: css/main.css @imports 54 files (~380 KB) on every visit, one after another, whatever look is
chosen. Most of that is other looks' rules. Each look needs only the rules that can match its body
classes, so this script splits the rules by the theme class their selectors require:

  * a selector whose positive class names (outside :not()) include no look class is "shared" and
    goes into every bundle;
  * a selector that requires a look class goes into the bundle of every look whose class set
    intersects it (a superset is always safe; excluding a rule is safe only when none of its
    required classes can be present in that look).

Rules keep their original order inside each bundle, so the cascade is unchanged. @media blocks are
split recursively; @keyframes / @font-face and other at-rules are kept in every bundle.
Run:  python3 tools/build_css_bundles.py   (from the miniwin/ folder). Re-run after editing css/*.css
and check the result with the pixel comparison in tools/test/bundles_compare.js.
"""
import os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)                      # miniwin/
CSS = os.path.join(ROOT, 'css')
OUT = os.path.join(CSS, 'bundles')

# The import order of main.css -- the cascade order. Do not reorder.
MAIN = open(os.path.join(CSS, 'main.css'), encoding='utf-8').read()
ORDER = re.findall(r'@import url\("([^"?]+)', MAIN)

# look -> the body classes that identify it (class names without the dot)
LOOKS = {
    'retro': set(), 'modern': set(),
    'luna': {'luna-mode'}, 'aqua': {'aqua-mode'}, 'system6': {'system6-mode'}, 'nextstep': {'nextstep-mode'},
    'os2': {'os2-mode'}, 'beos': {'beos-mode'},
    'platinum-lavender': {'platinum-mode'},
    'platinum-lime': {'platinum-mode', 'platinum-lime'},
    'platinum-magenta': {'platinum-mode', 'platinum-magenta'},
    'modern-aqua': {'modern-aqua-mode'}, 'modern-aqua-yosemite': {'modern-aqua-yosemite-mode'},
    'material': {'material-mode'}, 'plastik': {'plastik-mode'}, 'modern-glass': {'modern-glass-mode'},
    'aero': {'aero-mode'}, 'breeze': {'breeze-mode'}, 'flat': {'flat-mode'}, 'adwaita': {'adwaita-mode'},
    'mica': {'mica-mode'}, 'oxygen': {'oxygen-mode'}, 'sequoia': {'sequoia-mode'}, 'liquid': {'liquid-mode'},
}
THEME_CLASSES = set().union(*LOOKS.values())


def strip_comments(s):
    """Remove /* */ comments, leaving strings alone."""
    out, i, n = [], 0, len(s)
    while i < n:
        c = s[i]
        if c in '"\'':
            j = i + 1
            while j < n and s[j] != c:
                j += 2 if s[j] == '\\' else 1
            out.append(s[i:j + 1]); i = j + 1
        elif s.startswith('/*', i):
            j = s.find('*/', i + 2)
            i = n if j < 0 else j + 2
        else:
            out.append(c); i += 1
    return ''.join(out)


def split_top(s):
    """Parse a stylesheet into nodes: ('rule', selector, body) | ('block', prelude, [nodes]) | ('raw', text)."""
    nodes, i, n = [], 0, len(s)
    while i < n:
        # skip whitespace
        while i < n and s[i].isspace():
            i += 1
        if i >= n:
            break
        start = i
        depth_str = None
        # read prelude up to '{' or ';' at this level
        while i < n and s[i] not in '{;':
            if s[i] in '"\'':
                q = s[i]; i += 1
                while i < n and s[i] != q:
                    i += 2 if s[i] == '\\' else 1
            i += 1
        if i >= n:
            nodes.append(('raw', s[start:].strip())); break
        prelude = s[start:i].strip()
        if s[i] == ';':
            nodes.append(('raw', prelude + ';')); i += 1; continue
        # block: find matching '}'
        j, depth = i, 0
        while j < n:
            c = s[j]
            if c in '"\'':
                q = c; j += 1
                while j < n and s[j] != q:
                    j += 2 if s[j] == '\\' else 1
            elif c == '{':
                depth += 1
            elif c == '}':
                depth -= 1
                if depth == 0:
                    break
            j += 1
        body = s[i + 1:j]
        i = j + 1
        if prelude.startswith('@media') or prelude.startswith('@supports'):
            nodes.append(('block', prelude, split_top(body)))
        elif prelude.startswith('@'):
            nodes.append(('raw', prelude + '{' + body + '}'))
        else:
            nodes.append(('rule', prelude, body))
    return nodes


NOT_RE = re.compile(r':not\((?:[^()]|\([^()]*\))*\)')
CLASS_RE = re.compile(r'\.([A-Za-z_][\w-]*)')


def selector_look_classes(sel):
    """Positive look classes a single selector requires (':not(.x)' does not count)."""
    prev = None
    while prev != sel:
        prev, sel = sel, NOT_RE.sub('', sel)
    return {c for c in CLASS_RE.findall(sel) if c in THEME_CLASSES}


def split_selectors(prelude):
    parts, depth, cur = [], 0, ''
    for c in prelude:
        if c == '(':
            depth += 1
        elif c == ')':
            depth -= 1
        if c == ',' and depth == 0:
            parts.append(cur.strip()); cur = ''
        else:
            cur += c
    if cur.strip():
        parts.append(cur.strip())
    return parts


def rule_needs(prelude):
    """None = shared (matches every look); otherwise the set of look classes the rule can match under."""
    needs = set()
    for sel in split_selectors(prelude):
        k = selector_look_classes(sel)
        if not k:
            return None
        needs |= k
    return needs


def keep_for(look, needs):
    if needs is None:
        return True
    return bool(needs & LOOKS[look])


def filter_nodes(nodes, look):
    out = []
    for node in nodes:
        if node[0] == 'raw':
            out.append(node[1])
        elif node[0] == 'rule':
            if keep_for(look, rule_needs(node[1])):
                out.append(node[1] + '{' + node[2] + '}')
        elif node[0] == 'block':
            inner = filter_nodes(node[2], look)
            if inner:
                out.append(node[1] + '{' + ''.join(inner) + '}')
    return out


def minify(css):
    """Collapse whitespace outside strings and drop the spaces around { } ; , (safe in CSS)."""
    out, i, n = [], 0, len(css)
    pending_space = False
    while i < n:
        c = css[i]
        if c in '"\'':
            j = i + 1
            while j < n and css[j] != c:
                j += 2 if css[j] == '\\' else 1
            if pending_space and out and out[-1] not in '{};,':
                out.append(' ')
            pending_space = False
            out.append(css[i:j + 1]); i = j + 1
            continue
        if c.isspace():
            pending_space = True; i += 1; continue
        if pending_space and out and out[-1] not in '{};,(' and c not in '{};,)':
            out.append(' ')
        pending_space = False
        out.append(c); i += 1
    s = ''.join(out)
    s = re.sub(r';}', '}', s)
    return s


URL_RE = re.compile(r'url\(\s*(["\']?)(?!data:|https?:|//|/|#)([^"\')]+?)\1\s*\)')

def rebase_urls(css):
    """Files in css/ use paths relative to css/; the bundles live one folder down, in css/bundles/."""
    return URL_RE.sub(lambda m: 'url(' + m.group(1) + '../' + m.group(2) + m.group(1) + ')', css)

def build(look):
    nodes = []
    for f in ORDER:
        path = os.path.join(CSS, f)
        nodes += split_top(strip_comments(open(path, encoding='utf-8').read()))
    return rebase_urls(minify(''.join(filter_nodes(nodes, look))))


def main():
    os.makedirs(OUT, exist_ok=True)
    total = 0
    for look in LOOKS:
        text = build(look)
        if text.count('{') != text.count('}'):
            sys.exit('unbalanced braces in ' + look)
        with open(os.path.join(OUT, look + '.css'), 'w', encoding='utf-8') as fh:
            fh.write('/* MiniWin look: ' + look + ' -- generated by tools/build_css_bundles.py, do not edit */\n' + text)
        total += len(text.encode())
        print(f'{look:22s} {len(text.encode()):7d} bytes')
    print('total', total)


if __name__ == '__main__':
    main()
