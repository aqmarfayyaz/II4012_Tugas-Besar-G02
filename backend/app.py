"""
Main Flask Application for AI-based CV Screening System
"""

from flask import Flask, jsonify
from flask_cors import CORS
from flasgger import Swagger
from config import Config
from routes import upload, screening, candidates, auth, projects


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    # Enable CORS for frontend
    CORS(app)

    swagger_template = {
        "swagger": "2.0",
        "info": {
            "title": "TalentPulse AI API",
            "description": "API documentation for the CV screening backend",
            "version": "1.0.0",
        },
        "basePath": "/",
        "schemes": ["http"],
        "securityDefinitions": {
            "BearerAuth": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": "Use: Bearer <token>",
            }
        },
        "security": [{"BearerAuth": []}],
    }

    swagger_config = {
        "headers": [],
        "specs": [
            {
                "endpoint": "apispec_1",
                "route": "/apispec_1.json",
                "rule_filter": lambda rule: True,
                "model_filter": lambda tag: True,
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/api/docs/",
    }

    Swagger(app, template=swagger_template, config=swagger_config)

    @app.route("/", methods=["GET"])
    def index():
        """
        Service status
        ---
        tags:
          - Health
        responses:
          200:
            description: Service status
        """
        return jsonify(
            {
                "message": "CV Screening backend is running",
                "health": "/api/health",
                "base_api": "/api",
                "docs": "/api/docs/",
            }
        ), 200

    @app.route("/api", methods=["GET"])
    def api_root():
        """
        API root
        ---
        tags:
          - Health
        responses:
          200:
            description: API root
        """
        return jsonify({"message": "API root", "health": "/api/health"}), 200

    # Register blueprints
    app.register_blueprint(upload.bp)
    app.register_blueprint(screening.bp)
    app.register_blueprint(candidates.bp)
    app.register_blueprint(auth.bp)
    app.register_blueprint(projects.bp)

    # Initialize OAuth clients
    auth.init_oauth(app)

    # Health check endpoint
    @app.route("/api/health", methods=["GET"])
    def health():
        """
        Health check
        ---
        tags:
          - Health
        responses:
          200:
            description: Health status
        """
        return jsonify({"status": "ok", "message": "CV Screening System is running"}), 200

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Internal server error"}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=5000)
