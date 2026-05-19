"""
CV Parser using LlamaParse + OpenAI
Extracts structured data from CV PDF/DOCX
"""

import json
import logging
from typing import Dict, Any

from dotenv import load_dotenv
from llama_parse import LlamaParse
from openai import OpenAI

load_dotenv()

logger = logging.getLogger(__name__)

openai_client = OpenAI()


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
        Parse CV file and extract structured data

        Args:
            file_path: Path to CV PDF/DOCX

        Returns:
            Structured CV JSON
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

            structured_data = (
                self.structure_with_openai(
                    raw_text
                )
            )

            structured_data[
                "raw_text"
            ] = raw_text

            return structured_data

        except Exception as e:

            logger.error(
                f"Error parsing CV: {str(e)}"
            )

            raise

    def structure_with_openai(
        self,
        raw_text: str
    ) -> Dict[str, Any]:
        """
        Convert raw CV text into structured JSON
        using OpenAI
        """

        prompt = f"""
        Extract this CV into structured JSON.

        Return ONLY valid JSON.

        Required JSON schema:

        {{
          "name": "",
          "email": "",
          "phone": "",
          "skills": [],
          "experience": [],
          "education": [],
          "certifications": [],
          "projects": [],
          "summary": ""
        }}

        CV CONTENT:
        {raw_text}
        """

        response = (
            openai_client
            .chat
            .completions
            .create(
                model="gpt-4.1-mini",
                messages=[
                    {
                        "role": "system",
                        "content":
                        """
                        You are an expert HR CV parser.
                        Extract structured candidate information accurately.
                        Return ONLY valid JSON.
                        """
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0
            )
        )

        content = (
            response
            .choices[0]
            .message
            .content
        )

        try:

            parsed_json = json.loads(
                content
            )

            return parsed_json

        except Exception:

            logger.error(
                "Failed to parse OpenAI JSON response"
            )

            return {
                "name": "",
                "email": "",
                "phone": "",
                "skills": [],
                "experience": [],
                "education": [],
                "certifications": [],
                "projects": [],
                "summary": "",
                "raw_text": raw_text
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