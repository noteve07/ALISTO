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

## ✨ Key Features

<div align="center">

<table>
  <tr>
    <td align="center"><a href="#1-dashboard">📊<br><b>Dashboard</b></a></td>
    <td align="center"><a href="#2-live-hazard-monitoring">🗺️<br><b>Live Monitoring</b></a></td>
    <td align="center"><a href="#3-intelligent-risk-assessment">🧠<br><b>Risk Assessment</b></a></td>
    <td align="center"><a href="#4-user-location-hazard-insights">📍<br><b>Location Insights</b></a></td>
    <td align="center"><a href="#5-isa-chatbot">🤖<br><b>ISA Chatbot</b></a></td>
  </tr>
  <tr>
    <td colspan="5" align="center"><sub>Quick links to each feature</sub></td>
  </tr>
  
</table>

</div>

### 1. Dashboard

<table>
  <tr>
    <th align="left">Cards</th>
    <td>
      • Today’s Earthquakes<br>
      • Strongest Magnitude (last 24h)<br>
      • Nearby (≤ 100 km)<br>
      • Risk Level (User Location)
    </td>
  </tr>
  <tr>
    <th align="left">Details</th>
    <td>
      • User Location (province/municipality)<br>
      • Last Earthquake (timestamp, magnitude, depth)
    </td>
  </tr>
  <tr>
    <th align="left">Graphs</th>
    <td>
      • Bar — Last 7 days earthquake frequency<br>
      • Pie — Provincial distribution (last 7 days)
    </td>
  </tr>
  <tr>
    <th align="left">Lists</th>
    <td>
      • Recent Earthquakes<br>
      • Volcanic Advisories<br>
      • High‑Risk Provinces (model output)
    </td>
  </tr>
</table>

---

### 2. Live Hazard Monitoring

<table>
  <tr>
    <th align="left">Real‑Time Earthquake Monitoring</th>
    <th align="left">Volcanic Advisory Monitoring</th>
  </tr>
  <tr>
    <td>
      • Live data from DOST‑PHIVOLCS<br>
      • Interactive map (Leaflet.js / React‑Leaflet)<br>
      • Displays magnitude, depth, location, time<br>
      • Automated updates via scheduled scraping
    </td>
    <td>
      • Bulletins from PHIVOLCS<br>
      • Shows advisory level, status, timestamps<br>
      • Integrated with risk logic and chatbot
    </td>
  </tr>
</table>

---

### 3. Intelligent Risk Assessment

<table>
  <tr>
    <th align="left">K‑Means Clustering<br><sub>(Low & Medium Risk)</sub></th>
    <th align="left">Random Forest Classifier<br><sub>(High‑Risk Detection)</sub></th>
  </tr>
  <tr>
    <td>
      • Historical data (2018–present)<br>
      • Features: total earthquakes, major earthquakes, proximity to fault lines<br>
      • Cluster overlays on the map
    </td>
    <td>
      • Short‑term provincial high‑risk prediction<br>
      • Uses past 30‑day seismic patterns and temporal features<br>
      • Served via FastAPI for real‑time classification<br>
      • Evaluated with accuracy, precision, and recall
    </td>
  </tr>
</table>

---

### 4. User Location Hazard Insights

<table>
  <tr>
    <th align="left">Exposure & Proximity</th>
    <th align="left">Readiness & Support</th>
  </tr>
  <tr>
    <td>
      • Province + municipality selection (or auto geolocation)<br>
      • Nearest active fault line + distance<br>
      • Distance to active volcano<br>
      • Tsunami exposure and coastal proximity<br>
      • Landslide susceptibility context
    </td>
    <td>
      • Nearest evacuation centers<br>
      • Nearest hospitals<br>
      • Personalized hazard summary
    </td>
  </tr>
</table>

---

### 5. ISA Chatbot

<table>
  <tr>
    <th align="left">Capabilities</th>
    <th align="left">Context</th>
  </tr>
  <tr>
    <td>
      • Real‑time earthquake updates<br>
      • Volcanic advisories<br>
      • Provincial risk levels explained<br>
      • Emergency hotlines and safety tips<br>
      • Earthquake safety guidelines
    </td>
    <td>
      • Context‑aware responses powered by Google Gemini<br>
      • Integrated with live data and model outputs
    </td>
  </tr>
</table>

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
<em>Frontend Developer & GIS Specialist</em><br>
🗺️ Interactive Maps, GeoJSON Integration
</td>
<td align="center">
<strong>Michael</strong><br>
<em>Backend Developer & Database Engineer</em><br>
🗄️ Database Design, API Development
</td>
</tr>
</table>
