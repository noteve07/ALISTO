import React from "react";

const Header = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm flex items-center justify-between px-8 py-4">
      <h2 className="text-xl font-semibold">ALISTO</h2>

      <nav>
        <ul className="flex items-center space-x-8 text-sm font-medium text-gray-700">
          <li>Home</li>
          <li>Project Overview</li>
          <li>Developers</li>
          <li>About</li>
        </ul>
      </nav>

      {/* <button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"> */}
      <button className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-orange-300 transition cursor-pointer">
        Get Started
      </button>
    </div>
  );
};

export default Header;
