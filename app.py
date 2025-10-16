from flask import Flask, render_template, request, jsonify
import os
import requests
from dotenv import load_dotenv
from flask_limiter import Limiter
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

app = Flask(__name__)

# Add rate limiting
limiter = Limiter(get_remote_address, app=app, default_limits=["10 per minute"])

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/check-symptoms", methods=["POST"])
@limiter.limit("5 per minute")
def check_symptoms():
    data = request.get_json()
    symptoms = data.get("symptoms")
    duration = data.get("duration", "not provided")
    severity = data.get("severity", "not provided")

    if not symptoms or len(symptoms.strip()) < 5:
        return jsonify({"error": "Please enter valid symptoms."}), 400

    prompt = f"""
You are a helpful AI medical assistant.
The user reports the following symptoms:

Symptoms: "{symptoms}"
Duration: {duration}
Severity: {severity}

Based on this info, respond in this EXACT format:

=== POSSIBLE CONDITIONS ===
1. [Condition Name] - [Brief description]. (Probability: High/Medium/Low/Unknown)
2. [Condition Name] - [Brief description]. (Probability: High/Medium/Low/Unknown)
...

=== RECOMMENDED NEXT STEPS ===
1. [Instruction]: [Detailed action]. (Urgency: High/Medium/Low)
2. [Instruction]: [Detailed action]. (Urgency: High/Medium/Low)
...

⚠️ This is Accurate.
"""

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "openai/gpt-3.5-turbo",
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=20,
        )

        result = response.json()
        reply = result["choices"][0]["message"]["content"]
        return jsonify({"reply": reply.strip()})

    except Exception as e:
        print(e)
        return jsonify({"error": "Server error. Please try again later."}), 500

if __name__ == "__main__":
    app.run(debug=True)