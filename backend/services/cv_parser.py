"""
CV Parser using LlamaParse only
Extracts raw text from CV PDF/DOCX
"""

import logging
import re
from typing import Dict, Any

import pdfplumber
from docx import Document
from dotenv import load_dotenv
from llama_parse import LlamaParse

load_dotenv()

logger = logging.getLogger(__name__)

class CVParser:

    def __init__(self, api_key: str = None):
        self.api_key = api_key

    def parse_cv(
        self,
        file_path: str
    ) -> Dict[str, Any]:
        """
        Parse CV file and extract raw text

        Args:
            file_path: Path to CV PDF/DOCX

        Returns:
            Structured CV JSON (basic fields + raw_text)
        """

        try:
            logger.info(f"Parsing CV: {file_path}")

            raw_text = self._extract_text(file_path)

            if not raw_text.strip():
                raise ValueError(
                    "Could not extract text from CV file. "
                    "Ensure the file is a readable PDF or DOCX."
                )

            structured_data = self.structure_with_heuristics(raw_text)
            structured_data["raw_text"] = raw_text
            return structured_data

        except Exception as e:
            logger.error(f"Error parsing CV: {str(e)}")
            raise

    def structure_with_heuristics(
        self,
        raw_text: str
    ) -> Dict[str, Any]:
        """
        Convert raw CV text into a minimal structured JSON
        without external LLMs.
        """

        email_match = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", raw_text)
        phone_match = re.search(r"\+?\d[\d\s\-()]{7,}", raw_text)

        return {
            "name": "",
            "email": email_match.group(0) if email_match else "",
            "phone": phone_match.group(0) if phone_match else "",
            "skills": [],
            "experience": [],
            "education": [],
            "certifications": [],
            "projects": [],
            "summary": "",
        }
