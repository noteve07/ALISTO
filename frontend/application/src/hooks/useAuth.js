import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth events
    const handleLogin = (user) => setUser(user);
    const handleLogout = () => setUser(null);
    const handleRegister = (user) => setUser(user);

    authService.on('login', handleLogin);
    authService.on('logout', handleLogout);
    authService.on('register', handleRegister);

    return () => {
      authService.off('login', handleLogin);
      authService.off('logout', handleLogout);
      authService.off('register', handleRegister);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.login(email, password);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email, password, name) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.register(email, password, name);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(async (preferences) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.updatePreferences(preferences);
      setUser(result.user);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updatePreferences,
    clearError
  };
};
