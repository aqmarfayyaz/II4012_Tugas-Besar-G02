
import logging
import re
from pathlib import Path
from typing import Dict, Tuple

import joblib
from scipy.sparse import hstack

logger = logging.getLogger(__name__)

_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

CONFIDENCE_THRESHOLD = 0.75

_DATE_RE = re.compile(
    r"\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)"
    r"(uary|ruary|ch|il|e|y|ust|tember|ober|ember)?\b"
)

def _clean_text(text: str) -> str:
    s = text.lower()
    s = re.sub(r"<[^>]+>",          " ", s)
    s = re.sub(r"\S+@\S+",          " ", s)
    s = re.sub(r"http\S+|www\.\S+", " ", s)
    s = re.sub(r"\b\d{7,}\b",       " ", s)
    s = _DATE_RE.sub(               " ", s)
    s = re.sub(r"\d+",              " ", s)
    s = re.sub(r"[^\w\s+#\.]",      " ", s)
    return re.sub(r"\s+", " ", s).strip()

class JobCategoryClassifier:

    def __init__(self, model_dir: str = None):
        self.model = None
        self.word_vec = None
        self.char_vec = None
        self.classes = None

        dir_path = Path(model_dir) if model_dir else _PROJECT_ROOT
        self._load(dir_path)

    def _load(self, model_dir: Path):
        try:
            self.model    = joblib.load(model_dir / "lr_classifier_family.pkl")
            self.word_vec = joblib.load(model_dir / "tfidf_word.pkl")
            self.char_vec = joblib.load(model_dir / "tfidf_char.pkl")
            self.classes  = list(self.model.classes_)
            logger.info(f"Classifier loaded from {model_dir}")
        except FileNotFoundError:
            logger.warning(
                "Classifier pkl files not found in %s. "
                "Run II4012_M01_G02_Modelling_LogReg.ipynb to generate them.",
                model_dir,
            )
        except Exception as e:
            logger.error("Error loading classifier: %s", e)

    @property
    def is_loaded(self) -> bool:
        return (
            self.model is not None
            and self.word_vec is not None
            and self.char_vec is not None
        )

    def _features(self, text: str):
        cleaned = _clean_text(text)
        xw = self.word_vec.transform([cleaned])
        xc = self.char_vec.transform([cleaned])
        return hstack([xw, xc]).tocsr()

    def predict(self, text: str) -> Tuple[str, float]:
        if not self.is_loaded:
            return "Unknown", 0.0
        try:
            feat = self._features(text)
            prediction    = self.model.predict(feat)[0]
            probabilities = self.model.predict_proba(feat)[0]
            confidence    = float(max(probabilities))
            return prediction, confidence
        except Exception as e:
            logger.error("Error predicting: %s", e)
            return "Unknown", 0.0

    def predict_proba(self, text: str) -> Dict[str, float]:
        if not self.is_loaded:
            return {}
        try:
            feat = self._features(text)
            probabilities = self.model.predict_proba(feat)[0]
            return dict(
                sorted(
                    zip(self.classes, probabilities.round(4).tolist()),
                    key=lambda x: -x[1],
                )
            )
        except Exception as e:
            logger.error("Error computing probabilities: %s", e)
            return {}
