import os
import pickle
from flask import Flask, request, jsonify
try:
    from model_utils import clean_text, extract_audio_features
except ImportError:
    print("Warning: ML libraries not installed correctly. Using mock fallback.")
    clean_text = lambda x: x
    extract_audio_features = lambda x: [0.5]*13

app = Flask(__name__)

# Try to load models on startup
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
vectorizer = None
model = None

try:
    with open(os.path.join(MODEL_DIR, 'vectorizer.pkl'), 'rb') as f:
        vectorizer = pickle.load(f)
    with open(os.path.join(MODEL_DIR, 'model_lr.pkl'), 'rb') as f:
        model = pickle.load(f)
except FileNotFoundError:
    print("Warning: Models not found. Run train.py first. Proceeding without active models (will return mock results).")

@app.route('/predict_text', methods=['POST'])
def predict_text():
    data = request.json
    text = data.get('text', '')
    
    if not text:
        return jsonify({"error": "No text provided"}), 400
        
    if vectorizer and model:
        # Real inference
        cleaned = clean_text(text)
        vec = vectorizer.transform([cleaned])
        
        # Logistic Regression probability
        prob = model.predict_proba(vec)[0]
        risk_score = float(prob[1]) * 100 # probability of class 1
        
        if risk_score > 70:
            level = "High"
        elif risk_score > 40:
            level = "Medium"
        else:
            level = "Low"
            
        return jsonify({
            "confidence_score": risk_score,
            "risk_level": level,
            "recommendation": "Consult a medical professional." if risk_score > 40 else "No immediate risk detected."
        })
    else:
        # Fallback Mock
        if "watch" in text.lower() or "voice" in text.lower():
            return jsonify({"confidence_score": 85.5, "risk_level": "High", "recommendation": "Consult a medical professional immediately."})
        return jsonify({"confidence_score": 12.3, "risk_level": "Low", "recommendation": "No immediate risk detected."})


@app.route('/predict_audio', methods=['POST'])
def predict_audio():
    if 'file' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
        
    audio_file = request.files['file']
    # Save temporarily to extract features
    filepath = os.path.join("/tmp" if os.name != 'nt' else os.path.join(os.environ['TEMP']), audio_file.filename)
    audio_file.save(filepath)
    
    try:
        features = extract_audio_features(filepath)
        # Mocking classification based on features
        mock_score = sum(features) * 5
        level = "High" if mock_score > 70 else "Medium" if mock_score > 40 else "Low"
        
        return jsonify({
            "confidence_score": min(mock_score, 100),
            "risk_level": level,
            "recommendation": "Consult a medical professional." if mock_score > 40 else "No immediate risk detected."
        })
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
