<p align="center">
  <img src="frontend/src/assets/logo.png" alt="NearEarth Logo" width="220" />
</p>

<h1 align="center">NearEarth</h1>

<p align="center">
  <strong>Interactive dashboard for monitoring Near-Earth Objects, close approaches and asteroid watchlists</strong>
</p>

<p align="center">
  <a href="https://avuii.github.io/NearEarth/">
    <strong>🚀 Open the Static Demo</strong>
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
  - [📚 Search and Education](#-search-and-education)
- [🛰️ Data Sources](#️-data-sources)
- [🛠️ Tech Stack](#️-tech-stack)
- [🔌 Backend API](#-backend-api)
- [🧱 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [🔐 Environment Variables](#-environment-variables)
- [🧪 Testing and Builds](#-testing-and-builds)
- [⚠️ Limitations](#️-limitations)
- [🛣️ Roadmap](#️-roadmap)
- [⚠️ Disclaimer](#️-disclaimer)
- [👩‍💻 Author](#-author)

---

## 🌍 Overview

**NearEarth** is a full-stack web application for monitoring Near-Earth Objects, asteroid close approaches and potentially hazardous asteroid indicators.

The application presents NASA NeoWs data through summary cards, charts, close approach tables, asteroid details, a watchlist and a simplified 3D space preview. Users can check alerts manually or subscribe to automatic email alerts.

The goal of the project is to make asteroid close approach data easier to explore through a modern web interface.

---

## 🧩 Current Status

NearEarth is currently under active development.

| Area | Status |
|---|---|
| React + TypeScript frontend | ✅ Implemented |
| ASP.NET Core backend | ✅ Implemented |
| NASA NeoWs API integration | ✅ Implemented |
| Dashboard with live NASA data | ✅ Implemented |
| 7-day close approach summary | ✅ Implemented |
| 30-day backend aggregation | ✅ Implemented |
| Asteroid details lookup | ✅ Implemented |
| Flyby table and filters | ✅ Implemented |
| Dashboard and Flyby Explorer charts | ✅ Implemented with NASA data |
| Stats tab | 🟡 Implemented with bundled sample data |
| Watchlist using localStorage | ✅ Implemented |
| In-app alert generation | ✅ Implemented |
| Email notifications (Resend / SMTP) | ✅ Implemented, requires sender configuration |
| Email alert subscriptions | ✅ Implemented, with configurable recipient and rules |
| Automatic alert checking | ✅ Implemented, requires a running backend |
| Email history and duplicate prevention | ✅ Implemented, persists across backend restarts |
| Manual data refresh and last successful sync time | ✅ Implemented |
| 3D Solar System visualization | ✅ Implemented |
| Global search and education in English and Polish | ✅ Implemented |
| Automated backend and frontend tests | ✅ 24 backend and 5 frontend tests passed locally |
| JSON-based alert storage | ✅ Implemented |
| Database persistence (SQL) | ❌ Not implemented |
| User accounts and authentication | ❌ Not implemented |
| Public backend deployment | ❌ No deployment configured in the repository |

---

## 🚀 Live Demo

The [GitHub Pages demo](https://avuii.github.io/NearEarth/) is built from `demo/`. It uses sample data and simulates email sending in the browser.

The full app uses `frontend/` and the ASP.NET Core API. Live NASA data and real email alerts require a running backend with the relevant API key or mail credentials.

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
- active watchlist preview,
- manual refresh and the time of the last successful NASA data fetch.

Manual refresh requests fresh NASA data. Reading a cached response preserves the original fetch time.

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

The watchlist is saved in the current browser.

---

### 🚨 Alerts

The Alerts page supports rules for close approach distance, estimated diameter and NASA's potentially hazardous asteroid (PHA) flag. The dashboard preview also highlights fast flybys.

Set the recipient address, email language, rules and per-check email limit in the Alerts page. You can send matching alerts on demand or save a subscription for automatic checks. The backend checks a subscription after it is saved and repeats the check every 15 minutes by default. Checks continue while the backend runs, even with the browser tab closed.

The backend stores subscriptions and successful send history as JSON in `backend/NearEarth.Api/App_Data/`. It skips alerts already sent to the same recipient. The Alerts page shows the last automatic check, the last send and any reported sending error.

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

---

### 📚 Search and Education

Global search finds asteroids, pages and learning topics. The education section explains NEO terminology, measurements, asteroid types and the Solar System in English and Polish.

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

SBDB serves as an external reference for asteroid information.

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
- Hosted background service for email alert checks
- Local JSON files for subscriptions and send history

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
POST /api/alerts/check
GET /api/alerts/history
POST /api/alerts/subscriptions
GET /api/alerts/subscriptions/{id}
PUT /api/alerts/subscriptions/{id}
DELETE /api/alerts/subscriptions/{id}
```

Both dashboard endpoints accept `forceRefresh=true` to bypass the feed cache. `DELETE /api/alerts/subscriptions/{id}` disables automatic checks for the subscription.

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
│   ├── NearEarth.Api/
│   │   ├── Controllers/
│   │   ├── Models/
│   │   ├── Options/
│   │   ├── Services/
│   │   ├── Program.cs
│   │   └── appsettings.json
│   └── NearEarth.Api.Tests/
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── services/
│   │   └── types/
│   ├── tests/
│   ├── package.json
│   └── vite.config.ts
│
├── demo/
└── README.md
```

---

## 🚀 Getting Started

Local development uses the .NET 10 SDK, Node.js 22.12 or later, and npm.

> [!IMPORTANT]
> A fresh checkout currently fails to compile the backend. Several C# model files are present in the development workspace but excluded from Git by the `models/` rule. The steps below require a working copy with those files available.

### 1. Clone the repository

```bash
git clone https://github.com/Avuii/NearEarth.git
cd NearEarth
```

---

### 2. Configure NASA API key

Go to the backend project and set the key in .NET User Secrets.

```bash
cd backend/NearEarth.Api
dotnet user-secrets set "Nasa:ApiKey" "YOUR_NASA_API_KEY"
```

---

### 3. Run the backend

```bash
dotnet restore
dotnet run --launch-profile http
```

The `http` profile starts the API at `http://localhost:5272` and serves Swagger at `http://localhost:5272/swagger`. The `https` profile also listens at `https://localhost:7218`.

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

Set the frontend API URL in `frontend/.env`.

```env
VITE_API_URL=http://localhost:5272
```

Keep the NASA API key and mail credentials in .NET User Secrets during local development. Use double underscores in place of colons when setting the same backend values through environment variables.

| Backend setting | Purpose |
|---|---|
| `Nasa:ApiKey` | NASA NeoWs API key |
| `Email:Provider` | `Resend` or `Smtp` |
| `Email:ResendApiKey` and `Email:From` | Resend API key and sender address |
| `Email:Smtp:Host` and `Email:Smtp:Port` | SMTP server and STARTTLS port, defaulting to `smtp.gmail.com` and `587` |
| `Email:Smtp:Username` and `Email:Smtp:Password` | SMTP sender address and credential, such as a Gmail app password |
| `Email:CheckIntervalMinutes` | Interval between automatic alert checks, defaulting to 15 minutes |

Configure one email provider before testing delivery. Recipient addresses are set in the Alerts page.

---

## 🧪 Testing and Builds

Run the existing tests from the repository root after installing the backend and frontend dependencies.

```bash
dotnet test backend/NearEarth.Api.Tests/NearEarth.Api.Tests.csproj
node --test frontend/tests/data-sync.test.cjs
```

The backend tests cover alert rules, sending outcomes, scheduled checks, persistence and duplicate prevention. The frontend tests cover validation, storage and restoration of the last successful sync time.

The full frontend build (`npm run build` in `frontend/`) currently stops at TypeScript error `TS5107`. The installed compiler rejects the legacy `moduleResolution` setting in `frontend/tsconfig.app.json`.

---

## ⚠️ Limitations

- The dashboard alert preview can show sample alerts when the loaded NASA range is empty.
- The 3D preview uses a simplified model for education.

---

## 🛣️ Roadmap

- [ ] Make a fresh checkout buildable by tracking the missing backend models and updating the frontend TypeScript configuration.
- [ ] Deploy the API and connect a public version of the frontend to live data.
- [ ] Add accounts and authentication, with a server-side watchlist that follows the user across devices.
- [ ] Add database storage for alert subscriptions and send history.
- [ ] Connect the Stats tab to live NASA data.
- [ ] Add a standalone data sync schedule and a persistent sync log. Automatic alert checks already fetch fresh NASA data for active subscriptions.
- [ ] Integrate JPL SBDB as a backend source for asteroid details.
- [ ] Implement SMS notifications. The current sender class is a placeholder.
- [ ] Continue responsive UI polish, update the README screenshots and prepare a stable release.

---

## ⚠️ Disclaimer

NearEarth is an educational project.  
It does not provide official asteroid risk warnings and does not replace NASA, JPL, CNEOS or other scientific systems.

All critical interpretation of Near-Earth Object risk should be based on official NASA/JPL/CNEOS sources.

---

## 👩‍💻 Author

Created by Katarzyna Stańczyk.
