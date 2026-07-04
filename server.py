import os
import re
import json
import xml.etree.ElementTree as ET

from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

app = Flask(__name__, static_folder='.')

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
PORT = int(os.getenv('PORT', 5000))

model = None
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
    print('Gemini API initialized')
else:
    print('WARNING: No GEMINI_API_KEY set — generators unavailable')


def validate_svg(svg_text):
    cleaned = svg_text.strip()
    try:
        ET.fromstring(cleaned)
        return cleaned
    except ET.ParseError as e:
        closing_match = re.search(r'</svg>\s*$', cleaned)
        if not closing_match:
            cleaned += '</svg>'
        cleaned = re.sub(r'</(\w+)>(?!.*</\1>)', '', cleaned)
        try:
            ET.fromstring(cleaned)
            return cleaned
        except ET.ParseError:
            return svg_text


@app.route('/api/health')
def health():
    return jsonify({'status': 'ok', 'geminiReady': model is not None})


@app.route('/api/generate/infographic', methods=['POST'])
def generate_infographic():
    if not model:
        return jsonify({'error': 'Gemini API not configured'}), 503

    data = request.get_json(silent=True) or {}
    topic = data.get('topic', '').strip()
    if not topic:
        return jsonify({'error': 'topic is required'}), 400

    style = data.get('style', '')
    theme = data.get('theme', 'dark')
    animated = data.get('animated', False)

    color_scheme = (
        'Light background (#ffffff), dark text (#1a1a2e), accent colors (#0066cc, #00aa88, #cc4400)'
        if theme == 'light' else
        'Dark background (#1a1a2e), light text (#e0e0e0), accent colors (#00d4aa, #e94560, #e8c766)'
    )

    anim_guide = ''
    if animated:
        anim_guide = (
            '- Add data-target="VALUE" attributes to key numeric elements for GSAP counter animation\n'
            '- Group animated elements with <g class="anim-fade-in">, <g class="anim-scale">, '
            'or <g class="anim-slide-up"> for GSAP selector targets\n'
            '- Each animated group should have an id for GSAP targeting'
        )

    prompt = (
        f'You are an expert infographic designer. Create a professional SVG infographic about: "{topic}".\n\n'
        'Requirements:\n'
        '- Return ONLY valid SVG markup inside ```svg ... ``` code blocks\n'
        '- Use viewBox="0 0 800 600"\n'
        '- Include a clear title, data points, section headings, and visual hierarchy\n'
        f'- Use a cohesive color palette: {color_scheme}\n'
        '- Format with proper <g> grouping and semantic elements\n'
        '- Make it self-contained with all text visible\n'
        f'{anim_guide}\n'
        + (f'\nStyle guidance: {style}' if style else '')
    )

    try:
        response = model.generate_content(prompt)
        text = response.text

        match = re.search(r'```svg\n?(.*?)```', text, re.DOTALL)
        svg = match.group(1).strip() if match else text.strip()
        svg = validate_svg(svg)

        return jsonify({'svg': svg})
    except Exception as e:
        print('Infographic generation failed:', e)
        return jsonify({'error': str(e)}), 500


@app.route('/api/generate/audio', methods=['POST'])
def generate_audio():
    if not model:
        return jsonify({'error': 'Gemini API not configured'}), 503

    data = request.get_json(silent=True) or {}
    topic = data.get('topic', '').strip()
    script = data.get('script', '').strip()

    if not topic and not script:
        return jsonify({'error': 'topic or script is required'}), 400

    prompt = (
        f'Improve the following narration script for clarity and impact. '
        f'Keep it concise (30-60 seconds when read aloud). Return only the improved script:\n\n{script}'
        if script else
        f'Write a professional narration script about: "{topic}". '
        f'The script should be 30-60 seconds when read aloud. '
        f'Return only the script text, no additional commentary or formatting.'
    )

    try:
        response = model.generate_content(prompt)
        generated = response.text.strip()

        word_count = len(generated.split())
        estimated_duration = max(1, (word_count + 74) // 150 * 60 // 60 * 60)

        return jsonify({'script': generated, 'duration': estimated_duration})
    except Exception as e:
        print('Audio generation failed:', e)
        return jsonify({'error': str(e)}), 500


@app.route('/api/generate/animation', methods=['POST'])
def generate_animation():
    if not model:
        return jsonify({'error': 'Gemini API not configured'}), 503

    data = request.get_json(silent=True) or {}
    topic = data.get('topic', '').strip()
    if not topic:
        return jsonify({'error': 'topic is required'}), 400

    scene_count = min(max(int(data.get('scenes', 4)), 1), 6)

    prompt = (
        f'You are a GSAP animation director. Generate a complete cinematic animation configuration '
        f'for a {scene_count}-scene architectural demo about: "{topic}".\n\n'
        'Return ONLY valid JSON. No markdown, no code fences.\n\n'
        'The JSON structure must be:\n'
        '{\n'
        '  "title": "Overall demo title",\n'
        '  "totalDuration": <total seconds for all scenes>,\n'
        '  "modelName": "Name of recommended AI model/architecture",\n'
        '  "scenes": [\n'
        '    {\n'
        '      "id": 1,\n'
        '      "title": "Scene 1 title (setup/title card)",\n'
        '      "subtitle": "Short subtitle / problem statement",\n'
        '      "description": "One-sentence description",\n'
        '      "badges": ["🏷️ Badge1", "🏷️ Badge2"],\n'
        '      "antiPattern": "Anti-pattern name",\n'
        '      "solutionName": "Solution name",\n'
        '      "animation": { "duration": 0.8, "ease": "power2.out", "stagger": 0.15 }\n'
        '    },\n'
        '    {\n'
        '      "id": 2,\n'
        '      "title": "Scene 2 title (problem / naive fails)",\n'
        '      "description": "Describe the anti-pattern consequences",\n'
        '      "badges": ["❌ Problem 1", "❌ Problem 2", "❌ Problem 3"],\n'
        '      "failureScenario": "What happens when naive approach fails",\n'
        '      "failureConsequence": "The failure consequence",\n'
        '      "warningMessage": "Warning overlay message",\n'
        '      "animation": { "duration": 0.8, "ease": "power2.out", "stagger": 0.15 }\n'
        '    },\n'
        '    {\n'
        '      "id": 3,\n'
        '      "title": "Scene 3 title (solution / resilient wins)",\n'
        '      "description": "Describe the solution",\n'
        '      "pillars": [\n'
        '        { "icon": "🛡️", "title": "Pillar 1 Title", "description": "Pillar 1 description" },\n'
        '        { "icon": "⚡", "title": "Pillar 2 Title", "description": "Pillar 2 description" },\n'
        '        { "icon": "📊", "title": "Pillar 3 Title", "description": "Pillar 3 description" }\n'
        '      ],\n'
        '      "successMessage": "✅ Success scenario description",\n'
        '      "animation": { "duration": 0.7, "ease": "back.out(1.7)", "stagger": 0.25 }\n'
        '    },\n'
        '    {\n'
        '      "id": 4,\n'
        '      "title": "The Results",\n'
        '      "description": "Performance metrics description",\n'
        '      "metrics": [\n'
        '        { "label": "⚡ Metric 1", "unit": "%", "target": 75 },\n'
        '        { "label": "🛡️ Metric 2", "unit": "%", "target": 100 },\n'
        '        { "label": "📈 Metric 3", "unit": "%", "target": 95 }\n'
        '      ],\n'
        '      "animation": { "duration": 0.8, "ease": "elastic.out(1, 0.3)", "stagger": 0.2 }\n'
        '    }\n'
        '  ]\n'
        '}\n\n'
        f'Generate exactly {scene_count} scenes. Scene 1 is always the setup/title card, '
        f'scene 4 (or last) is always metrics. Fill scenes 2-3+ with problem/solution content '
        f'appropriate to the topic.\n'
        f'Make all text specific to "{topic}" — no generic placeholders.'
    )

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        cleaned = re.sub(r'```(?:json)?\n?', '', text)
        config = json.loads(cleaned)
        return jsonify(config)
    except Exception as e:
        print('Animation generation failed:', e)
        return jsonify({'error': str(e)}), 500


@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)


if __name__ == '__main__':
    print(f'Server running on port {PORT}')
    app.run(host='0.0.0.0', port=PORT, debug=True)
