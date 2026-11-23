import sys
import unittest
from html.parser import HTMLParser
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import article_figures
from build_articles import Md


class StoryParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.scenes = []
        self.steps = []
        self.navigation = None
        self.controls = None
        self.fictional = False
        self.canvases = 0
        self.static_stage = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = attrs.get('class', '').split()
        if 'data-as-scene' in attrs:
            self.scenes.append(attrs)
        if 'data-as-step' in attrs:
            self.steps.append((tag, attrs))
        if 'as-actions' in classes:
            self.navigation = attrs
        if 'as-canvas' in classes:
            self.canvases += 1
        if 'data-art-story' in attrs:
            self.static_stage = attrs.get('data-stage')
        if 'as-controls' in classes:
            self.controls = attrs
        if 'art-motion-tag' in classes:
            self.fictional = True


class StoryFigureTests(unittest.TestCase):
    def test_bilingual_stories_have_usable_static_fallbacks(self):
        for name in article_figures.STORIES:
            for lang in ('fr', 'en'):
                with self.subTest(figure=name, language=lang):
                    parser = StoryParser()
                    parser.feed(article_figures.figure_html(name, lang, 'Caption'))
                    self.assertTrue(parser.fictional)
                    self.assertEqual(len(parser.scenes), 4)
                    self.assertTrue(all('hidden' not in scene for scene in parser.scenes))
                    self.assertEqual(parser.canvases, 1)
                    self.assertEqual(parser.static_stage, '3')
                    self.assertGreaterEqual(len(parser.steps), 3)
                    for tag, attrs in parser.steps:
                        self.assertEqual(tag, 'button')
                        self.assertEqual(attrs.get('type'), 'button')
                        self.assertEqual(attrs.get('aria-pressed'), 'false')
                        self.assertIn(attrs.get('data-as-step'), ('0', '1', '2', '3'))
                    self.assertIn('hidden', parser.navigation)
                    self.assertTrue(parser.navigation.get('aria-label'))
                    self.assertIn('hidden', parser.controls)

    def test_each_subject_has_a_dedicated_visual(self):
        motifs = {
            'donnees-ia': 'as-refinery',
            'plan-b': 'as-continuity',
            'boucle-agents': 'as-agent-workbench',
            'signaux-expertise': 'as-signal-lab',
        }
        for name, motif in motifs.items():
            with self.subTest(figure=name):
                markup = article_figures.figure_html(name, 'fr', '')
                self.assertIn('class="%s"' % motif, markup)
                self.assertTrue(all('class="%s"' % other not in markup for other in motifs.values() if other != motif))

    def test_markdown_renders_and_registers_each_story(self):
        for name in article_figures.STORIES:
            with self.subTest(figure=name):
                md = Md('articles/example.html', 'example', 'fr')
                fragments = md.blocks([':::figure %s "Légende"' % name], 0)
                self.assertEqual(md.figs, [name])
                self.assertIn('<figcaption>Légende</figcaption>', fragments[0])


if __name__ == '__main__':
    unittest.main()
