export type Language = "en" | "pl";

export const translations = {
  en: {
    appName: "NearEarth",

    dashboard: "Home",
    flybys: "Flybys",
    watchlist: "Watch",
    alerts: "Alerts",
    insights: "Stats",

    searchPlaceholder: "Search NEO...",
    lastSync: "Sync",
    ago: "ago",

    heroTitle: "Near-Earth Object Monitoring",
    heroSubtitle:
      "Track asteroid flybys, visualize close approaches and monitor potentially hazardous objects.",
    manualSync: "Sync data",
    exploreFlybys: "View flybys",

    objectsNext7Days: "Next 7 days",
    objectsNext30Days: "Next 30 days",
    closestFlyby: "Closest",
    largestObject: "Largest",
    fastestObject: "Fastest",
    potentiallyHazardous: "PHA",
    moreThanLastWeek: "more than last week",
    trackingAll: "All approaches",
    diameter: "diameter",
    velocity: "velocity",
    phaObjectsTracked: "PHA tracked",

    flybysOverTime: "Flybys over time",
    distanceVsDate: "Distance vs date",

    top10ClosestFlybys: "Top 10 closest",
    viewAll: "View all",
    object: "Object",
    date: "Date",
    distance: "Distance",
    pha: "PHA",
    action: "Action",
    watch: "Watch",

    active: "Active",
    passed: "Passed",
    notesAvailable: "Notes",

    recentAlerts: "Recent alerts",
    hoursAgo: "h ago",
    dayAgo: "day ago",

    asteroidDetailsPreview: "Asteroid details",
    minDistance: "Min. distance",
    relativeVelocity: "Velocity",
    orbitClass: "Orbit",
    closeApproach: "Approach",
    timeUTC: "UTC",
    aboutThisApproach: "About approach",
    addToWatchlist: "Add to watchlist",
    ldExplanation:
      "This object will pass at {distance} LD from Earth. It is a close approach, but there is no direct impact threat.",

    dataSource: "Data: NASA/JPL-style NEO fields",
    copyright: "NearEarth © 2026",
    simplifiedVisualization: "Simplified close approach visualization",

    flybyExplorer: "Flyby explorer",
    allObjects: "All",
    closeOnly: "Close",
    hazardousOnly: "PHA only",
    searchResults: "Results",

    watchlistTitle: "Watchlist",
    alertRules: "Rules",
    alertStream: "Alert stream",

    insightsTitle: "Risk insights",
    riskTrend: "Risk trend",
    distanceBuckets: "Distance groups",
    observations: "Notes",

    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
  },

  pl: {
    appName: "NearEarth",

    dashboard: "Start",
    flybys: "Przeloty",
    watchlist: "Lista",
    alerts: "Alerty",
    insights: "Staty",

    searchPlaceholder: "Szukaj NEO...",
    lastSync: "Sync",
    ago: "temu",

    heroTitle: "Monitoring obiektów NEO",
    heroSubtitle:
      "Śledź przeloty asteroid, wizualizuj zbliżenia i monitoruj obiekty potencjalnie niebezpieczne.",
    manualSync: "Sync danych",
    exploreFlybys: "Zobacz przeloty",

    objectsNext7Days: "Najbliższe 7 dni",
    objectsNext30Days: "Najbliższe 30 dni",
    closestFlyby: "Najbliższy",
    largestObject: "Największy",
    fastestObject: "Najszybszy",
    potentiallyHazardous: "PHA",
    moreThanLastWeek: "więcej niż tydzień temu",
    trackingAll: "Wszystkie zbliżenia",
    diameter: "średnica",
    velocity: "prędkość",
    phaObjectsTracked: "PHA śledzone",

    flybysOverTime: "Przeloty w czasie",
    distanceVsDate: "Dystans / data",

    top10ClosestFlybys: "Top 10 przelotów",
    viewAll: "Pokaż",
    object: "Obiekt",
    date: "Data",
    distance: "Dystans",
    pha: "PHA",
    action: "Akcja",
    watch: "Dodaj",

    active: "Aktywne",
    passed: "Minęły",
    notesAvailable: "Notatki",

    recentAlerts: "Ostatnie alerty",
    hoursAgo: "h temu",
    dayAgo: "dzień temu",

    asteroidDetailsPreview: "Szczegóły asteroidy",
    minDistance: "Min. dystans",
    relativeVelocity: "Prędkość",
    orbitClass: "Orbita",
    closeApproach: "Zbliżenie",
    timeUTC: "UTC",
    aboutThisApproach: "Opis zbliżenia",
    addToWatchlist: "Dodaj do listy",
    ldExplanation:
      "Obiekt przeleci w odległości {distance} LD od Ziemi. To bliskie zbliżenie, ale bez bezpośredniego zagrożenia.",

    dataSource: "Dane: NASA/JPL-style NEO fields",
    copyright: "NearEarth © 2026",
    simplifiedVisualization: "Uproszczona wizualizacja zbliżeń",

    flybyExplorer: "Przegląd przelotów",
    allObjects: "Wszystkie",
    closeOnly: "Bliskie",
    hazardousOnly: "Tylko PHA",
    searchResults: "Wyniki",

    watchlistTitle: "Lista obserwacji",
    alertRules: "Reguły",
    alertStream: "Strumień alertów",

    insightsTitle: "Analiza ryzyka",
    riskTrend: "Trend ryzyka",
    distanceBuckets: "Grupy dystansu",
    observations: "Wnioski",

    low: "Niskie",
    medium: "Średnie",
    high: "Wysokie",
    critical: "Krytyczne",
  },
} as const;
