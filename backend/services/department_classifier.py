
from typing import Dict, List

class DepartmentClassifier:
    def __init__(self) -> None:
        self.keyword_map: Dict[str, List[str]] = {
            "engineering": [
                "software", "developer", "engineer", "backend", "frontend",
                "full stack", "api", "python", "java", "node", "react",
                "devops", "cloud", "aws", "docker", "kubernetes",
                "database", "sql", "microservices"
            ],
            "data": [
                "data", "machine learning", "ml", "ai", "analytics",
                "analysis", "modeling", "statistics", "etl", "pipeline",
                "data engineer", "data scientist", "nlp"
            ],
            "product": [
                "product", "roadmap", "stakeholder", "discovery",
                "requirements", "prioritization", "go-to-market"
            ],
            "design": [
                "design", "ui", "ux", "figma", "prototype", "visual",
                "interaction", "user research"
            ],
            "marketing": [
                "marketing", "seo", "campaign", "brand", "content",
                "social media", "growth"
            ],
            "sales": [
                "sales", "account", "quota", "lead", "crm",
                "pipeline", "closing"
            ],
            "hr": [
                "human resources", "recruitment", "talent", "payroll",
                "employee", "people"
            ]
        }

    def classify(self, text: str) -> str:
        if not text:
            return "Unknown"

        normalized = text.lower()
        best_department = "Unknown"
        best_score = 0

        for department, keywords in self.keyword_map.items():
            score = 0
            for keyword in keywords:
                if keyword in normalized:
                    score += 1
            if score > best_score:
                best_score = score
                best_department = department

        return best_department.title() if best_score > 0 else "Unknown"
