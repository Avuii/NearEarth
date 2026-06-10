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
  <img src="https://img.shields.io/badge/JPL%20SBDB-Reference-0F766E?style=for-the-badge" />
  <img src="https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-22C55E?style=for-the-badge" />
  <img src="https://img.shields.io/badge/backend-ASP.NET%20Core-512BD4?style=for-the-badge" />
</p>
<p align="center">
<img width="800" alt="image" src="https://github.com/user-attachments/assets/4a6ce557-6267-4185-a8a2-255503045016" />
</p>
---

## 📑 Table of Contents

- [🌍 Overview](#-overview)
- [🧩 Current Status](#-current-status)
- [🚀 Live Demo](#-live-demo)
- [✨ Features](#-features)
  - [📊 Dashboard](#-dashboard)
  - [🔎 Flyby Explorer](#-flyby-explorer)
  - [☄️ Asteroid Details](#️-asteroid-details)
  - [⭐ Watchlist](#-watchlist)
  - [🚨 Alerts](#-alerts)
  - [📈 Charts and 3D Preview](#-charts-and-3d-preview)
- [🛰️ Data Sources](#️-data-sources)
- [🛠️ Tech Stack](#️-tech-stack)
- [🔌 Backend API](#-backend-api)
- [🧱 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [🔐 Environment Variables](#-environment-variables)
- [⚠️ Limitations](#️-limitations)
- [🛣️ Roadmap](#️-roadmap)
- [⚠️ Disclaimer](#️-disclaimer)
- [👩‍💻 Author](#-author)

---

## 🌍 Overview

**NearEarth** is a full-stack web application for monitoring Near-Earth Objects, asteroid close approaches and potentially hazardous asteroid indicators.

The application uses public NASA NeoWs data and presents it in a cleaner dashboard format. Instead of browsing raw API responses, the user can view summary cards, charts, close approach tables, asteroid details, generated alerts, a watchlist and a simplified 3D space preview.

The goal of the project is to make asteroid close approach data easier to explore through a modern web interface.

---

## 🧩 Current Status

NearEarth is currently under active development.

| Area | Status |
|---|---|
| React frontend | ✅ Implemented |
| ASP.NET Core backend | ✅ Implemented |
| NASA NeoWs API integration | ✅ Implemented |
| Dashboard with live NASA data | ✅ Implemented |
| 7-day close approach summary | ✅ Implemented |
| 30-day backend aggregation | ✅ Implemented |
| Asteroid details lookup | ✅ Implemented |
| Flyby table and filters | ✅ Implemented |
| Charts and visual analytics | ✅ Implemented |
| Watchlist in frontend state/local storage | ✅ Implemented |
| In-app alert generation | ✅ Implemented |
| 3D Solar System preview | ✅ Implemented |
| Database persistence | Not implemented |
| User accounts | Not implemented |
| Email notifications | Not implemented |
| Deployed backend | Not implemented |

---

## 🚀 Live Demo

A static frontend demo is available here:

```text
https://avuii.github.io/NearEarth/
```

The GitHub Pages version presents the frontend interface and general application flow.

The full version with live NASA data requires running the ASP.NET Core backend locally, because the NASA API key is stored on the backend side and should not be exposed in the browser.

---

## ✨ Features

### 📊 Dashboard

The dashboard shows the most important information from NASA NeoWs:

- number of objects in the next 7 days,
- number of objects in the next 30 days,
- closest upcoming flyby,
- largest estimated object,
- fastest object,
- number of potentially hazardous asteroids,
- flybys over time chart,
- distance vs date chart,
- top closest approaches,
- recent generated alerts,
- active watchlist preview.

---

### 🔎 Flyby Explorer

The flyby page allows browsing current NASA NeoWs close approach data.

Available features:

- list of upcoming asteroid close approaches,
- filtering by all objects, close approaches and PHA objects,
- search by asteroid name,
- sorting by closest distance,
- watchlist actions,
- table with distance, velocity, estimated diameter and PHA flag.

---

### ☄️ Asteroid Details

Each asteroid can be opened in a details view.

The details view uses NASA NeoWs lookup data and displays:

- asteroid name,
- NASA/JPL identifier,
- estimated diameter,
- closest approach date,
- miss distance,
- relative velocity,
- orbit class if available,
- PHA status,
- NASA JPL source link.

---

### ⭐ Watchlist

Users can add selected asteroids to a watchlist.

Current behavior:

- add or remove an asteroid from the watchlist,
- show watched objects from the current NASA data range,
- display closest watched distance,
- display watched PHA count.

The watchlist currently works on the frontend side. There is no user account system or backend database persistence yet.

---

### 🚨 Alerts

The application generates in-app alerts from the currently loaded NASA data.

Current alert rules include:

- close approach below threshold,
- object marked as potentially hazardous,
- large estimated diameter,
- high relative velocity.

The alerts are generated inside the application and are not official warnings.

---

### 📈 Charts and 3D Preview

The app includes several visual views:

- flybys over time,
- distance vs date scatter plot,
- closest objects table,
- simplified 3D Solar System preview,
- asteroid belt reference,
- fullscreen object preview,
- camera focus on selected asteroid.

The 3D view is educational and simplified. It is not a precise orbital simulator.

---

## 🛰️ Data Sources

### NASA NeoWs

The main data source is NASA NeoWs:

```text
https://api.nasa.gov/
```

Used endpoints:

```text
GET /neo/rest/v1/feed
GET /neo/rest/v1/neo/{asteroid_id}
GET /neo/rest/v1/neo/browse
```

The app uses NeoWs to fetch:

- close approach data,
- asteroid names and IDs,
- estimated diameters,
- relative velocities,
- miss distances,
- potentially hazardous asteroid flags,
- NASA JPL links.

---

### JPL SBDB Lookup

JPL Small-Body Database Lookup is used as an external reference source for checking asteroid information.

Example object reference:

```text
https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=2530520
```

At this stage, SBDB is not fully integrated as a backend data source. It is used as a reference link/source for checking object information.

---

### SpaceRocks

SpaceRocks is linked as a related project/source around space-data tools and science communication.

```text
https://github.com/SpaceRocks/
```

---

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Three.js
- Lucide React

### Backend

- ASP.NET Core Web API
- C#
- HttpClient
- MemoryCache
- Swagger / OpenAPI
- NASA NeoWs API proxy

---

## 🔌 Backend API

The frontend does not call NASA directly.  
It calls the ASP.NET Core backend, and the backend calls NASA NeoWs using a private API key.

Current backend endpoints:

```text
GET /api/dashboard
GET /api/dashboard/range?days=30

GET /api/neos/feed?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
GET /api/neos/{id}
GET /api/neos/browse?page=0&size=20
```

### Why use a backend proxy?

The backend is used to:

- hide the NASA API key from the browser,
- normalize NASA responses,
- return simpler dashboard data,
- cache API responses,
- aggregate multiple 7-day NASA requests into a 30-day range.

---

## 🧱 Project Structure

```text
NearEarth/
├── backend/
│   └── NearEarth.Api/
│       ├── Controllers/
│       ├── Models/
│       │   ├── Dashboard/
│       │   └── Nasa/
│       ├── Options/
│       ├── Services/
│       ├── Program.cs
│       └── appsettings.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── services/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Avuii/NearEarth.git
cd NearEarth
```

---

### 2. Configure NASA API key

Go to the backend project:

```bash
cd backend/NearEarth.Api
```

Initialize user secrets:

```bash
dotnet user-secrets init
```

Add your NASA API key:

```bash
dotnet user-secrets set "Nasa:ApiKey" "YOUR_NASA_API_KEY"
```

The key should not be committed to GitHub.

---

### 3. Run the backend

```bash
dotnet restore
dotnet run
```

The backend should start on a local address similar to:

```text
http://localhost:5272
https://localhost:7218
```

Swagger is available at:

```text
http://localhost:5272/swagger
```

---

### 4. Configure frontend environment

Go to the frontend project:

```bash
cd ../../frontend
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5272
```

---

### 5. Run the frontend

```bash
npm install
npm run dev
```

The frontend should be available at:

```text
http://localhost:5173
```

---

## 🔐 Environment Variables

Frontend:

```env
VITE_API_URL=http://localhost:5272
```

Backend user secret:

```text
Nasa:ApiKey=YOUR_NASA_API_KEY
```

Backend `appsettings.json` contains only non-secret configuration, for example the NASA base URL.

---

## ⚠️ Limitations

Current limitations:

- no database yet,
- no user accounts,
- no persistent backend watchlist,
- no scheduled synchronization,
- no deployed backend,
- GitHub Pages demo does not include live backend data,
- 3D visualization is simplified and educational,
- alerts are generated in-app and are not official warnings.

---

## 🛣️ Roadmap

Planned next steps:

- deploy backend,
- add persistent database storage,
- save watchlist items in the backend,
- save alert rules in the backend,
- add synchronization logs,
- improve JPL SBDB links and enrichment,
- improve responsive UI,
- add more screenshots to README,
- prepare a stable release version.

---

## ⚠️ Disclaimer

NearEarth is an educational project.  
It does not provide official asteroid risk warnings and does not replace NASA, JPL, CNEOS or other scientific systems.

All critical interpretation of Near-Earth Object risk should be based on official NASA/JPL/CNEOS sources.

---

## 👩‍💻 Author

Created by Katarzyna Stańczyk.
