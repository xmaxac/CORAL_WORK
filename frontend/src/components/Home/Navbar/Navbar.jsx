import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "../../../fonts/Gotham/GothamFont.css";
import {
  HomeIcon,
  UserGroupIcon,
  DatabaseIcon,
  PlusIcon,
} from "@heroicons/react/solid";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menu, setMenu] = useState("home");

  useEffect(() => {
    const path = location.pathname.substring(1) || "home";
    setMenu(path);
  }, [location]);

  const isActive = (menuItem) => {
    return menu === menuItem ? "text-blue-500" : "text-gray-600";
  };

  return (
    <div className="select-none">
      {/* Navbar */}
      <nav className="relative flex items-center h-[70px] p-6 bg-white border-b border-slate-200">
        <Link
          to="/"
          className="absolute left-[2%] text-3xl text-blue-500 hover:cursor-pointer"
          onClick={() => setMenu("home")}
          style={{ fontFamily: "gothamBold" }}
        >
          CoralBase
        </Link>
        <ul
          className="absolute left-[17%] flex space-x-6 items-center text-gray-600"
          style={{ fontFamily: "gothamLight" }}
        >
          <Link
            to="/"
            onClick={() => setMenu("home")}
            className={`flex items-center justify-center transition-transform duration-300 ease-in-out hover:translate-y-[-0.3rem] hover:cursor-pointer ${isActive(
              "home"
            )}`}
          >
            <HomeIcon className="w-[15px] mr-1" />
            Home
          </Link>
          <Link
            to="/community"
            onClick={() => setMenu("community")}
            className={`flex items-center justify-center transition-transform duration-300 ease-in-out hover:translate-y-[-0.3rem] hover:cursor-pointer ${isActive(
              "community"
            )}`}
          >
            <UserGroupIcon className="w-[15px] mr-1" />
            Community
          </Link>
          <Link
            to="/database"
            onClick={() => setMenu("database")}
            className={`flex items-center justify-center transition-transform duration-300 ease-in-out hover:translate-y-[-0.3rem] hover:cursor-pointer ${isActive(
              "database"
            )}`}
          >
            <DatabaseIcon className="w-[15px] mr-1" />
            Database
          </Link>
        </ul>
        {location.pathname !== '/report' && (
          <div
            onClick={() => navigate("/report")}
            className="absolute w-[130px] right-[5%] p-2 rounded-md bg-blue-500 text-white items-center justify-center hover:cursor-pointer hover:bg-blue-800"
          >
            <span className="flex items-center justify-center">
              <PlusIcon className="w-[18px] mr-1" />
              New Report
            </span>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
