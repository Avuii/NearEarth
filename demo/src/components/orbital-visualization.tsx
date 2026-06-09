import { useEffect, useMemo, useRef, useState } from "react";
import {
  Crosshair,
  List,
  Maximize2,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { neoObjects } from "../data/neo-data";
import { Button } from "./ui/button";

import sunTexture from "../assets/2k_sun.jpg";
import sunFlareTexture from "../assets/glow.png";
import mercuryTexture from "../assets/2k_mercury.jpg";
import venusTexture from "../assets/2k_venus_surface.jpg";
import earthTexture from "../assets/2k_earth_daymap.jpg";
import earthCloudsTexture from "../assets/2k_earth_clouds.jpg";
import marsTexture from "../assets/2k_mars.jpg";
import jupiterTexture from "../assets/2k_jupiter.jpg";
import saturnTexture from "../assets/2k_saturn.jpg";
import saturnRingTexture from "../assets/2k_saturn_ring_alpha.png";
import uranusTexture from "../assets/2k_uranus.jpg";
import neptuneTexture from "../assets/2k_neptune.jpg";
import moonTexture from "../assets/2k_moon.jpg";
import asteroidTexture from "../assets/2k_asteroid.jpg";

type SizeMode = "visible" | "strict";

type Point = {
  x: number;
  y: number;
};

type HoverData = {
  id: string;
  label: string;
  type: string;
  details: string[];
  x: number;
  y: number;
};

type FocusRequest = {
  id: string;
  follow: boolean;
  nonce: number;
};

type PlanetConfig = {
  id: string;
  label: string;
  texture: string;
  orbitAU: number;
  radiusKm: number;
  orbitalPeriodDays: number;
  rotationPeriodDays: number;
  eccentricity: number;
  inclinationDeg: number;
  longitudeDeg: number;
  axialTiltDeg: number;
  color: string;
  moons?: MoonConfig[];
  ring?: boolean;
};

type MoonConfig = {
  id: string;
  label: string;
  radiusKm: number;
  distancePlanetRadii: number;
  orbitalPeriodDays: number;
  rotationPeriodDays: number;
  texture?: string;
  color: string;
};

type BodyRecord = {
  id: string;
  label: string;
  type: string;
  group: THREE.Group;
  mesh: THREE.Object3D;
  orbitAU: number;
  radiusKm: number;
  orbitalPeriodDays: number;
  rotationPeriodDays: number;
  eccentricity: number;
  inclinationDeg: number;
  longitudeDeg: number;
  initialAngle: number;
  details: () => string[];
};

type MoonRecord = {
  pivot: THREE.Group;
  mesh: THREE.Mesh;
  orbitalPeriodDays: number;
  rotationPeriodDays: number;
};

type AsteroidRecord = {
  id: string;
  label: string;
  group: THREE.Group;
  mesh: THREE.Object3D;
  orbitAU: number;
  orbitalPeriodDays: number;
  eccentricity: number;
  inclinationDeg: number;
  longitudeDeg: number;
  initialAngle: number;
  details: () => string[];
};

type NormalizedAsteroid = {
  id: string;
  name: string;
  isPHA: boolean;
  diameterM: number;
  velocityKms: number;
  distanceLD: number;
  orbitAU: number;
  eccentricity: number;
  inclinationDeg: number;
  longitudeDeg: number;
};

interface OrbitalVisualizationProps {
  apiAsteroids?: any[];
}

const SIZE_MODE: SizeMode = "visible";
const KM_PER_AU = 149_597_870;
const AU_SCALE = 4.2;
const DEFAULT_SPEED = 2;
const AXIS_ROTATION_MULTIPLIER = 0.008;
const MOON_ORBIT_MULTIPLIER = 0.35;
const ASTEROID_BELT_INNER_AU = 2.2;
const ASTEROID_BELT_OUTER_AU = 3.3;
const ASTEROID_BELT_COUNT = 1800;

const PLANETS: PlanetConfig[] = [
  {
    id: "mercury",
    label: "Mercury",
    texture: mercuryTexture,
    orbitAU: 0.387,
    radiusKm: 2439.7,
    orbitalPeriodDays: 87.97,
    rotationPeriodDays: 58.65,
    eccentricity: 0.2056,
    inclinationDeg: 7.0,
    longitudeDeg: 48,
    axialTiltDeg: 0.03,
    color: "#b6a99a",
  },
  {
    id: "venus",
    label: "Venus",
    texture: venusTexture,
    orbitAU: 0.723,
    radiusKm: 6051.8,
    orbitalPeriodDays: 224.7,
    rotationPeriodDays: -243.0,
    eccentricity: 0.0068,
    inclinationDeg: 3.39,
    longitudeDeg: 76,
    axialTiltDeg: 177.4,
    color: "#caa56f",
  },
  {
    id: "earth",
    label: "Earth",
    texture: earthTexture,
    orbitAU: 1,
    radiusKm: 6371,
    orbitalPeriodDays: 365.25,
    rotationPeriodDays: 0.997,
    eccentricity: 0.0167,
    inclinationDeg: 0,
    longitudeDeg: 0,
    axialTiltDeg: 23.44,
    color: "#60a5fa",
    moons: [
      {
        id: "moon",
        label: "Moon",
        radiusKm: 1737.4,
        distancePlanetRadii: 9.2,
        orbitalPeriodDays: 27.32,
        rotationPeriodDays: 27.32,
        texture: moonTexture,
        color: "#cbd5e1",
      },
    ],
  },
  {
    id: "mars",
    label: "Mars",
    texture: marsTexture,
    orbitAU: 1.524,
    radiusKm: 3389.5,
    orbitalPeriodDays: 686.98,
    rotationPeriodDays: 1.026,
    eccentricity: 0.0934,
    inclinationDeg: 1.85,
    longitudeDeg: 49,
    axialTiltDeg: 25.19,
    color: "#f97316",
  },
  {
    id: "jupiter",
    label: "Jupiter",
    texture: jupiterTexture,
    orbitAU: 5.203,
    radiusKm: 69911,
    orbitalPeriodDays: 4332.59,
    rotationPeriodDays: 0.414,
    eccentricity: 0.0489,
    inclinationDeg: 1.3,
    longitudeDeg: 100,
    axialTiltDeg: 3.13,
    color: "#d8b28a",
    moons: [
      {
        id: "io",
        label: "Io",
        radiusKm: 1821,
        distancePlanetRadii: 2.0,
        orbitalPeriodDays: 1.77,
        rotationPeriodDays: 1.77,
        color: "#facc15",
      },
      {
        id: "europa",
        label: "Europa",
        radiusKm: 1560,
        distancePlanetRadii: 2.65,
        orbitalPeriodDays: 3.55,
        rotationPeriodDays: 3.55,
        color: "#e5e7eb",
      },
      {
        id: "ganymede",
        label: "Ganymede",
        radiusKm: 2634,
        distancePlanetRadii: 3.45,
        orbitalPeriodDays: 7.15,
        rotationPeriodDays: 7.15,
        color: "#a8a29e",
      },
      {
        id: "callisto",
        label: "Callisto",
        radiusKm: 2410,
        distancePlanetRadii: 4.35,
        orbitalPeriodDays: 16.69,
        rotationPeriodDays: 16.69,
        color: "#78716c",
      },
    ],
  },
  {
    id: "saturn",
    label: "Saturn",
    texture: saturnTexture,
    orbitAU: 9.537,
    radiusKm: 58232,
    orbitalPeriodDays: 10759.22,
    rotationPeriodDays: 0.444,
    eccentricity: 0.0565,
    inclinationDeg: 2.49,
    longitudeDeg: 113,
    axialTiltDeg: 26.73,
    color: "#e7c77d",
    ring: true,
    moons: [
      {
        id: "titan",
        label: "Titan",
        radiusKm: 2575,
        distancePlanetRadii: 4.0,
        orbitalPeriodDays: 15.95,
        rotationPeriodDays: 15.95,
        color: "#d6a15c",
      },
    ],
  },
  {
    id: "uranus",
    label: "Uranus",
    texture: uranusTexture,
    orbitAU: 19.191,
    radiusKm: 25362,
    orbitalPeriodDays: 30688.5,
    rotationPeriodDays: -0.718,
    eccentricity: 0.046,
    inclinationDeg: 0.77,
    longitudeDeg: 74,
    axialTiltDeg: 97.77,
    color: "#93e5f4",
  },
  {
    id: "neptune",
    label: "Neptune",
    texture: neptuneTexture,
    orbitAU: 30.07,
    radiusKm: 24622,
    orbitalPeriodDays: 60182,
    rotationPeriodDays: 0.671,
    eccentricity: 0.009,
    inclinationDeg: 1.77,
    longitudeDeg: 131,
    axialTiltDeg: 28.32,
    color: "#3b82f6",
  },
];

function hashString(value: string) {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
}

function sceneDistanceAU(au: number) {
  return au * AU_SCALE;
}

function sceneRadiusKm(radiusKm: number, minimum = 0.035) {
  if (SIZE_MODE === "strict") {
    return Math.max((radiusKm / KM_PER_AU) * AU_SCALE, minimum);
  }

  return Math.max(minimum, Math.pow(radiusKm / 6371, 0.52) * 0.14);
}

function sunRadius() {
  if (SIZE_MODE === "strict") {
    return Math.max((696340 / KM_PER_AU) * AU_SCALE, 0.06);
  }

  return 1.2;
}

function degToRad(value: number) {
  return (value * Math.PI) / 180;
}

function orbitPosition(
  orbitAU: number,
  eccentricity: number,
  inclinationDeg: number,
  longitudeDeg: number,
  angle: number
) {
  const a = sceneDistanceAU(orbitAU);
  const b = a * Math.sqrt(1 - eccentricity * eccentricity);
  const x = a * (Math.cos(angle) - eccentricity);
  const z = b * Math.sin(angle);

  const vector = new THREE.Vector3(x, 0, z);
  vector.applyAxisAngle(new THREE.Vector3(0, 1, 0), degToRad(longitudeDeg));
  vector.applyAxisAngle(new THREE.Vector3(1, 0, 0), degToRad(inclinationDeg));

  return vector;
}

function createOrbitLine(
  orbitAU: number,
  eccentricity: number,
  inclinationDeg: number,
  longitudeDeg: number,
  color: string,
  opacity: number,
  dashed = false
) {
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= 256; i++) {
    const angle = (i / 256) * Math.PI * 2;
    points.push(
      orbitPosition(orbitAU, eccentricity, inclinationDeg, longitudeDeg, angle)
    );
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  if (dashed) {
    const material = new THREE.LineDashedMaterial({
      color,
      transparent: true,
      opacity,
      dashSize: 0.28,
      gapSize: 0.2,
    });

    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();

    return line;
  }

  return new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
    })
  );
}

function createMoonOrbit(radius: number) {
  const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2);
  const points = curve
    .getPoints(96)
    .map((point) => new THREE.Vector3(point.x, 0, point.y));

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({
      color: "#94a3b8",
      transparent: true,
      opacity: 0.22,
    })
  );
}

function createStars(count: number, spread: number) {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: "#ffffff",
      size: 0.12,
      transparent: true,
      opacity: 0.65,
      sizeAttenuation: true,
    })
  );
}

function createPlanetMaterial(texture: THREE.Texture | undefined, color: string) {
  const emissiveColor = new THREE.Color(color).multiplyScalar(0.14);

  return new THREE.MeshStandardMaterial({
    map: texture,
    color,
    roughness: 0.82,
    metalness: 0.02,
    emissive: emissiveColor,
    emissiveIntensity: 0.22,
  });
}

function createLabelSprite(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;

  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.font = "600 24px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = "rgba(229, 231, 235, 0.96)";
  ctx.fillText(text, 128, 32);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(2.7, 0.58, 1);

  return sprite;
}

function createAsteroidBelt() {
  const geometry = new THREE.IcosahedronGeometry(0.02, 0);
  const material = new THREE.MeshStandardMaterial({
    color: "#94a3b8",
    roughness: 0.95,
    metalness: 0.02,
    emissive: new THREE.Color("#475569"),
    emissiveIntensity: 0.14,
  });

  const mesh = new THREE.InstancedMesh(
    geometry,
    material,
    ASTEROID_BELT_COUNT
  );

  const dummy = new THREE.Object3D();

  for (let i = 0; i < ASTEROID_BELT_COUNT; i++) {
    const radiusAU =
      ASTEROID_BELT_INNER_AU +
      Math.random() * (ASTEROID_BELT_OUTER_AU - ASTEROID_BELT_INNER_AU);

    const angle = Math.random() * Math.PI * 2;
    const x = Math.cos(angle) * sceneDistanceAU(radiusAU);
    const z = Math.sin(angle) * sceneDistanceAU(radiusAU);
    const y = (Math.random() - 0.5) * 0.45;

    const scale = 0.35 + Math.random() * 0.95;

    dummy.position.set(x, y, z);
    dummy.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    dummy.scale.set(scale, scale * (0.7 + Math.random() * 0.5), scale);
    dummy.updateMatrix();

    mesh.setMatrixAt(i, dummy.matrix);
  }

  mesh.instanceMatrix.needsUpdate = true;

  const group = new THREE.Group();
  group.add(mesh);

  return group;
}

function normalizeApiOrLocalAsteroid(item: any, index: number): NormalizedAsteroid {
  const id = String(item.id ?? item.neo_reference_id ?? `neo-${index}`);
  const name = item.name ?? `NEO ${index + 1}`;

  const estimatedDiameterMin =
    item.estimated_diameter?.meters?.estimated_diameter_min ??
    item.diameterM ??
    100;

  const estimatedDiameterMax =
    item.estimated_diameter?.meters?.estimated_diameter_max ??
    item.diameterM ??
    estimatedDiameterMin;

  const diameterM = (estimatedDiameterMin + estimatedDiameterMax) / 2;

  const closeApproach =
    item.close_approach_data?.[0] ??
    item.closeApproachData?.[0] ??
    null;

  const velocityKms =
    Number(closeApproach?.relative_velocity?.kilometers_per_second) ||
    Number(item.velocityKms) ||
    12;

  const distanceLD =
    Number(closeApproach?.miss_distance?.lunar) ||
    Number(item.distanceLD) ||
    8;

  const isPHA =
    Boolean(item.is_potentially_hazardous_asteroid) ||
    Boolean(item.isPHA);

  const orbitalData = item.orbital_data ?? {};
  const rawSemiMajorAxis =
    Number(orbitalData.semi_major_axis) || 0;

  const orbitAU =
    rawSemiMajorAxis > 0
      ? rawSemiMajorAxis
      : 0.85 + (hashString(id + name) % 1000) / 1000 * 2.5;

  const eccentricity =
    Number(orbitalData.eccentricity) ||
    0.05 + ((hashString(name) % 1000) / 1000) * 0.35;

  const inclinationDeg =
    Number(orbitalData.inclination) ||
    ((hashString(id) % 1000) / 1000) * 18;

  const longitudeDeg =
    Number(orbitalData.ascending_node_longitude) ||
    ((hashString(name + id) % 1000) / 1000) * 360;

  return {
    id,
    name,
    isPHA,
    diameterM,
    velocityKms,
    distanceLD,
    orbitAU,
    eccentricity,
    inclinationDeg,
    longitudeDeg,
  };
}

export function OrbitalVisualization({
  apiAsteroids,
}: OrbitalVisualizationProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);

  useEffect(() => {
    function handleExternalFocusRequest(event: Event) {
      const customEvent = event as CustomEvent<{ id?: string; follow?: boolean }>;
      const id = customEvent.detail?.id;

      if (!id) return;

      setFocusRequest({
        id,
        follow: customEvent.detail?.follow ?? true,
        nonce: Date.now(),
      });
      setIsFullscreen(true);
    }

    window.addEventListener("nearearth:focus-orbit", handleExternalFocusRequest);
    window.addEventListener("nearearth:focus-asteroid", handleExternalFocusRequest);

    return () => {
      window.removeEventListener("nearearth:focus-orbit", handleExternalFocusRequest);
      window.removeEventListener("nearearth:focus-asteroid", handleExternalFocusRequest);
    };
  }, []);

  useEffect(() => {
    if (!isFullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFullscreen]);

  return (
    <>
      <SolarSystemScene
        fullscreen={false}
        apiAsteroids={apiAsteroids}
        onOpenFullscreen={() => setIsFullscreen(true)}
      />

      {isFullscreen && (
        <div className="fixed inset-0 z-[120] bg-black p-4">
          <div className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_30px_120px_rgba(0,0,0,0.75)]">
            <SolarSystemScene
              fullscreen
              apiAsteroids={apiAsteroids}
              focusRequest={focusRequest}
              onCloseFullscreen={() => setIsFullscreen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

interface SolarSystemSceneProps {
  fullscreen: boolean;
  apiAsteroids?: any[];
  focusRequest?: FocusRequest | null;
  onOpenFullscreen?: () => void;
  onCloseFullscreen?: () => void;
}

function SolarSystemScene({
  fullscreen,
  apiAsteroids,
  focusRequest,
  onOpenFullscreen,
  onCloseFullscreen,
}: SolarSystemSceneProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());
  const interactiveRef = useRef<THREE.Object3D[]>([]);
  const bodyRecordsRef = useRef<BodyRecord[]>([]);
  const asteroidRecordsRef = useRef<AsteroidRecord[]>([]);
  const moonRecordsRef = useRef<MoonRecord[]>([]);
  const animationRef = useRef(0);
  const previousTimeRef = useRef(0);
  const simulationDaysRef = useRef(0);
  const speedRef = useRef(DEFAULT_SPEED);
  const pausedRef = useRef(false);
  const movedRef = useRef(false);
  const pointerDownRef = useRef<Point | null>(null);
  const lastZoomUpdateRef = useRef(0);
  const followTargetIdRef = useRef<string | null>(null);

  const [hoverData, setHoverData] = useState<HoverData | null>(null);
  const [selectedData, setSelectedData] = useState<HoverData | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speedValue, setSpeedValue] = useState(DEFAULT_SPEED);
  const [zoomValue, setZoomValue] = useState(100);
  const [followTargetId, setFollowTargetId] = useState<string | null>(null);

  const normalizedAsteroids = useMemo(() => {
    const source = apiAsteroids?.length ? apiAsteroids : neoObjects;

    return source
      .slice(0, 28)
      .map((item, index) => normalizeApiOrLocalAsteroid(item, index));
  }, [apiAsteroids]);

  const asteroidList = useMemo(() => {
    return [...normalizedAsteroids].sort((a, b) => {
      if (a.isPHA !== b.isPHA) {
        return a.isPHA ? -1 : 1;
      }

      return a.distanceLD - b.distanceLD;
    });
  }, [normalizedAsteroids]);

  useEffect(() => {
    if (!fullscreen || !focusRequest) return;

    const timer = window.setTimeout(() => {
      focusBodyById(focusRequest.id, focusRequest.follow);
    }, 180);

    return () => window.clearTimeout(timer);
  }, [fullscreen, focusRequest?.nonce]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#000000");

    const camera = new THREE.PerspectiveCamera(
      45,
      wrapper.clientWidth / wrapper.clientHeight,
      0.01,
      1200
    );

    camera.position.set(0, fullscreen ? 96 : 88, fullscreen ? 158 : 176);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.setClearColor("#000000", 1);
    wrapper.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.enablePan = true;
    controls.minDistance = 2.5;
    controls.maxDistance = 420;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    const textureLoader = new THREE.TextureLoader();

    const textures = {
      sun: textureLoader.load(sunTexture),
      sunFlare: textureLoader.load(sunFlareTexture),
      mercury: textureLoader.load(mercuryTexture),
      venus: textureLoader.load(venusTexture),
      earth: textureLoader.load(earthTexture),
      earthClouds: textureLoader.load(earthCloudsTexture),
      mars: textureLoader.load(marsTexture),
      jupiter: textureLoader.load(jupiterTexture),
      saturn: textureLoader.load(saturnTexture),
      saturnRing: textureLoader.load(saturnRingTexture),
      uranus: textureLoader.load(uranusTexture),
      neptune: textureLoader.load(neptuneTexture),
      moon: textureLoader.load(moonTexture),
      asteroid: textureLoader.load(asteroidTexture),
    };

    Object.values(textures).forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
    });

    scene.add(createStars(fullscreen ? 1800 : 1200, 720));

    const ambientLight = new THREE.AmbientLight("#dbeafe", 0.34);
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(
      "#dbeafe",
      "#0f172a",
      0.78
    );
    scene.add(hemisphereLight);

    const sunLight = new THREE.PointLight("#fff4c2", 4.2, 900, 1.7);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight("#9dd8ff", 0.7);
    fillLight.position.set(130, 60, 90);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight("#fef3c7", 0.35);
    rimLight.position.set(-120, 30, -60);
    scene.add(rimLight);

    const cameraFillLight = new THREE.PointLight("#ffffff", 0.18, 0, 2);
    camera.add(cameraFillLight);
    scene.add(camera);

    const sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(sunRadius(), 64, 64),
      new THREE.MeshBasicMaterial({
        map: textures.sun,
        color: "#ffc96b",
      })
    );

    scene.add(sunMesh);

    const sunFlareMaterial = new THREE.SpriteMaterial({
      map: textures.sunFlare,
      color: "#ffe58a",
      transparent: true,
      opacity: 0.055,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });

    const sunFlare = new THREE.Sprite(sunFlareMaterial);
    sunFlare.scale.set(8.5, 8.5, 1);
    sunFlare.position.set(0, 0, 0);
    scene.add(sunFlare);

    const sunFlareSoftMaterial = new THREE.SpriteMaterial({
      map: textures.sunFlare,
      color: "#ffcf5a",
      transparent: true,
      opacity: 0.028,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });

    const sunFlareSoft = new THREE.Sprite(sunFlareSoftMaterial);
    sunFlareSoft.scale.set(13.5, 13.5, 1);
    sunFlareSoft.position.set(0, 0, 0);
    scene.add(sunFlareSoft);

    const sunLabel = createLabelSprite("Sun");
    sunLabel.position.set(0, sunRadius() * 2.2, 0);
    scene.add(sunLabel);

    const asteroidBelt = createAsteroidBelt();
    scene.add(asteroidBelt);

    const bodyRecords: BodyRecord[] = [];
    const moonRecords: MoonRecord[] = [];
    const interactive: THREE.Object3D[] = [];

    PLANETS.forEach((planet) => {
      const orbit = createOrbitLine(
        planet.orbitAU,
        planet.eccentricity,
        planet.inclinationDeg,
        planet.longitudeDeg,
        "#7dd3fc",
        planet.orbitAU < 2 ? 0.18 : 0.1
      );

      scene.add(orbit);

      const radius = sceneRadiusKm(planet.radiusKm, 0.055);
      const planetGroup = new THREE.Group();
      const axisGroup = new THREE.Group();
      axisGroup.rotation.z = degToRad(planet.axialTiltDeg);

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 48, 48),
        createPlanetMaterial(
          textures[planet.id as keyof typeof textures],
          planet.color
        )
      );

      axisGroup.add(mesh);
      planetGroup.add(axisGroup);

      if (planet.id === "earth") {
        const clouds = new THREE.Mesh(
          new THREE.SphereGeometry(radius * 1.012, 48, 48),
          new THREE.MeshStandardMaterial({
            map: textures.earthClouds,
            transparent: true,
            opacity: 0.22,
            depthWrite: false,
            emissive: new THREE.Color("#dbeafe"),
            emissiveIntensity: 0.06,
          })
        );

        axisGroup.add(clouds);
      }

      if (planet.ring) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(radius * 1.45, radius * 2.65, 128),
          new THREE.MeshBasicMaterial({
            map: textures.saturnRing,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.92,
            depthWrite: false,
          })
        );

        ring.rotation.x = Math.PI / 2;
        ring.rotation.z = 0.18;
        planetGroup.add(ring);
      }

      if (planet.moons) {
        planet.moons.forEach((moon) => {
          const moonPivot = new THREE.Group();
          const moonDistance = Math.max(
            radius * moon.distancePlanetRadii,
            radius + 0.35
          );
          const moonRadius = Math.max(
            0.022,
            sceneRadiusKm(moon.radiusKm, 0.02) * 0.55
          );

          const moonOrbit = createMoonOrbit(moonDistance);
          moonPivot.add(moonOrbit);

          const moonMesh = new THREE.Mesh(
            new THREE.SphereGeometry(moonRadius, 24, 24),
            createPlanetMaterial(
              moon.texture ? textures.moon : undefined,
              moon.color
            )
          );

          moonMesh.position.set(moonDistance, 0, 0);
          moonMesh.userData = {
            id: moon.id,
            label: moon.label,
            type: "moon",
            details: [
              `Parent: ${planet.label}`,
              `Orbital period: ${moon.orbitalPeriodDays} days`,
              `Radius: ${Math.round(moon.radiusKm)} km`,
            ],
          };

          interactive.push(moonMesh);
          moonPivot.add(moonMesh);
          planetGroup.add(moonPivot);

          moonRecords.push({
            pivot: moonPivot,
            mesh: moonMesh,
            orbitalPeriodDays: moon.orbitalPeriodDays,
            rotationPeriodDays: moon.rotationPeriodDays,
          });
        });
      }

      const label = createLabelSprite(planet.label);
      label.position.set(0, radius + 0.55, 0);
      label.visible = fullscreen;
      planetGroup.add(label);

      mesh.userData = {
        id: planet.id,
        label: planet.label,
        type: "planet",
        details: [
          `Distance from Sun: ${planet.orbitAU} AU`,
          `Orbital period: ${Math.round(planet.orbitalPeriodDays)} days`,
          `Radius: ${planet.radiusKm.toLocaleString()} km`,
          `Rotation period: ${Math.abs(planet.rotationPeriodDays)} days`,
          `Axial tilt: ${planet.axialTiltDeg}°`,
        ],
      };

      interactive.push(mesh);
      scene.add(planetGroup);

      bodyRecords.push({
        id: planet.id,
        label: planet.label,
        type: "planet",
        group: planetGroup,
        mesh,
        orbitAU: planet.orbitAU,
        radiusKm: planet.radiusKm,
        orbitalPeriodDays: planet.orbitalPeriodDays,
        rotationPeriodDays: planet.rotationPeriodDays,
        eccentricity: planet.eccentricity,
        inclinationDeg: planet.inclinationDeg,
        longitudeDeg: planet.longitudeDeg,
        initialAngle: degToRad(planet.longitudeDeg * 2.1),
        details: () => [
          `Distance from Sun: ${planet.orbitAU} AU`,
          `Orbital period: ${Math.round(planet.orbitalPeriodDays)} days`,
          `Radius: ${planet.radiusKm.toLocaleString()} km`,
          `Rotation period: ${Math.abs(planet.rotationPeriodDays)} days`,
          `Axial tilt: ${planet.axialTiltDeg}°`,
        ],
      });
    });

    const asteroidRecords: AsteroidRecord[] = [];

    normalizedAsteroids.forEach((asteroid) => {
      const period = Math.pow(Math.max(asteroid.orbitAU, 0.4), 1.5) * 365.25;
      const initialAngle =
        ((hashString(asteroid.id + asteroid.name) % 1000) / 1000) * Math.PI * 2;

      const orbit = createOrbitLine(
        asteroid.orbitAU,
        asteroid.eccentricity,
        asteroid.inclinationDeg,
        asteroid.longitudeDeg,
        asteroid.isPHA ? "#fb7185" : "#22d3ee",
        asteroid.isPHA ? 0.24 : 0.16,
        true
      );

      scene.add(orbit);

      const asteroidGroup = new THREE.Group();
      const geometry = new THREE.DodecahedronGeometry(
        0.012 + Math.min(asteroid.diameterM / 1600, 1) * 0.02,
        0
      );

      const material = new THREE.MeshStandardMaterial({
        map: textures.asteroid,
        color: asteroid.isPHA ? "#fb7185" : "#cbd5e1",
        roughness: 0.95,
        metalness: 0.01,
        emissive: asteroid.isPHA
          ? new THREE.Color("#7f1d1d")
          : new THREE.Color("#334155"),
        emissiveIntensity: 0.18,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(1.15, 0.78, 1);

      mesh.userData = {
        id: asteroid.id,
        label: asteroid.name,
        type: asteroid.isPHA ? "PHA asteroid" : "NEO asteroid",
        details: [
          `Estimated orbit: ${asteroid.orbitAU.toFixed(2)} AU`,
          `Close approach: ${asteroid.distanceLD.toFixed(2)} LD`,
          `Diameter: ~${Math.round(asteroid.diameterM)} m`,
          `Velocity: ${asteroid.velocityKms.toFixed(2)} km/s`,
          asteroid.isPHA ? "Potentially hazardous" : "Monitored object",
        ],
      };

      asteroidGroup.add(mesh);
      scene.add(asteroidGroup);
      interactive.push(mesh);

      asteroidRecords.push({
        id: asteroid.id,
        label: asteroid.name,
        group: asteroidGroup,
        mesh,
        orbitAU: asteroid.orbitAU,
        orbitalPeriodDays: period,
        eccentricity: asteroid.eccentricity,
        inclinationDeg: asteroid.inclinationDeg,
        longitudeDeg: asteroid.longitudeDeg,
        initialAngle,
        details: () => [
          `Estimated orbit: ${asteroid.orbitAU.toFixed(2)} AU`,
          `Close approach: ${asteroid.distanceLD.toFixed(2)} LD`,
          `Diameter: ~${Math.round(asteroid.diameterM)} m`,
          `Velocity: ${asteroid.velocityKms.toFixed(2)} km/s`,
          asteroid.isPHA ? "Potentially hazardous" : "Monitored object",
        ],
      });
    });

    interactiveRef.current = interactive;
    bodyRecordsRef.current = bodyRecords;
    asteroidRecordsRef.current = asteroidRecords;
    moonRecordsRef.current = moonRecords;

    function resize() {
      if (!wrapper || !rendererRef.current || !cameraRef.current) return;

      const width = wrapper.clientWidth;
      const height = wrapper.clientHeight;

      rendererRef.current.setSize(width, height);
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
    }

    function updateHover(event: PointerEvent) {
      const canvas = renderer.domElement;
      const rect = canvas.getBoundingClientRect();

      pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(pointerRef.current, camera);

      const hits = raycasterRef.current.intersectObjects(
        interactiveRef.current,
        true
      );

      if (!hits.length) {
        setHoverData(null);
        return;
      }

      const object = hits[0].object;
      const data = object.userData;

      if (!data?.id) {
        setHoverData(null);
        return;
      }

      setHoverData({
        id: data.id,
        label: data.label,
        type: data.type,
        details: data.details,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }

    function handlePointerDown(event: PointerEvent) {
      pointerDownRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
      movedRef.current = false;
    }

    function handlePointerMove(event: PointerEvent) {
      updateHover(event);

      if (!pointerDownRef.current) return;

      const distance = Math.hypot(
        event.clientX - pointerDownRef.current.x,
        event.clientY - pointerDownRef.current.y
      );

      if (distance > 4) {
        movedRef.current = true;
      }
    }

    function handlePointerUp(event: PointerEvent) {
      if (!fullscreen) {
        onOpenFullscreen?.();
        return;
      }

      if (movedRef.current) return;

      const canvas = renderer.domElement;
      const rect = canvas.getBoundingClientRect();

      pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(pointerRef.current, camera);

      const hits = raycasterRef.current.intersectObjects(
        interactiveRef.current,
        true
      );

      if (!hits.length) return;

      const data = hits[0].object.userData;

      if (!data?.id) return;

      focusBodyById(data.id);
    }

    function handlePointerLeave() {
      setHoverData(null);
    }

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);
    renderer.domElement.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("resize", resize);

    function animate(time: number) {
      if (!previousTimeRef.current) {
        previousTimeRef.current = time;
      }

      const deltaSeconds = Math.min(
        (time - previousTimeRef.current) / 1000,
        0.05
      );

      previousTimeRef.current = time;

      if (!pausedRef.current) {
        simulationDaysRef.current += deltaSeconds * speedRef.current;
      }

      const simulationDays = simulationDaysRef.current;

      sunMesh.rotation.y += deltaSeconds * 0.03;
      sunFlareMaterial.rotation += deltaSeconds * 0.018;
      sunFlareSoftMaterial.rotation -= deltaSeconds * 0.01;
      asteroidBelt.rotation.y += deltaSeconds * 0.01;

      bodyRecordsRef.current.forEach((body) => {
        const angle =
          body.initialAngle +
          (simulationDays / body.orbitalPeriodDays) * Math.PI * 2;

        const position = orbitPosition(
          body.orbitAU,
          body.eccentricity,
          body.inclinationDeg,
          body.longitudeDeg,
          angle
        );

        body.group.position.copy(position);

        const rotationDirection = body.rotationPeriodDays < 0 ? -1 : 1;
        const rotationSpeed =
          (Math.PI * 2 * speedRef.current) /
          Math.max(Math.abs(body.rotationPeriodDays), 0.1);

        body.mesh.rotation.y +=
          rotationDirection *
          rotationSpeed *
          deltaSeconds *
          AXIS_ROTATION_MULTIPLIER;
      });

      asteroidRecordsRef.current.forEach((asteroid) => {
        const angle =
          asteroid.initialAngle +
          (simulationDays / asteroid.orbitalPeriodDays) * Math.PI * 2;

        const position = orbitPosition(
          asteroid.orbitAU,
          asteroid.eccentricity,
          asteroid.inclinationDeg,
          asteroid.longitudeDeg,
          angle
        );

        asteroid.group.position.copy(position);
        asteroid.mesh.rotation.x += deltaSeconds * 0.24;
        asteroid.mesh.rotation.y += deltaSeconds * 0.18;
      });

      moonRecordsRef.current.forEach((moon) => {
        moon.pivot.rotation.y +=
          ((deltaSeconds * speedRef.current * Math.PI * 2) /
            moon.orbitalPeriodDays) *
          MOON_ORBIT_MULTIPLIER;

        moon.mesh.rotation.y +=
          ((deltaSeconds * speedRef.current * Math.PI * 2) /
            moon.rotationPeriodDays) *
          MOON_ORBIT_MULTIPLIER;
      });

      const followId = followTargetIdRef.current;

      if (followId) {
        const planetRecord = bodyRecordsRef.current.find(
          (item) => item.id === followId
        );

        const asteroidRecord = asteroidRecordsRef.current.find(
          (item) => item.id === followId
        );

        const record = planetRecord ?? asteroidRecord;

        const targetObject =
          record?.group ??
          interactiveRef.current.find((item) => item.userData?.id === followId);

        if (targetObject) {
          const targetPosition = new THREE.Vector3();
          targetObject.getWorldPosition(targetPosition);

          const cameraOffset = camera.position.clone().sub(controls.target);

          if (cameraOffset.length() < 0.001) {
            cameraOffset.set(0, 1.2, 2.8);
          }

          controls.target.copy(targetPosition);
          camera.position.copy(targetPosition.clone().add(cameraOffset));
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (time - lastZoomUpdateRef.current > 250) {
        lastZoomUpdateRef.current = time;
        const distance = camera.position.distanceTo(controls.target);
        setZoomValue(Math.round(Math.max(1, 180 - distance)));
      }

      animationRef.current = requestAnimationFrame(animate);
    }

    resize();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("resize", resize);
      controls.dispose();
      renderer.dispose();

      if (renderer.domElement.parentElement === wrapper) {
        wrapper.removeChild(renderer.domElement);
      }
    };
  }, [fullscreen, onOpenFullscreen, normalizedAsteroids]);

  function togglePause() {
    pausedRef.current = !pausedRef.current;
    setIsPaused(pausedRef.current);
  }

  function changeSpeed(next: number) {
    const value = Math.max(0.25, Math.min(60, next));
    speedRef.current = value;
    setSpeedValue(value);
  }

  function zoomCamera(multiplier: number) {
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (!camera || !controls) return;

    const direction = camera.position.clone().sub(controls.target);
    direction.multiplyScalar(multiplier);
    camera.position.copy(controls.target.clone().add(direction));
    controls.update();
  }

  function setFollowMode(id: string | null) {
    followTargetIdRef.current = id;
    setFollowTargetId(id);
  }

  function resetView() {
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (!camera || !controls) return;

    camera.position.set(0, fullscreen ? 96 : 88, fullscreen ? 158 : 176);
    controls.target.set(0, 0, 0);
    controls.update();
    simulationDaysRef.current = 0;
    setSelectedData(null);
    setFollowMode(null);
  }

  function focusBodyById(id: string, follow = false) {
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (!camera || !controls) return;

    const planetRecord = bodyRecordsRef.current.find((item) => item.id === id);
    const asteroidRecord = asteroidRecordsRef.current.find(
      (item) => item.id === id
    );
    const record = planetRecord ?? asteroidRecord;

    if (record) {
      const position = new THREE.Vector3();
      record.group.getWorldPosition(position);

      const direction = camera.position.clone().sub(controls.target);

      if (direction.length() < 0.001) {
        direction.set(0, 0.45, 1);
      }

      direction.normalize();

      const isAsteroid = Boolean(asteroidRecord);

      const distance = isAsteroid
        ? 2.8
        : Math.max(4.2, sceneDistanceAU(record.orbitAU) * 0.045);

      camera.position.copy(
        position.clone().add(direction.multiplyScalar(distance))
      );

      controls.target.copy(position);
      controls.update();

      const data = record.mesh.userData;

      if (data?.id) {
        setSelectedData({
          id: data.id,
          label: data.label,
          type: data.type,
          details: data.details,
          x: 0,
          y: 0,
        });
      }

      setFollowMode(follow ? id : null);
      return;
    }

    const object = interactiveRef.current.find((item) => item.userData?.id === id);

    if (!object) return;

    const position = new THREE.Vector3();
    object.getWorldPosition(position);

    const direction = camera.position.clone().sub(controls.target);

    if (direction.length() < 0.001) {
      direction.set(0, 0.45, 1);
    }

    direction.normalize();

    camera.position.copy(position.clone().add(direction.multiplyScalar(1.6)));
    controls.target.copy(position);
    controls.update();

    const data = object.userData;

    if (data?.id) {
      setSelectedData({
        id: data.id,
        label: data.label,
        type: data.type,
        details: data.details,
        x: 0,
        y: 0,
      });
    }

    setFollowMode(follow ? id : null);
  }

  return (
    <div
      ref={wrapperRef}
      className={
        fullscreen
          ? "relative h-full w-full overflow-hidden bg-black"
          : "relative h-[560px] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
      }
    >
      <div className="pointer-events-none absolute left-5 top-5 z-10 rounded-2xl border border-white/10 bg-background/70 px-4 py-3 shadow-xl backdrop-blur-xl">
        <p className="text-sm font-semibold text-foreground">
          3D Solar System Preview
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {fullscreen
            ? "Orbit controls • zoom • pan • click body for details"
            : "AU-based distances • asteroid belt • NASA NEO-ready"}
        </p>
      </div>

      {!fullscreen && (
        <Button
          variant="outline"
          size="sm"
          className="absolute right-5 top-5 z-10 bg-background/65 backdrop-blur-xl"
          onClick={onOpenFullscreen}
        >
          <Maximize2 className="h-4 w-4" />
          Full view
        </Button>
      )}

      {fullscreen && (
        <div className="absolute right-5 top-5 z-10 flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="bg-background/65 backdrop-blur-xl"
            onClick={togglePause}
          >
            {isPaused ? (
              <Play className="h-4 w-4" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="bg-background/65 backdrop-blur-xl"
            onClick={() => changeSpeed(speedRef.current - 1)}
          >
            <Minus className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="bg-background/65 px-4 backdrop-blur-xl"
            onClick={() => changeSpeed(speedRef.current + 1)}
          >
            {speedValue} d/s
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="bg-background/65 backdrop-blur-xl"
            onClick={() => changeSpeed(speedRef.current + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="bg-background/65 backdrop-blur-xl"
            onClick={() => zoomCamera(1.12)}
          >
            <Minus className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="bg-background/65 px-4 backdrop-blur-xl"
            onClick={resetView}
          >
            {zoomValue}%
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="bg-background/65 backdrop-blur-xl"
            onClick={() => zoomCamera(0.88)}
          >
            <Plus className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="bg-background/65 backdrop-blur-xl"
            onClick={resetView}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="bg-background/65 backdrop-blur-xl"
            onClick={onCloseFullscreen}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {hoverData && (
        <div
          className="pointer-events-none absolute z-20 min-w-[230px] rounded-2xl border border-white/10 bg-background/80 px-4 py-3 shadow-2xl backdrop-blur-xl"
          style={{
            left: Math.min(
              hoverData.x + 18,
              (wrapperRef.current?.clientWidth ?? 0) - 250
            ),
            top: Math.max(16, hoverData.y + 18),
          }}
        >
          <p className="text-sm font-semibold text-foreground">
            {hoverData.label}
          </p>

          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-cyan-300/80">
            {hoverData.type}
          </p>

          <div className="mt-2 space-y-1">
            {hoverData.details.map((detail) => (
              <p key={detail} className="text-xs text-muted-foreground">
                {detail}
              </p>
            ))}
          </div>
        </div>
      )}

      {fullscreen && (
        <div className="absolute bottom-5 left-5 z-20 w-[360px] max-w-[calc(100vw-2.5rem)] rounded-2xl border border-white/10 bg-background/80 p-4 shadow-2xl backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <List className="h-4 w-4 text-cyan-300" />
                <p className="text-sm font-semibold text-foreground">
                  NEO objects
                </p>
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Click object to zoom into its orbit
              </p>
            </div>

            <div className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-muted-foreground">
              {asteroidList.length}
            </div>
          </div>

          <div className="max-h-[38vh] space-y-2 overflow-y-auto pr-1">
            {asteroidList.map((asteroid) => (
              <button
                key={asteroid.id}
                className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-3 py-3 text-left transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/[0.07] active:scale-[0.99]"
                onClick={() => focusBodyById(asteroid.id)}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {asteroid.name}
                  </p>

                  {asteroid.isPHA ? (
                    <span className="rounded-full border border-red-400/30 bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-200">
                      PHA
                    </span>
                  ) : (
                    <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-200">
                      NEO
                    </span>
                  )}
                </div>

                <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                  <div>
                    <span className="block text-cyan-300/80">Orbit</span>
                    {asteroid.orbitAU.toFixed(2)} AU
                  </div>

                  <div>
                    <span className="block text-cyan-300/80">Close</span>
                    {asteroid.distanceLD.toFixed(1)} LD
                  </div>

                  <div>
                    <span className="block text-cyan-300/80">Size</span>~
                    {Math.round(asteroid.diameterM)} m
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {fullscreen && selectedData && (
        <div className="absolute bottom-5 right-5 z-20 w-[340px] rounded-2xl border border-white/10 bg-background/80 p-4 shadow-2xl backdrop-blur-xl">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-foreground">
                {selectedData.label}
              </p>

              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">
                {selectedData.type}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSelectedData(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className={
              followTargetId === selectedData.id
                ? "mb-3 w-full justify-center border-cyan-300/40 bg-cyan-400/15 text-cyan-100 transition duration-200 hover:scale-[1.01] active:scale-[0.99]"
                : "mb-3 w-full justify-center bg-white/[0.035] transition duration-200 hover:scale-[1.01] active:scale-[0.99]"
            }
            onClick={() => focusBodyById(selectedData.id, true)}
          >
            <Crosshair className="h-4 w-4" />
            {followTargetId === selectedData.id ? "Following object" : "Focus object"}
          </Button>

          {followTargetId === selectedData.id && (
            <Button
              variant="ghost"
              size="sm"
              className="mb-3 w-full justify-center text-muted-foreground hover:text-foreground"
              onClick={() => setFollowMode(null)}
            >
              Stop following
            </Button>
          )}

          <div className="space-y-2">
            {selectedData.details.map((detail) => (
              <div
                key={detail}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground"
              >
                {detail}
              </div>
            ))}
          </div>
        </div>
      )}

      {!fullscreen && (
        <div className="pointer-events-none absolute bottom-5 right-5 z-10 rounded-2xl border border-white/10 bg-background/65 px-4 py-3 text-xs text-muted-foreground shadow-xl backdrop-blur-xl">
          <p>Asteroid belt: 2.2–3.3 AU</p>
          <p>NEO asteroids: generated from NASA API or local fallback</p>
        </div>
      )}
    </div>
  );
}