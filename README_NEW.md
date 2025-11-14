<h1 align="center" style="border-bottom: none; margin-bottom: -px;">⚡ALISTO⚡</h1>
<p align="center"><b>A</b>utomated <b>L</b>ive <b>I</b>nformation for <b>S</b>eismic <b>T</b>racking and <b>O</b>bservation</p>
<p align="center">
  <img src="https://img.shields.io/badge/React-19.1.1-61DAFB?style=flat&logo=react" alt="React">
  <img src="https://img.shields.io/badge/FastAPI-0.116.1-009688?style=flat&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=flat&logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Python-ML-3776AB?style=flat&logo=python" alt="Python">
</p>

---

<p align="center">
  <img 
    src="https://raw.githubusercontent.com/noteve07/misc/37736657fa7f51232867f2d0feadfdb5fda81538/assets/software-under-development.gif" 
    alt="Software Under Development"
  >
</p>

<p align="center">
  <b>🚧 PROJECT UNDER DEVELOPMENT 🚧</b>
</p>

---

**ALISTO** is a comprehensive disaster preparedness platform that provides real-time earthquake and volcanic monitoring for the Philippines. Using machine learning algorithms and data from DOST-PHIVOLCS, the platform delivers intelligent risk assessments and personalized alerts to enhance public safety and disaster preparedness.

## 🚀 Key Features

### 1. Dashboard
- Snapshot cards: Today’s quakes, strongest (24h), nearby (≤ 100 km), local risk level
- Last quake details and quick stats
- 7‑day frequency bar and provincial distribution pie
- Lists: recent earthquakes, advisories, high‑risk provinces

### 2. Live Hazard Monitoring
- Live DOST‑PHIVOLCS data on an interactive Leaflet map
- Magnitude, depth, location, time with auto‑refresh via scheduler
- Volcanic advisories with levels, status, and timestamps

### 3. Intelligent Risk Assessment
- K‑Means for low/medium risk using historical (2018–present) features
- Random Forest for short‑term high‑risk using last‑30‑day patterns
- Results served via FastAPI and overlaid on the map

### 4. User Location Hazard Insights
- Province/municipality (or auto‑geo), nearest fault & volcano distance
- Tsunami and landslide context; nearby evacuation centers & hospitals
- Personalized hazard summary

### 5. ISA Chatbot
- Real‑time quake updates, volcanic advisories, provincial risk levels
- Safety tips and emergency hotlines
- Context‑aware responses powered by Google Gemini

## 🛠️ Tech Stack

### **Frontend**

```
React 19.1.1 + Vite
├── React Router Dom 7.9.4      # Routing
├── Leaflet 1.9.4               # Interactive maps
├── React Leaflet 5.0.0         # React map components
├── Chart.js 4.5.1              # Data visualization
├── Tailwind CSS 4.1.16         # Styling
├── Turf.js 7.2.0               # Geospatial analysis
└── Supabase Client 2.76.1      # Database client
```

### **Backend**

```
FastAPI 0.116.1 + Python
├── Supabase (PostgreSQL + PostGIS)  # Database & Authentication
├── Google Gemini AI                 # Chatbot intelligence
├── APScheduler 3.10.4               # Task scheduling
├── BeautifulSoup4 4.13.5            # Web scraping
├── GeoPandas 1.1.1                  # Geospatial data processing
├── Scikit-Learn                     # Machine learning
└── Matplotlib 3.10.7               # Data visualization
```

### **Machine Learning & Data**

```
Python Data Science Stack
├── NumPy 2.3.3                 # Numerical computing
├── Pandas 2.3.3                # Data manipulation
├── GeoPandas 1.1.1             # Geospatial data analysis
├── Scikit-Learn                # ML algorithms
└── Matplotlib 3.10.7           # Visualization
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **PostgreSQL** 12+ with PostGIS extension
- **Supabase** account for database and authentication

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/noteve07/ALISTO.git
   cd ALISTO
   ```

2. **Backend Setup**

   ```bash
   cd backend
   pip install -r requirements.txt

   # Set up environment variables
   cp .env.example .env
   # Configure SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY

   # Start the API server
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Frontend Setup**

   ```bash
   cd frontend
   npm install

   # Start development server
   npm run dev
   ```

4. **Database Setup**
   - Configure PostgreSQL with PostGIS extension
   - Set up Supabase project with provided schema
   - Configure environment variables in `.env`

### Environment Variables

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_JWT=your_supabase_jwt_secret

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key
```

## 📖 API Documentation

Once the backend is running, access the interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Main Endpoints

- `/api/v1/earthquakes` - Real-time earthquake data
- `/api/v1/volcanoes` - Volcanic activity monitoring
- `/api/v1/chatbot` - ISA chatbot interactions
- `/api/v1/risk-evaluations` - ML-based risk assessments
- `/api/v1/dashboard` - Dashboard analytics

## 🖥️ Main UI Pages

- Landing Page (navigation, hero, project overview, footer)
- Dashboard (personalized statistics and summaries)
- Live Monitoring (real-time map with overlays)
- Risk Assessment (province-level risk analysis)
- Emergency Hotlines (contact information)
- Earthquake Information (educational resources)
- ISA Chatbot (interactive Q&A interface)
- Notifications (personalized alerts)
- Account (profile and settings)

## 📁 Project Structure

```
ALISTO/
├── frontend/                    # React application
│   ├── src/
│   │   ├── features/           # Feature-based components
│   │   │   ├── auth/          # Authentication
│   │   │   ├── dashboard/     # Dashboard
│   │   │   ├── live-monitoring/ # Real-time maps
│   │   │   ├── chatbot/       # ISA chatbot
│   │   │   └── risk-evaluation/ # Risk analysis
│   │   ├── shared/            # Shared components
│   │   └── lib/              # Utilities and configs
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── api/v1/           # API routes
│   │   ├── core/             # Configuration
│   │   ├── models/           # Data models
│   │   ├── services/         # Business logic
│   │   │   ├── chatbot/      # ISA chatbot service
│   │   │   ├── live/         # Real-time monitoring
│   │   │   ├── notifications/ # Alert system
│   │   │   └── risk_assessment/ # ML models
│   │   └── utils/            # Utilities
│   └── scripts/              # Data processing scripts
├── ml/                        # Machine learning models
│   ├── models/               # Trained models
│   ├── scripts/              # Training scripts
│   └── dataset/              # Training data
└── prototypes/               # UI/UX prototypes
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Data Sources

- DOST-PHIVOLCS (earthquake data and volcanic advisories)
- CGIAR Consortium for Spatial Information (CGIAR-CSI)

## 🙏 Acknowledgments

- **DOST-PHIVOLCS** - Earthquake and volcanic data source
- **Google Gemini** - AI chatbot capabilities
- **Supabase** - Database and authentication infrastructure
- **Leaflet.js** - Interactive mapping library

## 📞 Contact & Support

For questions, suggestions, or support, please:

- Open an issue on GitHub
- Contact the development team
- Check our documentation

---

<h2 align="center">👥 Development Team</h2>

<table align="center">
<tr>
<td align="center">
<strong>Nicko</strong><br>
<em>Full-Stack Developer & ML Engineer</em><br>
🔧 Backend Architecture, Machine Learning Models
</td>
<td align="center">
<strong>Jealla</strong><br>
<em>Frontend Developer & UI/UX Designer</em><br>
🎨 User Interface, User Experience Design
</td>
</tr>
<tr>
<td align="center">
<strong>Miguel</strong><br>
<em>Backend Developer</em><br>
🗺️ AI Chatbot Services
</td>
<td align="center">
<strong>Michael</strong><br>
<em>Backend Developer & Database Engineer</em><br>
🗄️ Database Design
</td>
</tr>
</table>
