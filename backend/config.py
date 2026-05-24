
import os
from dotenv import load_dotenv

_dotenv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env')
load_dotenv(_dotenv_path, override=True)

class Config:
    DEBUG = False
    TESTING = False

    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret')
    JWT_SECRET = os.getenv('JWT_SECRET', SECRET_KEY)
    JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')
    JWT_EXP_MINUTES = int(os.getenv('JWT_EXP_MINUTES', '1440'))
    SESSION_COOKIE_SAMESITE = os.getenv('SESSION_COOKIE_SAMESITE', 'Lax')

    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024
    ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc', 'txt'}

    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')

    MODEL_PATH = os.path.join(BASE_DIR, "data", "models")
    EMBEDDINGS_PATH = os.path.join(BASE_DIR, "data", "embeddings")

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

    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000/login')
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', '')
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET', '')
    GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:5000/api/auth/google/callback')

class DevelopmentConfig(Config):
    DEBUG = True

class TestingConfig(Config):
    TESTING = True

class ProductionConfig(Config):
    DEBUG = False
