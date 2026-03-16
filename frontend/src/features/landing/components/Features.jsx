import React from "react";
import { useScrollAnimation } from "../../../shared/hooks/useScrollAnimation";

const Features = () => {
  const [sectionRef, isVisible] = useScrollAnimation(0.2);
  const features = [
    {
      id: 1,
      title: "Seismic Monitoring",
      description:
        "Access real-time data feeds from seismic sensors deployed across the Philippines.",
      icon: "sensors",
    },
    {
      id: 2,
      title: "Interactive Dashboards",
      description:
        "Utilize dynamic and intuitive data visualization tools to understand seismic patterns.",
      icon: "dashboard",
    },
    {
      id: 3,
      title: "Risk Assessment",
      description:
        "Leverage predictive analytics to evaluate potential risks for specific areas.",
      icon: "security",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="core-features"
      className={`px-6 py-20 sm:py-28 bg-white transition-all duration-600 ${
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
      }`}
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
            Core Features
          </h3>
          <p
            className={`text-gray-600 mt-6 text-lg md:text-xl max-w-3xl mx-auto transition-all duration-600 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-5"
            }`}
          >
            Explore the features that make EPICENTRA an essential tool for seismic
            awareness and preparedness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <article
              key={feature.id}
              className={`bg-background/50 rounded-2xl p-8 text-center shadow-sm transition-all duration-600 hover:transform hover:-translate-y-2 hover:shadow-xl group border border-gray-100 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
              }`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary-v2/10 text-primary-v2 transition-all duration-300 group-hover:bg-primary-v2 group-hover:text-white mb-6">
                <span className="material-symbols-outlined text-3xl">
                  {feature.icon}
                </span>
              </div>
              <h4 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 transition-colors duration-300 group-hover:text-primary-v2">
                {feature.title}
              </h4>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
