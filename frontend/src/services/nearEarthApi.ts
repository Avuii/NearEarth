const API_URL = import.meta.env.VITE_API_URL || "https://localhost:7218";

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