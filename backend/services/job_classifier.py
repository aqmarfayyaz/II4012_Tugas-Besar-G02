"""
Job family classifier using TF-IDF (word + char) and Logistic Regression.
"""

from typing import Dict, List, Optional
import logging

from joblib import load
from scipy.sparse import hstack

logger = logging.getLogger(__name__)


class JobFamilyClassifier:
    def __init__(
        self,
        word_vectorizer_path: str,
        char_vectorizer_path: str,
        classifier_path: str,
    ) -> None:
        self.word_vectorizer_path = word_vectorizer_path
        self.char_vectorizer_path = char_vectorizer_path
        self.classifier_path = classifier_path

        self._word_vectorizer = None
        self._char_vectorizer = None
        self._classifier = None

    def _load(self) -> None:
        if self._word_vectorizer is None:
            self._word_vectorizer = load(self.word_vectorizer_path)
        if self._char_vectorizer is None:
            self._char_vectorizer = load(self.char_vectorizer_path)
        if self._classifier is None:
            self._classifier = load(self.classifier_path)

    def _build_features(self, text: str):
        self._load()
        word_features = self._word_vectorizer.transform([text])
        char_features = self._char_vectorizer.transform([text])
        return hstack([word_features, char_features])

    def predict(self, text: str) -> Dict[str, object]:
        if not text:
            return {
                "label": "Unknown",
                "confidence": 0.0,
                "probabilities": {},
            }

        try:
            features = self._build_features(text)
            label = self._classifier.predict(features)[0]

            confidence = 0.0
            probabilities: Dict[str, float] = {}
            if hasattr(self._classifier, "predict_proba"):
                proba = self._classifier.predict_proba(features)[0]
                classes = list(getattr(self._classifier, "classes_", []))
                probabilities = {
                    str(cls): float(score)
                    for cls, score in zip(classes, proba)
                }
                confidence = float(max(proba)) if len(proba) else 0.0

            return {
                "label": str(label),
                "confidence": confidence,
                "probabilities": probabilities,
            }
        except Exception as exc:
            logger.error(f"Classification error: {exc}")
            return {
                "label": "Unknown",
                "confidence": 0.0,
                "probabilities": {},
            }
