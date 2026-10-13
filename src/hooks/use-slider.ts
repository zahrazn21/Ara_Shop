"use client";
import { useCallback, useEffect, useState } from "react";

export function useSlider(length: number, interval = 5000) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % length), [length]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + length) % length), [length]);

  useEffect(() => {
    if (paused || length < 2) return;
    const t = setInterval(next, interval);
    return () => clearInterval(t);
  }, [paused, next, interval, length]);

  return { index, next, prev, goTo: setIndex, pause: () => setPaused(true), resume: () => setPaused(false) };
}
