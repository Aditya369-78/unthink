# 🩺 Healthcare Symptom Checker

An AI-powered web application that helps users explore possible medical conditions based on their symptoms. Built with *Flask, **OpenRouter AI*, and a clean, responsive UI.

> ⚠ *Important: This tool is for **educational and informational purposes only. It does **not* provide medical advice, diagnosis, or treatment. Always consult a licensed healthcare professional for any health concerns.

---

## ✨ Features

- 🧠 AI analysis of symptoms using *GPT-3.5 Turbo* via [OpenRouter](https://openrouter.ai)
- 📝 Input symptoms, duration, and severity
- 📋 Clear display of *possible conditions* with probability indicators
- 📌 Actionable *recommended next steps* with urgency levels
- 🕒 Local storage of recent analyses (client-side only)
- 🔒 Rate limiting to prevent abuse (10 requests/minute)
- 🌐 Fully responsive design (works on mobile & desktop)
- 🛡 XSS-safe output rendering

---

## 🛠 Tech Stack

- *Backend*: Python 3.8+, Flask
- *AI*: OpenRouter API (GPT-3.5 Turbo)
- *Frontend*: HTML5, CSS3, Vanilla JavaScript
- *Security*: Flask-Limiter, HTML escaping
- *Deployment Ready*: Works on Render, Railway, Fly.io, etc.

---

## 🚀 Quick Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/healthcare-symptom-checker.git
cd healthcare-symptom-checker
