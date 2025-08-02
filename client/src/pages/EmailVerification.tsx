import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Mail, TrendingUp } from 'lucide-react';
import axios from 'axios';

const EmailVerification: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification token');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/auth/verify-email/${token}`);
        
        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message);
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login', { 
              state: { message: 'Email verified successfully! Please log in to continue.' }
            });
          }, 3000);
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Email verification failed');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Email verification failed');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <TrendingUp className="h-12 w-12 text-blue-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Email Verification</h2>
        </div>

        <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
          <div className="text-center">
            {status === 'loading' && (
              <div className="space-y-4">
                <Loader className="h-12 w-12 text-blue-500 animate-spin mx-auto" />
                <p className="text-gray-300">Verifying your email address...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Verification Successful!</h3>
                  <p className="text-gray-300 mb-4">{message}</p>
                  <p className="text-sm text-gray-400">Redirecting to login page...</p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Verification Failed</h3>
                  <p className="text-gray-300 mb-6">{message}</p>
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Go to Login
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Register Again
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            Need help?{' '}
            <a href="mailto:support@tradepro.com" className="text-blue-400 hover:text-blue-300">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;