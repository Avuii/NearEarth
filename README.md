<p align="center">
  <img src="frontend/src/assets/logo.png" alt="NearEarth Logo" width="220" />
</p>

<h1 align="center">NearEarth</h1>

<p align="center">
  <strong>Interactive dashboard for monitoring Near-Earth Objects, close approaches and asteroid watchlists</strong>
</p>

<p align="center">
  <a href="https://avuii.github.io/NearEarth/">
    <strong>🚀 Open Live Mockup Demo</strong>
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-in%20development-6366F1?style=for-the-badge" />
  <img src="https://img.shields.io/badge/demo-GitHub%20Pages-22C55E?style=for-the-badge" />
  <img src="https://img.shields.io/badge/NASA%20NeoWs-API-2563EB?style=for-the-badge" />
  <img src="https://img.shields.io/badge/JPL%20SBDB-Data-0F766E?style=for-the-badge" />
  <img src="https://img.shields.io/badge/TabPFN-ML%20Model-9333EA?style=for-the-badge" />
  <img src="https://img.shields.io/badge/.NET-ONNX%20Runtime-512BD4?style=for-the-badge" />
</p>

---

## 🌍 Overview

**NearEarth Watch** is a web application for monitoring Near-Earth Objects (NEOs) and their close approaches to Earth.  
The goal of the project is to collect asteroid data from public NASA/JPL sources, process it into a readable format and present it through a modern dashboard, watchlist and visual analytics.

NEO data is publicly available, but it is often scattered across technical APIs and difficult to follow for a regular user. This application focuses on making that information easier to understand through:

- clean dashboards,
- close approach timelines,
- asteroid detail pages,
- watchlists,
- threshold-based alerts,
- educational explanations,
- simplified space visualizations.

The application is designed for people interested in space, education, data dashboards and science communication.

---


## 🚀 Live Demo

A static mockup version of the dashboard is available here:

<p align="center">
  <a href="https://avuii.github.io/NearEarth/">
    <strong>👉 Open NearEarth Demo</strong>
  </a>
</p>

The demo is deployed with **GitHub Pages** and shows the planned user interface, dashboard layout and core application flow.

> The current GitHub Pages version is a frontend mockup. Backend integration, NASA API data fetching and ML inference are currently under development.

---

## 🧩 Current Project Status

NearEarth is currently under active development.

| Area | Status |
|---|---|
| Frontend dashboard | ✅ Mockup demo available |
| GitHub Pages deployment | ✅ Live |
| NASA NeoWs integration | 🚧 In progress |
| JPL SBDB enrichment | planned |
| Watchlist and alerts | planned |
| ML classification | planned |
| ONNX Runtime integration | planned |
| .NET backend | 🚧 In progress |

---

## 💡 Main Idea

The system helps users answer questions such as:

- Which asteroids will pass near Earth soon?
- How close will they be?
- How large are they estimated to be?
- How fast are they moving?
- Are any of them marked as potentially hazardous?
- Which objects should I keep on my watchlist?
- What does a distance such as `5 LD` actually mean?

The project is educational and analytical. It does not replace official NASA/JPL/CNEOS risk assessments.

---

## ✨ Key Features

### 📊 Near-Earth Object Dashboard

The dashboard presents the most important information in one place:

- number of upcoming close approaches,
- closest asteroid in the selected period,
- largest estimated object,
- fastest object,
- number of potentially hazardous asteroids,
- upcoming approaches timeline,
- top closest approaches,
- size and distance charts.

### 🔎 Close Approach Explorer

A searchable and filterable list of asteroid close approaches.

Planned filters:

- date range,
- maximum distance from Earth,
- distance in lunar distances,
- object name,
- potentially hazardous status,
- minimum estimated diameter,
- relative velocity.

Example fields displayed in the table:

| Field | Description |
|---|---|
| Object name | Asteroid name or designation |
| Close approach date | Date and time of closest approach |
| Distance | Nominal miss distance from Earth |
| Distance in LD | Distance expressed in lunar distances |
| Velocity | Relative velocity near Earth |
| Diameter | Estimated object size |
| PHA | Potentially Hazardous Asteroid flag |
| Source | NASA/JPL reference link |

### ☄️ Asteroid Details Page

Each object has a dedicated detail page with:

- name and designation,
- NASA/JPL object identifier,
- estimated diameter,
- relative velocity,
- closest approach data,
- potentially hazardous status,
- orbit class,
- external source links,
- upcoming and historical close approaches,
- educational explanation of key values.

Example explanation:

> `1 LD` means one lunar distance, which is approximately the average distance between Earth and the Moon.  
> If an asteroid passes at `10 LD`, it means it is about ten times farther away than the Moon.

### ⭐ Watchlist

Users can add selected asteroids to a personal watchlist.

Planned watchlist features:

- save interesting objects,
- track upcoming approaches,
- add private notes,
- mark objects as important,
- view previous and future close approaches,
- connect alert rules to watched objects.

---

### 🚨 Threshold-Based Alerts

The application can generate in-app alerts when a selected condition is met.

Example alert rules:

- distance below `X LD`,
- object marked as potentially hazardous,
- estimated diameter above selected value,
- close approach within the next `X` days,
- velocity above selected value.

In the MVP, alerts are planned as in-app notifications.  
Email notifications can be added later as an extended feature.

---

### 📈 Data Visualization

The application should not be only a table of API results.  
A key part of the project is a clear and attractive visual layer.

Planned visualizations:

- radar-style close approach view,
- Earth-centered distance rings,
- Moon orbit reference ring,
- timeline of upcoming close approaches,
- scatter plot: date vs distance,
- bubble chart: size vs distance,
- top closest objects ranking,
- potentially hazardous object cards.

The radar visualization is planned as a simplified educational view, not a precise orbital simulation.

--

### 🗄️ Data Cache and Scheduled Synchronization

The application stores processed API data in a local database.  
This avoids unnecessary API calls and allows the system to work faster.

Planned synchronization flow:

1. Scheduled job runs once per day.
2. Backend fetches data from NASA/JPL APIs.
3. Data is normalized and saved in the database.
4. Dashboard statistics are recalculated.
5. Alert rules are checked.
6. New alert events are created if conditions are met.

Manual synchronization can also be available from the admin panel or developer endpoint.

---

## 🛰️ Data Sources

The project is planned around public NASA/JPL data sources.

### 🚀 NASA NeoWs

NASA NeoWs is used for Near-Earth Object data, including asteroid lookup and close approach information.

Planned usage:

- browse NEO dataset,
- search objects by close approach date,
- fetch asteroid details by object ID,
- display NASA/JPL source links.

Documentation:

```text
https://api.nasa.gov/
```

### 🔭 JPL SBDB Close-Approach Data API

The JPL SBDB Close-Approach Data API is useful for monitoring close approaches of asteroids and comets.

Planned usage:

- fetch upcoming close approaches,
- filter by date range,
- filter by distance,
- sort by closest approach,
- retrieve distance and velocity values.

Documentation:

```text
https://ssd-api.jpl.nasa.gov/doc/cad.html
```

### 🪐 JPL SBDB API

The JPL Small-Body Database API can be used for additional object details.

Planned usage:

- enrich asteroid details,
- fetch orbital parameters,
- fetch selected physical properties,
- improve detail pages.

Documentation:

```text
https://ssd-api.jpl.nasa.gov/doc/sbdb.html
```
---

## 🛠️ Tech Stack

### 🎨 Frontend

- React
- TypeScript
- Vite
- Tailwind CSS or SCSS
- Recharts / Apache ECharts
- Three.js, Canvas or SVG for custom space visualization

### ⚙️ Backend

- ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL or SQLite
- Background jobs with Hangfire or Quartz.NET
- REST API
- Optional SignalR for live synchronization status

### 🧠 Optional ML Module

- Python for model training
- scikit-learn / LightGBM / XGBoost
- ONNX export
- ONNX Runtime in ASP.NET Core for inference


---

## 🧱 Planned Database Model

### NeoObject

Stores general information about an asteroid or comet.

```text
NeoObject
- Id
- ExternalId
- Name
- Designation
- NasaJplUrl
- IsPotentiallyHazardous
- EstimatedDiameterMinMeters
- EstimatedDiameterMaxMeters
- AbsoluteMagnitudeH
- OrbitClass
- Source
- CreatedAtUtc
- UpdatedAtUtc
```

### CloseApproach

Stores close approach events.

```text
CloseApproach
- Id
- NeoObjectId
- ApproachDateUtc
- DistanceAu
- DistanceLd
- DistanceKm
- RelativeVelocityKmS
- MissDistanceMinKm
- MissDistanceMaxKm
- CreatedAtUtc
```

### WatchlistItem

Stores user-saved objects.

```text
WatchlistItem
- Id
- UserId
- NeoObjectId
- Note
- IsImportant
- CreatedAtUtc
```

### AlertRule

Stores user-defined alert conditions.

```text
AlertRule
- Id
- UserId
- Name
- MaxDistanceLd
- MinDiameterMeters
- OnlyPotentiallyHazardous
- DaysAhead
- IsActive
- CreatedAtUtc
```

### AlertEvent

Stores triggered alerts.

```text
AlertEvent
- Id
- AlertRuleId
- NeoObjectId
- CloseApproachId
- Message
- IsRead
- CreatedAtUtc
```

### SyncLog

Stores synchronization history.

```text
SyncLog
- Id
- Source
- StartedAtUtc
- FinishedAtUtc
- Status
- ObjectsFetched
- ErrorMessage
```

---

## 🔌 Planned API Endpoints

```text
GET    /api/dashboard/summary
GET    /api/dashboard/charts

GET    /api/neos/upcoming?days=30
GET    /api/neos/closest?limit=10
GET    /api/neos/search?query=apophis
GET    /api/neos/{id}

GET    /api/watchlist
POST   /api/watchlist/{neoId}
DELETE /api/watchlist/{neoId}

GET    /api/alerts/rules
POST   /api/alerts/rules
PUT    /api/alerts/rules/{id}
DELETE /api/alerts/rules/{id}

GET    /api/alerts/events
PUT    /api/alerts/events/{id}/read

POST   /api/sync/run
GET    /api/sync/status
GET    /api/sync/logs
```

---

## 🎯 MVP Scope

The first version of the application should include:

- NASA/JPL data integration,
- close approach list,
- asteroid detail page,
- dashboard summary cards,
- charts and rankings,
- watchlist,
- in-app alert rules,
- daily data synchronization,
- database cache,
- simplified radar visualization,
- source links to NASA/JPL.

---

## Nice-To-Have Features

Future extensions:

- JPL SBDB enrichment,
- object comparison: asteroid A vs asteroid B,
- email notifications,
- advanced educational mode,
- admin panel for synchronization logs,
- export to CSV,
- public share links,
- live synchronization status with SignalR,
- ML demo for PHA-like classification,
- more advanced orbital visualization.

---

## 🧪 ML Demo: PHA-Like Classification

The optional ML module can classify whether an object is similar to known potentially hazardous asteroids based on selected features.

Possible input features:

- absolute magnitude H,
- estimated diameter,
- minimum approach distance,
- relative velocity,
- orbit class,
- MOID if available from enriched data.

Possible output:

```text
Low similarity
Medium similarity
High similarity
```

Important disclaimer:

> The ML module is educational only. It does not provide an official risk assessment and should not be treated as a scientific warning system. Official risk information should always come from NASA/JPL/CNEOS sources.

---

## 🔐 Example Environment Variables

```env
NASA_API_KEY=your_nasa_api_key
DATABASE_CONNECTION=your_database_connection_string
SYNC_INTERVAL_HOURS=24
ALERTS_ENABLED=true
```
---

## 🚀 Getting Started

### Backend

```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run
```

The backend should be available at:

```text
https://localhost:7000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend should be available at:

```text
http://localhost:5173
```

---

## 🧭 Example Development Flow

1. Create backend API project.
2. Add models and database context.
3. Implement NASA/JPL API client.
4. Add synchronization service.
5. Store close approach data in the database.
6. Build dashboard endpoints.
7. Create React frontend.
8. Add charts and visualizations.
9. Implement watchlist.
10. Add alert rules.
11. Improve UI and README.
12. Add optional ML module.

---

## 🎯 Project Goals

The project aims to demonstrate:

- working with external APIs,
- backend data aggregation,
- scheduled background jobs,
- database caching,
- dashboard design,
- data visualization,
- user watchlists,
- alert logic,
- clean API design,
- educational science communication.

---

## 📚 Educational Value

NearEarth Watch can be useful for:

- students learning about space data,
- people interested in astronomy,
- users who want to follow upcoming asteroid close approaches,
- developers learning API aggregation and dashboards,
- data visualization practice.

---

## ⚠️ Disclaimer

This application is an educational project.  
It does not provide official asteroid risk warnings and does not replace NASA, JPL or CNEOS systems.

All critical interpretation of Near-Earth Object risk should be based on official scientific sources.

---

## 📄 License

This project can be released under the MIT License.

---

## 🗂️ Project Management
- 📌 [Milestones](https://github.com/Avuii/AsteroidSafe/milestones)
- ✅ [Issues](https://github.com/Avuii/AsteroidSafe/issues)
- 🧭 [Project board](https://github.com/Avuii/AsteroidSafe/projects)
  
---

## 🛣️ Roadmap
- [M0 — Setup & Standards](./milestone/1)
- [M1 — Data Ingestion](./milestone/2)
- [M2 — Dataset & Feature Engineering](./milestone/3)
- [M3 — Model Training](./milestone/4)
- [M4 — ONNX + .NET Inference](./milestone/5)
- [M5 — Web Dashboard](./milestone/6)
- [M6 — Docs & Release](./milestone/7)

---

## 👩‍💻 Author

Created by Katarzyna Stańczyk.




