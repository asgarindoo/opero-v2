"use client";

import { useEffect, useRef, useState } from "react";

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: "delay-200" | "delay-400";
  animation?: "fade-in-up" | "scale-in";
  threshold?: number;
}

export default function FadeIn({
  children,
  className = "",
  delay,
  animation = "fade-in-up",
  threshold = 0.15,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`${className} ${visible ? `animate-${animation} ${delay ?? ""}` : "opacity-0"}`}
    >
      {children}
    </div>
  );
}
