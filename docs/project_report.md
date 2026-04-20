# Project Report: AI-Based Schizophrenia Detection System

## 1. Introduction
The objective of this project is to provide an early warning and detection system for schizophrenia symptoms. By leveraging Machine Learning techniques specifically applied to text and speech inputs, the system identifies potential risk factors and assigns a confidence score along with a risk severity level.

## 2. Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5, Chart.js, jsPDF
- **Backend API**: Node.js, Express.js
- **Machine Learning API**: Python, Flask, Scikit-learn, NLTK
- **Database**: MongoDB (Local / Atlas)

## 3. Methodology
1. **Data Acquisition**: Publicly available datasets dealing with semantic coherence in speech and clinical sentiment are processed.
2. **Preprocessing**: Text is sanitized (removal of stop words, tokenization). Audio features (like spectral changes and pausing patterns, though mocked for this prototype) are extracted.
3. **Model Selection**: Using baseline models (Logistic Regression, Random Forest, SVM) that have shown efficacy in linguistic analysis tasks.
4. **Integration**: A robust REST API bridges the core logic to the frontend user interface, enabling real-time analysis responses.

## 4. Future Enhancements
- Fine-tuning Transformer models (e.g., BERT, RoBERTa) using PyTorch for advanced NLP tasks.
- Integrating a more complex Speech-to-Text layer like OpenAI Whisper for robust transcript generation.
- Full deployment onto AWS or Render with Kubernetes container orchestration.
