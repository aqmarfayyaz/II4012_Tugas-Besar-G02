"""
Main Flask Application for AI-based CV Screening System
"""

from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from routes import upload, screening, candidates, auth

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Enable CORS for frontend
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(upload.bp)
    app.register_blueprint(screening.bp)
    app.register_blueprint(candidates.bp)
    app.register_blueprint(auth.bp)
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({'status': 'ok', 'message': 'CV Screening System is running'}), 200
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
