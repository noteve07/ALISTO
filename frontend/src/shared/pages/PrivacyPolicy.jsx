import React from 'react'
import { Link } from 'react-router-dom'
import Header from '../../features/landing/components/Header'
import Footer from '../../features/landing/components/Footer'

const PrivacyPolicy = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white">
      <Header />

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-12 pb-8 border-b-2 border-gray-200">
            <h1 className="text-4xl font-black text-[#1A2B48] mb-2">Data Privacy Notice</h1>
            <p className="text-lg text-gray-500 font-medium">Automated Live Information for Seismic Tracking and Observation (ALISTO)</p>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[#C85A2D] mb-4 tracking-wide">General Statement</h2>
            <p className="text-[#1A2B48] leading-7 mb-4 text-justify">
              The ALISTO web and mobile application (the "App") is developed and maintained by the Researchers and Developers (the "App Owner") to enhance disaster preparedness and public safety regarding seismic and volcanic activity in the Philippines.
            </p>
            <p className="text-[#1A2B48] leading-7 mb-4 text-justify">
              The App Owner recognizes the critical nature of the data you share, especially in disaster-related applications. We are committed to protecting your personal data and ensuring strict compliance with the Data Privacy Act of 2012 (RA 10173), its Implementing Rules and Regulations, and issuances by the National Privacy Commission.
            </p>
            <p className="text-[#1A2B48] leading-7 text-justify">
              This Privacy Notice explains what information we collect, how it is processed, and why, specifically for the purpose of providing real-time seismic information, risk analysis, and location-based alerts. We may update this notice to reflect changes in our policy or legal requirements; we encourage you to check for updates if notified.
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[#C85A2D] mb-4 tracking-wide">What Data We Collect and Why</h2>
            <p className="text-[#1A2B48] leading-7 mb-6 text-justify">
              We collect and process only the information necessary to fulfill the App's objectives: providing real-time earthquake monitoring, risk prediction, and personalized alerts. The information collected may include Personal Information (PI) and Sensitive Personal Information (SPI) as defined by the DPA.
            </p>

            <div className="overflow-hidden rounded-lg shadow-lg mb-6">
              <table className="w-full border-collapse bg-white">
                <thead className="bg-linear-to-r from-[#DB7235] to-[#B2660A] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-sm tracking-wide">Data Category</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm tracking-wide">Specific Data Collected</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm tracking-wide">Purpose of Collection</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-orange-50">
                    <td className="px-4 py-4 border-b border-gray-200">
                      <strong className="text-[#1A2B48]">Registration & Contact</strong>
                    </td>
                    <td className="px-4 py-4 border-b border-gray-200 text-[#1A2B48] leading-6">
                      Mobile Number, Email Address, User Credentials (username/password/PIN)
                    </td>
                    <td className="px-4 py-4 border-b border-gray-200 text-[#1A2B48] leading-6">
                      To create and secure your user account, verify your identity, and enable essential communications (e.g., account recovery, alert follow-up).
                    </td>
                  </tr>
                  <tr className="hover:bg-orange-50">
                    <td className="px-4 py-4 border-b border-gray-200">
                      <strong className="text-[#1A2B48]">Alert Customization</strong>
                    </td>
                    <td className="px-4 py-4 border-b border-gray-200 text-[#1A2B48] leading-6">
                      Geolocation (real-time or last known), Permanent Address, Preferred Notification Settings
                    </td>
                    <td className="px-4 py-4 border-b border-gray-200 text-[#1A2B48] leading-6">
                      Crucial for the App's core function: To accurately determine seismic and volcanic risk levels specific to your area and send timely, location-based alerts and notifications.
                    </td>
                  </tr>
                  <tr className="hover:bg-orange-50">
                    <td className="px-4 py-4 border-b border-gray-200">
                      <strong className="text-[#1A2B48]">KYC/Verification</strong>
                    </td>
                    <td className="px-4 py-4 border-b border-gray-200 text-[#1A2B48] leading-6">
                      Full Name, Date of Birth, Liveness Detection/Verification
                    </td>
                    <td className="px-4 py-4 border-b border-gray-200 text-[#1A2B48] leading-6">
                      To authenticate user identity, ensuring data accuracy and preventing the misuse of the alert system.
                    </td>
                  </tr>
                  <tr className="hover:bg-orange-50">
                    <td className="px-4 py-4 border-b border-gray-200">
                      <strong className="text-[#1A2B48]">Device & Usage</strong>
                    </td>
                    <td className="px-4 py-4 border-b border-gray-200 text-[#1A2B48] leading-6">
                      Cookie information, Device details (type, OS), IP Address
                    </td>
                    <td className="px-4 py-4 border-b border-gray-200 text-[#1A2B48] leading-6">
                      To ensure the App's functional suitability, reliability, and maintainability; to optimize the interactive web map display; and for security audit logs.
                    </td>
                  </tr>
                  <tr className="hover:bg-orange-50">
                    <td className="px-4 py-4">
                      <strong className="text-[#1A2B48]">AI Chatbot Interaction</strong>
                    </td>
                    <td className="px-4 py-4 text-[#1A2B48] leading-6">
                      Conversational input/text entered into the AI chatbot
                    </td>
                    <td className="px-4 py-4 text-[#1A2B48] leading-6">
                      To provide you with conversational support on earthquake updates, risk levels, and preparedness.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[#C85A2D] mb-4 tracking-wide">How Your Personal Data is Collected</h2>
            <p className="text-[#1A2B48] leading-7 mb-4 text-justify">
              We collect your Personal Data when you:
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <span className="text-[#C85A2D] font-bold text-lg mr-4">•</span>
                <span className="text-[#1A2B48] leading-7">Register in the App and create your user profile.</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#C85A2D] font-bold text-lg mr-4">•</span>
                <span className="text-[#1A2B48] leading-7">Explicitly enable location services on your device to receive geolocation-based alerts.</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#C85A2D] font-bold text-lg mr-4">•</span>
                <span className="text-[#1A2B48] leading-7">Update your profile and complete the necessary identity verification (KYC).</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#C85A2D] font-bold text-lg mr-4">•</span>
                <span className="text-[#1A2B48] leading-7">Interact with the App's features, such as the interactive map and the AI-powered chatbot.</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#C85A2D] font-bold text-lg mr-4">•</span>
                <span className="text-[#1A2B48] leading-7">Disclose your information through formal communication channels with the App Owner's authorized representatives.</span>
              </li>
            </ul>

            <div className="bg-orange-50 border-l-4 border-[#ec7c13] p-6 rounded-lg">
              <h3 className="text-lg font-bold text-[#C85A2D] mb-3">Consent is Paramount</h3>
              <p className="text-[#1A2B48] leading-7">
                No information will be collected until you have given your express consent. During the registration process, clicking the checkbox signifies that you have read and agree to the General Terms and this Data Privacy Notice.
              </p>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[#C85A2D] mb-4 tracking-wide">How We Use and Share Your Personal Data</h2>
            <p className="text-[#1A2B48] leading-7 mb-6 text-justify">
              We will only use your Personal Data to operate the ALISTO App and deliver its intended services. We may not process or use your information without your express consent.
            </p>

            <h3 className="text-xl font-semibold text-[#1A2B48] mb-3 mt-6">Primary Use</h3>
            <p className="text-[#1A2B48] leading-7 mb-6 text-justify">
              To perform real-time risk analysis and classification by pairing seismic data from official sources (e.g., DOST-PHIVOLCS) with your specified geolocation, ensuring alerts are relevant to your potential exposure.
            </p>

            <h3 className="text-xl font-semibold text-[#1A2B48] mb-3">Data Sharing</h3>
            <p className="text-[#1A2B48] leading-7 mb-6 text-justify">
              Your data, particularly your location (if an alert is issued), may be shared with authorized emergency response units, DOST-PHIVOLCS, and relevant Local Government Units (LGUs) for the sole purpose of immediate disaster coordination, validation, and response.
            </p>

            <h3 className="text-xl font-semibold text-[#1A2B48] mb-3">Secondary Use</h3>
            <p className="text-[#1A2B48] leading-7 mb-6 text-justify">
              For system testing, improvement, and generating anonymized statistics to enhance disaster preparedness strategies (e.g., analyzing alert distribution effectiveness).
            </p>

            <h3 className="text-xl font-semibold text-[#1A2B48] mb-3">Legal Compliance</h3>
            <p className="text-[#1A2B48] leading-7 text-justify">
              When required by law or a valid court order, we may disclose necessary data to legal and regulatory bodies.
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[#C85A2D] mb-4 tracking-wide">Your Rights as a Data Subject</h2>
            <p className="text-[#1A2B48] leading-7 mb-6 text-justify">
              As a user of ALISTO, you are entitled to the following data privacy rights under the DPA:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 transition-all duration-300 hover:border-[#ec7c13] hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 bg-[#ec7c13] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-[#C85A2D]">Right to Be Informed</h4>
                </div>
                <p className="text-[#1A2B48] text-sm leading-6">
                  To be informed whether your Personal Information is being, has been, or shall be processed.
                </p>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 transition-all duration-300 hover:border-[#ec7c13] hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 bg-[#ec7c13] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-[#C85A2D]">Right to Access</h4>
                </div>
                <p className="text-[#1A2B48] text-sm leading-6">
                  To reasonably access any Personal Information collected and processed by ALISTO.
                </p>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 transition-all duration-300 hover:border-[#ec7c13] hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 bg-[#ec7c13] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-[#C85A2D]">Right to Object</h4>
                </div>
                <p className="text-[#1A2B48] text-sm leading-6">
                  To object or withhold consent with regard to the collection and processing of your Personal Data.
                </p>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 transition-all duration-300 hover:border-[#ec7c13] hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 bg-[#ec7c13] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"/>
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-[#C85A2D]">Right to Erasure or Blocking</h4>
                </div>
                <p className="text-[#1A2B48] text-sm leading-6">
                  To suspend, withdraw, or order the blocking, removal, or destruction of Personal Data from the App's filing system.
                </p>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 transition-all duration-300 hover:border-[#ec7c13] hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 bg-[#ec7c13] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-[#C85A2D]">Right to Rectification</h4>
                </div>
                <p className="text-[#1A2B48] text-sm leading-6">
                  To dispute the inaccuracy or error in Personal Data, which the App Owner shall correct immediately upon request (unless the request is vexatious or otherwise unreasonable).
                </p>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 transition-all duration-300 hover:border-[#ec7c13] hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 bg-[#ec7c13] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-[#C85A2D]">Right to Data Portability</h4>
                </div>
                <p className="text-[#1A2B48] text-sm leading-6">
                  To obtain a copy of the data in an electronic or structured format that is commonly used and allows for further use by the Data Subject.
                </p>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 transition-all duration-300 hover:border-[#ec7c13] hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 bg-[#ec7c13] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.738V12a1 1 0 11-2 0v-1.262l-1.246-.87a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.262l1.246.87a1 1 0 01-.372 1.364l-1.75-1A1 1 0 013 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1.002 1.002 0 01-.52.878l-1.75 1a1 1 0 11-.986-1.736L16 14.277V12a1 1 0 011-1z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-[#C85A2D]">Right to Indemnified Damages</h4>
                </div>
                <p className="text-[#1A2B48] text-sm leading-6">
                  To be indemnified for any damages sustained pursuant to the provisions of the Data Privacy Act.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 bg-[#ec7c13] hover:bg-[#d86f0f] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
              </svg>
              Back to Home
            </Link>
          </div>

          <div className="text-center text-gray-500 text-sm italic mt-12 pt-8 border-t border-gray-200">
            Last Updated: October 2025
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default PrivacyPolicy