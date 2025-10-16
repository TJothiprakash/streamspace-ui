import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const AuthService = {
  // Login user
  async login(email, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });
      
      if (response.data.token) {
        return {
          success: true,
          token: response.data.token,
          message: 'Login successful'
        };
      } else {
        return {
          success: false,
          message: response.data.error || 'Login failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'An error occurred during login'
      };
    }
  },

  // Register user
  async register(username, email, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        username,
        email,
        password
      });
      
      if (response.data.userId) {
        return {
          success: true,
          userId: response.data.userId,
          message: 'Registration successful'
        };
      } else {
        return {
          success: false,
          message: response.data.error || 'Registration failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'An error occurred during registration'
      };
    }
  },

  // Request password reset
  async requestPasswordReset(email) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password-request`, {
        email
      });
      
      return {
        success: true,
        message: response.data.message || 'Password reset request sent'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'An error occurred while requesting password reset'
      };
    }
  },

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        newPassword
      });
      
      return {
        success: true,
        message: response.data.message || 'Password reset successful'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'An error occurred while resetting password'
      };
    }
  }
};

export default AuthService;
