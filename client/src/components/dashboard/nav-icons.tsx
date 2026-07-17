import type { SVGProps } from "react";

const base = (props: SVGProps<SVGSVGElement>) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const NavIcons = {
  categories: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  menu: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <path d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13 5.4 5M7 13l-1.4 6M17 13l1.4 6" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  ),
  tables: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM17 17h4M17 21h4M21 17v4" />
    </svg>
  ),
  photos: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  ),
  staff: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  kitchen: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  dashboard: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <path d="M3 13h8V3H3zM13 21h8V11h-8zM13 8h8V3h-8zM3 21h8v-5H3z" />
    </svg>
  ),
  hotels: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M15 21V9h2a2 2 0 0 1 2 2v10" />
      <path d="M9 7h2M9 11h2M9 15h2" />
    </svg>
  ),
  logout: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
  menuIcon: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  close: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
};

export type NavIconKey = keyof typeof NavIcons;
