"use client";

import { useEffect, useRef, useState } from "react";
import { LottieIcon } from "./lottie-icon";

/** <details> açılıp kapandıkça artı↔eksi Lottie (Michael Kobro, "Plus to minus"). */
export function AccordionIcon({ color = "#10233C" }: { color?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const d = ref.current?.closest("details");
    if (!d) return;
    const on = () => setOpen(d.open);
    d.addEventListener("toggle", on);
    return () => d.removeEventListener("toggle", on);
  }, []);

  return (
    <span ref={ref} className="inline-flex">
      <LottieIcon
        name="plusminus"
        size={28}
        mode="controlled"
        active={open}
        color={color}
        fallback={
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M0 7h14M7 0v14" stroke={color} strokeWidth="1.5" />
          </svg>
        }
      />
    </span>
  );
}
