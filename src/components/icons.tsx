import React from "react";
import { Circle, Path, Rect } from "react-native-svg";
import {
  AddIcon,
  BellIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  FavouriteIcon,
  Icon as GIcon,
  MenuIcon,
  RemoveIcon,
  SearchIcon,
  SettingsIcon,
  StarIcon,
  createIcon,
} from "@/components/ui/icon";

/** Brand-specific icons not covered by the pre-built Gluestack set. */
const HomeIcon = createIcon({
  viewBox: "0 0 24 24",
  path: (
    <>
      <Path d="M3 11l9-8 9 8v10h-6v-6H9v6H3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
});

const BagIcon = createIcon({
  viewBox: "0 0 24 24",
  path: (
    <>
      <Path d="M5 8h14l-1 12H6z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 8V6a3 3 0 016 0v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
});

const UserIcon = createIcon({
  viewBox: "0 0 24 24",
  path: (
    <>
      <Circle cx="12" cy="8" r="4" strokeWidth="2" />
      <Path d="M4 21c0-4 4-6 8-6s8 2 8 6" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
});

const PinIcon = createIcon({
  viewBox: "0 0 24 24",
  path: (
    <>
      <Path d="M12 21s-7-6-7-11a7 7 0 0114 0c0 5-7 11-7 11z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="10" r="2.5" strokeWidth="2" />
    </>
  ),
});

const CardIcon = createIcon({
  viewBox: "0 0 24 24",
  path: (
    <>
      <Rect x="3" y="6" width="18" height="13" rx="3" strokeWidth="2" />
      <Path d="M3 10h18" strokeWidth="2" />
    </>
  ),
});

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

const icons: Record<IconName, React.ElementType> = {
  home: HomeIcon,
  menu: MenuIcon,
  bag: BagIcon,
  user: UserIcon,
  search: SearchIcon,
  heart: FavouriteIcon,
  plus: AddIcon,
  minus: RemoveIcon,
  back: ChevronLeftIcon,
  pin: PinIcon,
  clock: ClockIcon,
  check: CheckIcon,
  star: StarIcon,
  bell: BellIcon,
  chev: ChevronRightIcon,
  card: CardIcon,
  gear: SettingsIcon,
};

export const iconFor = (name: IconName): React.ElementType => icons[name];

export type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
};

/** Compatibility wrapper so screens keep the `name` API while using Gluestack icons. */
export function Icon({ name, size = 20, className }: IconProps) {
  // Numeric sizes are forwarded to the Gluestack primitive at runtime.
  return <GIcon as={icons[name]} size={size as never} className={className ?? "text-ink"} />;
}
