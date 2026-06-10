const API_URL = import.meta.env.VITE_API_URL || "https://localhost:7218";

export interface EmailAlertSettings {
  email: string;
  language: "pl" | "en";
  enableVeryClose: boolean;
  enableLargeObject: boolean;
  enablePotentiallyHazardous: boolean;
  veryCloseMaxLd: number;
  largeMinDiameterMeters: number;
  startDate?: string;
  days: number;
  maxEmailsPerCheck: number;
}

export interface NeoAlert {
  alertId: string;
  ruleType: number;
  objectId: string;
  objectName: string;
  closeApproachDate: string;
  missDistanceLunar: number;
  diameterAverageMeters: number;
  velocityKilometersPerSecond: number;
  isPotentiallyHazardous: boolean;
  reasonEn: string;
  reasonPl: string;
  severity: string;
  createdAtUtc: string;
}

export interface NotificationResult {
  success: boolean;
  skipped: boolean;
  mockMode: boolean;
  alertId: string;
  message: string;
}

export interface AlertCheckResponse {
  totalAlertsFound: number;
  sentCount: number;
  skippedCount: number;
  alerts: NeoAlert[];
  results: NotificationResult[];
}

export async function getDashboardData(startDate?: string, endDate?: string) {
  const params = new URLSearchParams();

  if (startDate) {
    params.append("startDate", startDate);
  }

  if (endDate) {
    params.append("endDate", endDate);
  }

  const query = params.toString();
  const url = query
    ? `${API_URL}/api/dashboard?${query}`
    : `${API_URL}/api/dashboard`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  return response.json();
}

export async function getDashboardRangeData(days = 30, startDate?: string) {
  const params = new URLSearchParams();

  params.append("days", String(days));

  if (startDate) {
    params.append("startDate", startDate);
  }

  const response = await fetch(
    `${API_URL}/api/dashboard/range?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard range data");
  }

  return response.json();
}

export async function getNeoFeed(startDate: string, endDate: string) {
  const response = await fetch(
    `${API_URL}/api/neos/feed?startDate=${startDate}&endDate=${endDate}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch NEO feed");
  }

  return response.json();
}

export async function getAsteroidById(id: string) {
  const response = await fetch(`${API_URL}/api/neos/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch asteroid details");
  }

  return response.json();
}

export async function browseAsteroids(page = 0, size = 20) {
  const response = await fetch(
    `${API_URL}/api/neos/browse?page=${page}&size=${size}`
  );

  if (!response.ok) {
    throw new Error("Failed to browse asteroids");
  }

  return response.json();
}

export async function checkEmailAlerts(settings: EmailAlertSettings) {
  const response = await fetch(`${API_URL}/api/alerts/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to check email alerts");
  }

  return response.json() as Promise<AlertCheckResponse>;
}

export async function getEmailAlertHistory() {
  const response = await fetch(`${API_URL}/api/alerts/history`);

  if (!response.ok) {
    throw new Error("Failed to fetch email alert history");
  }

  return response.json() as Promise<NeoAlert[]>;
}