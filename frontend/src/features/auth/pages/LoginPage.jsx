import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
        navigate("/app");
      } else {
        // Provide more meaningful error messages
        let errorMessage = result.error || "Login failed";
        
        // Handle common Supabase auth errors
        if (errorMessage.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (errorMessage.includes("Email not confirmed")) {
          errorMessage = "Please check your email and confirm your account before signing in.";
        } else if (errorMessage.includes("Too many requests")) {
          errorMessage = "Too many login attempts. Please wait a moment before trying again.";
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

  // redirect to sign up page
  const handleSignupRedirect = () => {
    navigate("/signup");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Form title */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">Welcome back to ALISTO</p>
        </div>
      </div>

      {/* Form container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Form card*/}
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          {/* Error message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}
          
          {/* Form inputs */}
          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Input for email*/}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Input for password*/}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              {/* Remember me checkbox */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>

              {/* Forgot your password? */}
              <div className="text-sm">
                <button
                  type="button"
                  className="font-medium text-primary hover:text-primary/80"
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            {/* Sign in button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                Sign in
              </button>
            </div>
          </form>

          {/* Don't have an account? */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Don't have an account?
                </span>
              </div>
            </div>

            {/* Create new account button */}
            <div className="mt-6">
              <button
                onClick={handleSignupRedirect}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                Create new account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
