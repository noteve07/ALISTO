// Authentication service for ALISTO
class AuthService {
  constructor() {
    this.currentUser = null;
    this.token = localStorage.getItem('alisto_token');
    this.listeners = new Map();
  }

  // Simulate API calls (replace with real backend integration)
  async login(email, password) {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication (replace with real API)
      if (email === 'demo@alisto.com' && password === 'demo123') {
        const user = {
          id: 1,
          email: 'demo@alisto.com',
          name: 'Demo User',
          preferences: {
            notifications: true,
            location: { lat: 14.5995, lng: 120.9842, name: 'Manila' },
            alertThreshold: 4.0,
            units: 'metric'
          }
        };
        
        const token = 'mock_jwt_token_' + Date.now();
        
        this.currentUser = user;
        this.token = token;
        localStorage.setItem('alisto_token', token);
        localStorage.setItem('alisto_user', JSON.stringify(user));
        
        this.emit('login', user);
        return { success: true, user, token };
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      throw error;
    }
  }

  async register(email, password, name) {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock registration (replace with real API)
      const user = {
        id: Date.now(),
        email,
        name,
        preferences: {
          notifications: true,
          location: { lat: 14.5995, lng: 120.9842, name: 'Manila' },
          alertThreshold: 4.0,
          units: 'metric'
        }
      };
      
      const token = 'mock_jwt_token_' + Date.now();
      
      this.currentUser = user;
      this.token = token;
      localStorage.setItem('alisto_token', token);
      localStorage.setItem('alisto_user', JSON.stringify(user));
      
      this.emit('register', user);
      return { success: true, user, token };
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem('alisto_token');
    localStorage.removeItem('alisto_user');
    this.emit('logout');
  }

  async updatePreferences(preferences) {
    if (!this.currentUser) return;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.currentUser.preferences = { ...this.currentUser.preferences, ...preferences };
      localStorage.setItem('alisto_user', JSON.stringify(this.currentUser));
      
      this.emit('preferences_updated', this.currentUser);
      return { success: true, user: this.currentUser };
    } catch (error) {
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token && !!this.currentUser;
  }

  // Get current user
  getCurrentUser() {
    if (!this.currentUser && this.token) {
      // Try to restore from localStorage
      const storedUser = localStorage.getItem('alisto_user');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    }
    return this.currentUser;
  }

  // Get user preferences
  getPreferences() {
    const user = this.getCurrentUser();
    return user?.preferences || {
      notifications: true,
      location: { lat: 14.5995, lng: 120.9842, name: 'Manila' },
      alertThreshold: 4.0,
      units: 'metric'
    };
  }

  // Event system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in auth event callback:', error);
        }
      });
    }
  }
}

// Create and export a singleton instance
export const authService = new AuthService();
