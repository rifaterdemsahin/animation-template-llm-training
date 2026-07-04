import os
import pytest
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
SKIP_GEMINI = pytest.mark.skipif(
    not GEMINI_API_KEY,
    reason='GEMINI_API_KEY not set — skipping Gemini-dependent tests'
)


@pytest.fixture
def client():
    from server import app
    app.config['TESTING'] = True
    with app.test_client() as c:
        yield c


class TestHealth:
    def test_health_endpoint(self, client):
        resp = client.get('/api/health')
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['status'] == 'ok'
        assert isinstance(data['geminiReady'], bool)

    def test_static_index_served(self, client):
        resp = client.get('/')
        assert resp.status_code == 200
        assert b'GSAP' in resp.data or b'animation' in resp.data


class TestInfographicGenerator:
    def test_missing_topic_returns_400(self, client):
        resp = client.post('/api/generate/infographic', json={})
        assert resp.status_code == 400
        assert 'topic is required' in resp.get_json()['error']

    def test_invalid_json_returns_400(self, client):
        resp = client.post('/api/generate/infographic',
                           data='not-json',
                           content_type='application/json')
        assert resp.status_code in (400, 415)

    @SKIP_GEMINI
    def test_generates_svg(self, client):
        resp = client.post('/api/generate/infographic', json={
            'topic': 'Microservices vs Monolith',
            'theme': 'dark',
            'animated': True
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert 'svg' in data
        assert data['svg'].startswith('<svg') or 'svg' in data['svg'].lower()
        assert len(data['svg']) > 100

    @SKIP_GEMINI
    def test_light_theme(self, client):
        resp = client.post('/api/generate/infographic', json={
            'topic': 'Event-driven architecture',
            'theme': 'light',
            'style': 'Minimalist'
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert 'svg' in data

    @SKIP_GEMINI
    def test_architectural_style(self, client):
        resp = client.post('/api/generate/infographic', json={
            'topic': 'CQRS pattern',
            'style': 'Architectural diagram with connected blocks'
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert 'svg' in data


class TestAudioGenerator:
    def test_missing_topic_returns_400(self, client):
        resp = client.post('/api/generate/audio', json={})
        assert resp.status_code == 400
        assert 'topic or script is required' in resp.get_json()['error']

    @SKIP_GEMINI
    def test_generates_script(self, client):
        resp = client.post('/api/generate/audio', json={
            'topic': 'How event-driven architecture improves scalability'
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert 'script' in data
        assert len(data['script']) > 50
        assert 'duration' in data
        assert data['duration'] > 0

    @SKIP_GEMINI
    def test_improves_existing_script(self, client):
        resp = client.post('/api/generate/audio', json={
            'script': 'Event-driven architecture helps with scaling. It is good.'
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert 'script' in data
        assert len(data['script']) > len('Event-driven architecture helps with scaling.')


class TestAnimationGenerator:
    def test_missing_topic_returns_400(self, client):
        resp = client.post('/api/generate/animation', json={})
        assert resp.status_code == 400
        assert 'topic is required' in resp.get_json()['error']

    @SKIP_GEMINI
    def test_generates_animation_config(self, client):
        resp = client.post('/api/generate/animation', json={
            'topic': 'CQRS vs Event Sourcing'
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert 'title' in data
        assert 'scenes' in data
        assert len(data['scenes']) >= 1
        scene = data['scenes'][0]
        assert 'title' in scene
        assert 'animation' in scene
        assert 'duration' in scene['animation']
        assert 'ease' in scene['animation']

    @SKIP_GEMINI
    def test_scene_count_respected(self, client):
        resp = client.post('/api/generate/animation', json={
            'topic': 'Microservices architecture',
            'scenes': 3
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert len(data['scenes']) >= 3
        assert len(data['scenes']) <= 6

    @SKIP_GEMINI
    def test_has_metrics_in_final_scene(self, client):
        resp = client.post('/api/generate/animation', json={
            'topic': 'API Gateway pattern',
            'scenes': 4
        })
        assert resp.status_code == 200
        data = resp.get_json()
        last = data['scenes'][-1]
        assert 'metrics' in last
        assert len(last['metrics']) > 0
        for m in last['metrics']:
            assert 'label' in m
            assert 'target' in m


class TestCORSAndErrors:
    def test_unknown_route_returns_static(self, client):
        resp = client.get('/nonexistent.html')
        assert resp.status_code == 404

    def test_large_payload_handled(self, client):
        long_topic = 'architecture ' * 200
        resp = client.post('/api/generate/audio', json={
            'topic': long_topic.strip()
        })
        assert resp.status_code in (200, 400, 503)
