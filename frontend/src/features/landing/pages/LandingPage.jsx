import React from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import About from '../components/About'
import Features from '../components/Features'
import RealTimeOverview from '../components/RealTimeOverview'
import Paper from '../components/Paper'
import Developer from '../components/Developer'
import Footer from '../components/Footer'

const LandingPage = () => {
  return (
    <div style={{ zoom: '1.0' }}>
      <Header />
      <Hero />
      <About />
      <Features />
      <RealTimeOverview />
      <Developer />
      <Paper />
      <Footer />
    </div>
  )
}

export default LandingPage