"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function PortfolioHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo / Name */}
          <Link href="/" className="group">
            <h1 className="font-serif text-xl md:text-2xl font-bold text-foreground tracking-tight uppercase">
              Andra's
            </h1>
            <p className="text-xs text-muted-foreground uppercase tracking-[0.3em] font-light">
              Photography
            </p>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6 md:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-xs md:text-sm font-medium uppercase tracking-widest transition-colors hover:text-foreground",
                  pathname === link.href ||
                    (link.href !== "/" && pathname.startsWith(link.href))
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
