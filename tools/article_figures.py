"""Figures animées des articles.

Dans un fichier Markdown, une ligne seule « :::figure nom "légende" » insère la figure « nom ».
Chaque figure existe en français et en anglais. Sans animation (interrupteur « Animations »,
préférence du système ou JavaScript absent), la figure s'affiche dans son état final.
Les styles sont dans assets/css/art-figures.css, le déclenchement dans assets/js/art-figures.js.
"""
import html as htmllib

TXT = {
    'tag': {'fr': 'Exemple fictif', 'en': 'Fictional example'},
    'replay': {'fr': 'Rejouer', 'en': 'Replay'},
    'derive': {
        'fr': dict(doc='Documentation', real='Installation réelle', t0='Origine', t1='Dépannage', t2='Évolution',
                   t3="Aujourd'hui", gap='écart'),
        'en': dict(doc='Documentation', real='Actual installation', t0='Commissioning', t1='Repair', t2='Change',
                   t3='Today', gap='gap'),
    },
    'chrono': {
        'fr': dict(lanes=('Pièce présente', 'Moteur tapis', 'Vérin'), q='0,8 s ?'),
        'en': dict(lanes=('Part present', 'Belt motor', 'Cylinder'), q='0.8 s ?'),
    },
    'modele': {
        'fr': dict(states=(('Attente', 'tapis en marche'), ('Poussée', 'le vérin sort'), ('Retour', 'le vérin rentre')),
                   legend='I1 pièce présente · I2 vérin sorti · I3 vérin rentré'),
        'en': dict(states=(('Wait', 'belt running'), ('Push', 'cylinder out'), ('Return', 'cylinder in')),
                   legend='I1 part present · I2 cylinder out · I3 cylinder in'),
    },
    'ecart': {
        'fr': dict(lanes=('Mesure', 'Modèle'), bad='2 écarts', good='0 écart · modèle conforme', g1='0,8 s', g2='0,6 s',
                   t1='T1 = 0,8 s', t2='T2 = 0,6 s'),
        'en': dict(lanes=('Measured', 'Model'), bad='2 gaps', good='0 gap · model matches', g1='0.8 s', g2='0.6 s',
                   t1='T1 = 0.8 s', t2='T2 = 0.6 s'),
    },
    'boucle': {
        'fr': dict(steps=(('Observer', 'lecture seule'), ('Relever', 'signaux, E/S'), ('Reconstituer', 'états, séquences'),
                          ('Valider', 'modèle vs mesure'), ('Documenter', 'dossier à jour')),
                   ret='écart : retour à « Reconstituer »', a=3, b=4),
        'en': dict(steps=(('Observe', 'read-only'), ('Capture', 'signals, I/O'), ('Reconstruct', 'states, sequences'),
                          ('Validate', 'model vs measurement'), ('Document', 'file up to date')),
                   ret='gap: back to « Reconstruct »', a=3, b=4),
    },
    'signaux': {
        'fr': dict(steps=(('Capter', 'automatisme'), ('Fiabiliser', 'développement'), ('Décider', 'IA + expertise humaine')),
                   ret='chaque décision revient aux métiers', a=1, b=3),
        'en': dict(steps=(('Capture', 'automation'), ('Refine', 'development'), ('Decide', 'AI + human expertise')),
                   ret='every decision goes back to the business teams', a=1, b=3),
    },
}


def esc(s):
    return htmllib.escape(s, quote=True)


def _a(cls, d=None, t=None):
    st = []
    if d is not None:
        st.append('--d:%gs' % d)
    if t is not None:
        st.append('--t:%gs' % t)
    return 'class="%s"%s' % (cls, ' style="%s"' % ';'.join(st) if st else '')


def _t(x, y, s, cls='t', anchor='start', d=None, t=None):
    return '<text %s x="%g" y="%g" text-anchor="%s">%s</text>' % (_a(cls, d, t), x, y, anchor, esc(s))


def _p(cls, path, delay=None, dur=None, extra=''):
    return '<path %s d="%s"%s/>' % (_a(cls, delay, dur), path, extra)


def _svg(w, h, parts):
    return '<svg viewBox="0 0 %d %d" aria-hidden="true" focusable="false">%s</svg>' % (w, h, ''.join(parts))


# --------------------------------------------------------------------------- figures SVG
def derive(lang):
    t = TXT['derive'][lang]
    o = ['<g %s><path class="ln" d="M36 222H524"/>' % _a('a-fade', 0, .6)]
    o += ['<path class="ln" d="M%d 216V228"/>' % x for x in (36, 190, 350, 524)]
    o += [_t(36, 252, t['t0'], 'm dim', 'start'), _t(190, 252, t['t1'], 'm dim', 'middle'),
          _t(350, 252, t['t2'], 'm dim', 'middle'), _t(524, 252, t['t3'], 'm dim', 'end'), '</g>']
    o.append('<polygon %s points="190,96 524,96 524,162 350,162 350,124 190,124"/>' % _a('gapfill a-fade', 3.4, .8))
    o.append(_p('ln dot a-fade', 'M190 131V216', 2.1, .5))
    o.append(_p('ln dot a-fade', 'M350 169V216', 2.95, .5))
    o.append(_p('sl s-and a-draw', 'M36 96H190V124H350V162H524', 1.2, 2.4, ' pathLength="1"'))
    o.append(_p('sl s-sig dash a-fade', 'M36 96H524', .3, .8))
    o.append(_p('mk a-pop', 'M190 117L197 124L190 131L183 124Z', 2.0))
    o.append(_p('mk a-pop', 'M350 155L357 162L350 169L343 162Z', 2.85))
    o.append(_t(36, 70, t['doc'], 't c-sig a-fade', 'start', .3, .8))
    o.append(_t(524, 192, t['real'], 't c-and a-fade', 'end', 3.0, .6))
    o.append(_t(437, 134, t['gap'], 'm c-fault a-fade', 'middle', 3.8, .6))
    return _svg(560, 270, o)


def chrono(lang):
    t = TXT['chrono'][lang]

    def X(s):
        return 150 + 48.75 * s
    o = []
    bases = (74, 138, 202)
    for b in bases:
        o.append('<path class="ln dot" d="M150 %d H540"/>' % b)
    for b, name in zip(bases, t['lanes']):
        o.append(_t(10, b - 8, name, 't'))
    o.append('<path class="ln" d="M150 236H540"/>')
    for k, s in enumerate((0, 2, 4, 6, 8)):
        o.append('<path class="ln" d="M%g 230V242"/>' % X(s))
        o.append(_t(X(s), 260, str(s) if s < 8 else '8 s', 'm dim', 'middle'))
    o.append(_p('sl s-sig a-draw', 'M150 74H%g V48 H%g V74 H540' % (X(2.4), X(3.6)), 0, 1.8, ' pathLength="1"'))
    o.append(_p('sl s-and a-draw', 'M150 112H%g V138 H%g V112 H540' % (X(2.4), X(5.4)), .4, 1.8, ' pathLength="1"'))
    o.append(_p('sl s-and a-draw', 'M150 202H%g V176 H%g V202 H540' % (X(3.2), X(4.6)), .8, 1.8, ' pathLength="1"'))
    for s, d in ((2.4, 3.0), (3.2, 3.4)):
        o.append(_p('ln hl a-fade', 'M%g 40V222' % X(s), d, .5))
    for n, s, d in (('1', 2.4, 3.2), ('2', 3.2, 3.6)):
        o.append('<g %s><circle class="bdg" cx="%g" cy="26" r="11"/>%s</g>' % (_a('a-pop', d), X(s), _t(X(s), 31, n, 'm c-and b', 'middle')))
    o.append(_t(X(3.2) + 20, 31, t['q'], 'm c-and a-fade', 'start', 4.1, .6))
    return _svg(560, 270, o)


def modele(lang):
    t = TXT['modele'][lang]
    xs = (20, 220, 420)
    o = []
    for k, (x, (title, sub)) in enumerate(zip(xs, t['states'])):
        o.append('<g %s><rect class="box h%d" x="%d" y="40" width="120" height="56"/>%s%s</g>' % (
            _a('a-pop', k * .5), k + 1, x, _t(x + 60, 64, title, 't', 'middle'), _t(x + 60, 83, sub, 'm', 'middle')))
    o.append('<g %s><path class="ln arr" d="M140 68H214"/><path class="hd" d="M214 63L224 68L214 73Z"/>%s</g>' % (
        _a('a-fade', .8, .5), _t(180, 56, 'I1', 'm c-sig b', 'middle')))
    o.append('<g %s><path class="ln arr" d="M340 68H414"/><path class="hd" d="M414 63L424 68L414 73Z"/>%s</g>' % (
        _a('a-fade', 1.3, .5), _t(380, 56, 'I2', 'm c-sig b', 'middle')))
    o.append('<g %s><path class="ln arr" d="M480 96V172H80V102"/><path class="hd" d="M75 104L80 94L85 104Z"/>%s</g>' % (
        _a('a-fade', 1.8, .6), _t(280, 162, 'I3', 'm c-sig b', 'middle')))
    o.append(_t(280, 226, t['legend'], 'm', 'middle', 2.3, .6))
    o.append('<g class="tok"><circle class="halo" r="12"/><circle r="5.5"/></g>')
    return _svg(560, 250, o)


def ecart(lang):
    t = TXT['ecart'][lang]

    def X(s):
        return 130 + 102.5 * (s - 2)
    o = []
    for b in (96, 196):
        o.append('<path class="ln dot" d="M130 %d H540"/>' % b)
    o.append(_t(10, 88, t['lanes'][0], 't'))
    o.append(_t(10, 188, t['lanes'][1], 't'))
    o.append('<path class="ln" d="M130 262H540"/>')
    for s in (2, 3, 4, 5, 6):
        o.append('<path class="ln" d="M%g 256V268"/>' % X(s))
        o.append(_t(X(s), 286, str(s) if s < 6 else '6 s', 'm dim', 'middle'))
    # intervalles d'écart : modèle initial [2,4 ; 4,0] contre mesure [3,2 ; 4,6]
    o.append('<g class="gaps"><rect x="%g" y="52" width="%g" height="156"/><rect x="%g" y="52" width="%g" height="156"/>%s%s</g>' % (
        X(2.4), X(3.2) - X(2.4), X(4.0), X(4.6) - X(4.0),
        _t((X(2.4) + X(3.2)) / 2, 44, t['g1'], 'm c-fault b', 'middle'), _t((X(4.0) + X(4.6)) / 2, 44, t['g2'], 'm c-fault b', 'middle')))
    o.append(_p('sl s-and a-draw', 'M130 96H%g V64 H%g V96 H540' % (X(3.2), X(4.6)), 0, 1.6, ' pathLength="1"'))
    o.append(_p('sl s-pred dash hyp', 'M130 196H%g V164 H%g V196 H540' % (X(2.4), X(4.0))))
    o.append(_p('sl s-run a-draw fix', 'M130 196H%g V164 H%g V196 H540' % (X(3.2), X(4.6)), 4.8, 1.4, ' pathLength="1"'))
    o.append('<g class="brk">%s%s%s%s</g>' % (
        '<path class="ln s-runl" d="M%g 224V232H%g V224"/>' % (X(2.4), X(3.2)),
        '<path class="ln s-runl" d="M%g 224V232H%g V224"/>' % (X(4.0), X(4.6)),
        _t((X(2.4) + X(3.2)) / 2, 250, t['t1'], 'm c-run b', 'middle'), _t((X(4.0) + X(4.6)) / 2, 250, t['t2'], 'm c-run b', 'middle')))
    o.append(_t(540, 24, t['bad'], 'm c-fault b badA', 'end'))
    o.append(_t(540, 24, t['good'], 'm c-run b badB', 'end'))
    return _svg(560, 300, o)


# --------------------------------------------------------------------------- figures HTML (rangées d'étapes)
def _flow(name):
    def build(lang):
        d = TXT[name][lang]
        n = len(d['steps'])
        k = d['b'] - d['a'] + 1
        o = ['<div class="art-flow af-n%d" role="list" style="--n:%d;--k:%d;--c1:%d;--c2:%d">' % (n, n, k, d['a'], d['b'] + 1)]
        for i, (title, sub) in enumerate(d['steps']):
            o.append('<div class="af-step%s" role="listitem" style="--i:%d"><span class="af-n">%02d</span><strong>%s</strong>'
                     '<span class="af-s">%s</span></div>' % (' is-last' if i == n - 1 else '', i, i + 1, esc(title), esc(sub)))
        o.append('<div class="af-ret" aria-hidden="true"><span>↺ %s</span></div></div>' % esc(d['ret']))
        return ''.join(o)
    return build


# nom : (constructeur, valeurs fictives ?)
REGISTRY = {
    'derive': (derive, True),
    'chrono': (chrono, True),
    'modele': (modele, True),
    'ecart': (ecart, True),
    'boucle': (_flow('boucle'), False),
    'signaux': (_flow('signaux'), False),
}


def figure_html(name, lang, caption_html):
    build, fictional = REGISTRY[name]
    tag = '<span class="art-motion-tag">%s</span>' % esc(TXT['tag'][lang]) if fictional else ''
    cap = '<figcaption>%s</figcaption>' % caption_html if caption_html else ''
    return ('<figure class="art-motion art-motion--%s" data-art-fig="%s" data-replay="%s">'
            '<div class="art-motion-stage"><div class="art-motion-bar">%s</div>%s</div>%s</figure>'
            % (name, name, esc(TXT['replay'][lang]), tag, build(lang), cap))
