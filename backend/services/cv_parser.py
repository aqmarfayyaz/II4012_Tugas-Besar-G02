"""
CV Parser using pdfplumber/python-docx + OpenAI (with heuristic fallback)
"""

import json
import logging
import os
import re
from typing import Dict, Any, List

import pdfplumber
from docx import Document
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


class CVParser:

    def __init__(self, api_key=None):
        self.api_key = api_key

    def parse_cv(self, file_path):
        try:
            logger.info(f"Parsing CV: {file_path}")
            raw_text = self._extract_text(file_path)
            if not raw_text.strip():
                raise ValueError(
                    "Could not extract text from CV file. "
                    "Ensure the file is a readable (non-scanned) PDF or DOCX."
                )
            structured_data = self._structure(raw_text)
            structured_data["raw_text"] = raw_text
            return structured_data
        except Exception as e:
            logger.error(f"Error parsing CV: {str(e)}")
            raise

    def _extract_text(self, file_path):
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            return self._extract_pdf(file_path)
        elif ext in (".docx", ".doc"):
            return self._extract_docx(file_path)
        else:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()

    def _extract_pdf(self, file_path):
        parts = []
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    parts.append(text)
        return "\n".join(parts)

    def _extract_docx(self, file_path):
        doc = Document(file_path)
        return "\n".join([p.text for p in doc.paragraphs if p.text.strip()])

    def _structure(self, raw_text):
        try:
            from openai import OpenAI
            client = OpenAI()
            return self._structure_with_openai(client, raw_text)
        except Exception as e:
            logger.warning(f"OpenAI structuring failed ({e}); using heuristics")
            return self._structure_with_heuristics(raw_text)

    def _structure_with_openai(self, client, raw_text):
        schema = '{"name":"","email":"","phone":"","skills":[],"experience":[],"education":[],"certifications":[],"projects":[],"summary":""}'
        prompt = (
            "Extract this CV into structured JSON.\n"
            "Return ONLY valid JSON with no markdown, no code blocks.\n\n"
            f"Required schema:\n{schema}\n\n"
            f"CV CONTENT:\n{raw_text}"
        )
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert HR CV parser. "
                        "Return ONLY valid JSON with no markdown or code blocks."
                    )
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0
        )
        content = response.choices[0].message.content.strip()
        content = re.sub(r"^```(?:json)?\s*", "", content)
        content = re.sub(r"\s*```$", "", content)
        return json.loads(content)

    def _structure_with_heuristics(self, raw_text):
        lines = [ln.strip() for ln in raw_text.splitlines() if ln.strip()]
        email = self._find_email(raw_text)
        phone = self._find_phone(raw_text)
        name = self._find_name(lines, email)
        skills = self._find_skills(raw_text)
        summary = self._find_summary(lines)
        education = self._find_education_section(raw_text)
        experience = self._find_experience_section(raw_text)
        return {
            "name": name,
            "email": email,
            "phone": phone,
            "skills": skills,
            "experience": experience,
            "education": education,
            "certifications": [],
            "projects": [],
            "summary": summary,
        }

    @staticmethod
    def _find_email(text):
        m = re.search(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}", text)
        return m.group(0) if m else ""

    @staticmethod
    def _find_phone(text):
        m = re.search(r"(\+?\d[\d\s\-().]{7,}\d)", text)
        return m.group(0).strip() if m else ""

    @staticmethod
    def _find_name(lines, email):
        skip = re.compile(r"(@|resume|curriculum|vitae|\d{4}|http|www|linkedin|github)", re.I)
        for line in lines[:6]:
            if email and email.lower() in line.lower():
                continue
            if skip.search(line):
                continue
            words = line.split()
            if 2 <= len(words) <= 5 and all(re.match(r"[A-Za-z]", w) for w in words):
                return line
        return lines[0] if lines else ""

    @staticmethod
    def _find_skills(text):
        m = re.search(
            r"(?:skills?|technical skills?|core competencies)[:\s]*\n?(.*?)(?:\n{2,}|\Z)",
            text, re.I | re.S
        )
        if m:
            block = m.group(1)
            raw = re.split(r"[,|\n\r]+", block)
            skills = [s.strip(" -+*|") for s in raw]
            skills = [s for s in skills if 2 < len(s) < 50]
            if skills:
                return skills[:30]
        return []

    @staticmethod
    def _find_summary(lines):
        markers = re.compile(r"^(summary|objective|profile|about me)$", re.I)
        for i, line in enumerate(lines):
            if markers.match(line):
                excerpt = " ".join(lines[i + 1: i + 4])
                if len(excerpt) > 20:
                    return excerpt
        for line in lines:
            if len(line) > 80:
                return line
        return ""

    @staticmethod
    def _find_education_section(text):
        m = re.search(
            r"(?:education|academic background)[:\s]*\n?(.*?)(?:\n{2,}|\Z)",
            text, re.I | re.S
        )
        if m:
            entries = [ln.strip() for ln in m.group(1).strip().splitlines() if ln.strip()]
            return entries[:10]
        return []

    @staticmethod
    def _find_experience_section(text):
        m = re.search(
            r"(?:experience|work history|employment)[:\s]*\n?(.*?)(?:\n{2,}|\Z)",
            text, re.I | re.S
        )
        if m:
            entries = [ln.strip() for ln in m.group(1).strip().splitlines() if ln.strip()]
            return entries[:20]
        return []
