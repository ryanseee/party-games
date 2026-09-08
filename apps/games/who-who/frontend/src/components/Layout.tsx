import React from "react";
import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
  title?: string;
  showBack?: boolean;
  backTo?: string;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Join", path: "/join" },
    { name: "Participant", path: "/participant" },
    { name: "Admin", path: "/admin" },
  ];

  return (
    <div className="scanlines min-h-screen text-[#121212] font-['Space_Mono',_monospace]">
      <header className="sticky top-0 z-50 w-full border-b-4 border-[#121212] bg-[#f1f3f4] px-4 py-3">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center border-2 border-[#121212] bg-[#121212] font-['Press_Start_2P',_monospace] text-[10px] text-[#f1f3f4]">
              ?
            </span>
            <span className="font-['Press_Start_2P',_monospace] text-xs uppercase tracking-wider text-[#121212] sm:text-sm">
              WHO WHO
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-2 font-['Silkscreen',_monospace] text-[11px]">
            {navItems.map((item) => {
              const isActive =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`border-2 px-3 py-1 uppercase transition-colors ${
                    isActive
                      ? "border-[#121212] bg-[#121212] text-[#f1f3f4] shadow-[2px_2px_0px_#121212]"
                      : "border-transparent text-[#5f6368] hover:border-[#121212] hover:text-[#121212]"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 font-['Silkscreen',_monospace] text-[10px] text-[#5f6368]">
            <span className="h-2 w-2 animate-pulse bg-emerald-700" />
            <span>ONLINE</span>
            <div className="flex h-8 w-8 items-center justify-center border-2 border-[#121212] bg-[#121212]">
              <span className="material-symbols-outlined text-[18px] text-white">
                person
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-64px)] w-full bg-transparent">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">{children}</div>
      </main>

      <footer className="w-full border-t-4 border-[#121212] bg-[#f1f3f4] px-4 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row sm:px-4">
          <div className="flex items-center gap-2">
            <span className="font-['Press_Start_2P',_monospace] text-[10px] uppercase text-[#121212]">
              WHO WHO
            </span>
            <span className="font-['Silkscreen',_monospace] text-[10px] text-[#5f6368]">
              [CARTRIDGE 01]
            </span>
          </div>
          <div className="flex items-center gap-4 font-['Silkscreen',_monospace] text-[10px]">
            <span className="border border-[#121212] bg-white px-2 py-0.5 font-bold text-[#121212]">
              V1.0.0
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
