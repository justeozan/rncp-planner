export interface NavLink {
  text: string;
  href: string;
}

export const brand: NavLink = {
  text: "RNCP planner",
  href: "/planner",
};

export const navLinks: NavLink[] = [
  { text: "Planner", href: "/planner" },
  { text: "Calculator", href: "/calculator" },
  { text: "RNCP", href: "/rncp" },
];
