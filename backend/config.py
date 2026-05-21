"""
Configuration settings for the application
"""

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    DEBUG = False
    TESTING = False

    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    
    # Upload settings
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB max file size
    ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc', 'txt'}
    
    # LlamaParse settings
    LLAMA_API_KEY = os.getenv('LLAMA_API_KEY', '')
    
    # Model paths
    MODEL_PATH = os.path.join(BASE_DIR, "data", "models")
    EMBEDDINGS_PATH = os.path.join(BASE_DIR, "data", "embeddings")
    
    # ML Model settings
    EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2'
    CLASSIFICATION_MODEL = 'classifier.pkl'

    TFIDF_WORD_PATH = os.getenv(
        "TFIDF_WORD_PATH",
        os.path.join(BASE_DIR, "tfidf_word.pkl")
    )
    TFIDF_CHAR_PATH = os.getenv(
        "TFIDF_CHAR_PATH",
        os.path.join(BASE_DIR, "tfidf_char.pkl")
    )
    LR_CLASSIFIER_PATH = os.getenv(
        "LR_CLASSIFIER_PATH",
        os.path.join(BASE_DIR, "lr_classifier_family.pkl")
    )

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
