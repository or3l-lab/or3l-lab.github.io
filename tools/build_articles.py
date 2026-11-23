#!/usr/bin/env python3
"""Génère la section « Articles » du site (aucune dépendance, Python 3.8+).

Usage, depuis la racine du dépôt :
    python tools/build_articles.py            # génère les pages
    python tools/build_articles.py --check    # vérifie les articles sans rien écrire

Sources : content/articles/<dossier>/fr.md et en.md (voir content/articles/LISEZ-MOI.md).
Sorties : articles.html, en/articles.html, articles/*.html, en/articles/*.html,
          bandeau d'accueil (entre <!-- articles:start --> et <!-- articles:end -->)
          et bloc du plan du site (sitemap.xml).
"""
import argparse
import datetime
import html as htmllib
import json
import math
import posixpath
import re
import sys
import unicodedata
import urllib.parse
from pathlib import Path

import article_figures

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / 'content' / 'articles'
SITE = 'https://or3l-lab.github.io'
LINKEDIN = 'https://www.linkedin.com/in/aurelien-ramirez-58a476104/'
GEN_MARK = '<!-- Page générée par tools/build_articles.py à partir de content/articles : ne pas modifier à la main. -->'
M_START, M_END = '<!-- articles:start -->', '<!-- articles:end -->'
TOOLBAR_MIN = 4      # filtres et recherche à partir de ce nombre d'articles
FEATURE_MIN = 3      # carte « dernier article » en tête de la page Articles à partir de ce nombre
WORDS_PER_MIN = 200

MONTHS = {
    'fr': ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
    'en': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
}

L = {
    'fr': {
        'locale': 'fr_FR', 'index': 'articles.html', 'dir': 'articles', 'home': 'index.html', 'cv': 'cv.html',
        'skip': 'Aller au contenu', 'brand_label': 'Or3L — accueil', 'brand_sub': 'Informatique industrielle · IA',
        'nav_label': 'Navigation principale', 'menu': 'Menu',
        'nav': [('Parcours', 'parcours.html'), ('Compétences', 'competences.html'), ('Projets', 'projets.html'),
                ('Articles', 'articles.html'), ('Contact', 'index.html#contact')],
        'other': ('EN', 'en', 'English version'), 'motion': ('oui', 'non'),
        'back_top': 'Retour à la navigation', 'back_top_short': 'Navigation',
        'breadcrumb': "Fil d'Ariane", 'home_label': 'Accueil', 'articles': 'Articles', 'article': 'Article',
        'idx_title': 'Articles — Or3L',
        'idx_desc': "Mes articles, réflexions, idées et retours sur projets.",
        'idx_lede': "Mes articles, mes réflexions, mes idées et mes retours sur projets.",
        'back_home': "← Retour à l'accueil",
        'fig_head': "De l'idée à l'article", 'fig_small': 'format long',
        'plates': [('01 · Idée', 'Le point de départ'), ('02 · Réflexion', 'Contexte, méthode'), ('03 · Article', 'Structuré, avec sommaire')],
        'latest': 'Dernier article', 'contents': 'Sommaire', 'all_articles': 'Tous les articles',
        'filter_label': 'Filtrer par thème', 'all': 'Tous', 'search': 'Rechercher un article', 'search_ph': 'Rechercher…',
        'one': 'article', 'many': 'articles', 'none': "Aucun article ne correspond à ces critères.",
        'soon_title': 'Les premiers articles arrivent bientôt.',
        'soon_text': "Cette rubrique accueillera mes articles, mes réflexions et mes retours sur projets.",
        'follow': 'Les projets sont présentés en détail dans la rubrique Projets.', 'follow_link': 'Voir les projets',
        'min': 'min de lecture', 'sections': 'sections',
        'published': 'Publié', 'reading': 'Lecture', 'format': 'Type', 'format_art': 'Article',
        'intro': 'Introduction',
        'share': 'Partager sur LinkedIn', 'related': 'Voir aussi', 'updated': 'Mis à jour le',
        'prev': '← Article précédent', 'next': 'Article suivant →', 'nav_articles': 'Articles',
        'teaser_title': 'Le détail derrière chaque idée.', 'teaser_all': 'Tous les articles', 'teaser_open': "Lire l'article",
        'img_alt_default': 'Or3L — Articles',
    },
    'en': {
        'locale': 'en_GB', 'index': 'en/articles.html', 'dir': 'en/articles', 'home': 'en/index.html', 'cv': 'en/cv.html',
        'skip': 'Skip to content', 'brand_label': 'Or3L — home', 'brand_sub': 'Industrial IT · AI',
        'nav_label': 'Main navigation', 'menu': 'Menu',
        'nav': [('Journey', 'en/journey.html'), ('Skills', 'en/skills.html'), ('Projects', 'en/projects.html'),
                ('Articles', 'en/articles.html'), ('Contact', 'en/index.html#contact')],
        'other': ('FR', 'fr', 'Version française'), 'motion': ('on', 'off'),
        'back_top': 'Back to navigation', 'back_top_short': 'Navigation',
        'breadcrumb': 'Breadcrumb', 'home_label': 'Home', 'articles': 'Articles', 'article': 'Article',
        'idx_title': 'Articles — Or3L',
        'idx_desc': 'My articles, reflections, ideas and project write-ups.',
        'idx_lede': 'My articles, my reflections, my ideas and my project write-ups.',
        'back_home': '← Back to home',
        'fig_head': 'From idea to article', 'fig_small': 'long form',
        'plates': [('01 · Idea', 'The starting point'), ('02 · Thinking', 'Context, method'), ('03 · Article', 'Structured, with contents')],
        'latest': 'Latest article', 'contents': 'Contents', 'all_articles': 'All articles',
        'filter_label': 'Filter by topic', 'all': 'All', 'search': 'Search articles', 'search_ph': 'Search…',
        'one': 'article', 'many': 'articles', 'none': 'No article matches these criteria.',
        'soon_title': 'The first articles are coming soon.',
        'soon_text': 'This section will gather my articles, reflections and project write-ups.',
        'follow': 'The projects are presented in detail in the Projects section.', 'follow_link': 'See the projects',
        'min': 'min read', 'sections': 'sections',
        'published': 'Published', 'reading': 'Reading', 'format': 'Type', 'format_art': 'Article',
        'intro': 'Introduction',
        'share': 'Share on LinkedIn', 'related': 'See also', 'updated': 'Updated on',
        'prev': '← Previous article', 'next': 'Next article →', 'nav_articles': 'Articles',
        'teaser_title': 'The detail behind every idea.', 'teaser_all': 'All articles', 'teaser_open': 'Read the article',
        'img_alt_default': 'Or3L — Articles',
    },
}

TAG_DOTS = ['tag-ia', 'tag-data', 'tag-auto', 'tag-pilot', 'tag-lean', 'tag-full']
KEY_RE = re.compile(r'^([A-Za-z_][\w-]*)\s*:\s*(.*)$')


class BuildError(Exception):
    pass


# ---------------------------------------------------------------- utilitaires
def esc(s):
    return htmllib.escape(str(s), quote=True)


def norm(s):
    s = unicodedata.normalize('NFD', str(s).lower())
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn')


def slugify(s):
    s = re.sub(r'[^a-z0-9]+', '-', norm(s)).strip('-')
    return s or 'section'


def rel(src, dst):
    """Chemin relatif entre deux pages du site (chemins depuis la racine, avec « / »)."""
    frag = ''
    if '#' in dst:
        dst, frag = dst.split('#', 1)
        frag = '#' + frag
    sdirs = src.split('/')[:-1]
    dparts = (dst or 'index.html').split('/')
    i = 0
    while i < len(sdirs) and i < len(dparts) - 1 and sdirs[i] == dparts[i]:
        i += 1
    return '../' * (len(sdirs) - i) + '/'.join(dparts[i:]) + frag


def fmt_date(d, lang):
    if lang == 'fr':
        return ('1er' if d.day == 1 else str(d.day)) + ' ' + MONTHS['fr'][d.month - 1] + ' ' + str(d.year)
    return str(d.day) + ' ' + MONTHS['en'][d.month - 1] + ' ' + str(d.year)


def tag_class(tag):
    return TAG_DOTS[sum(ord(c) for c in norm(tag)) % len(TAG_DOTS)]


def to_crlf(text):
    return text.replace('\r\n', '\n').replace('\n', '\r\n')


def write_if_changed(path, text, written):
    data = to_crlf(text).encode('utf-8')
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists() or path.read_bytes() != data:
        path.write_bytes(data)
    written.append(path)


# ------------------------------------------------------------------ lecture
class Article:
    def __init__(self, key, lang, path):
        self.key, self.lang, self.path = key, lang, path
        self.title = self.summary = self.kind = self.image = ''
        self.date = self.updated = None
        self.tags, self.related, self.sections, self.figs = [], [], [], []
        self.draft = False
        self.slug = slugify(key)
        self.body = ''
        self.minutes = 1

    @property
    def out(self):
        return '%s/%s.html' % (L[self.lang]['dir'], self.slug)


def parse_front(text, path):
    text = text.replace('\r\n', '\n').lstrip('\ufeff')
    m = re.match(r'^---[ \t]*\n(.*?)\n---[ \t]*(?:\n|$)(.*)$', text, re.S)
    if not m:
        raise BuildError("%s : l'en-tête « --- » est manquant en tête de fichier." % path)
    meta = {}
    for n, line in enumerate(m.group(1).split('\n'), 2):
        if not line.strip() or line.lstrip().startswith('#'):
            continue
        k = KEY_RE.match(line)
        if not k:
            raise BuildError("%s, ligne %d : « %s » n'est pas de la forme clé: valeur." % (path, n, line.strip()))
        key, val = k.group(1).lower(), k.group(2).strip()
        if len(val) > 1 and val[0] == val[-1] and val[0] in '"\'':
            val = val[1:-1]
        if key == 'related':
            meta.setdefault('related', []).append(val)
        else:
            meta[key] = val
    return meta, m.group(2)


def load_article(key, lang, path):
    meta, body = parse_front(path.read_text(encoding='utf-8'), path)
    a = Article(key, lang, path)
    errors = []
    a.title = meta.get('title', '')
    a.summary = meta.get('summary', '')
    for need in ('title', 'summary', 'date'):
        if not meta.get(need):
            errors.append('%s : le champ « %s » est obligatoire.' % (path, need))
    for fld in ('date', 'updated'):
        if meta.get(fld):
            try:
                setattr(a, fld, datetime.date.fromisoformat(meta[fld]))
            except ValueError:
                errors.append('%s : « %s » doit être une date AAAA-MM-JJ (reçu : %s).' % (path, fld, meta[fld]))
    a.tags = [t.strip() for t in meta.get('tags', '').split(',') if t.strip()]
    a.kind = meta.get('type', '')
    a.image = meta.get('image', '').lstrip('/')
    a.draft = meta.get('draft', '').lower() in ('true', 'oui', 'yes', '1')
    if meta.get('slug'):
        a.slug = slugify(meta['slug'])
    for item in meta.get('related', []):
        target, _, label = item.partition('|')
        target, label = target.strip().lstrip('/'), label.strip()
        if not target or not label:
            errors.append('%s : « related » doit être de la forme « chemin/page.html | Libellé » (reçu : %s).' % (path, item))
        elif not (ROOT / target.split('#')[0]).exists():
            errors.append("%s : la page liée « %s » n'existe pas." % (path, target))
        else:
            a.related.append((target, label))
    if a.image and not (ROOT / a.image).exists():
        errors.append("%s : l'image « %s » est introuvable." % (path, a.image))
    a.body = body
    if errors:
        raise BuildError('\n'.join(errors))
    return a


# ----------------------------------------------------------------- Markdown
class Md:
    """Sous-ensemble de Markdown, rendu avec les classes du site."""

    def __init__(self, page, label, lang='fr'):
        self.page, self.label, self.lang, self.figs = page, label, lang, []

    def url(self, href):
        """« /chemin » est relatif à la racine du site ; les adresses du site deviennent relatives."""
        href = href.strip()
        if href.startswith(SITE + '/'):
            href = '/' + href[len(SITE) + 1:]
        if href.startswith('/') and not href.startswith('//'):
            return rel(self.page, href.lstrip('/') or 'index.html'), False
        return href, bool(re.match(r'^https?://', href))

    def inline(self, text):
        stash = []

        def keep(markup):
            stash.append(markup)
            return '\x00%d\x00' % (len(stash) - 1)

        text = re.sub(r'`([^`]+)`', lambda m: keep('<code>%s</code>' % esc(m.group(1))), text)
        text = esc(text)

        def link(m):
            href, external = self.url(htmllib.unescape(m.group(2)))
            attrs = ' rel="noopener" target="_blank"' if external else ''
            return keep('<a href="%s"%s>%s</a>' % (esc(href), attrs, self.emphasis(m.group(1))))

        text = re.sub(r'\[([^\]]+)\]\(([^)\s]+)\)', link, text)

        def bare(m):
            url, tail = m.group(0), ''
            while url and url[-1] in '.,;:!?':
                tail, url = url[-1] + tail, url[:-1]
            return keep('<a href="%s" rel="noopener" target="_blank">%s</a>' % (url, url)) + tail

        text = re.sub(r'(?<![\w"\'=>/])https?://[^\s<\x00]+', bare, text)
        text = self.emphasis(text)
        while '\x00' in text:
            text = re.sub(r'\x00(\d+)\x00', lambda m: stash[int(m.group(1))], text)
        return text

    @staticmethod
    def emphasis(text):
        text = re.sub(r'\*\*(?=\S)(.+?)(?<=\S)\*\*', r'<strong>\1</strong>', text)
        return re.sub(r'(?<![*\w])\*(?=[^\s*])(.+?)(?<=[^\s*])\*(?![*\w])', r'<em>\1</em>', text)

    def blocks(self, lines, start):
        out, i, n = [], 0, len(lines)

        def is_special(ln):
            s = ln.strip()
            return (s.startswith(('```', '>', '### ', '|', '![', ':::')) or re.match(r'^([-*]|\d+\.)\s+', s)
                    or re.match(r'^(---+|\*\*\*+)$', s))

        while i < n:
            s = lines[i].strip()
            if not s:
                i += 1
            elif s.startswith('```'):
                j, buf = i + 1, []
                while j < n and not lines[j].strip().startswith('```'):
                    buf.append(lines[j])
                    j += 1
                if j >= n:
                    raise BuildError('%s, ligne %d : bloc de code « ``` » non refermé.' % (self.label, start + i + 1))
                out.append('<pre><code>%s</code></pre>' % esc('\n'.join(buf)))
                i = j + 1
            elif re.match(r'^(---+|\*\*\*+)$', s):
                out.append('<hr>')
                i += 1
            elif s.startswith('### '):
                out.append('<h3>%s</h3>' % self.inline(s[4:].strip()))
                i += 1
            elif re.match(r'^(#|#{4,})\s', s):
                raise BuildError("%s, ligne %d : utilisez « ## » pour un titre de section et « ### » pour un sous-titre "
                                 "(le titre de l'article vient de l'en-tête)." % (self.label, start + i + 1))
            elif s.startswith('>'):
                buf = []
                while i < n and lines[i].strip().startswith('>'):
                    buf.append(re.sub(r'^\s*>\s?', '', lines[i]))
                    i += 1
                paras = [p for p in '\n'.join(buf).split('\n\n') if p.strip()]
                out.append('<blockquote class="art-callout">%s</blockquote>'
                           % ''.join('<p>%s</p>' % self.inline(' '.join(p.split('\n')).strip()) for p in paras))
            elif s.startswith('|') and i + 1 < n and re.match(r'^\s*\|?\s*:?-{2,}', lines[i + 1]):
                rows = []
                while i < n and lines[i].strip().startswith('|'):
                    rows.append([c.strip() for c in lines[i].strip().strip('|').split('|')])
                    i += 1
                th = ''.join('<th scope="col">%s</th>' % self.inline(c) for c in rows[0])
                tr = ''.join('<tr>%s</tr>' % ''.join('<td>%s</td>' % self.inline(c) for c in r) for r in rows[2:])
                out.append('<div class="art-table"><table><thead><tr>%s</tr></thead><tbody>%s</tbody></table></div>' % (th, tr))
            elif s.startswith('!['):
                m = re.match(r'^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$', s)
                if not m:
                    raise BuildError('%s, ligne %d : image mal formée (attendu : ![texte alternatif](/chemin/image.png "légende")).'
                                     % (self.label, start + i + 1))
                src, _ = self.url(m.group(2))
                cap = '<figcaption>%s</figcaption>' % self.inline(m.group(3)) if m.group(3) else ''
                out.append('<figure class="art-figure"><img src="%s" alt="%s" loading="lazy" decoding="async">%s</figure>'
                           % (esc(src), esc(m.group(1)), cap))
                i += 1
            elif s.startswith(':::'):
                m = re.match(r'^:::figure\s+([a-z][\w-]*)(?:\s+"([^"]*)")?$', s)
                if not m:
                    raise BuildError('%s, ligne %d : figure mal formée (attendu : :::figure nom "légende").'
                                     % (self.label, start + i + 1))
                if m.group(1) not in article_figures.REGISTRY:
                    raise BuildError('%s, ligne %d : figure « %s » inconnue (disponibles : %s).' % (
                        self.label, start + i + 1, m.group(1), ', '.join(sorted(article_figures.REGISTRY))))
                self.figs.append(m.group(1))
                out.append(article_figures.figure_html(m.group(1), self.lang, self.inline(m.group(2)) if m.group(2) else ''))
                i += 1
            elif re.match(r'^([-*]|\d+\.)\s+', s):
                tag = 'ol' if re.match(r'^\d+\.', s) else 'ul'
                items = []
                while i < n and lines[i].strip():
                    cur = lines[i]
                    m = re.match(r'^\s{0,3}([-*]|\d+\.)\s+(.*)$', cur)
                    if m:
                        items.append(m.group(2).strip())
                    elif cur.startswith((' ', '\t')) and items:
                        items[-1] += ' ' + cur.strip()
                    else:
                        break
                    i += 1
                out.append('<%s>%s</%s>' % (tag, ''.join('<li>%s</li>' % self.inline(t) for t in items), tag))
            else:
                buf = []
                while i < n and lines[i].strip() and (not buf or not is_special(lines[i])):
                    buf.append(lines[i].rstrip('\n'))
                    i += 1
                parts = []
                for k, ln in enumerate(buf):
                    brk = (ln.endswith('  ') or ln.endswith('\\')) and k < len(buf) - 1
                    parts.append(self.inline(ln.strip().rstrip('\\').strip()) + ('<br>' if brk else ''))
                out.append('<p>%s</p>' % ' '.join(parts))
        return out


def render_body(a):
    """Découpe le corps en sections (« ## ») : [(id, titre HTML, titre texte, [fragments HTML])]."""
    label = str(a.path.relative_to(ROOT)).replace('\\', '/')
    md = Md(a.out, label, a.lang)
    chunks, cur, in_code, title, cur_start = [], [], False, None, 0
    for idx, ln in enumerate(a.body.replace('\r\n', '\n').split('\n')):
        if ln.strip().startswith('```'):
            in_code = not in_code
        if not in_code and ln.startswith('## '):
            chunks.append((title, cur, cur_start))
            title, cur, cur_start = ln[3:].strip(), [], idx + 1
        else:
            cur.append(ln)
    chunks.append((title, cur, cur_start))
    sections, used = [], {'contenu', 'top', 'menu'}
    for title, chunk, start in chunks:
        intro = title is None
        if intro:
            if not ''.join(chunk).strip():
                continue
            title = L[a.lang]['intro']
        frags = md.blocks(chunk, start)
        if intro and frags and frags[0].startswith('<p>'):
            frags[0] = '<p class="art-lead">' + frags[0][3:]
        sid = base = slugify(title)
        k = 2
        while sid in used:
            sid = '%s-%d' % (base, k)
            k += 1
        used.add(sid)
        title_html = md.inline(title)
        plain = htmllib.unescape(re.sub(r'<[^>]+>', '', title_html))
        sections.append((sid, title_html, plain, frags))
    if not sections:
        raise BuildError("%s : l'article est vide." % label)
    a.figs = md.figs
    text = re.sub(r'<figure class="art-motion.*?</figure>', ' ', ' '.join(f for s in sections for f in s[3]), flags=re.S)
    words = len(re.findall(r'\w+', re.sub(r'<[^>]+>', ' ', text)))
    a.minutes = max(1, int(math.ceil(words / float(WORDS_PER_MIN))))
    a.sections = sections


# ------------------------------------------------------------------- gabarits
DOC_GLYPH = (
    '<svg class="glyph glyph-article" viewBox="0 0 240 160" aria-hidden="true" focusable="false">'
    '<g fill="none" stroke-linecap="round" stroke-linejoin="round">'
    '<rect class="g-line" x="14" y="52" width="58" height="56" rx="2"/>'
    '<path class="g-line g-thin" d="M26 59l5 5-5 5-5-5z"/>'
    '<path class="g-line g-thin ga-type" style="--i:0" pathLength="1" d="M36 62h26"/>'
    '<path class="g-line g-thin ga-type" style="--i:1" pathLength="1" d="M24 80h38"/>'
    '<path class="g-line g-thin ga-type" style="--i:1" pathLength="1" d="M24 90h30"/>'
    '<path class="g-line g-thin ga-type" style="--i:1" pathLength="1" d="M24 100h18"/>'
    '<path class="g-line g-dash" d="M72 80h38M130 80h24"/>'
    '<path class="g-accent" d="M120 70l10 10-10 10-10-10z"/>'
    '<path class="g-line g-thin" d="M120 75v10M115 80h10"/>'
    '<path class="ga-pulse" style="--i:0" pathLength="1" d="M72 80h38"/>'
    '<path class="ga-pulse" style="--i:1" pathLength="1" d="M130 80h24"/>'
    '<rect class="g-line" x="154" y="14" width="72" height="132" rx="2"/>'
    '<path class="g-accent ga-type" style="--i:2" pathLength="1" d="M166 30h40"/>'
    '<path class="g-line g-thin ga-type" style="--i:2" pathLength="1" d="M166 40h28"/>'
    '<path class="g-line g-thin" d="M166 58v74"/>'
    '<path class="g-accent ga-type" style="--i:3" pathLength="1" d="M174 60h20"/>'
    '<path class="g-line g-thin ga-type" style="--i:3" pathLength="1" d="M174 68h40M174 76h34"/>'
    '<path class="g-accent ga-type" style="--i:4" pathLength="1" d="M174 90h24"/>'
    '<path class="g-line g-thin ga-type" style="--i:4" pathLength="1" d="M174 98h40M174 106h30"/>'
    '<path class="g-accent ga-type" style="--i:5" pathLength="1" d="M174 120h18"/>'
    '<path class="g-line g-thin ga-type" style="--i:5" pathLength="1" d="M174 128h40M174 136h28"/>'
    '<circle class="g-dot" cx="120" cy="80" r="2.6"/>'
    '</g></svg>'
)


def fig_svg():
    """Figure animée « de l'idée à l'article » (viewBox 640 × 480), pilotée par assets/js/articles.js."""
    def w(cls, d, s=None):
        return '<path class="%s aw" pathLength="1"%s d="%s"/>' % (cls, ' data-s="%d"' % s if s is not None else '', d)
    parts = ['<svg viewBox="0 0 640 480" focusable="false"><g class="a-all">',
             '<path class="a-glow" d="M148 234H350"/>',
             '<g class="a-card-g"><rect class="a-card" x="28" y="176" width="120" height="116"/>'
             '<path class="a-av" d="M50 188L54 197L63 201L54 205L50 214L46 205L37 201L46 197Z"/>',
             w('a-line', 'M68 197H112'), w('a-line', 'M68 207H96'),
             w('a-line', 'M44 238H132'), w('a-line', 'M44 252H124'), w('a-line', 'M44 266H96'),
             '</g>',
             '<path class="a-link" d="M148 234H226"/><path class="a-pulse" pathLength="1" d="M148 234H226"/>',
             '<g class="a-node-g"><path class="a-node" d="M246 214L266 234L246 254L226 234Z"/>'
             '<path class="a-plus" d="M246 226V242M238 234H254"/></g>',
             '<path class="a-link" d="M266 234H350"/><path class="a-pulse" pathLength="1" d="M266 234H350"/>',
             '<g class="a-sheet-g"><rect class="a-sheet" x="350" y="64" width="254" height="344"/>',
             w('a-title', 'M372 98H520', 0), w('a-line', 'M372 114H470', 0),
             '<path class="a-rail aw" pathLength="1" d="M374 146V326"/>']
    for k in range(4):
        y = 146 + 60 * k
        parts.append(w('a-head', 'M392 %dH%d' % (y, 440 + 12 * (k % 3)), k + 1))
        parts.append(w('a-line', 'M392 %dH584' % (y + 17), k + 1))
        parts.append(w('a-line', 'M392 %dH%d' % (y + 30, 566 - 10 * (k % 2)), k + 1))
        parts.append(w('a-line', 'M392 %dH%d' % (y + 43, 520 - 14 * (k % 3)), k + 1))
    parts.append('</g>')
    for k in range(4):
        parts.append('<circle class="a-tick" cx="374" cy="%d" r="4.5"/>' % (146 + 60 * k))
    parts.append('</g></svg>')
    return ''.join(parts)


def head_html(lang, src, title, desc, canonical, alternates, og_type, og_image, og_alt, extra='', css_more=()):
    t = L[lang]
    alt = ''
    if alternates:
        alt = ''.join('  <link rel="alternate" hreflang="%s" href="%s/%s">\n' % (code, SITE, path) for code, path in alternates)
        alt += '  <link rel="alternate" hreflang="x-default" href="%s/%s">\n' % (SITE, alternates[0][1])
    return '''<!doctype html>
<html lang="{lang}" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <meta name="author" content="Or3L">
  <meta name="theme-color" content="#0a0e13">
  <meta name="color-scheme" content="dark">
  {gen}

  <link rel="canonical" href="{site}/{canonical}">
{alt}
  <meta property="og:type" content="{og_type}">
  <meta property="og:site_name" content="Or3L">
  <meta property="og:locale" content="{locale}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:url" content="{site}/{canonical}">
  <meta property="og:image" content="{site}/{og_image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="{og_alt}">
  <meta name="twitter:card" content="summary_large_image">
{extra}
  <link rel="icon" href="{favicon}" type="image/svg+xml">
  <link rel="manifest" href="{manifest}">
  <link rel="stylesheet" href="{css}">
  <link rel="stylesheet" href="{css2}">
{css_more}  <script src="{headjs}"></script>
</head>
'''.format(lang=lang, title=esc(title), desc=esc(desc), gen=GEN_MARK, site=SITE, canonical=canonical, alt=alt,
           og_type=og_type, locale=t['locale'], og_image=og_image, og_alt=esc(og_alt), extra=extra,
           favicon=rel(src, 'favicon.svg'), manifest=rel(src, 'site.webmanifest'), css=rel(src, 'assets/css/main.css'),
           css2=rel(src, 'assets/css/articles.css'), headjs=rel(src, 'assets/js/head.js'),
           css_more=''.join('  <link rel="stylesheet" href="%s">\n' % rel(src, c) for c in css_more))


def header_html(lang, src, switch_to):
    t = L[lang]
    nav = ''.join('          <li><a href="%s">%s</a></li>\n' % (rel(src, p), esc(lbl)) for lbl, p in t['nav'])
    code, hl, aria = t['other']
    return '''  <a class="skip-link" href="#contenu">{skip}</a>
  <div class="progress" aria-hidden="true"><span></span></div>

  <header class="site-header" data-header>
    <div class="container header-inner">
      <a class="brand" href="{home}" aria-label="{blabel}">
        <span class="brand-mark" aria-hidden="true">Or3L</span>
        <span class="brand-text">Or3L<small>{bsub}</small></span>
      </a>
      <nav class="main-nav" id="menu" aria-label="{navlabel}">
        <ul>
{nav}        </ul>
      </nav>
      <div class="header-actions">
        <a class="lang-switch" href="{switch}" hreflang="{hl}" lang="{hl}" aria-label="{aria}">{code}</a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="menu"><span class="menu-bars" aria-hidden="true"></span><span class="sr-only">{menu}</span></button>
      </div>
    </div>
  </header>
'''.format(skip=esc(t['skip']), home=rel(src, t['home']), blabel=esc(t['brand_label']), bsub=esc(t['brand_sub']),
           navlabel=esc(t['nav_label']), nav=nav, switch=rel(src, switch_to), hl=hl, aria=esc(aria), code=code,
           menu=esc(t['menu']))


def footer_html(lang, src, hud_total):
    t = L[lang]
    on, off = t['motion']
    return '''
  <footer class="site-footer">
    <div class="container footer-inner">
      <p class="footer-brand"><span class="brand-mark" aria-hidden="true">Or3L</span> © <span data-year>2026</span> Or3L</p>
      <ul class="footer-links">
        <li><a href="{cv}">CV</a></li>
        <li><a href="{li}" rel="noopener" target="_blank">LinkedIn</a></li>
      </ul>
      <button class="motion-switch" type="button" role="switch" aria-checked="true" data-motion-switch data-on="{on}" data-off="{off}" hidden><span class="motion-switch-label">Animations</span><span class="motion-switch-track" aria-hidden="true"><i></i></span><span class="motion-switch-state" aria-hidden="true">{on}</span></button>
    </div>
  </footer>

  <a class="back-to-top" href="#top" aria-label="{bt}" title="{bt}">
    <span class="back-to-top-arrow" aria-hidden="true">↑</span>
    <span>{bts}</span>
  </a>

  <div class="hud" aria-hidden="true"><span class="hud-led"></span><span class="hud-num">01</span><span class="hud-sep">/</span><span class="hud-total">{total:02d}</span><span class="hud-label"></span></div>
  <div class="cursor" aria-hidden="true"></div>
  <div class="toast" role="status" aria-live="polite"></div>
'''.format(cv=rel(src, t['cv']), li=LINKEDIN, on=on, off=off, bt=esc(t['back_top']), bts=esc(t['back_top_short']), total=hud_total)


def scripts_html(src, reading, more=()):
    vendor = ['gsap', 'ScrollTrigger', 'SplitText', 'ScrambleTextPlugin'] + (['Flip'] if reading else []) + ['DrawSVGPlugin', 'lenis']
    js = ['config', 'contact', 'site', 'figures'] + (['motion-pages', 'articles'] if reading else ['case', 'articles']) + list(more)
    lines = ['  <script defer src="%s"></script>' % rel(src, 'assets/vendor/%s.min.js' % v) for v in vendor]
    lines += ['  <script defer src="%s"></script>' % rel(src, 'assets/js/%s.js' % j) for j in js]
    return '\n  <!-- Scripts : bibliothèques (GSAP, Lenis), configuration, puis animations du site -->\n' + '\n'.join(lines) + '\n</body>\n</html>\n'


def default_og(lang):
    cand = 'assets/img/og/%sarticles.png' % ('en-' if lang == 'en' else '')
    if (ROOT / cand).exists():
        return cand
    return 'assets/img/og-image-en.png' if lang == 'en' else 'assets/img/og-image.png'


def counterpart(a, by_lang):
    return by_lang['en' if a.lang == 'fr' else 'fr'].get(a.key)


def alternates_of(a, other):
    if not other:
        return None
    fr, en = (a, other) if a.lang == 'fr' else (other, a)
    return [('fr', fr.out), ('en', en.out)]


# ------------------------------------------------------------------- pages
def tag_list(a):
    return ''.join('<li><span class="led-dot %s" aria-hidden="true"></span>%s</li>' % (tag_class(x), esc(x)) for x in a.tags)


def article_page(a, by_lang, lists):
    lang, t, src = a.lang, L[a.lang], a.out
    other = counterpart(a, by_lang)
    switch_to = other.out if other else L['en' if lang == 'fr' else 'fr']['index']
    og_image = a.image or default_og(lang)
    canonical = a.out
    canonical_url = '%s/%s' % (SITE, canonical)
    extra = '  <meta property="article:published_time" content="%s">\n' % a.date.isoformat()
    if a.updated:
        extra += '  <meta property="article:modified_time" content="%s">\n' % a.updated.isoformat()
    extra += ''.join('  <meta property="article:tag" content="%s">\n' % esc(tg) for tg in a.tags)
    ld = {'@context': 'https://schema.org', '@type': 'BlogPosting', 'headline': a.title, 'description': a.summary,
          'inLanguage': lang, 'datePublished': a.date.isoformat(), 'dateModified': (a.updated or a.date).isoformat(),
          'mainEntityOfPage': canonical_url, 'image': '%s/%s' % (SITE, og_image),
          'author': {'@type': 'Person', 'name': 'Or3L', 'url': SITE + '/'}, 'keywords': ', '.join(a.tags)}
    extra += '  <script type="application/ld+json">%s</script>\n' % json.dumps(ld, ensure_ascii=False).replace('</', '<\\/')
    out = head_html(lang, src, '%s — %s · Or3L' % (a.title, t['article']), a.summary, canonical, alternates_of(a, other),
                    'article', og_image, a.title, extra, ['assets/css/art-figures.css'] if a.figs else ())
    out += '<body class="page-case page-article" data-page="case">\n' + header_html(lang, src, switch_to)
    n = len(a.sections)
    tags = tag_list(a)
    toc = ''.join('<li><a href="#%s"><span class="toc-num">%02d</span>%s</a></li>' % (sid, i + 1, esc(plain))
                  for i, (sid, _, plain, _) in enumerate(a.sections))
    fmt = esc(a.kind or t['format_art'])
    out += '''
  <main id="contenu" class="case">

    <section class="case-hero" data-hud="{article}">
      <div class="container case-hero-inner">
        <div class="case-hero-copy">
          <nav class="breadcrumb" aria-label="{bc}"><ol><li><a href="{home}">{homelabel}</a></li><li><a href="{idx}">{articles}</a></li><li aria-current="page">{article}</li></ol></nav>
          <p class="case-kicker"><span class="case-num">{kind}</span>{kick}</p>
          <h1 class="case-title" data-reveal="lines">{title}</h1>
          <p class="case-pitch">{summary}</p>
          {tagsul}
        </div>
        <div class="case-visual case-screen" data-case-screen aria-hidden="true"><span class="screen-corner"></span><span class="screen-head"><span class="led led-signal"></span>{article}</span>{glyph}<span class="screen-sig">{n} {sections} · {mins} {minlabel}</span></div>
      </div>
    </section>

    <div class="container case-body">
      <aside class="case-toc" aria-label="{contents}">
        <p class="case-toc-title">{contents}</p>
        <ol>{toc}</ol>
      </aside>
      <article class="case-content art-body">
        <details class="art-toc-mobile"><summary>{contents}</summary><ol>{toc}</ol></details>
        <div class="case-overview"><dl class="case-meta">
          <div><dt>{published}</dt><dd><time datetime="{iso}">{date}</time></dd></div>
          <div><dt>{reading}</dt><dd>{mins} {minlabel}</dd></div>
          <div><dt>{format}</dt><dd>{fmt}</dd></div>
        </dl></div>
'''.format(article=esc(t['article']), kind=esc(a.kind or t['article']), bc=esc(t['breadcrumb']), home=rel(src, t['home']), homelabel=esc(t['home_label']),
           idx=rel(src, t['index']), articles=esc(t['articles']), kick=' · '.join(esc(x) for x in a.tags), title=esc(a.title),
           summary=esc(a.summary), tagsul='<ul class="card-tags">%s</ul>' % tags if tags else '', glyph=DOC_GLYPH, n=n,
           sections=t['sections'], mins=a.minutes, minlabel=t['min'], contents=esc(t['contents']), toc=toc,
           published=t['published'], reading=t['reading'], format=t['format'], iso=a.date.isoformat(),
           date=fmt_date(a.date, lang), fmt=fmt)
    for i, (sid, title_html, plain, frags) in enumerate(a.sections):
        out += '        <section class="case-section" id="%s" data-hud="%s">\n          <h2 class="case-h2"><span class="case-h2-num">%02d</span>%s</h2>\n' % (
            sid, esc(plain), i + 1, title_html)
        out += ''.join('          %s\n' % f for f in frags)
        out += '        </section>\n'
    share = 'https://www.linkedin.com/sharing/share-offsite/?url=' + urllib.parse.quote(canonical_url, safe='')
    end = '<div class="art-actions"><a class="btn btn-ghost" href="%s" rel="noopener" target="_blank">%s</a></div>' % (esc(share), esc(t['share']))
    out += '        <footer class="art-end">\n          %s\n' % end
    if a.related:
        out += '          <div><p class="art-end-title">%s</p><ul class="art-related">%s</ul></div>\n' % (
            esc(t['related']), ''.join('<li><a href="%s">%s</a></li>' % (rel(src, p), esc(lbl)) for p, lbl in a.related))
    if a.updated:
        out += '          <p class="art-updated">%s <time datetime="%s">%s</time></p>\n' % (esc(t['updated']), a.updated.isoformat(), fmt_date(a.updated, lang))
    out += '        </footer>\n      </article>\n    </div>\n'
    lst = lists[lang]
    pos = [x.key for x in lst].index(a.key)
    newer = lst[pos - 1] if pos > 0 else None
    older = lst[pos + 1] if pos + 1 < len(lst) else None

    def navlink(x, cls, label):
        if not x:
            return '<span aria-hidden="true"></span>'
        return '<a class="case-nav-link %s" href="%s"><span class="case-nav-label">%s</span><span class="case-nav-title">%s</span></a>' % (
            cls, rel(src, x.out), esc(label), esc(x.title))
    out += '''
    <nav class="case-nav container" aria-label="{na}">
      {prev}
      <a class="case-nav-link all" href="{idx}">{all}</a>
      {nxt}
    </nav>

  </main>
'''.format(na=esc(t['nav_articles']), prev=navlink(older, 'prev', t['prev']), idx=rel(src, t['index']),
           all=esc(t['all_articles']), nxt=navlink(newer, 'next', t['next']))
    out += footer_html(lang, src, n + 1)
    out += scripts_html(src, reading=False, more=['art-figures'] if a.figs else ())
    return out


def row_html(a, num, src):
    t = L[a.lang]
    tags = tag_list(a)
    kind = '<span class="art-row-kind">%s</span>' % esc(a.kind) if a.kind else ''
    return ('<li class="art-row" data-tags="%s" data-search="%s"><a class="art-row-link" href="%s">'
            '<span class="art-row-num" aria-hidden="true">%02d</span>'
            '<span class="art-row-main">%s<h3 class="art-row-title">%s</h3><p class="art-row-sum">%s</p>%s</span>'
            '<span class="art-row-meta"><time datetime="%s">%s</time><span>%d %s</span><span class="art-row-arrow" aria-hidden="true">→</span></span>'
            '</a></li>') % (esc(' '.join(slugify(x) for x in a.tags)), esc(norm(' '.join([a.title, a.summary, a.kind] + a.tags))),
                            rel(src, a.out), num, kind, esc(a.title), esc(a.summary),
                            '<ul class="art-row-tags">%s</ul>' % tags if tags else '', a.date.isoformat(),
                            fmt_date(a.date, a.lang), a.minutes, t['min'])


def card_html(a, num, src, flagship):
    t = L[a.lang]
    kick = ' · '.join(esc(x) for x in ([a.kind] if a.kind else []) + a.tags) or esc(t['article'])
    meta = '%s · %d %s' % (fmt_date(a.date, a.lang), a.minutes, t['min'])
    badge = '<span class="card-badge">%s</span>' % esc(t['latest']) if flagship else ''
    return ('<a class="feature-project{cls}" href="{h}" data-card>'
            '<span class="feature-visual">{g}<span class="card-num">{n:02d}</span>{badge}</span>'
            '<span class="feature-copy"><span class="feature-kicker">{k}</span><strong>{ti}</strong>'
            '<span class="spot-pitch">{s}</span><span class="feature-meta">{m}</span>'
            '<span class="feature-open">{o} <span aria-hidden="true">→</span></span></span></a>').format(
        cls=' spot-flagship' if flagship else '', h=rel(src, a.out), g=DOC_GLYPH, n=num, badge=badge, k=kick,
        ti=esc(a.title), s=esc(a.summary), m=esc(meta), o=esc(t['teaser_open']))


def index_page(lang, lists):
    t, src = L[lang], L[lang]['index']
    lst = lists[lang]
    other_lang = 'en' if lang == 'fr' else 'fr'
    alts = [('fr', L['fr']['index']), ('en', L['en']['index'])]
    out = head_html(lang, src, t['idx_title'], t['idx_desc'], src, alts, 'website', default_og(lang), t['img_alt_default'])
    out += '<body class="page-reading page-reading-articles" data-page="reading">\n' + header_html(lang, src, L[other_lang]['index'])
    plates = ''.join('<span class="fig-plate" style="--x:%s;--y:%s"><b>%s</b><span>%s</span></span>' % (x, y, esc(b), esc(s))
                     for (b, s), (x, y) in zip(t['plates'], [('4.4%', '26%'), ('28%', '57%'), ('54.7%', '86.5%')]))
    out += '''
  <main id="contenu">
    <section class="reading-hero" data-hud="{eyebrow}">
      <div class="container reading-hero-inner">
        <div class="reading-hero-copy">
          <p class="eyebrow"><span class="eyebrow-num">01</span>{eyebrow}</p>
          <h1 class="reading-title" data-reveal="lines">{eyebrow}</h1>
          <p class="reading-lede">{lede}</p>
          <a class="text-link" href="{home}">{back}</a>
        </div>
        <div class="fig fig-articles reading-figure" data-figure="articles" aria-hidden="true">{svg}<span class="fig-head"><span class="led led-signal"></span>{fh} <small>{fs}</small></span>{plates}</div>
      </div>
    </section>
'''.format(eyebrow=esc(t['articles']), lede=esc(t['idx_lede']), home=rel(src, t['home']), back=esc(t['back_home']), svg=fig_svg(),
           fh=esc(t['fig_head']), fs=esc(t['fig_small']), plates=plates)
    hud = 2
    if not lst:
        out += '''
    <section class="reading-content" data-hud="{c}">
      <div class="container art-soon">
        <p class="eyebrow"><span class="eyebrow-num">02</span>{c}</p>
        <h2 class="section-title" data-reveal="lines">{st}</h2>
        <p class="section-intro">{sx}</p>
      </div>
    </section>
'''.format(c=esc(t['contents']), st=esc(t['soon_title']), sx=esc(t['soon_text']))
    else:
        total = len(lst)
        numbers = {x.key: total - i for i, x in enumerate(lst)}
        eb = 2
        if total >= FEATURE_MIN:
            hud += 1
            out += '''
    <section class="reading-content art-feature-section" data-hud="{c}">
      <div class="container art-feature">
        <p class="eyebrow"><span class="eyebrow-num">{eb:02d}</span>{c}</p>
        <div class="spot-grid" style="margin-top:28px">{card}</div>
      </div>
    </section>
'''.format(c=esc(t['latest']), eb=eb, card=card_html(lst[0], numbers[lst[0].key], src, True))
            eb += 1
        tagset = {}
        for x in lst:
            for tg in x.tags:
                tagset.setdefault(slugify(tg), [tg, 0])[1] += 1
        tools = ''
        if total >= TOOLBAR_MIN:
            chips = '<button class="filter art-filter is-active" type="button" data-tag="" aria-pressed="true">%s <span class="filter-count">%d</span></button>' % (esc(t['all']), total)
            chips += ''.join('<button class="filter art-filter" type="button" data-tag="%s" aria-pressed="false">%s <span class="filter-count">%d</span></button>' % (k, esc(v[0]), v[1])
                             for k, v in sorted(tagset.items(), key=lambda kv: (-kv[1][1], norm(kv[1][0]))))
            tools = ('<div class="art-tools" hidden><div class="filters" role="group" aria-label="%s">%s</div>'
                     '<label class="art-search"><span class="sr-only">%s</span>'
                     '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/></svg>'
                     '<input type="search" placeholder="%s" autocomplete="off"></label>'
                     '<p class="art-count" aria-live="polite" data-one="%s" data-many="%s">%d %s</p></div>') % (
                esc(t['filter_label']), chips, esc(t['search']), esc(t['search_ph']), t['one'], t['many'], total, t['many'])
        years = {}
        for x in lst:
            years.setdefault(x.date.year, []).append(x)
        blocks = ''.join(
            '<section class="art-year" aria-label="%d"><h3 class="art-year-title">%d <small>%d</small></h3><ol class="art-rows">%s</ol></section>' % (
                y, y, len(xs), ''.join(row_html(x, numbers[x.key], src) for x in xs))
            for y, xs in sorted(years.items(), reverse=True))
        hud += 1
        out += '''
    <section class="reading-content" data-hud="{c}">
      <div class="container">
        <p class="eyebrow"><span class="eyebrow-num">{eb:02d}</span>{c}</p>
        <h2 class="section-title art-index-title" data-reveal="lines">{all}</h2>
        {tools}
        <div class="art-index">{blocks}</div>
        <p class="art-empty" hidden>{none}</p>
        <div class="reading-outro art-follow"><p>{follow}</p><a class="text-link" href="{proj}">{fl} <span aria-hidden="true">→</span></a></div>
      </div>
    </section>
'''.format(c=esc(t['contents']), eb=eb, all=esc(t['all_articles']), tools=tools, blocks=blocks, none=esc(t['none']),
           follow=esc(t['follow']), proj=rel(src, t['nav'][2][1]), fl=esc(t['follow_link']))
    out += '\n  </main>\n'
    out += footer_html(lang, src, hud)
    out += scripts_html(src, reading=True)
    return out


def teaser_html(lang, lists):
    t, src = L[lang], L[lang]['home']
    lst = lists[lang]
    if not lst:
        return ''
    total = len(lst)
    shown = lst[:3]
    flag = len(shown) in (1, 3)
    cards = ''.join(card_html(x, total - i, src, flag and i == 0) for i, x in enumerate(shown))
    return '''<section class="section spot-section art-teaser" id="articles" aria-labelledby="art-title" data-hud="{eb}">
      <div class="container">
        <div class="feature-head"><div><p class="eyebrow"><span class="eyebrow-num">03</span>{eb}</p>
          <h2 class="section-title" id="art-title" data-reveal="lines">{title}</h2></div>
          <a class="text-link" href="{idx}">{all} <span aria-hidden="true">→</span></a></div>
        <div class="spot-grid">{cards}</div>
      </div>
    </section>'''.format(eb=esc(t['articles']), title=esc(t['teaser_title']), idx=rel(src, t['index']),
                         all=esc(t['teaser_all']), cards=cards)


# ------------------------------------------------- accueil, plan du site, nettoyage
def patch_between(path, block, written):
    text = path.read_bytes().decode('utf-8')
    eol = '\r\n' if '\r\n' in text else '\n'
    pat = re.compile(re.escape(M_START) + r'.*?' + re.escape(M_END), re.S)
    if not pat.search(text):
        raise BuildError('%s : les repères %s … %s sont introuvables.' % (path.name, M_START, M_END))
    body = block.replace('\n', eol)
    inner = (eol + '    ' + body + eol + '    ') if body else ''
    new = pat.sub(lambda m: M_START + inner + M_END, text, count=1)
    # les sections suivantes sont numérotées après « À la une » (02), avec « Articles » (03) s'il y en a
    shift = 1 if body else 0
    for sid, num in (('chiffres', 3), ('profil', 4), ('amelioration-continue', 5), ('contact', 6)):
        new = re.sub(r'(<section[^>]*\bid="%s"[^>]*>.*?<span class="eyebrow-num">)\d+(</span>)' % sid,
                     lambda m: '%s%02d%s' % (m.group(1), num + shift, m.group(2)), new, count=1, flags=re.S)
    if new != text:
        path.write_bytes(new.encode('utf-8'))
    written.append(path)


def sitemap_block(by_lang, lists):
    def url(path, alts, lastmod=None):
        s = '  <url>\n    <loc>%s/%s</loc>\n' % (SITE, path)
        if lastmod:
            s += '    <lastmod>%s</lastmod>\n' % lastmod
        for code, p in alts:
            s += '    <xhtml:link rel="alternate" hreflang="%s" href="%s/%s"/>\n' % (code, SITE, p)
        return s + '  </url>'

    both = [('fr', L['fr']['index']), ('en', L['en']['index'])]
    entries = [url(L['fr']['index'], both), url(L['en']['index'], both)]
    for lang in ('fr', 'en'):
        for a in lists[lang]:
            entries.append(url(a.out, alternates_of(a, counterpart(a, by_lang)) or [], (a.updated or a.date).isoformat()))
    return '\n'.join(entries)


def patch_sitemap(block, written):
    path = ROOT / 'sitemap.xml'
    text = path.read_bytes().decode('utf-8')
    eol = '\r\n' if '\r\n' in text else '\n'
    section = '  ' + M_START + eol + block.replace('\n', eol) + eol + '  ' + M_END
    pat = re.compile(r'[ \t]*' + re.escape(M_START) + r'.*?' + re.escape(M_END), re.S)
    if pat.search(text):
        new = pat.sub(lambda m: section, text, count=1)
    else:
        new = text.replace('</urlset>', section + eol + '</urlset>')
    if new != text:
        path.write_bytes(new.encode('utf-8'))
    written.append(path)


def clean_stale(written):
    keep = {p.resolve() for p in written}
    for lang in ('fr', 'en'):
        d = ROOT / L[lang]['dir']
        if not d.is_dir():
            continue
        for f in d.glob('*.html'):
            if f.resolve() not in keep and GEN_MARK in f.read_text(encoding='utf-8', errors='ignore'):
                f.unlink()
                print('  supprimé :', f.relative_to(ROOT))
        if not any(d.iterdir()):
            d.rmdir()


# -------------------------------------------------------------------- main
def collect():
    by_lang = {'fr': {}, 'en': {}}
    drafts, warnings = [], []
    if not CONTENT.is_dir():
        return by_lang, drafts, warnings
    for folder in sorted(CONTENT.iterdir()):
        if not folder.is_dir() or folder.name.startswith(('_', '.')):
            continue
        found = False
        for lang in ('fr', 'en'):
            f = folder / ('%s.md' % lang)
            if f.exists():
                found = True
                a = load_article(folder.name, lang, f)
                if a.draft:
                    drafts.append(str(f.relative_to(ROOT)))
                else:
                    by_lang[lang][folder.name] = a
        if not found:
            warnings.append('%s : ni fr.md ni en.md, dossier ignoré.' % folder.relative_to(ROOT))
    for lang in ('fr', 'en'):
        slugs = {}
        for a in by_lang[lang].values():
            if a.slug in slugs:
                raise BuildError('Deux articles %s ont la même adresse « %s » (%s et %s).' % (lang.upper(), a.slug, slugs[a.slug], a.key))
            slugs[a.slug] = a.key
    return by_lang, drafts, warnings


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    ap = argparse.ArgumentParser(description='Génère la section Articles du site.')
    ap.add_argument('--check', action='store_true', help='vérifie les articles sans écrire de fichier')
    args = ap.parse_args()
    try:
        by_lang, drafts, warnings = collect()
        for lang in by_lang:
            for a in by_lang[lang].values():
                render_body(a)
        lists = {lang: sorted(by_lang[lang].values(), key=lambda x: (x.date, x.key), reverse=True) for lang in by_lang}
        for w in warnings:
            print('Attention :', w)
        for d in drafts:
            print('Brouillon ignoré :', d)
        print('Articles publiés : %d FR, %d EN' % (len(lists['fr']), len(lists['en'])))
        if args.check:
            print('Vérification terminée : aucune erreur.')
            return 0
        written = []
        for lang in ('fr', 'en'):
            write_if_changed(ROOT / L[lang]['index'], index_page(lang, lists), written)
            for a in lists[lang]:
                write_if_changed(ROOT / a.out, article_page(a, by_lang, lists), written)
            patch_between(ROOT / L[lang]['home'], teaser_html(lang, lists), written)
        patch_sitemap(sitemap_block(by_lang, lists), written)
        clean_stale(written)
        print('Fichiers générés ou vérifiés : %d' % len(written))
        return 0
    except BuildError as e:
        print('\nERREUR :', e, file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
