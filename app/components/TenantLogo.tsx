"use client";

interface TenantLogoProps {
  name: string;
  logo?: string | null;
  size?: "sm" | "md" | "lg";
  color?: string;
  loading?: boolean;
  className?: string;
}

const sizeClass = {
  sm: "w-7 h-7 rounded-[4px] text-[11px]",
  md: "w-9 h-9 rounded-[6px] text-[13px]",
  lg: "w-12 h-12 rounded-[8px] text-[16px]",
};

export default function TenantLogo({
  name,
  logo,
  size = "md",
  color = "var(--color-primary)",
  loading = false,
  className = "",
}: TenantLogoProps) {
  const initial = (name.trim().charAt(0) || "W").toUpperCase();
  const classes = [
    sizeClass[size],
    "flex items-center justify-center overflow-hidden shrink-0 font-display font-bold",
    className,
  ].join(" ");

  return (
    <div
      className={classes}
      style={{ background: logo ? "transparent" : color, color: "#fff" }}
      aria-label={`${name} logo`}
    >
      {loading ? (
        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
      ) : logo ? (
        <img src={logo} alt="" className="w-full h-full object-contain" />
      ) : (
        initial
      )}
    </div>
  );
}
