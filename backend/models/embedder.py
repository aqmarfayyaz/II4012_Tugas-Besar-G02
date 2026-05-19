"""
Embedder Service
Generates embeddings for CV and JD texts using OpenAI
"""

import logging
import numpy as np
from typing import List

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

logger = logging.getLogger(__name__)

client = OpenAI()


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

            response = client.embeddings.create(
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

            response = client.embeddings.create(
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

    def embed_cv(
        self,
        cv_data: dict
    ) -> np.ndarray:
        """
        Embed CV data
        """

        combined_text = f"""
        Summary:
        {cv_data.get('summary', '')}

        Skills:
        {' '.join(cv_data.get('skills', []))}

        Experience:
        {' '.join(cv_data.get('experience', []))}

        Education:
        {' '.join(cv_data.get('education', []))}

        Certifications:
        {' '.join(cv_data.get('certifications', []))}

        Projects:
        {' '.join(cv_data.get('projects', []))}
        """

        return self.embed_text(
            combined_text
        )

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