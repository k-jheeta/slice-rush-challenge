// Inline SVG icons. Line icons use `currentColor`, so set their colour with the CSS `color` property.
// <PizzaIcon> is multi-colour: it reads --pizza-crust / --pizza-sauce / --pizza-topping custom properties.
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 16, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="7" cy="7" r="4.5" />
    <path d="M10.5 10.5 14 14" />
  </Svg>
);

export const HeartIcon = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <Svg {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M8 13.5S2 10 2 6a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 4-6 7.5-6 7.5Z" />
  </Svg>
);

export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m4 4 8 8M12 4l-8 8" />
  </Svg>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m4 6 4 4 4-4" />
  </Svg>
);

export const ArrowUpIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 13V3M4 7l4-4 4 4" />
  </Svg>
);

export const ArrowDownIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 3v10M4 9l4 4 4-4" />
  </Svg>
);

export const PlusIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 3v10M3 8h10" />
  </Svg>
);

export const MinusIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 8h10" />
  </Svg>
);

export const AlertIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="8" cy="8" r="6.25" />
    <path d="M8 4.75v3.75M8 11.1v.15" />
  </Svg>
);

export const CheckCircleIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="8" cy="8" r="6.25" />
    <path d="m5.25 8.25 1.75 1.75 3.75-4" />
  </Svg>
);

export const InfoIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="8" cy="8" r="6.25" />
    <path d="M8 7.25v3.75M8 4.9v.15" />
  </Svg>
);

export const ChilliIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10.5 4.5c1.8.4 2.6 2 2 3.8-1 3-5 5.6-9.5 5.2 3.5-1.5 4.5-4 5-6.5.3-1.6 1.2-2.7 2.5-2.5Z" />
    <path d="M10.5 4.5c0-1.2.6-2.2 1.8-2.8" />
  </Svg>
);

export const LeafIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 13c0-6 4-10 10-10 0 6-4 10-10 10Z" />
    <path d="M3 13 9 7" />
  </Svg>
);

export const FlameIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 14a4 4 0 0 0 4-4c0-3-2.5-4.5-3-7.5C7 4 4 6.5 4 10a4 4 0 0 0 4 4Z" />
    <path d="M8 14a1.75 1.75 0 0 1-1.75-1.75C6.25 11 8 10 8 8.5c1 .9 1.75 2 1.75 3.75A1.75 1.75 0 0 1 8 14Z" />
  </Svg>
);

export const BikeIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="3.75" cy="11" r="2.25" />
    <circle cx="12.25" cy="11" r="2.25" />
    <path d="M3.75 11 6 6h4l2.25 5M6 6l2.5 5h1.5M9 4h2" />
  </Svg>
);

export const ScooterIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="3.5" cy="11.5" r="1.75" />
    <circle cx="12.5" cy="11.5" r="1.75" />
    <path d="M5.25 11.5h5.5l1-6.5H13M10.75 11.5 9 7H5.5a2 2 0 0 0-2 2v.75" />
  </Svg>
);

export const CarIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2 10.5V8.5l1.5-3.5h9L14 8.5v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1ZM2 8.5h12" />
    <circle cx="5" cy="11.5" r="1.25" />
    <circle cx="11" cy="11.5" r="1.25" />
  </Svg>
);

export const InboxIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2 9.5 3.6 3.6A1 1 0 0 1 4.6 3h6.8a1 1 0 0 1 1 .6L14 9.5V12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1Z" />
    <path d="M2 9.5h3.5l1 1.5h3l1-1.5H14" />
  </Svg>
);

/** Logo: a slice of pizza */
export const SliceIcon = (p: IconProps) => (
  <svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 20 20" aria-hidden="true" focusable="false" className={p.className}>
    <path d="M10 18 2.6 4.4C7.3 1.9 12.7 1.9 17.4 4.4Z" fill="#ffd36b" />
    <path d="M2.6 4.4C7.3 1.9 12.7 1.9 17.4 4.4l-.9 1.7C12.3 3.9 7.7 3.9 3.5 6.1Z" fill="#d98b3a" />
    <circle cx="8" cy="8" r="1.4" fill="#e4472f" />
    <circle cx="12" cy="9.2" r="1.2" fill="#e4472f" />
    <circle cx="10" cy="12.5" r="1.1" fill="#e4472f" />
  </svg>
);

/** A whole pizza, coloured with CSS custom properties so each category can look different */
export function PizzaIcon({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false" className={`pizza-icon ${className}`}>
      <circle cx="20" cy="20" r="19" fill="var(--pizza-crust, #e0a458)" />
      <circle cx="20" cy="20" r="15.5" fill="var(--pizza-sauce, #e4472f)" />
      <circle cx="20" cy="20" r="13.5" fill="var(--pizza-cheese, #ffe1a1)" />
      <g fill="var(--pizza-topping, #e4472f)">
        <circle cx="14" cy="15" r="2.6" />
        <circle cx="25" cy="13.5" r="2.2" />
        <circle cx="26" cy="24" r="2.6" />
        <circle cx="16" cy="26" r="2.2" />
        <circle cx="20.5" cy="19.5" r="1.8" />
      </g>
      <path d="M20 1v38M1 20h38M6.6 6.6l26.8 26.8M33.4 6.6 6.6 33.4" stroke="var(--pizza-crust, #e0a458)" strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}
