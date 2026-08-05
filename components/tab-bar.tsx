"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/today", label: "오늘" },
  { href: "/feed", label: "피드" },
  { href: "/board", label: "순위" },
  { href: "/me", label: "나" },
] as const;

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="주요 화면"
      className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-green/25 bg-paper/95 backdrop-blur"
    >
      <ul className="mx-auto flex w-full max-w-sm">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1.5 py-3 text-sm font-bold ${
                  active ? "text-green" : "text-ink-soft"
                }`}
              >
                {/* 선택된 탭에만 잎사귀 한 줄이 얹힌다. */}
                <span
                  aria-hidden
                  className={`h-1.5 w-7 rounded-full transition-colors ${
                    active ? "bg-green" : "bg-transparent"
                  }`}
                />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
