import React, { useState } from "react";
import { NavLink } from "react-router-dom";

// ISA Chatbot Icon Component (from ChatbotPage)
const ISAIcon = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="50"
      y="70"
      width="100"
      height="80"
      rx="15"
      fill="#FDE047"
      stroke="#000"
      strokeWidth="4"
    />
    <line
      x1="100"
      y1="40"
      x2="100"
      y2="70"
      stroke="#000"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <circle
      cx="100"
      cy="35"
      r="8"
      fill="#60A5FA"
      stroke="#000"
      strokeWidth="3"
    />
    <rect
      x="35"
      y="95"
      width="15"
      height="30"
      rx="7"
      fill="#6B7280"
      stroke="#000"
      strokeWidth="3"
    />
    <rect
      x="150"
      y="95"
      width="15"
      height="30"
      rx="7"
      fill="#6B7280"
      stroke="#000"
      strokeWidth="3"
    />
    <circle
      cx="75"
      cy="100"
      r="10"
      fill="#60A5FA"
      stroke="#000"
      strokeWidth="3"
    />
    <circle
      cx="125"
      cy="100"
      r="10"
      fill="#60A5FA"
      stroke="#000"
      strokeWidth="3"
    />
    <path
      d="M 80 125 Q 100 135 120 125"
      stroke="#000"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M 70 150 L 60 170 L 80 155 Z"
      fill="#FDE047"
      stroke="#000"
      strokeWidth="3"
      strokeLinejoin="round"
    />
  </svg>
);

const Sidebar = () => {
  const [isHovered, setIsHovered] = useState(false);

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      path: "/app/dashboard",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z"
          />
        </svg>
      ),
    },
    {
      id: "live-monitoring",
      label: "Live Monitoring",
      path: "/app/live-monitoring",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      id: "risk-evaluation",
      label: "Risk Evaluation",
      path: "/app/risk-evaluation",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      ),
    },
    {
      id: "emergency-hotlines",
      label: "Emergency Hotlines",
      path: "/app/emergency-hotlines",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      ),
    },
    {
      id: "chatbot",
      label: "ISA Chatbot",
      path: "/app/chatbot",
      icon: <ISAIcon className="w-6 h-6" />,
    },
  ];

  return (
    <aside
      className={`${
        isHovered ? "w-72" : "w-20"
      } bg-white shadow-lg h-screen flex flex-col border-r border-gray-100 transition-[width] duration-200`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thin divider to align with header (no extra top gap) */}
      <div className="border-b border-gray-100"></div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3.5 rounded-xl text-[13.5px] font-semibold transition-all duration-200 group relative ${
                isActive
                  ? "text-primary-v2 bg-primary-v2/5 border-l-4 border-primary-v2"
                  : "text-gray-700 hover:bg-gray-50 hover:text-primary-v2 border-l-4 border-transparent"
              }`
            }
          >
            <div className="shrink-0 transition-transform duration-200">
              {item.icon}
            </div>
            {isHovered && (
              <span className="ml-3 whitespace-nowrap overflow-hidden tracking-wide">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Links - show only when expanded; sticky at bottom when scrolled */}
      <div
        className={`${
          isHovered ? "block" : "hidden"
        } sticky bottom-0 bg-white px-5 py-4 border-t border-gray-100 space-y-3`}
      >
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px]">
          <button
            onClick={() => window.open("/terms", "_blank")}
            className="text-gray-500 hover:text-primary-v2 transition-colors duration-200 cursor-pointer font-medium"
          >
            Terms of Service
          </button>
          <button
            onClick={() => window.open("/privacy", "_blank")}
            className="text-gray-500 hover:text-primary-v2 transition-colors duration-200 cursor-pointer font-medium"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => window.open("/data-sources", "_blank")}
            className="text-gray-500 hover:text-primary-v2 transition-colors duration-200 cursor-pointer font-medium"
          >
            Data Source
          </button>
        </div>
        <div className="text-[11px] text-gray-400 font-medium">
          © ALISTO Dev Team 2025
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
