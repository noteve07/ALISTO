import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { userService } from "../services/userService";
import LocationStepPage from "../components/LocationStepPage";
import AuthLayout from "../components/AuthLayout";
import AuthBrandSection from "../components/AuthBrandSection";
import LoginForm from "../components/LoginForm";
import "../styles/animations.css";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLocationStep, setShowLocationStep] = useState(false);
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
        console.log("Login successful, checking user profile...");

        // Check user profile to see if location is enabled
        const profileResult = await userService.getProfile();

        if (profileResult.success) {
          const userProfile = profileResult.data;
          console.log("User profile:", userProfile);

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
        }

        // Navigate to app if location is already enabled or profile check failed
        navigate("/app");
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
    } finally {
      setLoading(false);
    }
  };

  // Handle location step events
  const handleLocationSet = (locationData) => {
    console.log("Location set successfully:", locationData);
    // Navigate to app after location is set
    navigate("/app");
  };

  const handleLocationSkip = () => {
    console.log("Location step skipped, navigating to app");
    // Navigate to app even if user skips location setup
    navigate("/app");
  };

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
