"use client";

import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/navigation";
import { Home, Hash, Heart, Settings } from "lucide-react";
import type { ComponentType } from "react";

interface Tab {
  key: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

const tabs: readonly Tab[] = [
  { key: "home", href: "/", icon: Home },
  { key: "counter", href: "/counter", icon: Hash },
  { key: "favorites", href: "/favorites", icon: Heart },
  { key: "settings", href: "/settings", icon: Settings },
];

export function BottomNav() {
  const t = useTranslations("Nav");
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-gold-200 dark:border-gold-800/30 bg-white/95 dark:bg-dark-card/95 backdrop-blur-md rounded-t-2xl">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ key, href, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/" && pathname.startsWith(href));

          return (
            <Link
              key={key}
              href={href}
              className={`relative flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors ${
                isActive
                  ? "text-gold-500"
                  : "text-gold-700 dark:text-gold-700 hover:text-gold-500"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{t(key)}</span>
              {isActive && (
                <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-gold-500" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
