import React from "react";
import logo from "../assets/logo.png";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md sticky top-0 z-50">
      <div className="flex items-center">
        <img src={logo} alt="Great Lakes Logo" className="h-10 mr-2" />
        <h1 className="text-xl font-bold text-green-600">Great Lakes Tech Squad</h1>
      </div>
      <div className="space-x-6 hidden md:flex">
        <a href="#services" className="text-gray-700 hover:text-blue-600">Services</a>
        <a href="#about" className="text-gray-700 hover:text-blue-600">About</a>
        <a href="#contact" className="text-gray-700 hover:text-blue-600">Contact</a>
      </div>
    </nav>
  );
};

export default Navbar;