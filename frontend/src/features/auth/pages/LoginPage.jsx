import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { userService } from "../services/userService";
import LocationStepPage from "../components/LocationStepPage";
import AuthLayout from "../components/AuthLayout";
import AuthBrandSection from "../components/AuthBrandSection";
import LoginForm from "../components/LoginForm";
import AuthLoadingScreen from "../components/AuthLoadingScreen";
import DashboardLoadingScreen from "../components/DashboardLoadingScreen";
import "../styles/animations.css";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLocationStep, setShowLocationStep] = useState(false);
  const [showAuthLoading, setShowAuthLoading] = useState(false);
  const [showDashboardLoading, setShowDashboardLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  // handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // handle signin button
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await authService.signInWithPassword(
        formData.email,
        formData.password
      );

      if (result.success) {
        console.log("Login successful, showing auth loading...");
        setShowAuthLoading(true);

        // Simulate a brief loading period for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check user profile to see if location is enabled
        const profileResult = await userService.getProfile();

        if (profileResult.success) {
          const userProfile = profileResult.data;
          console.log("User profile:", userProfile);
          setShowAuthLoading(false);

          // If location is not enabled, show location step
          if (
            !userProfile.location_enabled ||
            (!userProfile.user_lat && !userProfile.user_lon)
          ) {
            console.log("Location not enabled, showing location step");
            setShowLocationStep(true);
            return;
          }
        } else {
          console.warn(
            "Failed to get user profile, skipping location check:",
            profileResult.error
          );
          setShowAuthLoading(false);
        }

        // Show dashboard loading before navigating to app
        console.log("Location already enabled, showing dashboard loading...");
        setShowDashboardLoading(true);
        setTimeout(() => {
          navigate("/app");
        }, 2000);
      } else {
        // Provide more meaningful error messages
        let errorMessage = result.error || "Login failed";

        // Handle common Supabase auth errors
        if (errorMessage.includes("Invalid login credentials")) {
          errorMessage =
            "Invalid email or password. Please check your credentials and try again.";
        } else if (errorMessage.includes("Email not confirmed")) {
          errorMessage =
            "Please check your email and confirm your account before signing in.";
        } else if (errorMessage.includes("Too many requests")) {
          errorMessage =
            "Too many login attempts. Please wait a moment before trying again.";
        }

        setError(errorMessage);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
      setShowAuthLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle location step events
  const handleLocationSet = () => {
    console.log("Location set successfully, showing dashboard loading...");
    // Show dashboard loading before navigating
    setShowLocationStep(false);
    setShowDashboardLoading(true);
    setTimeout(() => {
      navigate("/app");
    }, 2000);
  };

  const handleLocationSkip = () => {
    console.log("Location step skipped, showing dashboard loading...");
    // Show dashboard loading before navigating
    setShowLocationStep(false);
    setShowDashboardLoading(true);
    setTimeout(() => {
      navigate("/app");
    }, 2000);
  };

  // Show auth loading screen
  if (showAuthLoading) {
    return <AuthLoadingScreen message="Signing you in..." />;
  }

  // Show dashboard loading screen
  if (showDashboardLoading) {
    return <DashboardLoadingScreen message="Preparing your dashboard..." />;
  }

  // If location step is active, show location page instead of login form
  if (showLocationStep) {
    return (
      <LocationStepPage
        onLocationSet={handleLocationSet}
        onSkip={handleLocationSkip}
      />
    );
  }

  return (
    <AuthLayout>
      {/* Brand Section - Shows on LEFT for login */}
      <AuthBrandSection type="login" />

      {/* Login Form - Shows on RIGHT for login */}
      <div className="lg:order-2">
        <LoginForm
          formData={formData}
          loading={loading}
          error={error}
          onInputChange={handleInputChange}
          onSubmit={handleLogin}
        />
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
