import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * Brand/Info section for auth pages
 * Shows on the left for login, right for signup
 */
const AuthBrandSection = ({ type = "login" }) => {
  const navigate = useNavigate();
  
  const isLogin = type === "login";

  const toggleAuthType = () => {
    navigate(isLogin ? "/signup" : "/login");
  };

  return (
    <div 
      className={`
        relative bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 
        p-12 flex flex-col justify-between text-white
        transition-all duration-700 ease-in-out
        ${isLogin ? 'lg:order-1' : 'lg:order-2'}
      `}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">ALISTO</h1>
          <div className="w-20 h-1 bg-white/50 rounded"></div>
        </div>

        {/* Main Message */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold leading-tight">
            {isLogin 
              ? "Welcome Back!" 
              : "Join Our Community"
            }
          </h2>
          <p className="text-lg text-white/90 leading-relaxed">
            {isLogin
              ? "Stay informed and prepared with real-time disaster monitoring and alerts for earthquakes, volcanic activity, and more."
              : "Create an account to access comprehensive disaster monitoring, personalized alerts, and community-driven safety resources."
            }
          </p>

          {/* Features list */}
          <div className="space-y-4 mt-8">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-white/90">Real-time earthquake monitoring</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-white/90">Volcanic activity tracking</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-white/90">Personalized safety alerts</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-white/90">Interactive risk evaluation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative z-10 mt-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <p className="text-sm text-white/90 mb-3">
            {isLogin 
              ? "Don't have an account yet?" 
              : "Already have an account?"
            }
          </p>
          <button
            onClick={toggleAuthType}
            className="w-full py-2.5 px-4 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-white/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLogin ? "Create New Account" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthBrandSection;
