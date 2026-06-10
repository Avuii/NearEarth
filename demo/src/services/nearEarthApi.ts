import { chartData, neoObjects } from "../data/neo-data";
import type { DashboardNeoItem, DashboardResponse } from "../types/dashboard";

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

const ALERT_HISTORY_KEY = "nearearth-demo-email-alert-history";
const ALERT_SENT_KEYS = "nearearth-demo-email-alert-sent-keys";

export async function getDashboardData() {
  await wait(220);
  return buildDashboardResponse(7);
}

export async function getDashboardRangeData(days = 30) {
  await wait(220);
  return buildDashboardResponse(days);
}

export async function getNeoFeed(startDate: string, endDate: string) {
  await wait(180);

  const objects = mockDashboardObjects();

  return {
    start_date: startDate,
    end_date: endDate,
    element_count: objects.length,
    near_earth_objects: objects,
  };
}

export async function getAsteroidById(id: string) {
  await wait(180);

  const baseId = getBaseMockId(id);
  const item = neoObjects.find((object) => object.id === baseId) ?? neoObjects[0];

  const closeApproachDate = toIsoDate(item.date);
  const missDistanceKilometers = item.distanceLD * 384400;
  const missDistanceAstronomical = missDistanceKilometers / 149597870.7;

  return {
    id: item.id,
    name: item.name,
    nasa_jpl_url: `https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${item.id}`,
    absolute_magnitude_h: estimateMagnitude(item.diameterM),
    is_potentially_hazardous_asteroid: item.isPHA,
    estimated_diameter: {
      meters: {
        estimated_diameter_min: item.diameterM * 0.72,
        estimated_diameter_max: item.diameterM * 1.28,
      },
    },
    close_approach_data: [
      {
        close_approach_date: closeApproachDate,
        close_approach_date_full: `${closeApproachDate} 12:00`,
        relative_velocity: {
          kilometers_per_second: String(item.velocityKms),
          kilometers_per_hour: String(item.velocityKms * 3600),
        },
        miss_distance: {
          lunar: String(item.distanceLD),
          kilometers: String(missDistanceKilometers),
          astronomical: String(missDistanceAstronomical),
        },
        orbiting_body: "Earth",
      },
    ],
    orbital_data: {
      orbit_class: {
        orbit_class_type: item.orbitClass,
        orbit_class_description: item.note,
      },
    },
  };
}

export async function browseAsteroids(page = 0, size = 20) {
  await wait(180);

  const objects = mockDashboardObjects();
  const start = page * size;
  const end = start + size;

  return {
    page: {
      size,
      total_elements: objects.length,
      total_pages: Math.ceil(objects.length / size),
      number: page,
    },
    near_earth_objects: objects.slice(start, end),
  };
}

export async function checkEmailAlerts(settings: EmailAlertSettings) {
  await wait(520);

  if (!settings.email.trim()) {
    throw new Error("Email is required.");
  }

  const dashboard = buildDashboardResponse(settings.days || 7);
  const alerts = evaluateAlerts(dashboard.objects, settings);

  const sentKeys = getSentKeys();
  const maxEmails =
    settings.maxEmailsPerCheck < 1 || settings.maxEmailsPerCheck > 20
      ? 1
      : settings.maxEmailsPerCheck;

  const results: NotificationResult[] = [];

  for (const alert of alerts.slice(0, maxEmails)) {
    const key = `${settings.email.trim().toLowerCase()}_${alert.alertId}`;

    if (sentKeys.includes(key)) {
      results.push({
        success: true,
        skipped: true,
        mockMode: true,
        alertId: alert.alertId,
        message: "Demo alert already generated for this email.",
      });

      continue;
    }

    results.push({
      success: true,
      skipped: false,
      mockMode: true,
      alertId: alert.alertId,
      message: "Demo email alert generated locally. No real email was sent.",
    });

    sentKeys.push(key);
  }

  const sentAlerts = alerts.filter((alert) =>
    results.some(
      (result) =>
        result.alertId === alert.alertId && result.success && !result.skipped
    )
  );

  saveSentKeys(sentKeys);
  saveHistory(sentAlerts);

  return {
    totalAlertsFound: alerts.length,
    sentCount: results.filter((item) => item.success && !item.skipped).length,
    skippedCount: results.filter((item) => item.skipped).length,
    alerts,
    results,
  } satisfies AlertCheckResponse;
}

export async function getEmailAlertHistory() {
  await wait(120);
  return getHistory();
}

function buildDashboardResponse(days: number): DashboardResponse {
  const objects = days <= 7 ? mockDashboardObjects() : buildExtendedMockObjects(days);

  const closestObject = [...objects].sort(
    (a, b) => a.missDistanceLunar - b.missDistanceLunar
  )[0] ?? null;

  const fastestObject = [...objects].sort(
    (a, b) => b.velocityKilometersPerSecond - a.velocityKilometersPerSecond
  )[0] ?? null;

  const largestObject = [...objects].sort(
    (a, b) => b.diameterAverageMeters - a.diameterAverageMeters
  )[0] ?? null;

  const hazardousObjects = objects.filter(
    (item) => item.isPotentiallyHazardous
  ).length;

  const averageDistanceLunar =
    objects.reduce((sum, item) => sum + item.missDistanceLunar, 0) /
    Math.max(objects.length, 1);

  const averageVelocityKilometersPerHour =
    objects.reduce((sum, item) => sum + item.velocityKilometersPerHour, 0) /
    Math.max(objects.length, 1);

  return {
    startDate: "2026-06-07",
    endDate: days <= 7 ? "2026-06-14" : "2026-07-07",
    generatedAtUtc: new Date().toISOString(),
    summary: {
      totalObjects: objects.length,
      hazardousObjects,
      safeObjects: objects.length - hazardousObjects,
      averageDistanceLunar,
      averageVelocityKilometersPerHour,
    },
    closestObject,
    fastestObject,
    largestObject,
    dailyApproaches: chartData.map((item, index) => ({
      date: `2026-06-${String(index + 7).padStart(2, "0")}`,
      count: item.count,
      hazardousCount: Math.max(0, Math.round(item.count / 4)),
    })),
    objects,
  };
}

function mockDashboardObjects(): DashboardNeoItem[] {
  return neoObjects.map((item) => mapMockObject(item));
}

function buildExtendedMockObjects(days: number): DashboardNeoItem[] {
  const rounds = Math.max(1, Math.ceil(days / 7));
  const result: DashboardNeoItem[] = [];

  for (let round = 0; round < rounds; round += 1) {
    neoObjects.forEach((item, index) => {
      const mapped = mapMockObject(item);
      const day = 7 + round * 7 + index;

      result.push({
        ...mapped,
        id: round === 0 ? mapped.id : `${mapped.id}-${round}`,
        closeApproachDate: `2026-06-${String(((day - 1) % 28) + 1).padStart(
          2,
          "0"
        )}`,
        closeApproachDateFull: `2026-Jun-${String(((day - 1) % 28) + 1).padStart(
          2,
          "0"
        )} 12:00`,
        missDistanceLunar: Number(
          Math.max(1.2, mapped.missDistanceLunar + round * 2.3).toFixed(2)
        ),
      });
    });
  }

  return result.slice(0, Math.max(neoObjects.length, days + 8));
}

function mapMockObject(item: (typeof neoObjects)[number]): DashboardNeoItem {
  const closeApproachDate = toIsoDate(item.date);
  const missDistanceKilometers = item.distanceLD * 384400;
  const missDistanceAstronomical = missDistanceKilometers / 149597870.7;

  return {
    id: item.id,
    name: item.name,
    nasaJplUrl: `https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${item.id}`,
    closeApproachDate,
    closeApproachDateFull: `${closeApproachDate} 12:00`,
    absoluteMagnitudeH: estimateMagnitude(item.diameterM),
    diameterMinMeters: item.diameterM * 0.72,
    diameterMaxMeters: item.diameterM * 1.28,
    diameterAverageMeters: item.diameterM,
    velocityKilometersPerHour: item.velocityKms * 3600,
    velocityKilometersPerSecond: item.velocityKms,
    missDistanceKilometers,
    missDistanceLunar: item.distanceLD,
    missDistanceAstronomical,
    isPotentiallyHazardous: item.isPHA,
    orbitingBody: "Earth",
  };
}

function evaluateAlerts(
  objects: DashboardNeoItem[],
  settings: EmailAlertSettings
): NeoAlert[] {
  const alerts: NeoAlert[] = [];

  objects.forEach((item) => {
    if (
      settings.enableVeryClose &&
      item.missDistanceLunar <= settings.veryCloseMaxLd
    ) {
      alerts.push({
        alertId: `${item.id}_${item.closeApproachDate}_VeryClose`,
        ruleType: 1,
        objectId: item.id,
        objectName: item.name,
        closeApproachDate: item.closeApproachDate,
        missDistanceLunar: item.missDistanceLunar,
        diameterAverageMeters: item.diameterAverageMeters,
        velocityKilometersPerSecond: item.velocityKilometersPerSecond,
        isPotentiallyHazardous: item.isPotentiallyHazardous,
        reasonEn: `Object passed within ${settings.veryCloseMaxLd} LD from Earth.`,
        reasonPl: `Obiekt przeleciał w odległości do ${settings.veryCloseMaxLd} LD od Ziemi.`,
        severity: item.missDistanceLunar <= 3 ? "High" : "Medium",
        createdAtUtc: new Date().toISOString(),
      });
    }

    if (
      settings.enableLargeObject &&
      item.diameterAverageMeters >= settings.largeMinDiameterMeters
    ) {
      alerts.push({
        alertId: `${item.id}_${item.closeApproachDate}_LargeObject`,
        ruleType: 2,
        objectId: item.id,
        objectName: item.name,
        closeApproachDate: item.closeApproachDate,
        missDistanceLunar: item.missDistanceLunar,
        diameterAverageMeters: item.diameterAverageMeters,
        velocityKilometersPerSecond: item.velocityKilometersPerSecond,
        isPotentiallyHazardous: item.isPotentiallyHazardous,
        reasonEn: `Estimated object diameter is at least ${settings.largeMinDiameterMeters} meters.`,
        reasonPl: `Szacowana średnica obiektu wynosi co najmniej ${settings.largeMinDiameterMeters} metrów.`,
        severity: "High",
        createdAtUtc: new Date().toISOString(),
      });
    }

    if (settings.enablePotentiallyHazardous && item.isPotentiallyHazardous) {
      alerts.push({
        alertId: `${item.id}_${item.closeApproachDate}_PotentiallyHazardous`,
        ruleType: 3,
        objectId: item.id,
        objectName: item.name,
        closeApproachDate: item.closeApproachDate,
        missDistanceLunar: item.missDistanceLunar,
        diameterAverageMeters: item.diameterAverageMeters,
        velocityKilometersPerSecond: item.velocityKilometersPerSecond,
        isPotentiallyHazardous: item.isPotentiallyHazardous,
        reasonEn: "Mock data marks this object as potentially hazardous.",
        reasonPl: "Dane mockupowe oznaczają ten obiekt jako potencjalnie niebezpieczny.",
        severity: "High",
        createdAtUtc: new Date().toISOString(),
      });
    }
  });

  return alerts
    .sort((a, b) => a.missDistanceLunar - b.missDistanceLunar)
    .slice(0, 20);
}

function getHistory(): NeoAlert[] {
  try {
    const raw = localStorage.getItem(ALERT_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(alerts: NeoAlert[]) {
  if (alerts.length === 0) {
    return;
  }

  const current = getHistory();
  const next = [...alerts, ...current];

  localStorage.setItem(ALERT_HISTORY_KEY, JSON.stringify(next.slice(0, 40)));
}

function getSentKeys() {
  try {
    const raw = localStorage.getItem(ALERT_SENT_KEYS);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveSentKeys(keys: string[]) {
  localStorage.setItem(ALERT_SENT_KEYS, JSON.stringify([...new Set(keys)]));
}

function getBaseMockId(id: string) {
  return id.split("-")[0];
}

function toIsoDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "2026-06-10";
  }

  return date.toISOString().slice(0, 10);
}

function estimateMagnitude(diameterMeters: number) {
  return Number((24 - Math.log10(Math.max(diameterMeters, 1)) * 2.2).toFixed(2));
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
