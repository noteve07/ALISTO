import React from "react";
import { useScrollAnimation } from "../../../shared/hooks/useScrollAnimation";

const Developer = () => {
  const [sectionRef, isVisible] = useScrollAnimation(0.2);
  const developers = [
    {
      id: 1,
      name: "Nicko James E. Barata",
      role: "Full Stack Developer",
      initials: "NB",
    },
    {
      id: 2,
      name: "Jealla Rose M. Waje",
      role: "UI/UX Designer",
      initials: "JW",
    },
    {
      id: 3,
      name: "Miguel Grant V. Bagtas",
      role: "Backend Developer",
      initials: "MB",
    },
    {
      id: 4,
      name: "Michale Joseph M. Talabo",
      role: "Backend Developer",
      initials: "MT",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className={`px-6 py-20 sm:py-28 bg-white transition-all duration-600 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      }`}
      id="developers"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h3
            className={`text-primary-v2 text-3xl md:text-4xl lg:text-5xl font-bold transition-all duration-600 delay-100 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-5"
            }`}
          >
            Meet the Team
          </h3>
          <p
            className={`text-gray-600 mt-6 text-lg md:text-xl max-w-3xl mx-auto transition-all duration-600 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-5"
            }`}
          >
            The dedicated developers and designers behind ALISTO
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {developers.map((developer, index) => (
            <div
              key={developer.id}
              className={`text-center group transition-all duration-600 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
              }`}
              style={{ transitionDelay: `${300 + index * 75}ms` }}
            >
              {/* Avatar placeholder */}
              <div className="w-28 h-28 mx-auto mb-6 bg-background rounded-2xl flex items-center justify-center text-2xl font-bold text-primary-v2 transition-all duration-300 group-hover:bg-primary-v2 group-hover:text-white shadow-lg">
                {developer.initials}
              </div>

              {/* Developer info */}
              <h4 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 transition-colors duration-300 group-hover:text-primary-v2">
                {developer.name}
              </h4>
              <p className="text-base md:text-lg text-gray-600 font-medium">
                {developer.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Developer;
