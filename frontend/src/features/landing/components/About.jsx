import React from "react";
import { useScrollAnimation } from "../../../shared/hooks/useScrollAnimation";

const About = () => {
  const [ref, isVisible] = useScrollAnimation();

  return (
    <section
      ref={ref}
      className={`px-6 py-20 sm:py-28 bg-background transition-all duration-600 ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      id="about"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2
          className={`text-primary-v2 text-3xl md:text-4xl lg:text-5xl font-bold transition-all duration-600 delay-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          About ALISTO
        </h2>
        <p
          className={`mt-8 text-gray-700 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto transition-all duration-600 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          Our mission is to provide accessible, real-time seismic risk
          assessment to empower communities across the Philippines. ALISTO is
          powered by official data from DOST-PHIVOLCS and enhanced with advanced
          machine learning technology to deliver timely and accurate seismic
          information.
        </p>
      </div>
    </section>
  );
};

export default About;
