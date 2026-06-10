import { Info } from "lucide-react";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";

interface InfoHintProps {
  text: string;
}

interface TooltipPosition {
  top: number;
  left: number;
}

export function InfoHint({ text }: InfoHintProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({
    top: 0,
    left: 0,
  });

  function openTooltip() {
    const button = buttonRef.current;

    if (!button) {
      return;
    }

    const rect = button.getBoundingClientRect();
    const tooltipWidth = 280;
    const margin = 12;

    const left = Math.min(
      Math.max(rect.left + rect.width / 2 - tooltipWidth / 2, margin),
      window.innerWidth - tooltipWidth - margin
    );

    const top = rect.bottom + 10;

    setPosition({ top, left });
    setIsOpen(true);
  }

  function closeTooltip() {
    setIsOpen(false);
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        onFocus={openTooltip}
        onBlur={closeTooltip}
        className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-cyan-300 transition hover:border-cyan-300/60 hover:bg-cyan-300/15"
        aria-label="Info"
      >
        <Info className="h-3 w-3" />
      </button>

      {isOpen &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[9999] w-[280px] rounded-xl border border-cyan-300/20 bg-black/95 p-3 text-xs leading-relaxed text-muted-foreground shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl"
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-cyan-300/20 bg-black/95" />
            {text}
          </div>,
          document.body
        )}
    </>
  );
}