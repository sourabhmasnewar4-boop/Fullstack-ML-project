import nltk
import re
import string
from sklearn.feature_extraction.text import TfidfVectorizer

# Download required NLTK resources
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')
    nltk.download('punkt')

from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

def clean_text(text):
    """
    Cleans the input text for ML processing:
    1. Lowers text
    2. Removes punctuation
    3. Removes stopwords
    """
    text = text.lower()
    text = re.sub(f"[{re.escape(string.punctuation)}]", "", text)
    tokens = word_tokenize(text)
    
    stop_words = set(stopwords.words('english'))
    filtered_tokens = [w for w in tokens if not w in stop_words]
    
    return " ".join(filtered_tokens)

def extract_audio_features(filepath):
    """
    Mock function to extract features from an audio file.
    In a real-world scenario, this would use librosa:
    import librosa
    y, sr = librosa.load(filepath)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    return np.mean(mfcc.T, axis=0)
    """
    import numpy as np
    # Returning mock array of 13 mock MFCCs
    np.random.seed(len(filepath)) # pseudo-deterministic mock
    return np.random.rand(13).tolist()
