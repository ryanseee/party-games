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
    <div className="min-h-screen bg-[#f8f9fb] font-['JetBrains_Mono'] text-[#191c1e] antialiased">
      {/* Fixed Neobrutalist Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-[#06080c]">
        <div className="h-16 max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="w-6 h-6 bg-[#06080c] border-2 border-[#06080c] flex items-center justify-center text-white font-['Space_Mono'] text-sm font-bold">
                ?
              </span>
              <span className="font-['Space_Mono'] text-lg tracking-tight text-[#06080c] uppercase font-bold">
                Who Who
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const isActive =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1 font-['JetBrains_Mono'] text-xs uppercase tracking-wider transition-colors font-bold ${
                    isActive
                      ? "bg-[#06080c] text-white border-2 border-[#06080c]"
                      : "border-2 border-transparent text-[#45474b] hover:border-[#06080c] hover:text-[#191c1e]"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Avatar Pill */}
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-[#06080c] flex items-center justify-center border border-[#06080c]">
              <span className="material-symbols-outlined text-white text-[18px]">
                person
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="w-full pt-16 bg-[#f8f9fb] min-h-[calc(100vh-64px)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">{children}</div>
      </main>

      {/* Neobrutalist Footer */}
      <footer className="w-full bg-white border-t-2 border-[#06080c] py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-['Space_Mono'] text-sm text-[#06080c] uppercase tracking-tight font-bold">
              Who Who
            </span>
            <span className="text-[#76777b] font-['JetBrains_Mono'] text-[10px]">
              [v1.0.0-RETRO]
            </span>
          </div>
          <div className="font-['JetBrains_Mono'] text-xs text-[#45474b]">
            © 2025 WHO WHO PHOTO GAME. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-4 font-['JetBrains_Mono'] text-[10px]">
            <span className="px-2 py-0.5 bg-[#edeef0] border border-[#06080c] text-[#06080c] font-bold">
              8-BIT NEO BRUTAL
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
