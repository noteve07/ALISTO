import React from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import About from "../components/About";
import Features from "../components/Features";
import RealTimeOverview from "../components/RealTimeOverview";
import Developer from "../components/Developer";
import Footer from "../components/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header />
      <Hero />
      <About />
      <Features />
      <RealTimeOverview />
      <Developer />
      <Footer />
    </div>
  );
};

export default LandingPage;
