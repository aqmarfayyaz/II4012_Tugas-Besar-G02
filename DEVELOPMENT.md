# Development Guide

## Project Overview

This is a full-stack AI-powered CV Screening System with React frontend and Python Flask backend.

## Quick Start

### 1. Initial Setup

```bash
# Clone repository
git clone <repo-url>
cd II4012_Tugas-Besar-G02

# Backend setup
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Create .env file
cp ../.env.example .env
# Add your LLAMA_API_KEY to .env

# Frontend setup (new terminal)
cd frontend
npm install
```

### 2. Running Development Servers

**Backend (Terminal 1):**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app.py
# Server: http://localhost:5000
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm start
# App: http://localhost:3000
```

## File Structure Explanation

### Backend Structure

```
backend/
├── app.py                      # Flask app entry point
├── config.py                   # Configuration classes
├── requirements.txt            # Python dependencies
│
├── models/                     # ML Models
│   ├── classifier.py          # Logistic Regression for job classification
│   └── embedder.py            # Sentence Transformers for embeddings
│
├── services/                   # Business Logic
│   ├── cv_parser.py           # LlamaParse integration for CV extraction
│   ├── data_cleaner.py        # Data normalization & cleaning
│   ├── similarity_scorer.py   # Cosine similarity computation
│   └── job_matcher.py         # Candidate ranking logic
│
├── routes/                     # API Endpoints
│   ├── upload.py              # POST /api/upload/* endpoints
│   ├── screening.py           # POST /api/screening/* endpoints
│   └── candidates.py          # CRUD /api/candidates/* endpoints
│
├── utils/                      # Utilities
│   ├── file_handler.py        # File upload/deletion
│   └── helpers.py             # Helper functions
│
└── uploads/                    # Temp file storage
```

### Frontend Structure

```
frontend/
├── public/                     # Static assets
│
├── src/
│   ├── components/             # Reusable React Components
│   │   ├── Layout.jsx         # Main app wrapper
│   │   ├── Sidebar.jsx        # Navigation sidebar
│   │   ├── TopNavBar.jsx      # Header bar
│   │   ├── ResultsTable.jsx   # Candidate ranking table
│   │   ├── InsightPanel.jsx   # Analysis & insights
│   │   └── CandidateCard.jsx  # Candidate item component
│   │
│   ├── pages/                  # Page Components
│   │   ├── Dashboard.jsx      # Main screening interface
│   │   └── CandidateDetail.jsx # Candidate profile view
│   │
│   ├── services/               # API Integration
│   │   └── api.js             # Axios API client
│   │
│   ├── styles/                 # Global Styles
│   │   └── index.css          # Tailwind directives
│   │
│   ├── App.jsx                # Router setup
│   └── index.js               # Entry point
│
├── reference/                  # Design References
│   └── DESIGN_REFERENCES.md   # Design documentation
│
├── tailwind.config.js         # Tailwind CSS theme
├── postcss.config.js          # PostCSS config
├── .env                       # Environment variables
└── package.json               # Dependencies
```

## Common Tasks

### Adding a New API Endpoint

1. **Create service** (`backend/services/new_service.py`):
```python
class MyService:
    @staticmethod
    def do_something(data):
        # Implementation
        return result
```

2. **Create route** (`backend/routes/my_route.py`):
```python
from flask import Blueprint, request, jsonify
from services.my_service import MyService

bp = Blueprint('my_route', __name__, url_prefix='/api/my-route')

@bp.route('/action', methods=['POST'])
def my_action():
    data = request.get_json()
    result = MyService.do_something(data)
    return jsonify({'data': result}), 200
```

3. **Register in app** (`backend/app.py`):
```python
from routes import my_route
app.register_blueprint(my_route.bp)
```

### Adding a New React Component

1. **Create component** (`frontend/src/components/MyComponent.jsx`):
```jsx
import React from 'react';

const MyComponent = ({ prop1, prop2 }) => {
  return (
    <div className="bg-white rounded-lg p-4">
      {/* Component content */}
    </div>
  );
};

export default MyComponent;
```

2. **Use in page/component**:
```jsx
import MyComponent from '../components/MyComponent';

export default function Page() {
  return <MyComponent prop1="value" />;
}
```

### Adding Tailwind Styles

```jsx
// Use Tailwind classes directly
<div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
  <h2 className="text-h2 font-h2 text-primary mb-4">Title</h2>
  <p className="text-body-md text-secondary">Description</p>
</div>
```

### Making API Calls

```jsx
import { matchCVJD, rankCandidates } from '../services/api';

// In component:
const result = await matchCVJD(cvData, jdData);
const ranked = await rankCandidates(candidates, jdData);
```

## Environment Variables

### Backend (.env)
```
LLAMA_API_KEY=your_api_key
FLASK_ENV=development
FLASK_DEBUG=True
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Testing

### Backend API Testing (using cURL or Postman)

```bash
# Health check
curl http://localhost:5000/api/health

# Upload CV
curl -X POST -F "file=@resume.pdf" http://localhost:5000/api/upload/cv

# Upload JD
curl -X POST -d '{"text":"Senior Developer..."}' http://localhost:5000/api/upload/jd

# Perform screening
curl -X POST -H "Content-Type: application/json" \
  -d '{"candidates":[...],"jd_data":{...}}' \
  http://localhost:5000/api/screening/rank
```

### Frontend Testing

```bash
cd frontend

# Run tests (if configured)
npm test

# Build for production
npm run build
```

## Debugging

### Backend Debugging
- Check Flask logs in terminal
- Set `FLASK_DEBUG=True` in .env
- Add breakpoints using Python debugger

### Frontend Debugging
- Open DevTools (F12)
- Check Console for errors
- React DevTools extension helpful
- Network tab to inspect API calls

## Database Setup (Future)

To add persistent database:

```bash
pip install flask-sqlalchemy psycopg2
```

Update `backend/config.py`:
```python
SQLALCHEMY_DATABASE_URI = 'postgresql://user:password@localhost/cvscreening'
```

## Deployment Checklist

- [ ] Set production environment variables
- [ ] Build React app: `npm run build`
- [ ] Test API endpoints
- [ ] Setup database (if using persistent storage)
- [ ] Configure CORS properly
- [ ] Add error logging/monitoring
- [ ] Test file upload limits
- [ ] Verify API rate limiting

## Troubleshooting

### "Address already in use" on port 5000
```bash
# Kill process on port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

### Frontend can't connect to backend
- Check if backend is running on port 5000
- Verify `REACT_APP_API_URL` in `.env`
- Check CORS settings in `backend/app.py`

### Import errors in backend
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt` again
- Check Python version (3.8+)

## Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Axios Documentation](https://axios-http.com/)
- [Material Symbols](https://fonts.google.com/icons)

---

**Last Updated**: May 2, 2026
