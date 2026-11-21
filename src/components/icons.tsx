import React from "react";
import Svg, { Circle, Path, Rect } from "react-native-svg";

export type IconName =
  | "home"
  | "menu"
  | "bag"
  | "user"
  | "search"
  | "heart"
  | "plus"
  | "minus"
  | "back"
  | "pin"
  | "clock"
  | "check"
  | "star"
  | "bell"
  | "chev"
  | "card"
  | "gear";

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

const paths: Record<IconName, React.ReactNode> = {
  home: <Path d="M3 11l9-8 9 8v10h-6v-6H9v6H3z" />,
  menu: (
    <>
      <Path d="M5 9h11v5a5 5 0 01-5 5h-1a5 5 0 01-5-5z" />
      <Path d="M16 11h2a2 2 0 010 4h-2M8 3v3M12 3v3" />
    </>
  ),
  bag: (
    <>
      <Path d="M5 8h14l-1 12H6z" />
      <Path d="M9 8V6a3 3 0 016 0v2" />
    </>
  ),
  user: (
    <>
      <Circle cx="12" cy="8" r="4" />
      <Path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),
  search: (
    <>
      <Circle cx="11" cy="11" r="7" />
      <Path d="M20 20l-4-4" />
    </>
  ),
  heart: <Path d="M12 20s-8-5-8-11a4.5 4.5 0 018-2.5A4.5 4.5 0 0120 9c0 6-8 11-8 11z" />,
  plus: <Path d="M12 5v14M5 12h14" />,
  minus: <Path d="M5 12h14" />,
  back: <Path d="M15 5l-7 7 7 7" />,
  pin: (
    <>
      <Path d="M12 21s-7-6-7-11a7 7 0 0114 0c0 5-7 11-7 11z" />
      <Circle cx="12" cy="10" r="2.5" />
    </>
  ),
  clock: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 7v5l3 2" />
    </>
  ),
  check: <Path d="M5 12l5 5 9-10" />,
  star: <Path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />,
  bell: (
    <>
      <Path d="M6 16v-5a6 6 0 0112 0v5l2 2H4z" />
      <Path d="M10 21h4" />
    </>
  ),
  chev: <Path d="M9 5l7 7-7 7" />,
  card: (
    <>
      <Rect x="3" y="6" width="18" height="13" rx="3" />
      <Path d="M3 10h18" />
    </>
  ),
  gear: (
    <>
      <Circle cx="12" cy="12" r="3" />
      <Path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
    </>
  ),
};

export function Icon({ name, size = 20, color = "#2B1D16", strokeWidth = 2 }: IconProps) {
  const filled = name === "star";
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : "none"}
      stroke={filled ? "none" : color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessibilityLabel={name}
    >
      {paths[name]}
    </Svg>
  );
}
