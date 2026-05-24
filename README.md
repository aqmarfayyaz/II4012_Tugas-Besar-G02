# TalentPulse AI: Pemodelan AI untuk Efisiensi CV Screening

## Solusi AI
### 1. Solusi AIaaS
- CV Parsing: Ekstraksi konteks CV oleh OpenAI dan pengaturan struktur CV dalam format PDF/DOCX dengan library pdfplumber beserta python-docx

### 2. Solusi Hasil Training
- Job Classification: Klasifikasi multiclass berdasarkan CV dan job description menggunakan Logistic Regression

### 3. Solusi Bebas
- Similarity Matching: Melakukan matching CV dengan job description dengan embedding dan cosine similarity
- Intelligent Ranking: Mengurutkan kandidat berdasarkan skor similarity
- AI Insights: Penjelasan kesamaan dan perbedaan antara CV dengan job description

## Project Structure

```
II4012_Tugas-Besar-G02/
├── backend/                          # Backend Python Flask
│   ├── app.py                       # Aplikasi utama
│   ├── config.py                    # Konfigurasi
│   ├── requirements.txt             # Dependencies
│   ├── data/                        # Penyimpanan data
│   │   ├── candidates.json
│   │   ├── projects.json
│   │   ├── screening_results.json
│   │   └── users.json
│   ├── models/
│   │   ├── classifier.py           # Logistic Regression classifier
│   │   └── embedder.py             # Text embedding
│   ├── services/
│   │   ├── activity_log.py         # Activity logging
│   │   ├── cv_parser.py            # CV parsing (pdfplumber / OpenAI)
│   │   ├── data_cleaner.py         # Data cleaning
│   │   ├── department_classifier.py # Klasifikasi departemen
│   │   ├── firebase_db.py          # Integrasi Firebase Firestore
│   │   ├── job_classifier.py       # Klasifikasi job family
│   │   ├── job_matcher.py          # Logika matching & ranking
│   │   └── similarity_scorer.py    # Similarity scoring
│   ├── routes/
│   │   ├── activity.py             # Endpoint activity log
│   │   ├── analytics.py            # Endpoint analytics
│   │   ├── auth.py                 # Endpoint autentikasi
│   │   ├── candidates.py           # Manajemen kandidat
│   │   ├── dashboard.py            # Endpoint dashboard
│   │   ├── projects.py             # Manajemen proyek
│   │   ├── screening.py            # Endpoint screening
│   │   └── upload.py               # Endpoint upload file
│   └── utils/
│       ├── file_handler.py         # Operasi file
│       └── helpers.py              # Helper functions
│
├── frontend/                         # Frontend React
│   ├── public/                      # File statis
│   ├── src/
│   │   ├── components/
│   │   │   ├── InsightPanel.jsx   
│   │   │   ├── Layout.jsx         
│   │   │   ├── ResultsTable.jsx    
│   │   │   ├── Sidebar.jsx         
│   │   │   └── TopNavBar.jsx      
│   │   ├── context/
│   │   │   └── AuthContext.jsx    
│   │   ├── pages/
│   │   │   ├── Analytics.jsx     
│   │   │   ├── CVScreening.jsx     
│   │   │   ├── CandidateDetail.jsx 
│   │   │   ├── Candidates.jsx      
│   │   │   ├── Dashboard.jsx    
│   │   │   ├── History.jsx       
│   │   │   ├── Landing.jsx       
│   │   │   ├── Login.jsx           
│   │   │   ├── Notifications.jsx  
│   │   │   ├── Profile.jsx      
│   │   │   ├── ProjectDetail.jsx   
│   │   │   ├── Projects.jsx        
│   │   │   ├── Ranking.jsx        
│   │   │   ├── Register.jsx      
│   │   │   ├── Settings.jsx      
│   │   │   ├── Support.jsx        
│   │   │   └── Upload.jsx        
│   │   ├── picture/             
│   │   ├── services/
│   │   │   ├── api.js           
│   │   │   └── firebase.js      
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── model/                           # Model ML 
│   ├── lr_classifier_family.pkl     # Model Logistic Regression
│   ├── tfidf_char.pkl               # TF-IDF vectorizer level karakter
│   └── tfidf_word.pkl               # TF-IDF vectorizer level kata
│
├── Datasets/                         # Dataset mentah
│   ├── resume_dataset_1200.csv
│   └── Resume.csv
│
├── II4012_M01_G02_DataUnderstanding_DataPreparation.ipynb
├── II4012_M01_G02_Modelling_LogReg.ipynb
├── prepared_candidates.csv          
├── prepared_classification.csv       
├── prepared_jd_bank.csv
├── .gitignore
└── README.md
```

## Prerequisites
- Python 3.8+
- Node.js 16+
- pip / npm

## Setup TalentPulse
### Buat .env di root directory
.env dapat diakses pada Laporan Akhir yang telah dikumpulkan kelompok

### Backend Setup

```bash
# Masuk ke direktori backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file (opsional jika kernel Python tidak mendukung, disarankan Python 3.10-3.13)
cp ../.env.example .env
```

### Frontend Setup

```bash
# Masuk ke direktori frontend
cd frontend

# Install dependencies
npm install
```

## Menjalankan TalentPulse

**Terminal 1 - Start Server Backend:**
```bash
cd backend
python app.py
# Akses server pada http://localhost:5000 dan http://localhost:5000/api/docs untuk dokumentasi
```

**Terminal 2 - Start Server Frontend:**
```bash
cd frontend
npm start
# Akses server pada http://localhost:3000
```


## Tech Stack

### Backend
- **Framework**: Flask, Flask-CORS
- **ML/NLP**:
  - Scikit-learn (Logistic Regression classifier)
  - NumPy, SciPy (numerical computation & similarity scoring)
  - Pandas (data processing)
  - pdfplumber, python-docx (CV parsing)
  - OpenAI API (text extraction & AI insights)
- **Auth**: JWT Authentication, Google OAuth
- **Database**: Firebase
- **API**: REST with CORS, Flasgger (Swagger docs)

### Frontend
- **Framework**: React
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **HTTP Client**: Axios
- **Auth & Database**: Firebase


## Anggota Kelompok
- Inggried Amelia Deswanty - 18223035
- Muhammad Aqmar Fayyaz Zakaria - 18223043 
- Amudi Purba - 18223049
- Nadia Apsarini Baizal - 18223065
- Velicia Christina Gabriel - 18223085
