# 🤖 AI-based CV Screening System (TalentPulse AI)

An intelligent recruitment system that uses AI to parse, classify, and match CVs against job descriptions. Features a professional React frontend with Material Design 3, and a Python Flask backend with ML-powered candidate ranking.

## 🎯 Features

- **📄 CV Parsing**: Extract structured data from PDF/DOCX using LlamaParse
- **🧹 Data Cleaning**: Normalize and structure CV data automatically
- **🏷️ Job Classification**: Classify job descriptions using Logistic Regression
- **🔍 Similarity Matching**: Match CVs with JDs using embeddings + cosine similarity
- **📊 Intelligent Ranking**: Rank candidates with detailed scoring breakdown
- **💡 AI Insights**: Human-readable explanations for each match
- **📱 Professional UI**: Enterprise-grade React interface with Tailwind CSS

## 📁 Project Structure

```
II4012_Tugas-Besar-G02/
├── backend/                          # Python Flask Backend
│   ├── app.py                       # Main application
│   ├── config.py                    # Configuration
│   ├── requirements.txt             # Dependencies
│   ├── models/
│   │   ├── classifier.py           # Logistic Regression classifier
│   │   └── embedder.py             # Text embeddings
│   ├── services/
│   │   ├── cv_parser.py            # CV parsing (LlamaParse)
│   │   ├── data_cleaner.py         # Data cleaning
│   │   ├── similarity_scorer.py    # Similarity computation
│   │   └── job_matcher.py          # Matching & ranking logic
│   ├── routes/
│   │   ├── upload.py               # File upload endpoints
│   │   ├── screening.py            # Screening endpoints
│   │   └── candidates.py           # Candidate management
│   └── utils/
│       ├── file_handler.py         # File operations
│       └── helpers.py              # Helper functions
│
├── frontend/                         # React Frontend
│   ├── public/                      # Static files
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx          # Main wrapper
│   │   │   ├── Sidebar.jsx         # Navigation menu
│   │   │   ├── TopNavBar.jsx       # Header bar
│   │   │   ├── ResultsTable.jsx    # Ranking table
│   │   │   ├── InsightPanel.jsx    # Analysis panel
│   │   │   └── CandidateCard.jsx   # Candidate item
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Main screening page
│   │   │   └── CandidateDetail.jsx # Profile view
│   │   ├── services/
│   │   │   └── api.js             # API integration
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── reference/                  # Design references (HTML)
│
├── data/                            # ML Models & Data
│   ├── models/                      # Trained models
│   ├── embeddings/                 # Pre-computed embeddings
│   └── processed/                  # Cleaned datasets
│
├── Datasets/                        # Raw data
│   ├── resume_dataset_1200.csv
│   └── Resume.csv
│
├── notebooks/                       # Jupyter notebooks
│   └── II4012_M01_G02_DataUnderstanding_DataPreparation.ipynb
│
├── prepared_*.csv                   # Prepared datasets
├── .env.example                     # Environment template
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- pip / npm

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp ../.env.example .env
# Edit .env and add your LLAMA_API_KEY
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

### Running the Application

**Terminal 1 - Start Backend Server:**
```bash
cd backend
python app.py
# Server runs on http://localhost:5000
```

**Terminal 2 - Start Frontend Dev Server:**
```bash
cd frontend
npm start
# App opens on http://localhost:3000
```

## 📚 API Documentation

### Upload Endpoints
- `POST /api/upload/cv` - Upload and parse CV file
  - Request: multipart/form-data (file)
  - Response: `{ candidate_id, candidate_name, email, skills, summary }`

- `POST /api/upload/jd` - Upload or paste job description
  - Request: multipart/form-data (file) or JSON (text)
  - Response: `{ jd_id, job_title, required_skills, preferred_skills }`

### Screening Endpoints
- `POST /api/screening/match` - Match single CV against JD
  - Request: `{ cv_data, jd_data }`
  - Response: `{ overall_score, similarity_score, skill_score, skill_details, insight }`

- `POST /api/screening/rank` - Rank multiple candidates
  - Request: `{ candidates, jd_data }`
  - Response: `{ ranked_candidates: [{ rank, name, overall_score, ... }] }`

### Candidate Management
- `GET /api/candidates` - Get all candidates
- `GET /api/candidates/<id>` - Get candidate details
- `POST /api/candidates` - Create candidate
- `DELETE /api/candidates/<id>` - Delete candidate

### Health Check
- `GET /api/health` - System status

## 🎨 Design System

**Theme**: Material Design 3
- **Colors**: Custom palette defined in `tailwind.config.js`
- **Typography**: Inter font family
- **Icons**: Material Symbols Outlined
- **Framework**: Tailwind CSS v3+

See `frontend/reference/DESIGN_REFERENCES.md` for design documentation.

## 🔧 Tech Stack

### Backend
- **Framework**: Flask 2.3
- **ML/NLP**: 
  - Sentence Transformers (embeddings)
  - Scikit-learn (classification)
  - LlamaParse (CV parsing)
- **Database**: In-memory (expandable to PostgreSQL)
- **API**: REST with CORS

### Frontend
- **Framework**: React 18
- **Styling**: Tailwind CSS v3
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Material Symbols Google Fonts

## 🛠️ Development

### Adding New Features

**Backend Service:**
1. Create service class in `backend/services/`
2. Add route in `backend/routes/`
3. Update API documentation

**Frontend Component:**
1. Create component in `src/components/` or `src/pages/`
2. Update API calls in `src/services/api.js` if needed
3. Style using Tailwind utilities

### File Upload Settings
- Max file size: 50MB
- Allowed formats: PDF, DOCX, DOC, TXT

### Database Integration
Currently uses in-memory storage. To add persistent database:
1. Install SQLAlchemy: `pip install flask-sqlalchemy`
2. Create models in `backend/models/`
3. Update `backend/routes/` to use database

## 🧪 Testing

### Manual API Testing (Postman/cURL)
```bash
# Test health check
curl http://localhost:5000/api/health

# Test CV upload
curl -X POST -F "file=@sample.pdf" http://localhost:5000/api/upload/cv
```

## 📋 Configuration

**Backend Config** (`backend/config.py`):
- `DEBUG` - Enable/disable debug mode
- `UPLOAD_FOLDER` - File upload directory
- `MAX_CONTENT_LENGTH` - Max file size (50MB)
- `LLAMA_API_KEY` - LlamaParse API key

**Frontend Config** (`.env`):
- `REACT_APP_API_URL` - Backend API base URL

## 🤝 Team

**Team II4012 - G02**

Members:
- (Add team member names)

## 📄 License

MIT License - See LICENSE file for details

## 📚 Additional Resources

- [Material Design 3](https://m3.material.io/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [Sentence Transformers](https://www.sbert.net/)

---

**Last Updated**: May 2, 2026
**Status**: Development Phase
