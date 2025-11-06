import React, { useEffect } from "react";
import HeroLeft from "./HeroLeft";
import HeroGraphics from "./HeroGraphics";
import { useScrollAnimation } from "../../../shared/hooks/useScrollAnimation";

const Hero = () => {
  const [ref, isVisible] = useScrollAnimation(0.3);

  // Auto-scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section
      ref={ref}
      id="home"
      className="relative min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 overflow-hidden"
    >
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary-v2/10 to-orange-400/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full filter blur-2xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-gradient-to-r from-green-400/10 to-teal-400/10 rounded-full filter blur-2xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,107,53,0.15) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Header spacing */}
      <div className="pt-20"></div>

      <div className="relative z-10 min-h-[calc(100vh-5rem)] flex items-start pt-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-start">
            
            {/* Left Content */}
            <div
              className={`transition-all duration-1000 delay-200 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-10"
              }`}
            >
              <HeroLeft />
            </div>

            {/* Right Graphics */}
            <div
              className={`transition-all duration-1000 delay-400 ${
                isVisible
                  ? "opacity-100 translate-x-0 scale-100"
                  : "opacity-0 translate-x-10 scale-95"
              }`}
            >
              <HeroGraphics />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg className="relative block w-full h-20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="#ff6b35"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="#ff6b35"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="#ff6b35"></path>
        </svg>
      </div>
      
      {/* Global SVG white background removal */}
      <style jsx global>{`
        /* Global rule to remove white backgrounds from ALL ALISTO SVGs */
        img[src*="ALISTO_"] {
          mix-blend-mode: multiply !important;
          background: transparent !important;
        }
      `}</style>
    </section>
  );
};

export default Hero;
