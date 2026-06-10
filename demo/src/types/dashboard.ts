export type DashboardNeoItem = {
  id: string;
  name: string;
  nasaJplUrl: string;
  closeApproachDate: string;
  closeApproachDateFull: string;
  absoluteMagnitudeH: number;
  diameterMinMeters: number;
  diameterMaxMeters: number;
  diameterAverageMeters: number;
  velocityKilometersPerHour: number;
  velocityKilometersPerSecond: number;
  missDistanceKilometers: number;
  missDistanceLunar: number;
  missDistanceAstronomical: number;
  isPotentiallyHazardous: boolean;
  orbitingBody: string;
};

export type DailyApproachCount = {
  date: string;
  count: number;
  hazardousCount: number;
};

export type DashboardSummary = {
  totalObjects: number;
  hazardousObjects: number;
  safeObjects: number;
  averageDistanceLunar: number;
  averageVelocityKilometersPerHour: number;
};

export type DashboardResponse = {
  startDate: string;
  endDate: string;
  generatedAtUtc: string;
  summary: DashboardSummary;
  closestObject: DashboardNeoItem | null;
  fastestObject: DashboardNeoItem | null;
  largestObject: DashboardNeoItem | null;
  dailyApproaches: DailyApproachCount[];
  objects: DashboardNeoItem[];
};