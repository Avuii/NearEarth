import { useMemo, useState } from "react";
import type { DashboardNeoItem } from "../types/dashboard";
import { Card } from "./ui/card";

interface RadarVisualizationProps {
    objects: DashboardNeoItem[];
    lang: "pl" | "en";
    onSelect?: (id: string) => void;
}

interface RadarPoint {
    id: string;
    name: string;
    x: number;
    y: number;
    radius: number;
    distance: number;
    velocity: number;
    diameter: number;
    closeApproachDate: string;
    isPotentiallyHazardous: boolean;
    isOutsideRange: boolean;
}

const RADAR_MAX_LD = 20;
const SVG_SIZE = 720;
const CENTER = SVG_SIZE / 2;
const OUTER_RADIUS = 245;
const OUTSIDE_RADIUS = 280;
const OUTSIDE_RADIUS_ALT = 300;

export function RadarVisualization({
    objects,
    lang,
    onSelect,
}: RadarVisualizationProps) {
    const [hovered, setHovered] = useState<RadarPoint | null>(null);

    const copy =
        lang === "pl"
            ? {
                title: "Radar bliskich przelotów",
                subtitle:
                    "Ziemia znajduje się w centrum. Ringi pokazują odległość w LD, a obiekty poza 20 LD są pokazane lekko poza zewnętrznym pierścieniem.",
                earth: "Ziemia",
                moonDistance: "1 LD — odległość do Księżyca",
                veryClose: "5 LD — strefa bardzo bliska",
                closeZone: "10 LD — strefa bliskiego przelotu",
                monitored: "20 LD — strefa monitorowana",
                outside: "Poza zakresem 20 LD",
                regular: "Obiekt NEO",
                hazardous: "Obiekt PHA",
                legend: "Legenda",
                zones: "Strefy",
                visualRules: "Jak czytać radar",
                distance: "Odległość",
                diameter: "Średnica",
                velocity: "Prędkość",
                date: "Data",
                outsideRange: "Poza zakresem 20 LD",
                ruleSize: "rozmiar punktu = szacowana średnica",
                rulePha: "czerwony punkt = PHA",
                ruleOutside: "żółta obwódka = obiekt dalej niż 20 LD",
                ruleLabels: "etykiety są pokazane dla bliższych obiektów",
            }
            : {
                title: "Close approach radar",
                subtitle:
                    "Earth is at the center. Rings show distance in LD, and objects beyond 20 LD are placed slightly outside the outer ring.",
                earth: "Earth",
                moonDistance: "1 LD — Moon distance",
                veryClose: "5 LD — very close zone",
                closeZone: "10 LD — close approach zone",
                monitored: "20 LD — monitored zone",
                outside: "Outside 20 LD range",
                regular: "NEO object",
                hazardous: "PHA object",
                legend: "Legend",
                zones: "Zones",
                visualRules: "Visual rules",
                distance: "Distance",
                diameter: "Diameter",
                velocity: "Velocity",
                date: "Date",
                outsideRange: "Outside 20 LD range",
                ruleSize: "point size = estimated diameter",
                rulePha: "red = PHA",
                ruleOutside: "yellow outline = farther than 20 LD",
                ruleLabels: "labels shown for nearer objects",
            };

    const radarPoints = useMemo(() => {
        const outsideObjects = objects.filter(
            (item) => item.missDistanceLunar > RADAR_MAX_LD
        );

        return objects.map((item) => {
            const isOutsideRange = item.missDistanceLunar > RADAR_MAX_LD;

            let angle = getStableAngle(item.id);
            let orbitalRadius = mapLdToRadius(item.missDistanceLunar);

            if (isOutsideRange) {
                const outsideIndex = outsideObjects.findIndex(
                    (outsideItem) => outsideItem.id === item.id
                );

                const safeIndex = outsideIndex >= 0 ? outsideIndex : 0;
                const outsideCount = Math.max(outsideObjects.length, 1);
                const angleOffset = Math.PI / outsideCount;

                angle =
                    -Math.PI / 2 +
                    (safeIndex / outsideCount) * Math.PI * 2 +
                    angleOffset;

                orbitalRadius =
                    safeIndex % 2 === 0 ? OUTSIDE_RADIUS : OUTSIDE_RADIUS_ALT;
            }

            const x = CENTER + Math.cos(angle) * orbitalRadius;
            const y = CENTER + Math.sin(angle) * orbitalRadius;

            return {
                id: item.id,
                name: item.name,
                x,
                y,
                radius: getPointRadius(item.diameterAverageMeters),
                distance: item.missDistanceLunar,
                velocity: item.velocityKilometersPerSecond,
                diameter: item.diameterAverageMeters,
                closeApproachDate: item.closeApproachDate,
                isPotentiallyHazardous: item.isPotentiallyHazardous,
                isOutsideRange,
            } satisfies RadarPoint;
        });
    }, [objects]);

    return (
        <Card className="overflow-hidden border-white/10 bg-black/70 p-6 backdrop-blur-xl">
            <div className="mb-5">
                <h3 className="text-xl font-semibold text-foreground">{copy.title}</h3>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                    {copy.subtitle}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/50 p-4">
                    <svg
                        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
                        className="h-auto w-full"
                    >
                        <defs>

                            <radialGradient id="earthFill" cx="35%" cy="28%" r="70%">
                                <stop offset="0%" stopColor="rgba(186,230,253,1)" />
                                <stop offset="35%" stopColor="rgba(14,165,233,1)" />
                                <stop offset="76%" stopColor="rgba(37,99,235,1)" />
                                <stop offset="100%" stopColor="rgba(15,23,42,1)" />
                            </radialGradient>

                            <clipPath id="earthClip">
                                <circle cx={CENTER} cy={CENTER} r="23" />
                            </clipPath>
                        </defs>

                        <circle
                            cx={CENTER}
                            cy={CENTER}
                            r={OUTSIDE_RADIUS_ALT + 10}
                            fill="rgba(255,255,255,0.012)"
                            stroke="rgba(255,255,255,0.035)"
                        />

                        <circle
                            cx={CENTER}
                            cy={CENTER}
                            r={OUTSIDE_RADIUS}
                            fill="none"
                            stroke="rgba(251,191,36,0.12)"
                            strokeDasharray="3 8"
                        />

                        <circle
                            cx={CENTER}
                            cy={CENTER}
                            r={OUTSIDE_RADIUS_ALT}
                            fill="none"
                            stroke="rgba(251,191,36,0.08)"
                            strokeDasharray="3 10"
                        />

                        <RadarRing radius={mapLdToRadius(1)} label="1 LD" />
                        <RadarRing radius={mapLdToRadius(5)} label="5 LD" />
                        <RadarRing radius={mapLdToRadius(10)} label="10 LD" />
                        <RadarRing radius={mapLdToRadius(20)} label="20 LD" />

                        <line
                            x1={CENTER}
                            y1={CENTER - OUTER_RADIUS}
                            x2={CENTER}
                            y2={CENTER + OUTER_RADIUS}
                            stroke="rgba(255,255,255,0.06)"
                        />

                        <line
                            x1={CENTER - OUTER_RADIUS}
                            y1={CENTER}
                            x2={CENTER + OUTER_RADIUS}
                            y2={CENTER}
                            stroke="rgba(255,255,255,0.06)"
                        />

                        <g>
                            <circle
                                cx={CENTER}
                                cy={CENTER}
                                r={23}
                                fill="url(#earthFill)"
                                stroke="rgba(255,255,255,0.4)"
                                strokeWidth="2"
                            />

                            <g clipPath="url(#earthClip)">
                                <path
                                    d={`M ${CENTER - 20} ${CENTER - 4}
        C ${CENTER - 14} ${CENTER - 16}, ${CENTER - 2} ${CENTER - 18}, ${CENTER + 2} ${CENTER - 8}
        C ${CENTER - 2} ${CENTER - 3}, ${CENTER - 8} ${CENTER + 1}, ${CENTER - 4} ${CENTER + 7}
        C ${CENTER - 11} ${CENTER + 5}, ${CENTER - 18} ${CENTER + 3}, ${CENTER - 20} ${CENTER - 4}`}
                                    fill="rgba(34,197,94,0.82)"
                                />

                                <path
                                    d={`M ${CENTER + 5} ${CENTER - 14}
        C ${CENTER + 17} ${CENTER - 10}, ${CENTER + 22} ${CENTER - 2}, ${CENTER + 15} ${CENTER + 6}
        C ${CENTER + 9} ${CENTER + 3}, ${CENTER + 8} ${CENTER - 4}, ${CENTER + 3} ${CENTER - 5}
        C ${CENTER + 8} ${CENTER - 8}, ${CENTER + 8} ${CENTER - 11}, ${CENTER + 5} ${CENTER - 14}`}
                                    fill="rgba(22,163,74,0.8)"
                                />

                                <path
                                    d={`M ${CENTER - 3} ${CENTER + 9}
        C ${CENTER + 5} ${CENTER + 8}, ${CENTER + 12} ${CENTER + 13}, ${CENTER + 8} ${CENTER + 21}
        C ${CENTER + 1} ${CENTER + 20}, ${CENTER - 3} ${CENTER + 16}, ${CENTER - 3} ${CENTER + 9}`}
                                    fill="rgba(34,197,94,0.72)"
                                />
                            </g>
                        </g>

                        <text
                            x={CENTER}
                            y={CENTER + 54}
                            textAnchor="middle"
                            className="fill-white text-[14px] font-medium"
                        >
                            {copy.earth}
                        </text>

                        {radarPoints.map((point) => (
                            <g
                                key={point.id}
                                onMouseEnter={() => setHovered(point)}
                                onMouseLeave={() => setHovered(null)}
                                onClick={() => onSelect?.(point.id)}
                                className={onSelect ? "cursor-pointer" : "cursor-default"}
                            >
                                <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r={point.radius + 5}
                                    fill={
                                        point.isPotentiallyHazardous
                                            ? "rgba(244,63,94,0.14)"
                                            : "rgba(45,212,191,0.13)"
                                    }
                                />

                                <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r={point.radius}
                                    fill={
                                        point.isPotentiallyHazardous
                                            ? "rgba(244,63,94,0.95)"
                                            : "rgba(45,212,191,0.95)"
                                    }
                                    stroke={
                                        point.isOutsideRange
                                            ? "rgba(251,191,36,0.98)"
                                            : "rgba(255,255,255,0.35)"
                                    }
                                    strokeWidth={point.isOutsideRange ? 2.4 : 1}
                                    opacity={point.isOutsideRange ? 0.88 : 1}
                                />

                                {point.distance <= 10 && (
                                    <text
                                        x={point.x + 10}
                                        y={point.y - 10}
                                        className="pointer-events-none fill-white text-[11px]"
                                    >
                                        {truncateName(point.name)}
                                    </text>
                                )}
                            </g>
                        ))}
                    </svg>

                    {hovered && (
                        <div className="absolute right-4 top-4 w-72 rounded-2xl border border-white/10 bg-black/90 p-4 text-sm shadow-2xl backdrop-blur-xl">
                            <p className="font-semibold text-foreground">{hovered.name}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                ID: {hovered.id}
                            </p>

                            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                                <p>
                                    {copy.distance}:{" "}
                                    <span className="text-foreground">
                                        {hovered.distance.toFixed(2)} LD
                                    </span>
                                </p>

                                <p>
                                    {copy.diameter}:{" "}
                                    <span className="text-foreground">
                                        ~{Math.round(hovered.diameter)} m
                                    </span>
                                </p>

                                <p>
                                    {copy.velocity}:{" "}
                                    <span className="text-foreground">
                                        {hovered.velocity.toFixed(1)} km/s
                                    </span>
                                </p>

                                <p>
                                    {copy.date}:{" "}
                                    <span className="text-foreground">
                                        {hovered.closeApproachDate}
                                    </span>
                                </p>

                                <p>
                                    PHA:{" "}
                                    <span className="text-foreground">
                                        {hovered.isPotentiallyHazardous ? "YES" : "NO"}
                                    </span>
                                </p>

                                {hovered.isOutsideRange && (
                                    <p className="pt-1 text-amber-300">{copy.outsideRange}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="mb-3 font-semibold text-foreground">{copy.legend}</p>

                        <div className="space-y-3 text-sm text-muted-foreground">
                            <LegendItem color="bg-sky-400" label={copy.earth} />
                            <LegendItem color="bg-teal-400" label={copy.regular} />
                            <LegendItem color="bg-rose-400" label={copy.hazardous} />
                            <LegendItem color="bg-amber-400" label={copy.outside} />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="mb-3 font-semibold text-foreground">{copy.zones}</p>

                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>{copy.moonDistance}</p>
                            <p>{copy.veryClose}</p>
                            <p>{copy.closeZone}</p>
                            <p>{copy.monitored}</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="mb-2 font-semibold text-foreground">
                            {copy.visualRules}
                        </p>

                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>• {copy.ruleSize}</p>
                            <p>• {copy.rulePha}</p>
                            <p>• {copy.ruleOutside}</p>
                            <p>• {copy.ruleLabels}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

function RadarRing({
    radius,
    label,
}: {
    radius: number;
    label: string;
}) {
    return (
        <>
            <circle
                cx={CENTER}
                cy={CENTER}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeDasharray="5 5"
            />

            <text
                x={CENTER + radius + 8}
                y={CENTER - 6}
                className="fill-slate-400 text-[11px]"
            >
                {label}
            </text>
        </>
    );
}

function LegendItem({
    color,
    label,
}: {
    color: string;
    label: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <span className={`h-3 w-3 rounded-full ${color}`} />
            <span>{label}</span>
        </div>
    );
}

function mapLdToRadius(ld: number) {
    return (Math.min(ld, RADAR_MAX_LD) / RADAR_MAX_LD) * OUTER_RADIUS;
}

function getPointRadius(diameterMeters: number) {
    if (!Number.isFinite(diameterMeters) || diameterMeters <= 0) {
        return 4;
    }

    if (diameterMeters < 50) return 4;
    if (diameterMeters < 150) return 5;
    if (diameterMeters < 300) return 6;
    if (diameterMeters < 600) return 8;
    return 10;
}

function getStableAngle(value: string) {
    let hash = 0;

    for (let i = 0; i < value.length; i += 1) {
        hash = (hash * 31 + value.charCodeAt(i)) % 360;
    }

    return (hash * Math.PI) / 180;
}

function truncateName(name: string) {
    if (name.length <= 16) {
        return name;
    }

    return `${name.slice(0, 13)}...`;
}