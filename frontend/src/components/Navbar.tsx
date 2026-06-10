import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Trophy, LogIn, UserPlus, Home as HomeIcon, BarChart2 } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [showNavbar, setShowNavbar] = useState(!isHomePage);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (!isHomePage) {
      setShowNavbar(true);
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > window.innerHeight * 1.2) {
        setShowNavbar(true);
      } else {
        setShowNavbar(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 glassmorphism transition-all duration-700 ease-in-out ${
      showNavbar ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-extrabold text-lg sm:text-xl tracking-wider bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                MUNDIAL<span className="text-white font-medium text-xs sm:text-sm ml-1 tracking-normal">Stats</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 ${
                isActive("/") 
                  ? "text-yellow-500" 
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <HomeIcon className="h-4 w-4" />
              Inicio
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
            >
              <BarChart2 className="h-4 w-4" />
              Estadísticas
            </Link>
            <span className="h-4 w-px bg-gray-700"></span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/login"
              className={`flex items-center gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                isActive("/login")
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-gray-300 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Ingresar
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 shadow-md shadow-yellow-500/10 hover:shadow-yellow-500/25 transition-all duration-200"
            >
              <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
