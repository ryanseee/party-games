import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import { Image } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showNav?: boolean;
  showBack?: boolean;
  backTo?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  showNav = true,
  showBack = false,
  backTo = "/",
}) => {
  const { currentSession, isAdmin } = useSession();

  return (
    <div className="min-h-screen flex flex-col">
      {showNav && (
        <header className="glass-header">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
                <Image className="h-7 w-7 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
                <span className="ml-2 text-xl font-light text-gray-800 group-hover:text-gray-900 transition-colors">
                  CaiCai
                </span>
              </Link>

              {currentSession && (
                <div className="ml-6 border-l border-gray-200 pl-6 hidden sm:block">
                  <span className="text-sm text-gray-500">
                    {isAdmin ? "Admin" : "Participant"}:{" "}
                    {currentSession.name || currentSession.id}
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {(title || showBack) && (
            <div className="mb-8 flex items-center">
              {showBack && (
                <Link
                  to={backTo}
                  className="mr-3 text-gray-400 hover:text-indigo-500 transition-colors"
                >
                  &larr;
                </Link>
              )}
              {title && (
                <h1 className="text-2xl font-light text-gray-800">{title}</h1>
              )}
            </div>
          )}

          {children}
        </div>
      </main>

      <footer className="glass-footer py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} CaiCai Game
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
