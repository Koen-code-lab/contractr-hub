import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Search,
  Briefcase,
  HardHat,
  PlusSquare,
  Users,
  MessageSquare,
  FileText,
  User,
  Settings,
  Bell,
  ChevronDown,
  HelmetIcon,
} from "lucide-react";
import { Construction } from "lucide-react";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/zoek-capaciteit", label: "Zoek capaciteit", icon: Search },
  { to: "/bekijk-opdrachten", label: "Bekijk opdrachten", icon: Briefcase },
  { to: "/bied-capaciteit-aan", label: "Bied capaciteit aan", icon: HardHat },
  { to: "/plaats-opdracht", label: "Plaats opdracht", icon: PlusSquare },
  { to: "/mijn-netwerk", label: "Mijn netwerk", icon: Users },
  { to: "/berichten", label: "Berichten", icon: MessageSquare },
  { to: "/mijn-publicaties", label: "Mijn publicaties", icon: FileText },
  { to: "/mijn-profiel", label: "Mijn profiel", icon: User },
  { to: "/instellingen", label: "Instellingen", icon: Settings },
] as const;

export function AppShell() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-sidebar text-sidebar-foreground sticky top-0 h-screen border-r border-sidebar-border">
        <div className="px-6 py-6 flex items-center gap-2 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
            <Construction className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <div className="font-display font-bold text-lg tracking-tight text-white">CONTRACTR</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/60">Bouw netwerk</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = path === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <div className="rounded-xl bg-sidebar-accent p-4">
            <div className="text-xs text-sidebar-foreground/60 uppercase tracking-wider">Pro tip</div>
            <div className="text-sm mt-1 text-white">Verbind je profiel om sneller matches te vinden.</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-background/85 backdrop-blur border-b border-border">
          <div className="h-16 px-4 lg:px-8 flex items-center gap-4">
            <div className="lg:hidden font-display font-bold tracking-tight">CONTRACTR</div>
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Zoek opdrachten, bedrijven, vakmensen..."
                  className="w-full h-10 pl-10 pr-4 rounded-full bg-muted text-sm outline-none focus:ring-2 focus:ring-ring border border-transparent focus:border-border"
                />
              </div>
            </div>
            <Link to="/berichten" className="hidden sm:inline-flex w-10 h-10 rounded-full hover:bg-muted items-center justify-center relative">
              <MessageSquare className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
            </Link>
            <button className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
            </button>
            <Link to="/mijn-profiel" className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-muted">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-foreground to-foreground/70 text-background flex items-center justify-center text-xs font-bold">JV</div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-10 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>

        <footer className="border-t border-border py-6 px-8 text-xs text-muted-foreground flex flex-wrap gap-4 justify-between">
          <div>© 2026 CONTRACTR — Het netwerk voor de bouw.</div>
          <div className="flex gap-4">
            <span>Privacy</span>
            <span>Voorwaarden</span>
            <span>Support</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
