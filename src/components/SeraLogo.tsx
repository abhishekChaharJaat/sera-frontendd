import { Outfit } from "next/font/google";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "900"] });

export function SeraIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="iconBg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22f0a0" />
          <stop offset="100%" stopColor="#0a9e5c" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="11" fill="url(#iconBg)" />
      <text x="18" y="25.5" textAnchor="middle"
        fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
        fontSize="22" fontWeight="800" fill="white">S</text>
    </svg>
  );
}

export default function SeraLogo() {
  return (
    <div className={`${outfit.className} flex items-end gap-0.5`}>
      <span
        style={{
          fontSize: "26px",
          fontWeight: 900,
          background: "linear-gradient(160deg, #4fffb0, #19c37d)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1,
        }}
      >
        S
      </span>
      <span
        style={{
          fontSize: "22px",
          fontWeight: 300,
          color: "rgba(255,255,255,0.88)",
          lineHeight: 1,
          letterSpacing: "0.04em",
        }}
      >
        era
      </span>
    </div>
  );
}
