import React from "react";
import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";
import type { IllustrationName } from "@/data/menu";

type ArtProps = { size?: number };

const Cup = ({ size }: ArtProps) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Ellipse cx="50" cy="87" rx="40" ry="7" fill="#E3CFAE" />
    <Path d="M72 42h6a9 9 0 010 18h-7" fill="none" stroke="#FFFAF2" strokeWidth="6" strokeLinecap="round" />
    <Path d="M20 36h52v18c0 17-12 28-26 28S20 71 20 54z" fill="#FFFAF2" />
    <Ellipse cx="46" cy="36" rx="26" ry="6" fill="#6B4129" />
    <Path d="M46 32c-4 0-6 2-6 4 0 3 6 5 6 5s6-2 6-5c0-2-2-4-6-4z" fill="#ECDCC2" />
    <Path d="M38 24c-4-5 4-8 0-13M52 24c-4-5 4-8 0-13" stroke="#C8873F" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".75" />
  </Svg>
);

const Iced = ({ size }: ArtProps) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path d="M26 24h48l-6 62H32z" fill="#F6E9D3" />
    <Path d="M29 44h42l-3 42H32z" fill="#8A5A36" />
    <Path d="M29 44h42l-1.2 14H30.2z" fill="#ECDCC2" />
    <Rect x="35" y="28" width="15" height="15" rx="3" fill="#FFFFFF" opacity=".75" />
    <Rect x="53" y="34" width="12" height="12" rx="3" fill="#FFFFFF" opacity=".65" />
    <Path d="M62 8l-6 44" stroke="#C8873F" strokeWidth="5" strokeLinecap="round" />
  </Svg>
);

const Croissant = ({ size }: ArtProps) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path d="M8 66c4-28 24-40 42-40s38 12 42 40c-8 10-20 8-27-3-4 7-11 7-15 0-7 11-19 13-27 3z" fill="#D9A05B" />
    <Path d="M34 38l8 26M50 30v34M66 38l-8 26" stroke="#B87C3C" strokeWidth="3.5" strokeLinecap="round" fill="none" />
  </Svg>
);

const Cake = ({ size }: ArtProps) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path d="M10 68h80v16a4 4 0 01-4 4H14a4 4 0 01-4-4z" fill="#C8873F" />
    <Path d="M10 52h80v16H10z" fill="#FFFAF2" />
    <Path d="M10 38a4 4 0 014-4h72a4 4 0 014 4v14H10z" fill="#6B4129" />
    <Circle cx="50" cy="28" r="6.5" fill="#B5483A" />
  </Svg>
);

const Bean = ({ size }: ArtProps) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Ellipse cx="50" cy="50" rx="24" ry="35" transform="rotate(30 50 50)" fill="#6B4129" />
    <Path d="M45 18c15 20-9 42 6 64" stroke="#2F1F17" strokeWidth="4.5" fill="none" strokeLinecap="round" transform="rotate(30 50 50)" />
  </Svg>
);

const art: Record<IllustrationName, React.ComponentType<ArtProps>> = {
  cup: Cup,
  iced: Iced,
  croi: Croissant,
  cake: Cake,
  bean: Bean,
};

export function Illustration({ name, size = 80 }: { name: IllustrationName; size?: number }) {
  const Art = art[name];
  return <Art size={size} />;
}
