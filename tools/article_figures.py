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


# --------------------------------------------------------------------------- récits interactifs
STORIES = {
    'donnees-ia': {
        'fr': dict(
            code='DATA / PRÉPARATION', nav='Étapes de préparation des données',
            steps=(
                ('Sources', 'Rassembler sans confondre', 'Chaque source a son rôle, son format et son histoire.'),
                ('Diagnostic', 'Repérer les écarts', 'Un doublon apparent ou une valeur absente demande une vérification.'),
                ('Préparer', 'Rendre les règles explicites', 'Les formats sont harmonisés, les écarts vérifiés et le contexte conservé.'),
                ('Partager', 'Éclairer les usages', 'Les métiers et, si nécessaire, l’IA utilisent des données dont les limites sont connues.'),
            ),
            sources='Sources', source_items=('Fichiers', 'Relevés', 'Logiciels'),
            processing='Préparation', targets='Usages', target_items=('Métiers', 'IA'),
            actions=((0, 'Collecter'), (1, 'Inspecter'), (2, 'Appliquer les règles'), (3, 'Distribuer')),
            raw='Lot reçu', clean='Lot contrôlé', date='Date', duplicate='Doublon à vérifier avec les métiers',
            pending='À compléter', rule='Formats harmonisés · doublon confirmé écarté',
            note='Une valeur absente n’est pas inventée : B-04 reste à compléter.',
        ),
        'en': dict(
            code='DATA / PREPARATION', nav='Data preparation steps',
            steps=(
                ('Sources', 'Bring sources together', 'Each source has its own purpose, format and history.'),
                ('Diagnosis', 'Identify discrepancies', 'An apparent duplicate or a missing value needs checking.'),
                ('Prepare', 'Make the rules explicit', 'Formats are harmonised, discrepancies checked and context retained.'),
                ('Share', 'Support different uses', 'Business teams and, where useful, AI use data with known limitations.'),
            ),
            sources='Sources', source_items=('Files', 'Records', 'Systems'),
            processing='Preparation', targets='Uses', target_items=('Teams', 'AI'),
            actions=((0, 'Collect'), (1, 'Inspect'), (2, 'Apply rules'), (3, 'Distribute')),
            raw='Incoming batch', clean='Checked batch', date='Date', duplicate='Duplicate to check with business teams',
            pending='To complete', rule='Formats aligned · confirmed duplicate removed',
            note='Missing data is not invented: B-04 still needs completing.',
        ),
    },
    'plan-b': {
        'fr': dict(
            code='CONTINUITÉ / PLAN B', nav='Étapes du scénario de continuité',
            steps=(
                ('Nominal', 'Un service au quotidien', 'Une équipe utilise un service et dépend de son accès.'),
                ('Incident', 'Le service devient indisponible', 'L’activité habituelle s’interrompt ; la cause et la durée restent inconnues.'),
                ('Repli', 'Activer un mode préparé', 'Une copie protégée et une procédure testée peuvent soutenir une partie du travail.'),
                ('Reprise', 'Vérifier avant de revenir', 'Les modifications sont rapprochées avant le retour au fonctionnement normal.'),
            ),
            team='Équipe', service='Service', activity='Activité', fallback='Mode dégradé préparé',
            options=('Copie protégée', 'Procédure'), states=('Disponible', 'Indisponible', 'Indisponible', 'Vérification'),
            actions=((1, 'Simuler une coupure'), (2, 'Activer le repli'), (3, 'Rétablir et vérifier')),
            work=('En cours', 'En attente', 'Partielle', 'Reprise contrôlée'),
            checks=('Accès', 'Intégrité', 'Rapprochement'),
            note='Scénario préparé et fictif, pas une bascule automatique garantie.',
        ),
        'en': dict(
            code='CONTINUITY / PLAN B', nav='Continuity scenario steps',
            steps=(
                ('Normal', 'A service in daily use', 'A team uses a service and depends on access to it.'),
                ('Incident', 'The service becomes unavailable', 'Normal work is interrupted; the cause and duration are unknown.'),
                ('Fallback', 'Use a prepared alternative', 'A protected copy and tested procedure may support part of the work.'),
                ('Recovery', 'Check before returning', 'Changes are reconciled before normal operation resumes.'),
            ),
            team='Team', service='Service', activity='Work', fallback='Prepared fallback',
            options=('Protected copy', 'Procedure'), states=('Available', 'Unavailable', 'Unavailable', 'Verification'),
            actions=((1, 'Simulate an outage'), (2, 'Activate fallback'), (3, 'Restore and check')),
            work=('In progress', 'Waiting', 'Partial', 'Controlled recovery'),
            checks=('Access', 'Integrity', 'Reconciliation'),
            note='A prepared fictional scenario, not a guarantee of automatic failover.',
        ),
    },
    'boucle-agents': {
        'fr': dict(
            code='AGENT / RÉTROACTION', nav='Étapes de la boucle de rétroaction',
            steps=(
                ('Agir', 'Préparer une proposition', 'L’agent produit un brouillon à partir des informations autorisées.'),
                ('Observer', 'Recevoir un retour ciblé', 'Le contrôle signale une date manquante dans le brouillon.'),
                ('Ajuster', 'Réviser sans inventer', 'La date absente reste à confirmer : le brouillon rend l’incertitude visible.'),
                ('Valider', 'Passer le relais à l’humain', 'La proposition ajustée attend toujours une validation humaine.'),
            ),
            human='Humain', human_sub='validation',
            actions=((1, 'Signaler un manque'), (2, 'Ajuster le brouillon'), (3, 'Soumettre à l’humain')),
            report='Compte rendu · brouillon', equipment='Équipement', date='Date',
            missing='Non renseignée', revised='À confirmer', reviewer='Contrôle du brouillon',
            feedback='La date manque. Ne pas l’inventer.', source='Source disponible',
            gate='Validation humaine requise', versions=('Version initiale', 'Version ajustée'),
            note='Simulation : aucun fichier modifié, aucun modèle réentraîné.',
        ),
        'en': dict(
            code='AGENT / FEEDBACK', nav='Feedback loop steps',
            steps=(
                ('Act', 'Prepare a proposal', 'The agent drafts a response using authorised information.'),
                ('Observe', 'Receive targeted feedback', 'A check identifies a missing date in the draft.'),
                ('Adjust', 'Revise without inventing', 'The missing date remains to be confirmed: uncertainty is made explicit.'),
                ('Validate', 'Hand over to a person', 'The revised proposal still requires human approval.'),
            ),
            human='Human', human_sub='review',
            actions=((1, 'Flag missing information'), (2, 'Revise the draft'), (3, 'Submit for human review')),
            report='Report · draft', equipment='Equipment', date='Date',
            missing='Not provided', revised='To confirm', reviewer='Draft review',
            feedback='The date is missing. Do not invent it.', source='Source available',
            gate='Human approval required', versions=('Initial version', 'Revised version'),
            note='Simulation: no file changed, no model retrained.',
        ),
    },
    'signaux-expertise': {
        'fr': dict(
            code='SIGNAL / EXPERTISE', nav='Étapes de l’analyse des signaux',
            steps=(
                ('Signaux', 'Observer les historiques', 'Des mesures et des événements décrivent une partie de l’activité.'),
                ('Contexte', 'Tenir compte du procédé', 'Les réglages, interventions et changements aident à interpréter les données.'),
                ('Analyse', 'Repérer une séquence', 'Un modèle pourrait signaler une séquence inhabituelle, sans en prouver la cause.'),
                ('Expertise', 'Soumettre une hypothèse', 'Une personne examine les indices avant toute décision.'),
            ),
            labels=('Signaux', 'Contexte', 'Analyse', 'Expertise'),
            context=('Cadence', 'Intervention', 'Réglage'), output='À examiner',
            actions=((1, 'Ajouter le contexte'), (2, 'Analyser la séquence'), (3, 'Examiner l’hypothèse')),
            signals=('Vibration', 'Température'), window='Séquence inhabituelle',
            event='Changement de cadence', hypothesis='Hypothèse, pas diagnostic',
            note='Signaux fictifs : une anomalie ne prouve ni une panne ni sa cause.',
        ),
        'en': dict(
            code='SIGNAL / EXPERTISE', nav='Signal analysis steps',
            steps=(
                ('Signals', 'Observe historical records', 'Measurements and events describe part of the activity.'),
                ('Context', 'Account for the process', 'Settings, interventions and changes help interpret the data.'),
                ('Analysis', 'Spot a sequence', 'A model might flag an unusual sequence, without proving its cause.'),
                ('Expertise', 'Submit a hypothesis', 'A person examines the evidence before any decision.'),
            ),
            labels=('Signals', 'Context', 'Analysis', 'Expertise'),
            context=('Speed', 'Intervention', 'Setting'), output='Review needed',
            actions=((1, 'Add context'), (2, 'Analyse the sequence'), (3, 'Examine the hypothesis')),
            signals=('Vibration', 'Temperature'), window='Unusual sequence',
            event='Speed change', hypothesis='Hypothesis, not diagnosis',
            note='Fictional signals: an anomaly proves neither a failure nor its cause.',
        ),
    },
}

STORY_UI = {
    'fr': dict(steps='Simulation interactive', pause='Pause', play='Reprendre', progress='Phase'),
    'en': dict(steps='Interactive simulation', pause='Pause', play='Resume', progress='Phase'),
}


def _data_visual(d):
    sources = ''.join('<span style="--i:%d"><i></i>%s</span>' % (i, esc(x)) for i, x in enumerate(d['source_items']))
    targets = ''.join('<div><span class="as-output-bars"><i></i><i></i><i></i></span><strong>%s</strong></div>'
                      % esc(x) for x in d['target_items'])
    return ('<div class="as-refinery" aria-hidden="true">'
            '<div class="as-intakes"><small>%s</small>%s</div><div class="as-data-rail"></div>'
            '<div class="as-ledger"><div class="as-ledger-title"><span class="as-before">%s</span>'
            '<span class="as-after">%s</span><i class="as-filter"></i></div>'
            '<div class="as-record as-record-head"><span>REF</span><span>%s</span></div>'
            '<div class="as-record"><b>A-17</b><span class="as-before">23/11/26</span><span class="as-after">2026-11-23</span></div>'
            '<div class="as-record as-duplicate"><b>A-17</b><span>23/11/26</span><i>!</i></div>'
            '<div class="as-record as-incomplete"><b>B-04</b><span class="as-before">—</span><span class="as-after">%s</span><i>?</i></div>'
            '<div class="as-scanline"></div><p class="as-dedup-note as-before">%s</p><p class="as-rule as-after">%s</p></div>'
            '<div class="as-data-rail as-data-rail-out"></div>'
            '<div class="as-destinations"><small>%s</small>%s</div></div>'
            % (esc(d['sources']), sources, esc(d['raw']), esc(d['clean']), esc(d['date']),
               esc(d['pending']), esc(d['duplicate']), esc(d['rule']), esc(d['targets']), targets))


def _phase_values(values, cls=''):
    return ''.join('<span class="as-value %s" data-value-stage="%d">%s</span>' % (cls, i, esc(value))
                   for i, value in enumerate(values))


def _plan_visual(d):
    return ('<div class="as-continuity" aria-hidden="true">'
            '<svg class="as-route-map" viewBox="0 0 600 300" preserveAspectRatio="none" focusable="false">'
            '<path class="as-route-base" d="M75 64H525"/><path class="as-route-backup" pathLength="1" d="M75 64V236H525V64"/>'
            '<path class="as-route-main-packet" pathLength="1" d="M75 64H525"/>'
            '<path class="as-route-backup-packet" pathLength="1" d="M75 64V236H525V64"/>'
            '<path class="as-route-sync" pathLength="1" d="M300 226V64"/></svg>'
            '<div class="as-net-top"><div class="as-endpoint"><span class="as-person"></span><strong>%s</strong></div>'
            '<div class="as-cloud"><div class="as-server"><i></i><i></i><i></i></div><small>%s</small>%s'
            '<span class="as-disconnect">×</span></div>'
            '<div class="as-endpoint as-work"><span class="as-work-icon"><i></i><i></i><i></i></span><strong>%s</strong>%s</div></div>'
            '<div class="as-backup"><small>%s</small><div class="as-backup-options">%s</div>'
            '<div class="as-recovery-checks">%s</div></div></div>'
            % (esc(d['team']), esc(d['service']), _phase_values(d['states']), esc(d['activity']),
               _phase_values(d['work']), esc(d['fallback']),
               ''.join('<span>%s</span>' % esc(x) for x in d['options']),
               ''.join('<span style="--i:%d">✓ %s</span>' % (i, esc(x)) for i, x in enumerate(d['checks']))))


def _agent_visual(d):
    return ('<div class="as-agent-workbench" aria-hidden="true"><div class="as-agent-columns">'
            '<div class="as-draft"><small>%s</small><div class="as-version"><span class="as-before">%s</span>'
            '<span class="as-after">%s</span></div><div class="as-document-lines"><i></i><i></i><i></i></div>'
            '<p>%s : <b>P-17</b></p><p class="as-date-edit">%s : <span class="as-before">%s</span>'
            '<strong class="as-after">%s</strong></p></div>'
            '<div class="as-review"><span class="as-review-icon">⌕</span><small>%s</small>'
            '<p>✓ %s</p><div class="as-comment">! %s</div></div></div>'
            '<div class="as-return"><svg viewBox="0 0 600 55" preserveAspectRatio="none" focusable="false">'
            '<path class="as-feedback-path" pathLength="1" d="M495 2V30H125V5M119 13L125 5L131 13"/>'
            '<path class="as-feedback-packet" pathLength="1" d="M495 2V30H125V5"/></svg></div>'
            '<div class="as-human-gate"><span>◇</span><strong>%s</strong><i></i></div></div>'
            % (esc(d['report']), esc(d['versions'][0]), esc(d['versions'][1]), esc(d['equipment']),
               esc(d['date']), esc(d['missing']), esc(d['revised']), esc(d['reviewer']),
               esc(d['source']), esc(d['feedback']), esc(d['gate'])))


def _neural_network():
    return ('<svg viewBox="0 0 112 58" focusable="false"><path class="as-neural-links" '
               'd="M14 12L55 7M14 12L55 29M14 12L55 51M14 29L55 7M14 29L55 29M14 29L55 51'
               'M14 46L55 7M14 46L55 29M14 46L55 51M55 7L98 18M55 7L98 40'
               'M55 29L98 18M55 29L98 40M55 51L98 18M55 51L98 40"/>'
               '<g class="as-neural-nodes"><circle cx="14" cy="12" r="3"/><circle cx="14" cy="29" r="3"/>'
               '<circle cx="14" cy="46" r="3"/><circle cx="55" cy="7" r="3"/>'
               '<circle cx="55" cy="29" r="3"/><circle cx="55" cy="51" r="3"/>'
               '<circle cx="98" cy="18" r="3"/><circle cx="98" cy="40" r="3"/></g></svg>')


def _expert_visual(d):
    return ('<div class="as-signal-lab" aria-hidden="true">'
            '<div class="as-scope"><div class="as-scope-labels"><span>%s</span><span>%s</span></div>'
            '<svg viewBox="0 0 600 180" preserveAspectRatio="none" focusable="false">'
            '<path class="as-scope-grid" d="M0 45H600M0 90H600M0 135H600M100 0V180M200 0V180M300 0V180M400 0V180M500 0V180"/>'
            '<rect class="as-anomaly-window" x="350" y="5" width="100" height="166"/>'
            '<path class="as-wave-vibration" pathLength="1" d="M0 45L20 42L35 53L50 34L65 48L85 41L105 52L125 37L145 47'
            'L165 42L185 53L205 34L225 48L245 41L265 52L285 37L305 47L325 42L345 53L360 18L375 77L390 9L405 83'
            'L420 15L435 70L450 40L470 46L490 39L510 51L530 36L550 48L575 41L600 45"/>'
            '<path class="as-wave-temperature" pathLength="1" d="M0 139L40 137L80 140L120 136L160 138L200 135L240 137'
            'L280 135L320 134L350 130L380 118L410 112L440 120L470 127L500 130L540 134L570 135L600 136"/>'
            '<path class="as-context-marker" d="M350 0V180"/></svg><i class="as-analysis-beam"></i>'
            '<span class="as-window-label">%s</span></div>'
            '<div class="as-context-tags"><strong>%s</strong>%s</div>'
            '<div class="as-inference"><div class="as-neural"><small>%s</small>%s</div>'
            '<span class="as-inference-arrow">→</span><div class="as-hypothesis"><span>◇</span>'
            '<small>%s</small><strong>%s</strong></div></div></div>'
            % (esc(d['signals'][0]), esc(d['signals'][1]), esc(d['window']), esc(d['event']),
               ''.join('<span style="--i:%d">%s</span>' % (i, esc(x)) for i, x in enumerate(d['context'])),
               esc(d['labels'][2]), _neural_network(), esc(d['hypothesis']), esc(d['output'])))


STORY_VISUALS = {
    'donnees-ia': _data_visual,
    'plan-b': _plan_visual,
    'boucle-agents': _agent_visual,
    'signaux-expertise': _expert_visual,
}


def _story(name):
    def build(lang):
        d, ui = STORIES[name][lang], STORY_UI[lang]
        actions = ''.join('<button type="button" data-as-step="%d" aria-pressed="false">%s</button>'
                          % (i, esc(label)) for i, label in d['actions'])
        scenes = ''.join('<div class="as-scene" data-as-scene><div class="as-scene-copy">'
                         '<span class="as-scene-num">%02d / %02d</span><div><h3>%s</h3><p>%s</p></div></div></div>'
                         % (i + 1, len(d['steps']), esc(step[1]), esc(step[2]))
                         for i, step in enumerate(d['steps']))
        return ('<div class="art-story as-sim--%s" data-art-story data-stage="3" data-step-label="%s">'
                '<div class="as-meta"><span><i></i>%s</span><span>%s</span></div>'
                '<div class="as-canvas">%s</div><p class="as-sim-note">%s</p><div class="as-scenes">%s</div>'
                '<div class="as-actions" role="group" aria-label="%s" hidden>%s</div>'
                '<div class="as-controls" hidden><button type="button" data-as-toggle data-pause="%s" data-play="%s">%s</button>'
                '<span class="as-progress" aria-hidden="true"><i data-as-progress></i></span>'
                '<span class="as-count" data-as-count></span></div>'
                '<p class="sr-only" aria-live="polite" data-as-status></p></div>'
                % (name, esc(ui['progress']), esc(d['code']), esc(ui['steps']), STORY_VISUALS[name](d), esc(d['note']),
                   scenes, esc(d['nav']), actions,
                   esc(ui['pause']), esc(ui['play']), esc(ui['pause'])))
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
REGISTRY.update((name, (_story(name), True)) for name in STORIES)


def figure_html(name, lang, caption_html):
    build, fictional = REGISTRY[name]
    tag = '<span class="art-motion-tag">%s</span>' % esc(TXT['tag'][lang]) if fictional else ''
    cap = '<figcaption>%s</figcaption>' % caption_html if caption_html else ''
    return ('<figure class="art-motion art-motion--%s" data-art-fig="%s" data-replay="%s">'
            '<div class="art-motion-stage"><div class="art-motion-bar">%s</div>%s</div>%s</figure>'
            % (name, name, esc(TXT['replay'][lang]), tag, build(lang), cap))
