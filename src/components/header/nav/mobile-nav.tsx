"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { navLinks } from "./links";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      modal={false}
    >
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetHeader className="sr-only">
        <SheetTitle>Navigation Menu</SheetTitle>
      </SheetHeader>
      <SheetContent
        side="left"
        hasCloseButton={false}
        className="prevent-scroll top-14"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        aria-describedby={undefined}
      >
        <ScrollArea className="h-full">
          <div className="flex flex-col divide-y">
            {navLinks.map((link) => (
              <MobileLink
                key={link.href}
                href={link.href}
                className="py-5 font-medium transition-colors first:pt-0 last:pb-0 hover:text-foreground/80"
                onOpenChange={setOpen}
              >
                {link.text}
              </MobileLink>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) {
  const router = useRouter();
  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString());
        onOpenChange?.(false);
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Link>
  );
}
