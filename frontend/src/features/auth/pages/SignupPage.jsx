import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { userService } from "../services/userService";
import LocationStepPage from "../components/LocationStepPage";
import AuthLayout from "../components/AuthLayout";
import AuthBrandSection from "../components/AuthBrandSection";
import SignupForm from "../components/SignupForm";
import AuthLoadingScreen from "../components/AuthLoadingScreen";
import DashboardLoadingScreen from "../components/DashboardLoadingScreen";
import "../styles/animations.css";

const SignupPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLocationStep, setShowLocationStep] = useState(false);
  const [showAuthLoading, setShowAuthLoading] = useState(false);
  const [showDashboardLoading, setShowDashboardLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  // Validation functions
  const validateForm = () => {
    // Reset error
    setError("");

    // Check if all fields are filled
    if (!formData.firstName.trim()) {
      setError("First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (!formData.confirmPassword) {
      setError("Please confirm your password");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  // handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  // handle sign up
  const handleSignup = async (e) => {
    e.preventDefault();

    // Validate form first
    if (!validateForm()) {
      return;
    }

    console.log("handleSignup start");
    setLoading(true);
    try {
      const result = await authService.signUp(
        formData.email,
        formData.password
      );

      console.log("Signup result:", result);

      if (result.success) {
        console.log("Signup successful, showing auth loading...");
        setShowAuthLoading(true);

        // Simulate a brief loading period for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update user profile with first name and last name
        const profileResult = await userService.updateProfile(
          formData.firstName,
          formData.lastName
        );

        setShowAuthLoading(false);

        if (profileResult.success) {
          console.log("Profile updated successfully, showing location step");
          setShowLocationStep(true);
          return;
        } else {
          console.warn("Profile update failed:", profileResult.error);
          // Still show location step even if profile update fails
          // User can update their profile later
          setShowLocationStep(true);
          return;
        }
      } else {
        console.log("Signup failed:", result.error);
        // Provide more meaningful error messages
        let errorMessage = result.error || "Signup failed";

        // Handle common Supabase auth errors
        if (errorMessage.includes("User already registered")) {
          errorMessage =
            "An account with this email already exists. Please sign in instead.";
        } else if (errorMessage.includes("Password")) {
          errorMessage =
            "Password does not meet requirements. Please try a stronger password.";
        } else if (errorMessage.includes("Email")) {
          errorMessage = "Please enter a valid email address.";
        } else if (errorMessage.includes("weak")) {
          errorMessage =
            "Password is too weak. Please use at least 6 characters.";
        }

        setError(errorMessage);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred. Please try again.");
      setShowAuthLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle location step events
  const handleLocationSet = (locationData) => {
    console.log("Location set successfully:", locationData);
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
    return <AuthLoadingScreen message="Setting up your account..." />;
  }

  // Show dashboard loading screen
  if (showDashboardLoading) {
    return <DashboardLoadingScreen message="Preparing your dashboard..." />;
  }

  // If location step is active, show location page instead of signup form
  if (showLocationStep) {
    return (
      <LocationStepPage
        onLocationSet={handleLocationSet}
        onSkip={handleLocationSkip}
      />
    );
  }

  return (
    <AuthLayout isSignup={true}>
      {/* Signup Form - Shows on LEFT for signup */}
      <div className="lg:order-1">
        <SignupForm
          formData={formData}
          loading={loading}
          error={error}
          onInputChange={handleInputChange}
          onSubmit={handleSignup}
        />
      </div>

      {/* Brand Section - Shows on RIGHT for signup */}
      <AuthBrandSection type="signup" />
    </AuthLayout>
  );
};

export default SignupPage;
