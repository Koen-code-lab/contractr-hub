import { useState } from "react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "xl" | "2xl";

const sizeMap: Record<Size, { box: string; text: string }> = {
  sm: { box: "w-10 h-10 rounded-full", text: "text-xs" },
  md: { box: "w-12 h-12 rounded-xl", text: "text-sm" },
  lg: { box: "w-14 h-14 rounded-2xl", text: "text-base" },
  xl: { box: "w-20 h-20 rounded-2xl", text: "text-2xl" },
  "2xl": { box: "w-32 h-32 rounded-3xl", text: "text-3xl" },
};

function initialsFrom(name?: string | null) {
  if (!name) return "··";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function CompanyAvatar({
  name,
  logoUrl,
  size = "md",
  shape,
  className,
}: {
  name?: string | null;
  logoUrl?: string | null;
  size?: Size;
  shape?: "rounded" | "circle";
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const s = sizeMap[size];
  const shapeClass = shape === "circle" ? "rounded-full" : s.box.includes("rounded") ? "" : "rounded-xl";
  const baseBox = shape === "circle" ? s.box.replace(/rounded-[a-z0-9]+/, "rounded-full") : s.box;
  const showImg = !!logoUrl && !errored;

  return (
    <div
      className={cn(
        baseBox,
        shapeClass,
        "relative overflow-hidden shrink-0 bg-gradient-to-br from-foreground to-foreground/70 text-background flex items-center justify-center font-bold",
        className,
      )}
    >
      {showImg ? (
        <>
          {!loaded && (
            <span className={cn("absolute inset-0 flex items-center justify-center", s.text)}>
              {initialsFrom(name)}
            </span>
          )}
          <img
            src={logoUrl}
            alt={name ? `${name} logo` : "Bedrijfslogo"}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
            className={cn(
              "w-full h-full object-contain bg-card transition-opacity duration-300",
              loaded ? "opacity-100" : "opacity-0",
            )}
          />
        </>
      ) : (
        <span className={s.text}>{initialsFrom(name)}</span>
      )}
    </div>
  );
}
