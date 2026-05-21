"""
CV Parser using LlamaParse only
Extracts raw text from CV PDF/DOCX
"""

import logging
import re
from typing import Dict, Any

from dotenv import load_dotenv
from llama_parse import LlamaParse

load_dotenv()

logger = logging.getLogger(__name__)

class CVParser:

    def __init__(
        self,
        api_key: str = None
    ):
        """
        Initialize CV Parser
        """

        self.api_key = api_key

        self.parser = LlamaParse(
            api_key=api_key,
            result_type="markdown",
            parsing_instruction="""
            Extract CV content accurately.
            Preserve:
            - education
            - experience
            - skills
            - certifications
            - projects
            - achievements
            """
        )

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

            logger.info(
                f"Parsing CV: {file_path}"
            )

            documents = (
                self.parser.load_data(
                    file_path
                )
            )

            raw_text = "\n".join([
                doc.text
                for doc in documents
            ])

            structured_data = self.structure_with_heuristics(raw_text)
            structured_data["raw_text"] = raw_text
            return structured_data

        except Exception as e:

            logger.error(
                f"Error parsing CV: {str(e)}"
            )

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

    def extract_sections(
        self,
        text: str
    ) -> Dict[str, str]:
        """
        Extract basic CV sections
        """

        sections = {
            "summary": "",
            "experience": "",
            "education": "",
            "skills": ""
        }

        text_lower = text.lower()

        if "summary" in text_lower:
            sections["summary"] = text

        if "experience" in text_lower:
            sections["experience"] = text

        if "education" in text_lower:
            sections["education"] = text

        if "skills" in text_lower:
            sections["skills"] = text

        return sections