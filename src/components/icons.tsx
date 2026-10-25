// Iconos SVG en línea (trazo, heredan currentColor).
import type { ReactNode } from "react";

const Svg = ({ children, size = 22 }: { children: ReactNode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const IconBolt = (p: { size?: number }) => <Svg {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></Svg>;
export const IconTarget = (p: { size?: number }) => <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" /><path d="m15 9 5-5M17 4h3v3" /></Svg>;
export const IconTrophy = (p: { size?: number }) => <Svg {...p}><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6" /></Svg>;
export const IconFlame = (p: { size?: number }) => <Svg {...p}><path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3-1-5 1-8z" /><path d="M12 21a3 3 0 0 1-3-3c0-2 2-3 3-5 1 2 3 3 3 5a3 3 0 0 1-3 3z" /></Svg>;
export const IconKeyboard = (p: { size?: number }) => <Svg {...p}><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M10 13h.01M14 13h.01M18 13h.01M7 16h10" /></Svg>;
export const IconMap = (p: { size?: number }) => <Svg {...p}><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z" /><path d="M9 3v15M15 6v15" /></Svg>;
export const IconChart = (p: { size?: number }) => <Svg {...p}><path d="M4 20V10M9 20V4M14 20v-8M19 20V7M2 20h20" /></Svg>;
export const IconGear = (p: { size?: number }) => <Svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></Svg>;
export const IconCode = (p: { size?: number }) => <Svg {...p}><path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" /></Svg>;
export const IconCross = (p: { size?: number }) => <Svg {...p}><circle cx="12" cy="12" r="8" /><path d="M12 2v5M12 17v5M2 12h5M17 12h5" /><circle cx="12" cy="12" r="1.5" /></Svg>;
export const IconClock = (p: { size?: number }) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>;
export const IconChevron = (p: { size?: number }) => <Svg {...p}><path d="m9 6 6 6-6 6" /></Svg>;
export const IconExpand = (p: { size?: number }) => <Svg {...p}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></Svg>;
export const IconLock = (p: { size?: number }) => <Svg {...p}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Svg>;
export const IconRefresh = (p: { size?: number }) => <Svg {...p}><path d="M20 11a8 8 0 1 0-2 6M20 4v7h-7" /></Svg>;
export const IconSkip = (p: { size?: number }) => <Svg {...p}><path d="m5 5 9 7-9 7zM19 5v14" /></Svg>;
export const IconPulse = (p: { size?: number }) => <Svg {...p}><path d="M2 12h5l2-6 4 12 2-6h7" /></Svg>;
export const IconMusic = (p: { size?: number }) => <Svg {...p}><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></Svg>;
export const IconPlay = (p: { size?: number }) => <Svg {...p}><path d="M7 4v16l13-8z" fill="currentColor" /></Svg>;
export const IconPause = (p: { size?: number }) => <Svg {...p}><rect x="6" y="4" width="4" height="16" fill="currentColor" /><rect x="14" y="4" width="4" height="16" fill="currentColor" /></Svg>;
export const IconNext = (p: { size?: number }) => <Svg {...p}><path d="m5 5 10 7-10 7zM19 5v14" /></Svg>;
export const IconPrev = (p: { size?: number }) => <Svg {...p}><path d="m19 5-10 7 10 7zM5 5v14" /></Svg>;
export const IconVolume = (p: { size?: number }) => <Svg {...p}><path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" /></Svg>;
export const IconMedal = (p: { size?: number }) => <Svg {...p}><circle cx="12" cy="15" r="6" /><path d="M8.5 10 6 2h4l2 5 2-5h4l-2.5 8M12 12.5l.9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2-1.4-1.4 2-.3z" /></Svg>;
