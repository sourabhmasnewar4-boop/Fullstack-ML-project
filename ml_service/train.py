import json
import os
import pickle
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

from model_utils import clean_text

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))

def train_dummy_model():
    """
    Trains a mock model and saves it. 
    Replace `texts` and `labels` with actual DataFrame loaded from CSV for real scenarios.
    """
    print("Training mock models for Schizophrenia Detection...")
    
    # Mock data
    texts = [
        "I hear voices that tell me to hide, someone is watching.",
        "I had a great day at school, the weather was nice.",
        "They implanted chips in my brain, the government can listen.",
        "I am looking forward to my vacation next week.",
        "The shadows are forming words, the television speaks directly to me.",
        "My dog likes to play with his chew toy in the garden.",
        "I am afraid these people are following me, I see signs everywhere.",
        "I need to buy groceries: milk, eggs, bread."
    ]
    labels = [1, 0, 1, 0, 1, 0, 1, 0] # 1 = Risk, 0 = Normal
    
    # Clean text
    cleaned_texts = [clean_text(t) for t in texts]
    
    # TF-IDF Vectorization
    vectorizer = TfidfVectorizer(max_features=5000)
    X = vectorizer.fit_transform(cleaned_texts)
    
    X_train, X_test, y_train, y_test = train_test_split(X, labels, test_size=0.2, random_state=42)
    
    # 1. Logistic Regression
    lr = LogisticRegression()
    lr.fit(X_train, y_train)
    print(f"LR Accuracy: {accuracy_score(y_test, lr.predict(X_test)):.2f}")
    
    # 2. Random Forest
    rf = RandomForestClassifier(n_estimators=10)
    rf.fit(X_train, y_train)
    print(f"RF Accuracy: {accuracy_score(y_test, rf.predict(X_test)):.2f}")
    
    # 3. SVM
    svm_model = SVC(probability=True)
    svm_model.fit(X_train, y_train)
    print(f"SVM Accuracy: {accuracy_score(y_test, svm_model.predict(X_test)):.2f}")
    
    # Save the models
    with open(os.path.join(MODEL_DIR, "vectorizer.pkl"), "wb") as f:
        pickle.dump(vectorizer, f)
    with open(os.path.join(MODEL_DIR, "model_lr.pkl"), "wb") as f:
        pickle.dump(lr, f)
        
    print("Models saved successfully in ml_service directory.")

if __name__ == "__main__":
    train_dummy_model()
