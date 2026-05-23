
import logging
import re
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

COMMON_SKILLS: List[str] = [

    "python", "java", "javascript", "typescript", "c++", "c#", "c", "go", "golang",
    "rust", "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "perl",
    "bash", "shell", "powershell",

    "html", "css", "sass", "scss", "bootstrap", "tailwind", "react", "angular",
    "vue", "next.js", "nuxt", "svelte", "jquery", "webpack", "vite",
    "node.js", "nodejs", "express", "fastapi", "flask", "django", "spring",
    "laravel", "rails", "graphql", "rest", "rest api", "soap",

    "machine learning", "deep learning", "nlp", "natural language processing",
    "computer vision", "tensorflow", "pytorch", "keras", "scikit-learn",
    "pandas", "numpy", "scipy", "matplotlib", "seaborn", "plotly",
    "data analysis", "data science", "data engineering", "data visualization",
    "statistics", "probability", "regression", "classification", "clustering",
    "neural network", "transformer", "bert", "llm", "generative ai",
    "feature engineering", "model training", "xgboost", "lightgbm",

    "sql", "mysql", "postgresql", "postgres", "sqlite", "oracle", "sql server",
    "mongodb", "elasticsearch", "redis", "cassandra", "dynamodb", "firebase",
    "bigquery", "snowflake", "databricks", "hive",

    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "helm",
    "terraform", "ansible", "jenkins", "github actions", "ci/cd", "gitlab ci",
    "linux", "unix", "devops", "sre", "microservices", "serverless",

    "android", "ios", "react native", "flutter", "xamarin",

    "git", "github", "gitlab", "jira", "confluence", "notion",
    "figma", "sketch", "adobe xd", "illustrator", "photoshop",
    "tableau", "power bi", "looker", "metabase",

    "agile", "scrum", "kanban", "lean", "six sigma",
    "project management", "product management", "stakeholder management",
    "communication", "teamwork", "leadership", "problem solving",
    "critical thinking", "time management", "adaptability",
]

_SKILL_LIST_SORTED = sorted(COMMON_SKILLS, key=len, reverse=True)

class DataCleaner:

    @staticmethod
    def clean_text(text: str) -> str:
        if not text:
            return ""
        return " ".join(text.split()).strip()

    @staticmethod
    def normalize_skills(skills: List[str]) -> List[str]:
        if not skills:
            return []
        normalized, seen = [], set()
        for skill in skills:
            clean = DataCleaner.clean_text(str(skill)).lower()
            if clean and clean not in seen:
                normalized.append(clean)
                seen.add(clean)
        return normalized

    @staticmethod
    def _coerce_text(value) -> str:
        if isinstance(value, list):
            return " ".join(str(item) for item in value if item)
        return value or ""

    @staticmethod
    def extract_skills_from_text(text: str) -> List[str]:
        if not text:
            return []
        text_lower = text.lower()
        found: List[str] = []
        seen: set = set()
        for skill in _SKILL_LIST_SORTED:

            pattern = r"(?<![a-z0-9+#.])" + re.escape(skill) + r"(?![a-z0-9+#.])"
            if re.search(pattern, text_lower) and skill not in seen:
                found.append(skill)
                seen.add(skill)
        logger.debug("extract_skills_from_text: found %d skills from text", len(found))
        return found

    @staticmethod
    def structure_cv_data(raw_data: Dict[str, Any]) -> Dict[str, Any]:
        name = raw_data.get("name") or raw_data.get("candidate_name", "")
        experience = raw_data.get("experience_text") or raw_data.get("experience", "")
        education = raw_data.get("education_text") or raw_data.get("education", "")
        full_text = raw_data.get("full_text") or raw_data.get("raw_text", "")

        skills = DataCleaner.normalize_skills(raw_data.get("skills", []))

        if not skills and full_text:
            skills = DataCleaner.extract_skills_from_text(full_text)
            if skills:
                logger.debug("CV skill extraction fallback: found %d skills", len(skills))

        structured = {
            "id": raw_data.get("id") or raw_data.get("candidate_id", ""),
            "name": DataCleaner.clean_text(name),
            "email": raw_data.get("email", "").lower().strip(),
            "phone": raw_data.get("phone", ""),
            "skills": skills,
            "experience_text": DataCleaner.clean_text(DataCleaner._coerce_text(experience)),
            "education_text": DataCleaner.clean_text(DataCleaner._coerce_text(education)),
            "summary": DataCleaner.clean_text(raw_data.get("summary", "")),
            "full_text": DataCleaner.clean_text(DataCleaner._coerce_text(full_text)),
        }

        predicted = raw_data.get("predicted_category") or raw_data.get("predicted_label")
        if predicted:
            structured["predicted_category"] = predicted

        logger.debug(
            "structure_cv_data: name=%s skills=%s full_text_len=%d",
            structured["name"], structured["skills"][:5], len(structured["full_text"]),
        )
        return structured

    @staticmethod
    def structure_jd_data(raw_jd: Dict[str, str]) -> Dict[str, Any]:
        job_title = raw_jd.get("job_title") or raw_jd.get("title", "")
        full_text = DataCleaner.clean_text(raw_jd.get("full_text", ""))

        required_skills = DataCleaner.normalize_skills(raw_jd.get("required_skills", []))
        preferred_skills = DataCleaner.normalize_skills(raw_jd.get("preferred_skills", []))

        if not required_skills and full_text:
            required_skills = DataCleaner.extract_skills_from_text(full_text)
            if required_skills:
                logger.info(
                    "JD skill extraction: auto-detected %d skills from text: %s",
                    len(required_skills), required_skills[:10],
                )

        structured = {
            "job_title": DataCleaner.clean_text(job_title),
            "department": DataCleaner.clean_text(raw_jd.get("department", "")),
            "required_skills": required_skills,
            "preferred_skills": preferred_skills,
            "description": DataCleaner.clean_text(raw_jd.get("description", "")),
            "requirements": DataCleaner.clean_text(raw_jd.get("requirements", "")),
            "full_text": full_text,
        }

        if raw_jd.get("job_category"):
            structured["job_category"] = raw_jd["job_category"]

        logger.debug(
            "structure_jd_data: title=%s required_skills=%s",
            structured["job_title"], structured["required_skills"][:10],
        )
        return structured
