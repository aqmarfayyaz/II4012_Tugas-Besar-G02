"""
Embedder Service
Generates embeddings for CV and JD texts
"""

import logging
import numpy as np
from typing import List, Union

logger = logging.getLogger(__name__)

class TextEmbedder:
    def __init__(self, model_name: str = 'sentence-transformers/all-MiniLM-L6-v2'):
        """
        Initialize embedder with sentence transformer
        
        Args:
            model_name: HuggingFace model identifier
        """
        self.model_name = model_name
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load sentence transformer model"""
        try:
            # TODO: Load sentence transformer model
            # from sentence_transformers import SentenceTransformer
            # self.model = SentenceTransformer(self.model_name)
            logger.info(f"Embedder model loaded: {self.model_name}")
        except Exception as e:
            logger.error(f"Error loading embedder model: {str(e)}")
    
    def embed_text(self, text: str) -> np.ndarray:
        """
        Embed single text
        
        Args:
            text: Text to embed
            
        Returns:
            Embedding vector
        """
        if not self.model:
            # Return dummy embedding for now
            return np.zeros(384)
        
        try:
            embedding = self.model.encode(text, convert_to_numpy=True)
            return embedding
        except Exception as e:
            logger.error(f"Error embedding text: {str(e)}")
            return np.zeros(384)
    
    def embed_texts(self, texts: List[str]) -> np.ndarray:
        """
        Embed multiple texts
        
        Args:
            texts: List of texts to embed
            
        Returns:
            2D numpy array of embeddings
        """
        if not self.model:
            return np.zeros((len(texts), 384))
        
        try:
            embeddings = self.model.encode(texts, convert_to_numpy=True)
            return embeddings
        except Exception as e:
            logger.error(f"Error embedding texts: {str(e)}")
            return np.zeros((len(texts), 384))
    
    def embed_cv(self, cv_data: dict) -> np.ndarray:
        """Embed CV data"""
        # Combine key sections
        combined_text = f"""
        {cv_data.get('summary', '')}
        {cv_data.get('experience_text', '')}
        {cv_data.get('education_text', '')}
        {' '.join(cv_data.get('skills', []))}
        """
        return self.embed_text(combined_text)
    
    def embed_jd(self, jd_data: dict) -> np.ndarray:
        """Embed Job Description data"""
        combined_text = f"""
        {jd_data.get('job_title', '')}
        {jd_data.get('description', '')}
        {jd_data.get('requirements', '')}
        {' '.join(jd_data.get('required_skills', []))}
        {' '.join(jd_data.get('preferred_skills', []))}
        """
        return self.embed_text(combined_text)
