import React from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Overview from '../components/Overview'
import Footer from '../components/Footer'


const LandingPage = () => {
  return (
    <div className="text-center">
        
        <Header />
        <Hero />
        <Overview /> 
        <Footer />
    </div>
  )
}

export default LandingPage