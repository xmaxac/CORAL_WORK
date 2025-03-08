import React, { useContext, useState, useEffect } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import "../../../fonts/Gotham/GothamFont.css";
import {
  UserGroupIcon,
  DatabaseIcon,
  PlusIcon,
  UserIcon,
  LogoutIcon,
  AcademicCapIcon,
  CameraIcon
} from "@heroicons/react/solid";
import { AppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import LanguageDropdown from "../Language/LanguageDropdown";


const Navbar = ({ setShowLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, setToken, user } = useContext(AppContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const {t} = useTranslation();

  const navigationItems = [
    {path: "/info", label: t('home.navbar.info'), icon: AcademicCapIcon},
    {path: "/database", label: t('home.navbar.database'), icon: DatabaseIcon},
    {path: "/community", label: t('home.navbar.community') , icon: UserGroupIcon},
    {path: "/detection", label: t('home.navbar.detection'), icon: CameraIcon},
  ];

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  return (
    <nav className="sticky top-0 z-[10] w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink
            to="/"
            className="text-2xl font-bold text-blue-500 hover:text-blue-600 transition-colors"
          >
            CoralBase
          </NavLink>
          
          {/* Desktop Navigation */}
          <div className={`hidden md:flex items-center ${t('global.spacex')}`}>
            {navigationItems.map(({path, label, icon: Icon}) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => `
                flex items-center space-x-1 px-3 py-2 rounded-md text-md font-medium transition-all duration-200 hover:text-blue-500 hover:-translate-y-0.5 ${isActive ? 'text-blue-500' : 'text-gray-600'}
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="whitespace-nowrap">{label}</span>
              </NavLink>
            ))}
          </div>

          {/* Right side Items */}
          <div className="flex items-center space-x-4">
            <LanguageDropdown />
            {token ? (
              <>
                {/* New Report Button */}
                {location.pathname !== "/report" && (
                  <Button
                    onClick={() => navigate("/report")}
                    className="hidden sm:flex items-center space-x-1"
                    variant="default"  
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>{t('home.buttons.newReport')}</span>
                  </Button>
                )}

                {/* Notification */}
                {/* <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  aria-label="Notifications"
                >
                  <BellIcon className="w-5 h-5" />
                </Button> */}
              </>
            ) : (
              <></>
            )}

            {/* User Profile */}
            {token ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label="User Profile"
                    title={user?.username}
                  >
                    {user?.profile_image ? (
                      <Avatar>
                        <AvatarImage src={user.profile_image} alt="Profile" />
                        <AvatarFallback>{user.username[0]}</AvatarFallback>
                      </Avatar>
                    ): (
                      <Avatar className="w-9 h-9">
                        <AvatarImage src="/avatar-placeholder.png" alt="Default"/>
                      </Avatar>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate(`/profile/${user?.username}`)}>
                    <UserIcon className="w-4 h-4 mr-2" />
                    {t('home.buttons.profile')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogoutIcon className="w-4 h-4 mr-2" />
                    {t('home.buttons.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => setShowLogin(true)}>
                {t('home.buttons.signUp')}
              </Button>
            )}

            {/* Mobile Menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center px-3 py-2 border rounded text-gray-600 border-gray-400 hover:text-blue-500 hover:border-blue-500"
            >
              <svg
                className="fill-current h-3 w-3"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Menu</title>
                <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigationItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => `
                  flex items-center space-x-1 px-3 py-2 rounded-md text-md font-medium transition-all duration-200 hover:text-blue-500 hover:-translate-y-0.5 ${isActive ? 'text-blue-500' : 'text-gray-600'}
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
