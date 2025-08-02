import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  isEmailVerified?: boolean;
  accountStatus?: string;
  tradingLevel?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAIL' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_BALANCE'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true };
    case 'AUTH_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'AUTH_FAIL':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'UPDATE_BALANCE':
      return {
        ...state,
        user: state.user ? { ...state.user, balance: action.payload } : null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up axios interceptor for requests
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Set up axios interceptor for responses
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token is invalid or expired
          dispatch({ type: 'LOGOUT' });
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadUser = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.get('/auth/profile');
      
      if (response.data.success) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { 
            user: response.data.user, 
            token: localStorage.getItem('token')! 
          },
        });
      } else {
        throw new Error('Failed to load user profile');
      }
    } catch (error) {
      console.error('Load user error:', error);
      dispatch({ type: 'AUTH_FAIL' });
    }
  };

  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      if (response.data.success) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: response.data.user, token: response.data.token },
        });
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      dispatch({ type: 'AUTH_FAIL' });
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
      });
      
      if (response.data.success) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: response.data.user, token: response.data.token },
        });
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      dispatch({ type: 'AUTH_FAIL' });
      throw error;
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateBalance = (newBalance: number) => {
    dispatch({ type: 'UPDATE_BALANCE', payload: newBalance });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (undefined === context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the configured axios instance for use in components
export { api };