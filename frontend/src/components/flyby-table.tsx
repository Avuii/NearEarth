import { Star } from "lucide-react";
import { neoObjects } from "../data/neo-data";
import type { NeoObject } from "../data/neo-data";
import { Language, translations } from "../lib/i18n";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface FlybyTableProps {
  lang: Language;
  items?: NeoObject[];
  selectedId?: string;
  limit?: number;
  onlyHazardous?: boolean;
  closeOnly?: boolean;
  watchlistIds?: string[];
  onSelect?: (id: string) => void;
  onToggleWatch?: (id: string) => void;
}

export function FlybyTable({
  lang,
  items,
  selectedId,
  limit,
  onlyHazardous,
  closeOnly,
  watchlistIds = [],
  onSelect,
  onToggleWatch,
}: FlybyTableProps) {
  const t = translations[lang];
  const source = items ?? neoObjects;

  const rows = source
    .filter((item) => !onlyHazardous || item.isPHA)
    .filter((item) => !closeOnly || item.distanceLD <= 5)
    .slice(0, limit ?? source.length);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/70 backdrop-blur-xl">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>{t.object}</TableHead>
            <TableHead>{t.date}</TableHead>
            <TableHead>{t.distance}</TableHead>
            <TableHead>{t.velocity}</TableHead>
            <TableHead>{t.diameter}</TableHead>
            <TableHead className="text-center">{t.pha}</TableHead>
            <TableHead className="w-[170px] min-w-[170px] text-right">
              {t.action}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((item) => {
            const isWatched = watchlistIds.includes(item.id);

            return (
              <TableRow
                key={item.id}
                onClick={() => onSelect?.(item.id)}
                className={
                  selectedId === item.id
                    ? "cursor-pointer bg-primary/10 transition duration-200 hover:bg-primary/15"
                    : "cursor-pointer transition duration-200 hover:bg-secondary/50"
                }
              >
                <TableCell className="font-medium text-foreground">
                  {item.name}
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {lang === "pl" ? item.datePL : item.date}
                </TableCell>

                <TableCell>
                  <Badge variant={item.distanceLD <= 5 ? "warning" : "outline"}>
                    {item.distanceLD} LD
                  </Badge>
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {item.velocityKms} km/s
                </TableCell>

                <TableCell className="text-muted-foreground">
                  ~{item.diameterM} m
                </TableCell>

                <TableCell className="text-center">
                  {item.isPHA ? (
                    <Badge variant="danger">YES</Badge>
                  ) : (
                    <Badge variant="outline">NO</Badge>
                  )}
                </TableCell>

                <TableCell className="w-[170px] min-w-[170px] text-right">
                  <Button
                    variant={isWatched ? "default" : "ghost"}
                    size="sm"
                    className="w-[124px] justify-center transition duration-200 hover:scale-[1.03] active:scale-[0.97]"
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleWatch?.(item.id);
                    }}
                  >
                    <Star
                      className={
                        isWatched
                          ? "h-4 w-4 shrink-0 fill-current"
                          : "h-4 w-4 shrink-0"
                      }
                    />
                    <span className="w-[68px] text-left">
                      {isWatched ? "Watching" : "Watch"}
                    </span>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}

          {rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-8 text-center text-muted-foreground"
              >
                {lang === "pl" ? "Brak obiektów." : "No objects found."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}