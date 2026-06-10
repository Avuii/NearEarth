import { useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Database,
  ExternalLink,
  Gauge,
  Globe2,
  Info,
  Layers,
  Lightbulb,
  Moon,
  Orbit,
  Radar,
  Ruler,
  ShieldAlert,
  Sparkles,
  Telescope,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Language } from "../lib/i18n";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

interface EducationCardProps {
  lang: Language;
}

type CategoryId =
  | "basics"
  | "risk"
  | "measurements"
  | "asteroids"
  | "solarSystem"
  | "spaceObjects";

type SpaceVisualType =
  | "asteroid"
  | "comet"
  | "meteoroid"
  | "dwarfPlanet"
  | "blackHole"
  | "gasPlanet"
  | "star"
  | "moon"
  | "nebula"
  | "galaxy"
  | "pulsar"
  | "quasar"
  | "darkMatter"
  | "sun"
  | "mercury"
  | "venus"
  | "earth"
  | "mars"
  | "asteroidBelt"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "kuiperBelt"
  | "meteorite"
  | "carbonaceous"
  | "metalAsteroid"
  | "rubblePile";

interface EducationItem {
  icon: LucideIcon;
  label: string;
  value: string;
  text: string;
  visual?: SpaceVisualType;
  link?: string;
  linkLabel?: string;
}

interface EducationCategory {
  id: CategoryId;
  icon: LucideIcon;
  title: string;
  description: string;
  items: EducationItem[];
}

interface SourceLink {
  title: string;
  text: string;
  url: string;
}

interface CategoryNote {
  icon: LucideIcon;
  title: string;
  text: string;
}

const content: Record<
  Language,
  {
    badge: string;
    title: string;
    subtitle: string;
    openSource: string;
    sourcesTitle: string;
    sourcesText: string;
    categories: EducationCategory[];
    sourceLinks: SourceLink[];
    categoryNotes: Record<CategoryId, CategoryNote[]>;
  }
> = {
  en: {
    badge: "Learning center",
    title: "Understand Near-Earth Object data",
    subtitle:
      "NASA asteroid data contains technical values. This section explains space terms in simple language, so the dashboard is easier and more fun to read.",
    openSource: "Open source",
    sourcesTitle: "Official learning sources",
    sourcesText:
      "The links below point to NASA, CNEOS and JPL pages that explain asteroid data, close approaches, moons and small-body information.",
    categories: [
      {
        id: "basics",
        icon: BookOpen,
        title: "Basics",
        description: "Core terms used across the dashboard.",
        items: [
          {
            icon: Telescope,
            label: "NEO",
            value: "Near-Earth Object",
            text: "A NEO is an asteroid or comet whose orbit brings it close to Earth's neighborhood. It does not mean that the object will hit Earth.",
            link: "https://cneos.jpl.nasa.gov/about/neo_groups.html",
            linkLabel: "CNEOS NEO groups",
          },
          {
            icon: Moon,
            label: "LD",
            value: "Lunar distance",
            text: "1 LD is about the average distance from Earth to the Moon. Lower LD means the object passes closer to Earth.",
          },
          {
            icon: Orbit,
            label: "Close approach",
            value: "Nearest pass",
            text: "A close approach is the moment when an object passes nearest to Earth during a specific encounter.",
            link: "https://cneos.jpl.nasa.gov/ca/",
            linkLabel: "CNEOS close approaches",
          },
          {
            icon: Database,
            label: "NeoWs",
            value: "NASA API data",
            text: "NASA NeoWs provides Near-Earth Object data such as object IDs, names, close approaches, distances and PHA status.",
            link: "https://api.nasa.gov/",
            linkLabel: "NASA APIs",
          },
        ],
      },
      {
        id: "risk",
        icon: ShieldAlert,
        title: "Risk & alerts",
        description: "How to read warning-like labels without panic.",
        items: [
          {
            icon: ShieldAlert,
            label: "PHA",
            value: "Potentially Hazardous Asteroid",
            text: "PHA does not mean that an impact is expected. It means the asteroid is large enough and its orbit can come relatively close to Earth.",
            link: "https://cneos.jpl.nasa.gov/glossary/PHA.html",
            linkLabel: "CNEOS PHA definition",
          },
          {
            icon: AlertTriangle,
            label: "Alert",
            value: "Generated rule match",
            text: "An in-app alert means that an object matched a simple rule, for example close distance, large size, high speed or PHA status.",
          },
          {
            icon: Radar,
            label: "Radar rings",
            value: "Distance zones",
            text: "Radar-style rings help compare close approaches visually, for example 1 LD, 5 LD, 10 LD and 20 LD.",
          },
          {
            icon: Layers,
            label: "Risk reading",
            value: "Look at several values",
            text: "Distance, diameter, velocity and PHA status should be read together. One value alone does not describe the full situation.",
          },
        ],
      },
      {
        id: "measurements",
        icon: Ruler,
        title: "Measurements",
        description: "Useful units and values used in space science.",
        items: [
          {
            icon: Moon,
            label: "LD",
            value: "Lunar distance",
            text: "LD compares an object's distance to the average Earth-Moon distance. It is useful for close asteroid flybys.",
          },
          {
            icon: Orbit,
            label: "AU",
            value: "Astronomical unit",
            text: "1 AU is roughly the average distance from Earth to the Sun. It is useful for describing distances inside the Solar System.",
          },
          {
            icon: Sparkles,
            label: "Light-year",
            value: "Distance light travels in a year",
            text: "A light-year is not a time unit. It is a distance used for stars and galaxies, far beyond typical asteroid flyby distances.",
          },
          {
            icon: Zap,
            label: "Relative velocity",
            value: "Speed compared with Earth",
            text: "This shows how fast the object moves relative to Earth during the close approach.",
          },
          {
            icon: Ruler,
            label: "Diameter",
            value: "Estimated size",
            text: "Asteroid diameter is usually shown as an estimate, often as minimum and maximum values.",
          },
          {
            icon: Sparkles,
            label: "Absolute magnitude H",
            value: "Brightness number",
            text: "H helps estimate asteroid size. A lower H value usually means a brighter and often larger object.",
          },
          {
            icon: Gauge,
            label: "Miss distance",
            value: "How far it passes",
            text: "Miss distance describes how far the object passes from Earth during the close approach.",
          },
          {
            icon: Orbit,
            label: "Orbital period",
            value: "Time for one orbit",
            text: "Orbital period tells how long an object takes to complete one orbit around the Sun or another body.",
          },
          {
            icon: Layers,
            label: "Eccentricity",
            value: "Orbit shape",
            text: "Eccentricity describes how stretched an orbit is. A value near 0 is more circular, while higher values are more elongated.",
          },
          {
            icon: Radar,
            label: "Inclination",
            value: "Orbit tilt",
            text: "Inclination tells how much an orbit is tilted compared with a reference plane, such as Earth's orbital plane.",
          },
          {
            icon: Telescope,
            label: "Albedo",
            value: "Reflectivity",
            text: "Albedo describes how much sunlight an object reflects. Dark asteroids reflect less light than bright icy objects.",
          },
          {
            icon: Database,
            label: "Estimated range",
            value: "Min and max values",
            text: "Space data often gives ranges because distant objects cannot always be measured directly with perfect precision.",
          },
        ],
      },
      {
        id: "asteroids",
        icon: Sparkles,
        title: "Asteroids",
        description: "Interesting facts about asteroids, meteorites and famous objects.",
        items: [
          {
            icon: Sparkles,
            label: "Asteroid",
            value: "Rocky small body",
            text: "An asteroid is a rocky object orbiting the Sun. Most are much smaller than planets and many are found in the asteroid belt.",
            visual: "asteroid",
          },
          {
            icon: Radar,
            label: "Asteroid belt",
            value: "Between Mars and Jupiter",
            text: "The main asteroid belt is a region between Mars and Jupiter where many rocky objects orbit the Sun.",
            visual: "asteroidBelt",
          },
          {
            icon: Database,
            label: "Composition",
            value: "Rock, metal and carbon",
            text: "Asteroids can be carbon-rich, rocky or metal-rich. Their composition helps scientists learn about the early Solar System.",
            visual: "carbonaceous",
          },
          {
            icon: Sparkles,
            label: "Metal-rich asteroids",
            value: "Example: Psyche",
            text: "Some asteroids may contain large amounts of metal. Psyche is one of the most famous metal-rich asteroid targets.",
            visual: "metalAsteroid",
          },
          {
            icon: Layers,
            label: "Rubble piles",
            value: "Loose collections",
            text: "Some asteroids are not solid rocks. They are loose collections of boulders and dust held together by weak gravity.",
            visual: "rubblePile",
          },
          {
            icon: Globe2,
            label: "Ceres",
            value: "Dwarf planet in the belt",
            text: "Ceres is the largest object in the asteroid belt and is classified as a dwarf planet.",
            visual: "dwarfPlanet",
          },
          {
            icon: Telescope,
            label: "Vesta",
            value: "Bright asteroid",
            text: "Vesta is one of the largest and brightest asteroids. It has a large impact basin near its south pole.",
            visual: "asteroid",
          },
          {
            icon: AlertTriangle,
            label: "Apophis",
            value: "Famous close approach",
            text: "Apophis became famous because early observations required careful tracking. Later measurements ruled out impact risk for known close passes.",
            visual: "asteroid",
          },
          {
            icon: Radar,
            label: "Bennu",
            value: "Sample-return target",
            text: "Bennu is a carbon-rich asteroid visited by NASA's OSIRIS-REx mission, which returned a sample to Earth.",
            visual: "rubblePile",
          },
          {
            icon: Zap,
            label: "Chelyabinsk",
            value: "Atmospheric airburst",
            text: "In 2013, a small asteroid exploded over Chelyabinsk, Russia. Events like this show why monitoring small bodies matters.",
            visual: "meteorite",
          },
          {
            icon: Sparkles,
            label: "Meteorite",
            value: "When it reaches the ground",
            text: "A small space rock is a meteoroid in space, a meteor while burning in the atmosphere, and a meteorite if it reaches the ground.",
            visual: "meteorite",
          },
          {
            icon: Telescope,
            label: "Tracking",
            value: "Repeated observations",
            text: "Astronomers observe asteroids many times to refine their orbits and predict future close approaches more accurately.",
          },
        ],
      },
      {
        id: "solarSystem",
        icon: Globe2,
        title: "Solar System",
        description: "Objects in our Solar System with quick facts and moon counts.",
        items: [
          {
            icon: Sparkles,
            label: "Sun",
            value: "The central star",
            text: "The Sun contains most of the mass in the Solar System and its gravity controls the motion of planets, asteroids and comets.",
            visual: "sun",
          },
          {
            icon: Globe2,
            label: "Mercury",
            value: "0 known moons",
            text: "Mercury is the smallest planet and the closest one to the Sun. Its surface is heavily cratered.",
            visual: "mercury",
          },
          {
            icon: Globe2,
            label: "Venus",
            value: "0 known moons",
            text: "Venus is similar in size to Earth but has a thick atmosphere and extreme surface temperatures.",
            visual: "venus",
          },
          {
            icon: Globe2,
            label: "Earth",
            value: "1 moon",
            text: "Earth is our home planet and the main reference point for NearEarth close approach distances.",
            visual: "earth",
          },
          {
            icon: Moon,
            label: "Moon",
            value: "Earth's natural satellite",
            text: "The Moon is used as a convenient distance scale in this app. 1 LD is about one Earth-Moon distance.",
            visual: "moon",
          },
          {
            icon: Globe2,
            label: "Mars",
            value: "2 known moons",
            text: "Mars has two small moons, Phobos and Deimos. It also marks the inner edge region before the asteroid belt.",
            visual: "mars",
          },
          {
            icon: Radar,
            label: "Asteroid belt",
            value: "Between Mars and Jupiter",
            text: "The main asteroid belt contains many rocky bodies, including Ceres, the only dwarf planet in the inner Solar System.",
            visual: "asteroidBelt",
          },
          {
            icon: Globe2,
            label: "Jupiter",
            value: "95 known moons",
            text: "Jupiter is the largest planet. It has giant storms, including the Great Red Spot, and many moons.",
            visual: "jupiter",
          },
          {
            icon: Globe2,
            label: "Saturn",
            value: "274 known moons",
            text: "Saturn is famous for its rings. Its moon Titan has a thick atmosphere, which is unusual for a moon.",
            visual: "saturn",
          },
          {
            icon: Globe2,
            label: "Uranus",
            value: "28 known moons",
            text: "Uranus rotates on its side. Deep inside Uranus, extreme conditions could crush carbon into diamonds.",
            visual: "uranus",
          },
          {
            icon: Globe2,
            label: "Neptune",
            value: "16 known moons",
            text: "Neptune is the most distant planet. Like Uranus, it may have extreme interior conditions connected with diamond formation.",
            visual: "neptune",
          },
          {
            icon: Globe2,
            label: "Dwarf planets",
            value: "5 officially recognized",
            text: "Ceres, Pluto, Haumea, Makemake and Eris are officially recognized dwarf planets in our Solar System.",
            visual: "dwarfPlanet",
          },
          {
            icon: Orbit,
            label: "Kuiper Belt",
            value: "Icy outer region",
            text: "The Kuiper Belt lies beyond Neptune and contains icy bodies, including Pluto and many other distant objects.",
            visual: "kuiperBelt",
          },
        ],
      },
      {
        id: "spaceObjects",
        icon: Telescope,
        title: "Space objects",
        description: "Different natural objects and structures found in space.",
        items: [
          {
            icon: Sparkles,
            label: "Asteroid",
            value: "Rocky small body",
            text: "An asteroid is a rocky object orbiting the Sun. Most asteroids are irregular in shape and much smaller than planets.",
            visual: "asteroid",
          },
          {
            icon: Sparkles,
            label: "Comet",
            value: "Icy object with a tail",
            text: "A comet is made of ice, dust and rock. When it gets closer to the Sun, it can form a glowing coma and a tail.",
            visual: "comet",
          },
          {
            icon: Zap,
            label: "Meteoroid",
            value: "Small object in space",
            text: "A meteoroid is smaller than an asteroid. When it enters Earth's atmosphere and burns, we see it as a meteor.",
            visual: "meteoroid",
          },
          {
            icon: Globe2,
            label: "Dwarf planet",
            value: "Small round world",
            text: "A dwarf planet orbits the Sun and is large enough to be round, but it has not cleared its orbital neighborhood.",
            visual: "dwarfPlanet",
          },
          {
            icon: Radar,
            label: "Black hole",
            value: "Extreme gravity",
            text: "A black hole is a region where gravity is so strong that even light cannot escape from inside its boundary.",
            visual: "blackHole",
          },
          {
            icon: Globe2,
            label: "Gas giant",
            value: "Huge gas planet",
            text: "Gas giants are massive planets made mostly of hydrogen and helium, such as Jupiter and Saturn.",
            visual: "gasPlanet",
          },
          {
            icon: Sparkles,
            label: "Star",
            value: "Glowing plasma sphere",
            text: "A star produces energy through nuclear fusion. The Sun is the closest star to Earth.",
            visual: "star",
          },
          {
            icon: Moon,
            label: "Moon",
            value: "Natural satellite",
            text: "A moon is a natural object orbiting a planet or a dwarf planet. Earth's Moon is our nearest large natural neighbor.",
            visual: "moon",
          },
          {
            icon: Sparkles,
            label: "Nebula",
            value: "Cloud of gas and dust",
            text: "A nebula is a huge cloud of gas and dust in space. Some nebulae are regions where new stars are born.",
            visual: "nebula",
          },
          {
            icon: Orbit,
            label: "Galaxy",
            value: "System of stars",
            text: "A galaxy is a massive system of stars, gas, dust and dark matter held together by gravity.",
            visual: "galaxy",
          },
          {
            icon: Zap,
            label: "Pulsar",
            value: "Rotating neutron star",
            text: "A pulsar is a rapidly rotating neutron star that sends out beams of radiation like a cosmic lighthouse.",
            visual: "pulsar",
          },
          {
            icon: Telescope,
            label: "Quasar",
            value: "Very bright galaxy core",
            text: "A quasar is an extremely bright active galactic nucleus powered by material falling into a supermassive black hole.",
            visual: "quasar",
          },
          {
            icon: Database,
            label: "Dark matter and dark energy",
            value: "Invisible universe components",
            text: "Dark matter and dark energy are not directly visible, but scientists use them to explain how galaxies move and how the universe expands.",
            visual: "darkMatter",
          },
        ],
      },
    ],
    sourceLinks: [
      {
        title: "NASA API portal",
        text: "NeoWs API documentation and NASA API key access.",
        url: "https://api.nasa.gov/",
      },
      {
        title: "CNEOS Close Approaches",
        text: "Official close approach table for Near-Earth Objects.",
        url: "https://cneos.jpl.nasa.gov/ca/",
      },
      {
        title: "NASA Space Place: Moons",
        text: "Beginner-friendly explanation of how many moons each planet has.",
        url: "https://spaceplace.nasa.gov/how-many-moons/en/",
      },
      {
        title: "NASA Science: Planets",
        text: "Overview of planets, dwarf planets and Solar System structure.",
        url: "https://science.nasa.gov/solar-system/planets/",
      },
      {
        title: "CNEOS PHA glossary",
        text: "Definition of Potentially Hazardous Asteroid.",
        url: "https://cneos.jpl.nasa.gov/glossary/PHA.html",
      },
      {
        title: "NASA Science: Asteroids, Comets and Meteors",
        text: "Beginner-friendly educational material from NASA.",
        url: "https://science.nasa.gov/asteroids-comets-meteors/",
      },
    ],
    categoryNotes: {
      basics: [
        {
          icon: Lightbulb,
          title: "Small space fact",
          text: "Most detected Near-Earth Object close approaches are safe flybys. Monitoring helps scientists compare future paths and notice objects that deserve more observation.",
        },
        {
          icon: Orbit,
          title: "Near-Earth is still space-scale",
          text: "Near-Earth does not mean close like a plane or satellite above us. In astronomy, an object can still pass hundreds of thousands or millions of kilometers away.",
        },
      ],
      risk: [
        {
          icon: Info,
          title: "How to read risk here?",
          text: "Do not judge an asteroid by one number only. A useful overview combines distance, size, relative velocity, orbit information and the PHA flag. A close flyby is interesting, but it does not automatically mean danger.",
        },
        {
          icon: ShieldAlert,
          title: "PHA is not an impact prediction",
          text: "The PHA flag means the object belongs to a monitoring category. It does not mean that NASA expects an impact.",
        },
      ],
      measurements: [
        {
          icon: Ruler,
          title: "Why are some values estimated?",
          text: "Asteroid size is often estimated from brightness and observation data. That is why APIs usually show a minimum and maximum diameter instead of one exact value.",
        },
        {
          icon: Sparkles,
          title: "Do not mix up light-years and years",
          text: "A light-year is a distance, not a time period. It is useful for stars and galaxies, while asteroid flybys are usually much closer.",
        },
      ],
      asteroids: [
        {
          icon: Sparkles,
          title: "Asteroids are not all the same",
          text: "Some asteroids are small rocks, some are several kilometers wide, and some have moons of their own. Their shape is often irregular, not perfectly round.",
        },
        {
          icon: Database,
          title: "Meteorite names tell a story",
          text: "When a piece of an asteroid survives the atmosphere and reaches the ground, scientists can study it directly as a meteorite.",
        },
      ],
      solarSystem: [
        {
          icon: Orbit,
          title: "Space is mostly empty",
          text: "Even when an asteroid is described as close, the distance can still be many times farther than the Moon. Space distances are much larger than they feel on a chart.",
        },
        {
          icon: Globe2,
          title: "Moons are still being discovered",
          text: "Moon counts can change when new small moons are confirmed, especially around giant planets like Saturn and Jupiter.",
        },
      ],
      spaceObjects: [
        {
          icon: Telescope,
          title: "Different objects, different scales",
          text: "A meteoroid can be tiny, an asteroid can be city-sized, a star is enormous, and a galaxy contains billions of stars. These visuals are simplified and not shown to scale.",
        },
        {
          icon: Sparkles,
          title: "Looking into space means looking into the past",
          text: "Light needs time to travel. When we observe distant stars, galaxies or quasars, we see them as they looked in the past, not exactly as they are right now.",
        },
      ],
    },
  },
  pl: {
    badge: "Centrum wiedzy",
    title: "Zrozum dane o obiektach NEO",
    subtitle:
      "Dane NASA o asteroidach zawierają dużo technicznych wartości. Ta sekcja tłumaczy pojęcia kosmiczne prostym językiem, żeby dashboard był łatwiejszy i ciekawszy do czytania.",
    openSource: "Otwórz źródło",
    sourcesTitle: "Oficjalne źródła edukacyjne",
    sourcesText:
      "Poniższe linki prowadzą do stron NASA, CNEOS i JPL, które wyjaśniają dane o asteroidach, bliskich przelotach, księżycach i małych ciałach Układu Słonecznego.",
    categories: [
      {
        id: "basics",
        icon: BookOpen,
        title: "Podstawy",
        description: "Najważniejsze pojęcia używane w dashboardzie.",
        items: [
          {
            icon: Telescope,
            label: "NEO",
            value: "Obiekt bliski Ziemi",
            text: "NEO to asteroida albo kometa, której orbita prowadzi ją w okolice Ziemi. Nie oznacza to, że obiekt uderzy w Ziemię.",
            link: "https://cneos.jpl.nasa.gov/about/neo_groups.html",
            linkLabel: "Grupy NEO w CNEOS",
          },
          {
            icon: Moon,
            label: "LD",
            value: "Odległość księżycowa",
            text: "1 LD to mniej więcej średnia odległość Ziemi od Księżyca. Im mniejsza wartość LD, tym bliżej Ziemi przelatuje obiekt.",
          },
          {
            icon: Orbit,
            label: "Close approach",
            value: "Najbliższy przelot",
            text: "To moment, w którym obiekt mija Ziemię w najmniejszej odległości podczas danego przelotu.",
            link: "https://cneos.jpl.nasa.gov/ca/",
            linkLabel: "Bliskie przeloty CNEOS",
          },
          {
            icon: Database,
            label: "NeoWs",
            value: "Dane z API NASA",
            text: "NASA NeoWs dostarcza dane o NEO, między innymi ID, nazwy, przeloty, dystanse i status PHA.",
            link: "https://api.nasa.gov/",
            linkLabel: "NASA APIs",
          },
        ],
      },
      {
        id: "risk",
        icon: ShieldAlert,
        title: "Ryzyko i alerty",
        description: "Jak czytać oznaczenia ostrzegawcze bez paniki.",
        items: [
          {
            icon: ShieldAlert,
            label: "PHA",
            value: "Potencjalnie niebezpieczna asteroida",
            text: "PHA nie oznacza, że asteroida uderzy w Ziemię. To informacja, że obiekt jest dość duży i jego orbita może zbliżać się do Ziemi.",
            link: "https://cneos.jpl.nasa.gov/glossary/PHA.html",
            linkLabel: "Definicja PHA CNEOS",
          },
          {
            icon: AlertTriangle,
            label: "Alert",
            value: "Spełniona reguła",
            text: "Alert w aplikacji oznacza, że obiekt spełnił prosty warunek, na przykład mały dystans, duży rozmiar, dużą prędkość albo status PHA.",
          },
          {
            icon: Radar,
            label: "Pierścienie radaru",
            value: "Strefy odległości",
            text: "Pierścienie radarowe pomagają wizualnie porównać zbliżenia, na przykład 1 LD, 5 LD, 10 LD i 20 LD.",
          },
          {
            icon: Layers,
            label: "Czytanie ryzyka",
            value: "Patrz na kilka wartości",
            text: "Dystans, średnica, prędkość i status PHA powinny być czytane razem. Jedna liczba nie opisuje całej sytuacji.",
          },
        ],
      },
      {
        id: "measurements",
        icon: Ruler,
        title: "Wartości i pomiary",
        description: "Przydatne jednostki i wartości używane w naukach o kosmosie.",
        items: [
          {
            icon: Moon,
            label: "LD",
            value: "Odległość księżycowa",
            text: "LD porównuje dystans obiektu ze średnią odległością Ziemi od Księżyca. Przydaje się przy bliskich przelotach asteroid.",
          },
          {
            icon: Orbit,
            label: "AU",
            value: "Jednostka astronomiczna",
            text: "1 AU to w przybliżeniu średnia odległość Ziemi od Słońca. Używa się jej do opisywania dystansów w Układzie Słonecznym.",
          },
          {
            icon: Sparkles,
            label: "Rok świetlny",
            value: "Dystans światła w rok",
            text: "Rok świetlny nie jest jednostką czasu. To odległość używana dla gwiazd i galaktyk, znacznie dalej niż typowe przeloty asteroid.",
          },
          {
            icon: Zap,
            label: "Prędkość względna",
            value: "Prędkość względem Ziemi",
            text: "Pokazuje, jak szybko obiekt porusza się względem Ziemi podczas zbliżenia.",
          },
          {
            icon: Ruler,
            label: "Średnica",
            value: "Szacowany rozmiar",
            text: "Średnica asteroidy jest zwykle podawana jako szacunek, często w formie wartości minimalnej i maksymalnej.",
          },
          {
            icon: Sparkles,
            label: "Jasność absolutna H",
            value: "Liczba związana z jasnością",
            text: "H pomaga szacować rozmiar asteroidy. Niższa wartość H zwykle oznacza jaśniejszy i często większy obiekt.",
          },
          {
            icon: Gauge,
            label: "Miss distance",
            value: "Dystans przelotu",
            text: "Miss distance opisuje, jak daleko obiekt minie Ziemię podczas najbliższego zbliżenia.",
          },
          {
            icon: Orbit,
            label: "Okres orbitalny",
            value: "Czas jednego obiegu",
            text: "Okres orbitalny mówi, ile czasu obiekt potrzebuje na wykonanie pełnego obiegu wokół Słońca albo innego ciała.",
          },
          {
            icon: Layers,
            label: "Ekscentryczność",
            value: "Kształt orbity",
            text: "Ekscentryczność opisuje, jak bardzo rozciągnięta jest orbita. Wartość bliska 0 oznacza orbitę bardziej kołową.",
          },
          {
            icon: Radar,
            label: "Inklinacja",
            value: "Nachylenie orbity",
            text: "Inklinacja mówi, jak bardzo orbita jest nachylona względem płaszczyzny odniesienia, na przykład orbity Ziemi.",
          },
          {
            icon: Telescope,
            label: "Albedo",
            value: "Odbijalność",
            text: "Albedo opisuje, jak dużo światła odbija obiekt. Ciemne asteroidy odbijają mniej światła niż jasne obiekty lodowe.",
          },
          {
            icon: Database,
            label: "Zakres szacunku",
            value: "Minimum i maksimum",
            text: "Dane kosmiczne często podają zakresy, bo odległe obiekty nie zawsze da się zmierzyć bezpośrednio z idealną dokładnością.",
          },
        ],
      },
      {
        id: "asteroids",
        icon: Sparkles,
        title: "Asteroidy",
        description: "Ciekawostki o asteroidach, meteorytach i znanych obiektach.",
        items: [
          {
            icon: Sparkles,
            label: "Asteroida",
            value: "Skaliste małe ciało",
            text: "Asteroida to skalisty obiekt krążący wokół Słońca. Większość jest dużo mniejsza od planet, a wiele znajduje się w pasie asteroid.",
            visual: "asteroid",
          },
          {
            icon: Radar,
            label: "Pas asteroid",
            value: "Między Marsem a Jowiszem",
            text: "Główny pas asteroid to obszar między Marsem a Jowiszem, w którym wiele skalistych obiektów krąży wokół Słońca.",
            visual: "asteroidBelt",
          },
          {
            icon: Database,
            label: "Skład asteroid",
            value: "Skały, metal i węgiel",
            text: "Asteroidy mogą być bogate w węgiel, skaliste albo metaliczne. Ich skład pomaga badać początki Układu Słonecznego.",
            visual: "carbonaceous",
          },
          {
            icon: Sparkles,
            label: "Asteroidy metaliczne",
            value: "Przykład: Psyche",
            text: "Niektóre asteroidy mogą zawierać dużo metalu. Psyche jest jednym z najbardziej znanych celów badań tego typu obiektów.",
            visual: "metalAsteroid",
          },
          {
            icon: Layers,
            label: "Rubble pile",
            value: "Luźna sterta skał",
            text: "Niektóre asteroidy nie są jedną litą skałą. To luźne zbiory głazów i pyłu utrzymywane przez bardzo słabą grawitację.",
            visual: "rubblePile",
          },
          {
            icon: Globe2,
            label: "Ceres",
            value: "Planeta karłowata w pasie",
            text: "Ceres jest największym obiektem w pasie asteroid i jest klasyfikowana jako planeta karłowata.",
            visual: "dwarfPlanet",
          },
          {
            icon: Telescope,
            label: "Vesta",
            value: "Jasna asteroida",
            text: "Vesta jest jedną z największych i najjaśniejszych asteroid. Ma ogromny basen uderzeniowy w okolicy bieguna południowego.",
            visual: "asteroid",
          },
          {
            icon: AlertTriangle,
            label: "Apophis",
            value: "Słynne zbliżenie",
            text: "Apophis stał się znany, bo pierwsze obserwacje wymagały dokładnego śledzenia. Późniejsze pomiary wykluczyły ryzyko uderzenia dla znanych przelotów.",
            visual: "asteroid",
          },
          {
            icon: Radar,
            label: "Bennu",
            value: "Próbka z asteroidy",
            text: "Bennu to bogata w węgiel asteroida odwiedzona przez misję NASA OSIRIS-REx, która dostarczyła próbkę na Ziemię.",
            visual: "rubblePile",
          },
          {
            icon: Zap,
            label: "Czelabińsk",
            value: "Eksplozja w atmosferze",
            text: "W 2013 roku mała asteroida eksplodowała nad Czelabińskiem w Rosji. Takie zdarzenia pokazują, dlaczego warto monitorować małe ciała.",
            visual: "meteorite",
          },
          {
            icon: Sparkles,
            label: "Meteoryt",
            value: "Gdy dotrze do gruntu",
            text: "Mała skała w kosmosie to meteoroid, podczas spalania w atmosferze widzimy meteor, a jeśli fragment dotrze do ziemi, staje się meteorytem.",
            visual: "meteorite",
          },
          {
            icon: Telescope,
            label: "Śledzenie",
            value: "Wiele obserwacji",
            text: "Astronomowie obserwują asteroidy wielokrotnie, żeby doprecyzować ich orbity i lepiej przewidywać przyszłe zbliżenia.",
          },
        ],
      },
      {
        id: "solarSystem",
        icon: Globe2,
        title: "Układ Słoneczny",
        description: "Obiekty Układu Słonecznego, liczba księżyców i krótkie ciekawostki.",
        items: [
          {
            icon: Sparkles,
            label: "Słońce",
            value: "Centralna gwiazda",
            text: "Słońce zawiera większość masy Układu Słonecznego, a jego grawitacja kontroluje ruch planet, asteroid i komet.",
            visual: "sun",
          },
          {
            icon: Globe2,
            label: "Merkury",
            value: "0 znanych księżyców",
            text: "Merkury jest najmniejszą planetą i znajduje się najbliżej Słońca. Jego powierzchnia jest mocno pokryta kraterami.",
            visual: "mercury",
          },
          {
            icon: Globe2,
            label: "Wenus",
            value: "0 znanych księżyców",
            text: "Wenus ma podobny rozmiar do Ziemi, ale bardzo gęstą atmosferę i ekstremalne temperatury powierzchni.",
            visual: "venus",
          },
          {
            icon: Globe2,
            label: "Ziemia",
            value: "1 księżyc",
            text: "Ziemia jest naszą planetą i głównym punktem odniesienia dla odległości bliskich przelotów w NearEarth.",
            visual: "earth",
          },
          {
            icon: Moon,
            label: "Księżyc",
            value: "Naturalny satelita Ziemi",
            text: "Księżyc jest używany jako wygodna skala odległości. 1 LD to mniej więcej jedna odległość Ziemia-Księżyc.",
            visual: "moon",
          },
          {
            icon: Globe2,
            label: "Mars",
            value: "2 znane księżyce",
            text: "Mars ma dwa małe księżyce: Fobosa i Deimosa. Za orbitą Marsa zaczyna się region pasa asteroid.",
            visual: "mars",
          },
          {
            icon: Radar,
            label: "Pas asteroid",
            value: "Między Marsem a Jowiszem",
            text: "Główny pas asteroid zawiera wiele skalistych ciał, w tym Ceres, jedyną planetę karłowatą w wewnętrznym Układzie Słonecznym.",
            visual: "asteroidBelt",
          },
          {
            icon: Globe2,
            label: "Jowisz",
            value: "95 znanych księżyców",
            text: "Jowisz jest największą planetą. Ma ogromne burze, w tym Wielką Czerwoną Plamę, oraz bardzo wiele księżyców.",
            visual: "jupiter",
          },
          {
            icon: Globe2,
            label: "Saturn",
            value: "274 znane księżyce",
            text: "Saturn słynie z pierścieni. Jego księżyc Tytan ma gęstą atmosferę, co jest nietypowe dla księżyca.",
            visual: "saturn",
          },
          {
            icon: Globe2,
            label: "Uran",
            value: "28 znanych księżyców",
            text: "Uran obraca się prawie bokiem. W jego wnętrzu ekstremalne warunki mogą sprzyjać powstawaniu diamentów z węgla.",
            visual: "uranus",
          },
          {
            icon: Globe2,
            label: "Neptun",
            value: "16 znanych księżyców",
            text: "Neptun jest najdalszą planetą. Podobnie jak Uran, może mieć ekstremalne warunki związane z powstawaniem diamentów.",
            visual: "neptune",
          },
          {
            icon: Globe2,
            label: "Planety karłowate",
            value: "5 oficjalnie uznanych",
            text: "Ceres, Pluton, Haumea, Makemake i Eris to oficjalnie uznane planety karłowate w Układzie Słonecznym.",
            visual: "dwarfPlanet",
          },
          {
            icon: Orbit,
            label: "Pas Kuipera",
            value: "Lodowy obszar zewnętrzny",
            text: "Pas Kuipera znajduje się za Neptunem i zawiera lodowe ciała, w tym Plutona oraz wiele innych odległych obiektów.",
            visual: "kuiperBelt",
          },
        ],
      },
      {
        id: "spaceObjects",
        icon: Telescope,
        title: "Obiekty w kosmosie",
        description: "Różne naturalne obiekty i struktury występujące w przestrzeni kosmicznej.",
        items: [
          {
            icon: Sparkles,
            label: "Asteroida",
            value: "Skaliste małe ciało",
            text: "Asteroida to skalisty obiekt krążący wokół Słońca. Większość asteroid ma nieregularny kształt i jest dużo mniejsza od planet.",
            visual: "asteroid",
          },
          {
            icon: Sparkles,
            label: "Kometa",
            value: "Lodowy obiekt z ogonem",
            text: "Kometa składa się z lodu, pyłu i skał. Gdy zbliża się do Słońca, może tworzyć świecącą otoczkę i ogon.",
            visual: "comet",
          },
          {
            icon: Zap,
            label: "Meteoroid",
            value: "Mały obiekt w kosmosie",
            text: "Meteoroid jest mniejszy od asteroidy. Gdy wpada w atmosferę Ziemi i się spala, widzimy go jako meteor.",
            visual: "meteoroid",
          },
          {
            icon: Globe2,
            label: "Planeta karłowata",
            value: "Mały okrągły świat",
            text: "Planeta karłowata krąży wokół Słońca i jest na tyle duża, żeby mieć prawie kulisty kształt, ale nie oczyściła swojej orbity.",
            visual: "dwarfPlanet",
          },
          {
            icon: Radar,
            label: "Czarna dziura",
            value: "Ekstremalna grawitacja",
            text: "Czarna dziura to obszar, w którym grawitacja jest tak silna, że nawet światło nie może uciec z jej wnętrza.",
            visual: "blackHole",
          },
          {
            icon: Globe2,
            label: "Gazowy olbrzym",
            value: "Ogromna planeta gazowa",
            text: "Gazowe olbrzymy to masywne planety zbudowane głównie z wodoru i helu, na przykład Jowisz i Saturn.",
            visual: "gasPlanet",
          },
          {
            icon: Sparkles,
            label: "Gwiazda",
            value: "Świecąca kula plazmy",
            text: "Gwiazda wytwarza energię dzięki reakcjom jądrowym. Słońce jest najbliższą Ziemi gwiazdą.",
            visual: "star",
          },
          {
            icon: Moon,
            label: "Księżyc",
            value: "Naturalny satelita",
            text: "Księżyc to naturalny obiekt krążący wokół planety albo planety karłowatej. Księżyc Ziemi jest naszym najbliższym dużym sąsiadem.",
            visual: "moon",
          },
          {
            icon: Sparkles,
            label: "Mgławica",
            value: "Chmura gazu i pyłu",
            text: "Mgławica to ogromna chmura gazu i pyłu w kosmosie. Niektóre mgławice są miejscami narodzin nowych gwiazd.",
            visual: "nebula",
          },
          {
            icon: Orbit,
            label: "Galaktyka",
            value: "Układ gwiazd",
            text: "Galaktyka to ogromny układ gwiazd, gazu, pyłu i ciemnej materii utrzymywany przez grawitację.",
            visual: "galaxy",
          },
          {
            icon: Zap,
            label: "Pulsar",
            value: "Wirująca gwiazda neutronowa",
            text: "Pulsar to szybko obracająca się gwiazda neutronowa, która wysyła wiązki promieniowania jak kosmiczna latarnia.",
            visual: "pulsar",
          },
          {
            icon: Telescope,
            label: "Kwazar",
            value: "Bardzo jasne jądro galaktyki",
            text: "Kwazar to ekstremalnie jasne aktywne jądro galaktyki zasilane materią opadającą na supermasywną czarną dziurę.",
            visual: "quasar",
          },
          {
            icon: Database,
            label: "Ciemna materia i ciemna energia",
            value: "Niewidzialne składniki kosmosu",
            text: "Ciemna materia i ciemna energia nie są bezpośrednio widoczne, ale pomagają naukowcom wyjaśniać ruch galaktyk i rozszerzanie się Wszechświata.",
            visual: "darkMatter",
          },
        ],
      },
    ],
    sourceLinks: [
      {
        title: "NASA API portal",
        text: "Dokumentacja NeoWs i dostęp do klucza API NASA.",
        url: "https://api.nasa.gov/",
      },
      {
        title: "CNEOS Close Approaches",
        text: "Oficjalna tabela bliskich przelotów obiektów NEO.",
        url: "https://cneos.jpl.nasa.gov/ca/",
      },
      {
        title: "NASA Space Place: księżyce",
        text: "Przystępne wyjaśnienie, ile księżyców mają planety.",
        url: "https://spaceplace.nasa.gov/how-many-moons/en/",
      },
      {
        title: "NASA Science: planety",
        text: "Przegląd planet, planet karłowatych i struktury Układu Słonecznego.",
        url: "https://science.nasa.gov/solar-system/planets/",
      },
      {
        title: "CNEOS PHA glossary",
        text: "Definicja Potentially Hazardous Asteroid.",
        url: "https://cneos.jpl.nasa.gov/glossary/PHA.html",
      },
      {
        title: "NASA Science: Asteroids, Comets and Meteors",
        text: "Przystępne materiały edukacyjne NASA.",
        url: "https://science.nasa.gov/asteroids-comets-meteors/",
      },
    ],
    categoryNotes: {
      basics: [
        {
          icon: Lightbulb,
          title: "Krótka ciekawostka",
          text: "Większość wykrytych zbliżeń NEO to bezpieczne przeloty. Monitoring pomaga naukowcom porównywać przyszłe trajektorie i szybciej zauważać obiekty wymagające dodatkowych obserwacji.",
        },
        {
          icon: Orbit,
          title: "Blisko Ziemi nadal oznacza kosmiczną skalę",
          text: "Obiekt bliski Ziemi nie oznacza czegoś bliskiego jak samolot albo satelita. W astronomii taki obiekt może nadal mijać Ziemię setki tysięcy albo miliony kilometrów dalej.",
        },
      ],
      risk: [
        {
          icon: Info,
          title: "Jak czytać ryzyko?",
          text: "Nie oceniaj asteroidy tylko po jednej liczbie. Sensowny obraz daje dopiero połączenie dystansu, rozmiaru, prędkości względnej, informacji o orbicie i flagi PHA. Bliski przelot jest ciekawy, ale nie oznacza automatycznie zagrożenia.",
        },
        {
          icon: ShieldAlert,
          title: "PHA to nie przewidywanie uderzenia",
          text: "Flaga PHA oznacza kategorię obiektu do monitorowania. Nie oznacza, że NASA przewiduje uderzenie w Ziemię.",
        },
      ],
      measurements: [
        {
          icon: Ruler,
          title: "Dlaczego część wartości to szacunki?",
          text: "Rozmiar asteroidy często szacuje się na podstawie jasności i danych obserwacyjnych. Dlatego API zwykle pokazuje minimalną i maksymalną średnicę, a nie jedną dokładną liczbę.",
        },
        {
          icon: Sparkles,
          title: "Rok świetlny to nie rok",
          text: "Rok świetlny jest jednostką odległości, a nie czasu. Przydaje się dla gwiazd i galaktyk, a przeloty asteroid są zwykle dużo bliżej.",
        },
      ],
      asteroids: [
        {
          icon: Sparkles,
          title: "Asteroidy nie są identyczne",
          text: "Niektóre asteroidy są małymi skałami, inne mają kilka kilometrów średnicy, a część z nich ma nawet własne księżyce. Ich kształt często jest nieregularny, a nie idealnie okrągły.",
        },
        {
          icon: Database,
          title: "Meteoryty są kosmicznymi próbkami",
          text: "Gdy fragment asteroidy przetrwa przejście przez atmosferę i dotrze do gruntu, naukowcy mogą badać go bezpośrednio jako meteoryt.",
        },
      ],
      solarSystem: [
        {
          icon: Orbit,
          title: "Kosmos jest prawie pusty",
          text: "Nawet gdy asteroida jest opisana jako bliska, dystans nadal może być wielokrotnie większy niż odległość do Księżyca. Odległości kosmiczne są dużo większe, niż wydaje się na wykresie.",
        },
        {
          icon: Globe2,
          title: "Księżyce nadal są odkrywane",
          text: "Liczba księżyców może się zmieniać, gdy potwierdzane są nowe małe księżyce, szczególnie wokół olbrzymów takich jak Saturn i Jowisz.",
        },
      ],
      spaceObjects: [
        {
          icon: Telescope,
          title: "Różne obiekty, różne skale",
          text: "Meteoroid może być bardzo mały, asteroida może mieć rozmiar miasta, gwiazda jest ogromna, a galaktyka zawiera miliardy gwiazd. Proste wizualizacje edukacyjne nie pokazują tych obiektów w jednej skali.",
        },
        {
          icon: Sparkles,
          title: "Patrząc w kosmos, patrzymy w przeszłość",
          text: "Światło potrzebuje czasu, żeby do nas dotrzeć. Gdy obserwujemy odległe gwiazdy, galaktyki albo kwazary, widzimy je takimi, jakie były kiedyś, a nie dokładnie takimi, jakie są teraz.",
        },
      ],
    },
  },
};

export function EducationCard({ lang }: EducationCardProps) {
  const c = content[lang];
  const [activeCategoryId, setActiveCategoryId] = useState<CategoryId>("basics");

  const activeCategory =
    c.categories.find((category) => category.id === activeCategoryId) ??
    c.categories[0];

  const ActiveIcon = activeCategory.icon;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-white/10 bg-black/70 p-6 backdrop-blur-xl">
        <div className="mb-6">
          <Badge variant="secondary" className="mb-3">
            <BookOpen className="h-3.5 w-3.5" />
            {c.badge}
          </Badge>

          <h3 className="text-2xl font-semibold tracking-tight text-foreground">
            {c.title}
          </h3>

          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {c.subtitle}
          </p>
        </div>

        <div className="mb-6 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.025] p-1">
          <div className="flex min-w-max gap-1">
            {c.categories.map((category) => (
              <CategoryButton
                key={category.id}
                category={category}
                active={category.id === activeCategory.id}
                onClick={() => setActiveCategoryId(category.id)}
              />
            ))}
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-cyan-300/15 bg-gradient-to-r from-cyan-300/[0.08] to-transparent p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <ActiveIcon className="h-5 w-5" />
            </div>

            <div>
              <p className="text-lg font-semibold text-foreground">
                {activeCategory.title}
              </p>

              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {activeCategory.description}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {activeCategory.items.map((item) => (
            <EducationTile
              key={`${activeCategory.id}-${item.label}`}
              item={item}
              openSource={c.openSource}
            />
          ))}
        </div>

        {c.categoryNotes[activeCategory.id].length > 0 && (
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {c.categoryNotes[activeCategory.id].map((note) => (
              <InfoBox
                key={note.title}
                icon={note.icon}
                title={note.title}
                text={note.text}
              />
            ))}
          </div>
        )}
      </Card>

      <Card className="overflow-hidden border-white/10 bg-black/70 p-6 backdrop-blur-xl">
        <div className="mb-5">
          <Badge variant="secondary" className="mb-3">
            <ExternalLink className="h-3.5 w-3.5" />
            NASA / JPL
          </Badge>

          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            {c.sourcesTitle}
          </h3>

          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {c.sourcesText}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {c.sourceLinks.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/[0.055]"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="font-medium text-foreground">{source.title}</p>
                <ExternalLink className="h-4 w-4 text-muted-foreground transition group-hover:text-cyan-300" />
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {source.text}
              </p>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}

function CategoryButton({
  category,
  active,
  onClick,
}: {
  category: EducationCategory;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = category.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-medium text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.22)] transition duration-200"
          : "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition duration-200 hover:bg-white/[0.06] hover:text-foreground"
      }
    >
      <Icon className="h-4 w-4" />
      {category.title}
    </button>
  );
}

function EducationTile({
  item,
  openSource,
}: {
  item: EducationItem;
  openSource: string;
}) {
  const Icon = item.icon;

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.045] to-white/[0.02] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300/25">
      {item.visual ? (
        <SpaceObjectVisual type={item.visual} />
      ) : (
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
          <Icon className="h-5 w-5" />
        </div>
      )}

      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
        {item.label}
      </p>

      <p className="mt-1 font-semibold text-foreground">{item.value}</p>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {item.text}
      </p>

      {item.link && (
        <a
          href={item.link}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-cyan-200 transition hover:border-cyan-300/30 hover:bg-cyan-300/10"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {item.linkLabel ?? openSource}
        </a>
      )}
    </div>
  );
}

function InfoBox({
  icon: Icon,
  title,
  text,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="mb-2 flex items-center gap-2 text-foreground">
        <Icon className="h-4 w-4 text-cyan-300" />
        <p className="font-medium">{title}</p>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

function SpaceObjectVisual({ type }: { type: SpaceVisualType }) {
  if (type === "asteroid") {
    return <RockVisual color1="#94a3b8" color2="#334155" color3="#020617" />;
  }

  if (type === "carbonaceous") {
    return <RockVisual color1="#475569" color2="#1f2937" color3="#020617" />;
  }

  if (type === "metalAsteroid") {
    return <RockVisual color1="#dbeafe" color2="#64748b" color3="#111827" glow="rgba(147,197,253,0.35)" />;
  }

  if (type === "rubblePile") {
    return (
      <VisualShell>
        <div className="relative h-14 w-14">
          <span className="absolute left-3 top-2 h-7 w-7 rounded-[45%_55%_40%_60%] bg-slate-500 shadow-[0_0_18px_rgba(34,211,238,0.16)]" />
          <span className="absolute right-2 top-4 h-6 w-6 rounded-[55%_45%_50%_50%] bg-slate-700" />
          <span className="absolute bottom-2 left-5 h-5 w-5 rounded-[40%_60%_55%_45%] bg-slate-400" />
          <span className="absolute bottom-3 right-5 h-3 w-3 rounded-full bg-slate-300/70" />
        </div>
      </VisualShell>
    );
  }

  if (type === "comet") {
    return (
      <VisualShell>
        <div className="relative h-12 w-28">
          <div className="absolute right-5 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-gradient-to-br from-cyan-200 via-cyan-400 to-blue-900 shadow-[0_0_32px_rgba(34,211,238,0.45)]" />
          <div className="absolute right-10 top-1/2 h-2 w-24 -translate-y-1/2 rounded-full bg-gradient-to-l from-cyan-300/55 to-transparent blur-sm" />
          <div className="absolute right-10 top-7 h-1.5 w-20 rounded-full bg-gradient-to-l from-blue-300/40 to-transparent blur-sm" />
          <div className="absolute right-10 top-3 h-1.5 w-16 rounded-full bg-gradient-to-l from-white/35 to-transparent blur-sm" />
        </div>
      </VisualShell>
    );
  }

  if (type === "meteoroid") {
    return (
      <VisualShell>
        <div className="relative h-14 w-28 rotate-[-18deg]">
          <div className="absolute right-4 top-5 h-4 w-4 rounded-full bg-orange-200 shadow-[0_0_24px_rgba(251,146,60,0.75)]" />
          <div className="absolute right-7 top-[26px] h-2 w-24 rounded-full bg-gradient-to-l from-orange-300/70 via-cyan-300/30 to-transparent blur-sm" />
          <div className="absolute right-7 top-4 h-1 w-16 rounded-full bg-gradient-to-l from-white/50 to-transparent blur-sm" />
        </div>
      </VisualShell>
    );
  }

  if (type === "meteorite") {
    return (
      <VisualShell>
        <div className="relative h-12 w-14 rounded-[35%_65%_45%_55%] bg-gradient-to-br from-orange-200 via-slate-700 to-black shadow-[0_0_22px_rgba(251,146,60,0.28)]">
          <span className="absolute left-3 top-3 h-2 w-2 rounded-full bg-black/35" />
          <span className="absolute bottom-3 right-3 h-3 w-3 rounded-full bg-orange-300/25" />
        </div>
      </VisualShell>
    );
  }

  if (type === "sun" || type === "star") {
    return (
      <VisualShell background="radial-gradient(circle at center, rgba(250,204,21,0.18), rgba(255,255,255,0.02) 48%, transparent 75%)">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-100 via-yellow-400 to-orange-700 shadow-[0_0_42px_rgba(250,204,21,0.65)]" />
      </VisualShell>
    );
  }

  if (type === "mercury") {
    return <PlanetVisual color1="#d1d5db" color2="#6b7280" color3="#111827" crater />;
  }

  if (type === "venus") {
    return <PlanetVisual color1="#fde68a" color2="#c084fc" color3="#7c2d12" />;
  }

  if (type === "earth") {
    return (
      <VisualShell background="radial-gradient(circle at center, rgba(34,197,94,0.12), rgba(255,255,255,0.02) 48%, transparent 75%)">
        <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-blue-300 via-blue-700 to-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.28)]">
          <span className="absolute left-2 top-3 h-3 w-5 rounded-full bg-emerald-300/70" />
          <span className="absolute bottom-3 right-2 h-4 w-4 rounded-full bg-emerald-400/60" />
          <span className="absolute left-0 top-7 h-1 w-full bg-white/25" />
        </div>
      </VisualShell>
    );
  }

  if (type === "mars") {
    return <PlanetVisual color1="#fecaca" color2="#dc2626" color3="#431407" crater />;
  }

  if (type === "moon") {
    return <PlanetVisual color1="#e5e7eb" color2="#64748b" color3="#0f172a" crater />;
  }

  if (type === "jupiter" || type === "gasPlanet") {
    return (
      <VisualShell background="radial-gradient(circle at center, rgba(251,146,60,0.12), rgba(255,255,255,0.02) 48%, transparent 75%)">
        <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-orange-200 via-amber-600 to-slate-950 shadow-[0_0_30px_rgba(251,146,60,0.35)]">
          <span className="absolute left-0 top-2 h-1.5 w-full bg-white/30" />
          <span className="absolute left-0 top-5 h-2 w-full bg-black/20" />
          <span className="absolute left-0 top-8 h-1.5 w-full bg-orange-100/25" />
          <span className="absolute right-2 top-6 h-2 w-4 rounded-full bg-red-800/60" />
        </div>
      </VisualShell>
    );
  }

  if (type === "saturn") {
    return (
      <VisualShell background="radial-gradient(circle at center, rgba(251,191,36,0.12), rgba(255,255,255,0.02) 48%, transparent 75%)">
        <div className="relative flex h-16 w-20 items-center justify-center">
          <div className="absolute h-5 w-20 rotate-[-12deg] rounded-full border border-amber-200/45" />
          <div className="relative h-11 w-11 rounded-full bg-gradient-to-br from-yellow-100 via-amber-500 to-slate-900 shadow-[0_0_28px_rgba(251,191,36,0.3)]" />
        </div>
      </VisualShell>
    );
  }

  if (type === "uranus") {
    return <PlanetVisual color1="#cffafe" color2="#22d3ee" color3="#164e63" />;
  }

  if (type === "neptune") {
    return <PlanetVisual color1="#bfdbfe" color2="#2563eb" color3="#0f172a" />;
  }

  if (type === "dwarfPlanet") {
    return <PlanetVisual color1="#ddd6fe" color2="#8b5cf6" color3="#111827" ring />;
  }

  if (type === "asteroidBelt" || type === "kuiperBelt") {
    return (
      <VisualShell>
        <div className="relative h-16 w-28">
          <div className="absolute left-1/2 top-1/2 h-10 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/20" />
          <div className="absolute left-1/2 top-1/2 h-6 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/15" />
          {Array.from({ length: 16 }).map((_, index) => (
            <span
              key={index}
              className="absolute h-1 w-1 rounded-full bg-cyan-200/70"
              style={{
                left: `${12 + ((index * 23) % 80)}%`,
                top: `${20 + ((index * 17) % 55)}%`,
              }}
            />
          ))}
        </div>
      </VisualShell>
    );
  }

  if (type === "blackHole") {
    return (
      <VisualShell background="radial-gradient(circle at center, rgba(14,165,233,0.14), rgba(255,255,255,0.02) 48%, transparent 75%)">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute h-16 w-16 rounded-full border border-cyan-200/25 blur-[1px]" />
          <div className="absolute h-10 w-20 rotate-[-18deg] rounded-full border border-cyan-300/40" />
          <div className="h-8 w-8 rounded-full bg-black shadow-[0_0_38px_rgba(34,211,238,0.35)]" />
        </div>
      </VisualShell>
    );
  }

  if (type === "nebula") {
    return (
      <VisualShell background="black">
        <div className="relative h-16 w-28">
          <div className="absolute left-4 top-4 h-10 w-20 rounded-full bg-cyan-400/25 blur-xl" />
          <div className="absolute left-8 top-1 h-12 w-16 rounded-full bg-fuchsia-500/25 blur-xl" />
          <div className="absolute left-12 top-7 h-8 w-12 rounded-full bg-violet-400/25 blur-lg" />
          <span className="absolute left-5 top-5 h-1 w-1 rounded-full bg-white" />
          <span className="absolute right-5 top-4 h-1 w-1 rounded-full bg-white/80" />
          <span className="absolute bottom-5 left-12 h-1 w-1 rounded-full bg-white/70" />
        </div>
      </VisualShell>
    );
  }

  if (type === "galaxy") {
    return (
      <VisualShell background="radial-gradient(circle at center, rgba(99,102,241,0.14), rgba(255,255,255,0.02) 48%, transparent 75%)">
        <div className="relative h-16 w-16">
          <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.75)]" />
          <div className="absolute left-1/2 top-1/2 h-8 w-16 -translate-x-1/2 -translate-y-1/2 rotate-[25deg] rounded-full border border-cyan-200/35" />
          <div className="absolute left-1/2 top-1/2 h-5 w-14 -translate-x-1/2 -translate-y-1/2 rotate-[-20deg] rounded-full border border-violet-300/30" />
        </div>
      </VisualShell>
    );
  }

  if (type === "pulsar") {
    return (
      <VisualShell background="radial-gradient(circle at center, rgba(34,211,238,0.16), rgba(255,255,255,0.02) 48%, transparent 75%)">
        <div className="relative flex h-16 w-28 items-center justify-center">
          <div className="absolute h-1 w-28 rotate-[18deg] rounded-full bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent blur-sm" />
          <div className="absolute h-1 w-28 rotate-[-18deg] rounded-full bg-gradient-to-r from-transparent via-blue-300/50 to-transparent blur-sm" />
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-white via-cyan-300 to-blue-950 shadow-[0_0_30px_rgba(34,211,238,0.55)]" />
        </div>
      </VisualShell>
    );
  }

  if (type === "quasar") {
    return (
      <VisualShell background="radial-gradient(circle at center, rgba(250,204,21,0.14), rgba(255,255,255,0.02) 48%, transparent 75%)">
        <div className="relative flex h-16 w-28 items-center justify-center">
          <div className="absolute h-2 w-28 rounded-full bg-gradient-to-r from-transparent via-yellow-200/80 to-transparent blur-sm" />
          <div className="absolute h-12 w-12 rounded-full bg-yellow-200/20 blur-xl" />
          <div className="h-6 w-6 rounded-full bg-white shadow-[0_0_36px_rgba(250,204,21,0.8)]" />
        </div>
      </VisualShell>
    );
  }

  return (
    <VisualShell background="radial-gradient(circle at center, rgba(148,163,184,0.12), rgba(255,255,255,0.02) 48%, transparent 75%)">
      <div className="relative h-16 w-24">
        <div className="absolute left-6 top-3 h-10 w-10 rounded-full border border-slate-300/25 blur-[1px]" />
        <div className="absolute left-10 top-5 h-8 w-8 rounded-full border border-cyan-300/20 blur-[1px]" />
        <div className="absolute left-3 top-7 h-6 w-6 rounded-full border border-violet-300/20 blur-[1px]" />
        <span className="absolute left-12 top-8 h-1.5 w-1.5 rounded-full bg-white/40" />
      </div>
    </VisualShell>
  );
}

function VisualShell({
  children,
  background = "radial-gradient(circle at center, rgba(34,211,238,0.14), rgba(255,255,255,0.02) 48%, transparent 75%)",
}: {
  children: React.ReactNode;
  background?: string;
}) {
  return (
    <div
      className="mb-4 flex h-20 items-center justify-center overflow-hidden rounded-2xl border border-white/10"
      style={{ background }}
    >
      {children}
    </div>
  );
}

function PlanetVisual({
  color1,
  color2,
  color3,
  crater = false,
  ring = false,
}: {
  color1: string;
  color2: string;
  color3: string;
  crater?: boolean;
  ring?: boolean;
}) {
  return (
    <VisualShell>
      <div className="relative flex h-16 w-20 items-center justify-center">
        {ring && (
          <span className="absolute h-4 w-20 rotate-[-12deg] rounded-full border border-cyan-200/35" />
        )}
        <div
          className="relative h-12 w-12 rounded-full shadow-[0_0_30px_rgba(34,211,238,0.18)]"
          style={{
            background: `linear-gradient(135deg, ${color1}, ${color2}, ${color3})`,
          }}
        >
          {crater && (
            <>
              <span className="absolute left-3 top-3 h-2 w-2 rounded-full bg-black/25" />
              <span className="absolute bottom-3 right-3 h-3 w-3 rounded-full bg-black/20" />
              <span className="absolute bottom-5 left-5 h-1.5 w-1.5 rounded-full bg-white/25" />
            </>
          )}
        </div>
      </div>
    </VisualShell>
  );
}

function RockVisual({
  color1,
  color2,
  color3,
  glow = "rgba(34,211,238,0.18)",
}: {
  color1: string;
  color2: string;
  color3: string;
  glow?: string;
}) {
  return (
    <VisualShell>
      <div
        className="relative h-12 w-12 rounded-[42%_58%_47%_53%] border border-cyan-200/20"
        style={{
          background: `linear-gradient(135deg, ${color1}, ${color2}, ${color3})`,
          boxShadow: `0 0 28px ${glow}`,
        }}
      >
        <span className="absolute left-3 top-2 h-1.5 w-1.5 rounded-full bg-black/40" />
        <span className="absolute bottom-3 right-3 h-2 w-2 rounded-full bg-black/35" />
        <span className="absolute bottom-5 left-5 h-1 w-1 rounded-full bg-white/30" />
      </div>
    </VisualShell>
  );
}