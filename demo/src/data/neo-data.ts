export interface NeoObject {
  id: string;
  name: string;
  date: string;
  datePL: string;
  distanceLD: number;
  velocityKms: number;
  diameterM: number;
  isPHA: boolean;
  orbitClass: string;
  risk: "low" | "medium" | "high" | "critical";
  note: string;
}

export interface AlertItem {
  id: string;
  title: string;
  titlePL: string;
  description: string;
  descriptionPL: string;
  level: "low" | "medium" | "high" | "critical";
  time: string;
}

export const neoObjects: NeoObject[] = [
  { id: "1", name: "2024 XR7", date: "Jun 8, 2026", datePL: "8 cze 2026", distanceLD: 2.3, velocityKms: 12.4, diameterM: 180, isPHA: false, orbitClass: "Apollo", risk: "medium", note: "Very close approach with moderate size." },
  { id: "2", name: "2025 TN2", date: "Jun 7, 2026", datePL: "7 cze 2026", distanceLD: 4.1, velocityKms: 21.5, diameterM: 320, isPHA: true, orbitClass: "Aten", risk: "high", note: "Fast PHA object selected for monitoring." },
  { id: "3", name: "2024 FP3", date: "Jun 10, 2026", datePL: "10 cze 2026", distanceLD: 3.2, velocityKms: 15.8, diameterM: 210, isPHA: false, orbitClass: "Apollo", risk: "medium", note: "Close but currently not marked as PHA." },
  { id: "4", name: "2025 HC8", date: "Jun 13, 2026", datePL: "13 cze 2026", distanceLD: 5.6, velocityKms: 19.2, diameterM: 380, isPHA: true, orbitClass: "Apollo", risk: "high", note: "Large PHA object with a relatively close approach." },
  { id: "5", name: "2024 YM", date: "Jun 8, 2026", datePL: "8 cze 2026", distanceLD: 6.8, velocityKms: 11.3, diameterM: 95, isPHA: false, orbitClass: "Amor", risk: "low", note: "Small object, useful as a baseline case." },
  { id: "6", name: "2025 QR", date: "Jun 16, 2026", datePL: "16 cze 2026", distanceLD: 7.1, velocityKms: 16.7, diameterM: 290, isPHA: false, orbitClass: "Apollo", risk: "medium", note: "Medium risk due to size and speed." },
  { id: "7", name: "2025 KQ", date: "Jun 9, 2026", datePL: "9 cze 2026", distanceLD: 8.7, velocityKms: 18.2, diameterM: 450, isPHA: true, orbitClass: "Aten", risk: "high", note: "Largest object in the current dataset." },
  { id: "8", name: "2024 LK2", date: "Jun 14, 2026", datePL: "14 cze 2026", distanceLD: 9.3, velocityKms: 13.9, diameterM: 140, isPHA: false, orbitClass: "Amor", risk: "low", note: "Standard close approach." },
  { id: "9", name: "2024 VN", date: "Jun 17, 2026", datePL: "17 cze 2026", distanceLD: 11.5, velocityKms: 14.6, diameterM: 160, isPHA: false, orbitClass: "Apollo", risk: "low", note: "Monitored as part of traffic overview." },
  { id: "10", name: "2024 BG", date: "Jun 11, 2026", datePL: "11 cze 2026", distanceLD: 12.4, velocityKms: 10.8, diameterM: 120, isPHA: false, orbitClass: "Amor", risk: "low", note: "Low priority watch item." },
];

export const chartData = [
  { date: "Jun 7", count: 5, risk: 62 },
  { date: "Jun 8", count: 4, risk: 48 },
  { date: "Jun 9", count: 7, risk: 73 },
  { date: "Jun 10", count: 3, risk: 35 },
  { date: "Jun 11", count: 6, risk: 41 },
  { date: "Jun 12", count: 5, risk: 38 },
  { date: "Jun 13", count: 8, risk: 78 },
  { date: "Jun 14", count: 4, risk: 31 },
  { date: "Jun 15", count: 3, risk: 22 },
  { date: "Jun 16", count: 9, risk: 58 },
];

export const distanceBuckets = [
  { name: "0-5 LD", value: 3 },
  { name: "5-10 LD", value: 5 },
  { name: "10-20 LD", value: 8 },
  { name: "20+ LD", value: 31 },
];

export const alerts: AlertItem[] = [
  { id: "a1", title: "Close approach below 3 LD", titlePL: "Zbliżenie poniżej 3 LD", description: "2024 XR7 will pass at 2.3 lunar distances.", descriptionPL: "2024 XR7 minie Ziemię w odległości 2.3 odległości księżycowej.", level: "medium", time: "18 min ago" },
  { id: "a2", title: "PHA object detected", titlePL: "Wykryto obiekt PHA", description: "2025 TN2 is marked as potentially hazardous.", descriptionPL: "2025 TN2 jest oznaczony jako potencjalnie niebezpieczny.", level: "high", time: "2 h ago" },
  { id: "a3", title: "Large diameter object", titlePL: "Obiekt o dużej średnicy", description: "2025 KQ estimated diameter is about 450 m.", descriptionPL: "Szacowana średnica 2025 KQ wynosi około 450 m.", level: "high", time: "6 h ago" },
];
