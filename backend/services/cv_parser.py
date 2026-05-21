"""
CV Parser using pdfplumber/python-docx + OpenAI
Extracts structured data from CV PDF/DOCX without external parsing APIs
"""

import json
import logging
import os
import re
from typing import Dict, Any

import pdfplumber
from docx import Document
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

logger = logging.getLogger(__name__)

openai_client = OpenAI()


class CVParser:

    def __init__(self, api_key: str = None):
        self.api_key = api_key

    def parse_cv(
        self,
        file_path: str
    ) -> Dict[str, Any]:

        try:
            logger.info(f"Parsing CV: {file_path}")

            raw_text = self._extract_text(file_path)

            if not raw_text.strip():
                raise ValueError(
                    "Could not extract text from CV file. "
                    "Ensure the file is a readable PDF or DOCX."
                )

            structured_data = self.structure_with_openai(raw_text)
            structured_data["raw_text"] = raw_text

            return structured_data

        except Exception as e:
            logger.error(f"Error parsing CV: {str(e)}")
            raise

    def _extract_text(self, file_path: str) -> str:
        ext = os.path.splitext(file_path)[1].lower()

        if ext == ".pdf":
            return self._extract_pdf(file_path)
        elif ext in (".docx", ".doc"):
            return self._extract_docx(file_path)
        else:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()

    def _extract_pdf(self, file_path: str) -> str:
        text_parts = []
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text)
        return "\n".join(text_parts)

    def _extract_docx(self, file_path: str) -> str:
        doc = Document(file_path)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n".join(paragraphs)

    def structure_with_openai(
        self,
        raw_text: str
    ) -> Dict[str, Any]:

        prompt = f"""
        Extract this CV into structured JSON.

        Return ONLY valid JSON with no markdown, no code blocks.

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
                        "content": (
                            "You are an expert HR CV parser. "
                            "Extract structured candidate information accurately. "
                            "Return ONLY valid JSON with no markdown or code blocks."
                        )
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0
            )
        )

        content = response.choices[0].message.content.strip()

        # Strip markdown code fences if GPT wraps the JSON
        content = re.sub(r"^```(?:json)?\s*", "", content)
        content = re.sub(r"\s*```$", "", content)

        try:
            return json.loads(content)

        except Exception:
            logger.error("Failed to parse OpenAI JSON response")
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
