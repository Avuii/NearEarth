const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5272";

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