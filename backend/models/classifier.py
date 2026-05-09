"""
Logistic Regression Classifier
For job category classification
"""

import logging
import pickle
import numpy as np
from typing import Dict, Tuple

logger = logging.getLogger(__name__)

class JobCategoryClassifier:
    def __init__(self, model_path: str = None):
        """
        Initialize classifier
        
        Args:
            model_path: Path to saved model file
        """
        self.model = None
        self.vectorizer = None
        self.classes = None
        
        if model_path:
            self.load_model(model_path)
    
    def load_model(self, model_path: str):
        """Load pre-trained model"""
        try:
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
                self.model = model_data.get('model')
                self.vectorizer = model_data.get('vectorizer')
                self.classes = model_data.get('classes')
            logger.info(f"Model loaded from {model_path}")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
    
    def predict(self, text: str) -> Tuple[str, float]:
        """
        Predict job category
        
        Args:
            text: Job description text
            
        Returns:
            (predicted_category, confidence_score)
        """
        if not self.model or not self.vectorizer:
            logger.warning("Model not loaded")
            return "Unknown", 0.0
        
        try:
            # TODO: Vectorize text and predict
            X = self.vectorizer.transform([text])
            prediction = self.model.predict(X)[0]
            probabilities = self.model.predict_proba(X)[0]
            confidence = max(probabilities)
            
            return prediction, confidence
        except Exception as e:
            logger.error(f"Error predicting: {str(e)}")
            return "Unknown", 0.0
    
    def predict_proba(self, text: str) -> Dict[str, float]:
        """Get probability for each class"""
        if not self.model or not self.vectorizer:
            return {}
        
        try:
            X = self.vectorizer.transform([text])
            probabilities = self.model.predict_proba(X)[0]
            
            result = {}
            for class_label, prob in zip(self.classes, probabilities):
                result[class_label] = float(prob)
            
            return result
        except Exception as e:
            logger.error(f"Error computing probabilities: {str(e)}")
            return {}
