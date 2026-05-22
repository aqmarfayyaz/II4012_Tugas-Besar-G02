"""
Embedder Service
Generates embeddings for CV and JD texts using OpenAI
"""

import logging
import os
import numpy as np
from typing import List

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

logger = logging.getLogger(__name__)



def _get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        return None
    return OpenAI(api_key=api_key)


class TextEmbedder:

    def __init__(
        self,
        model_name: str = "text-embedding-3-small"
    ):
        """
        Initialize OpenAI embedding model

        Args:
            model_name: OpenAI embedding model
        """

        self.model_name = model_name
        self.client = _get_openai_client()

        if not self.client:
            logger.warning(
                "OPENAI_API_KEY is not set; embedding calls will return zero vectors"
            )

        logger.info(
            f"Embedding model initialized: {model_name}"
        )

    def embed_text(
        self,
        text: str
    ) -> np.ndarray:
        """
        Embed single text using OpenAI

        Args:
            text: Text to embed

        Returns:
            Embedding vector
        """

        try:

            if not self.client:
                return np.zeros(1536)

            response = self.client.embeddings.create(
                model=self.model_name,
                input=text
            )

            embedding = (
                response
                .data[0]
                .embedding
            )

            return np.array(embedding)

        except Exception as e:

            logger.error(
                f"Error embedding text: {str(e)}"
            )

            return np.zeros(1536)

    def embed_texts(
        self,
        texts: List[str]
    ) -> np.ndarray:
        """
        Embed multiple texts

        Args:
            texts: List of texts

        Returns:
            2D embedding array
        """

        try:

            if not self.client:
                return np.zeros((len(texts), 1536))

            response = self.client.embeddings.create(
                model=self.model_name,
                input=texts
            )

            embeddings = [
                item.embedding
                for item in response.data
            ]

            return np.array(embeddings)

        except Exception as e:

            logger.error(
                f"Error embedding texts: {str(e)}"
            )

            return np.zeros(
                (len(texts), 1536)
            )

    @staticmethod
    def _join_field(value) -> str:
        """Coerce list-or-string field to a single string."""
        if isinstance(value, list):
            return ' '.join(str(item) for item in value if item)
        return str(value) if value else ''

    def embed_cv(
        self,
        cv_data: dict
    ) -> np.ndarray:
        """
        Embed CV data.
        Handles both raw keys (experience, education) and
        structured keys (experience_text, education_text, full_text).
        """
        experience = (
            cv_data.get('experience_text') or
            cv_data.get('experience', '')
        )
        education = (
            cv_data.get('education_text') or
            cv_data.get('education', '')
        )

        combined_text = (
            f"Summary: {cv_data.get('summary', '')}\n"
            f"Skills: {' '.join(cv_data.get('skills', []))}\n"
            f"Experience: {self._join_field(experience)}\n"
            f"Education: {self._join_field(education)}\n"
            f"Certifications: {self._join_field(cv_data.get('certifications', []))}\n"
            f"Projects: {self._join_field(cv_data.get('projects', []))}\n"
            f"Full Text: {cv_data.get('full_text', '')}"
        )

        return self.embed_text(combined_text)

    def embed_jd(
        self,
        jd_data: dict
    ) -> np.ndarray:
        """
        Embed Job Description data
        """

        combined_text = f"""
        Job Title:
        {jd_data.get('job_title', '')}

        Description:
        {jd_data.get('description', '')}

        Requirements:
        {jd_data.get('requirements', '')}

        Required Skills:
        {' '.join(jd_data.get('required_skills', []))}

        Preferred Skills:
        {' '.join(jd_data.get('preferred_skills', []))}
        """

        return self.embed_text(
            combined_text
        )