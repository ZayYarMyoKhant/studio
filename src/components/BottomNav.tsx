"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, HandCoins } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      label: "စာရင်းချုပ်",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      label: "အကြွေးစာရင်း",
      href: "/debts",
      icon: HandCoins,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border flex justify-around items-center h-16 px-4 max-w-2xl mx-auto shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className={cn("h-6 w-6", isActive && "fill-primary/10")} />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {item.label}
            </span>
            {isActive && (
              <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
