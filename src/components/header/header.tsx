import { Button } from "@/components/ui/button";
import Link from "next/link";
import GitHub from "../icons/GitHub";
import { brand } from "./nav/links";
import { MainNav } from "./nav/main-nav";
import { MobileNav } from "./nav/mobile-nav";
import ThemeToggle from "./theme-toggle";

export function Header() {
  return (
    <header className="@container sticky top-0 z-50 flex w-full items-start justify-center border-border/40 border-b bg-background md:bg-background/95 md:backdrop-blur-md md:supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 @max-[1400px]:w-full @min-[1400px]:w-[1400px] p-4">
        <MobileNav />
        <Link
          href={brand.href}
          className="mr-6 flex items-center font-semibold text-foreground text-sm"
        >
          {brand.text}
        </Link>
        <MainNav />

        <div className="ml-auto flex items-center gap-x-4">
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="hidden md:flex"
          >
            <Link
              href="https://github.com/justeozan/rncp-planner"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHub className="mr-2 size-6" />
              Star on GitHub
            </Link>
          </Button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default Header;
