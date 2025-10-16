import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../auth/AuthService';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('request'); // 'request' or 'reset'
  
  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    const result = await AuthService.requestPasswordReset(email);
    
    if (result.success) {
      setMessage('If an account exists with this email, a reset link has been sent.');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');
    
    const result = await AuthService.resetPassword(token, newPassword);
    
    if (result.success) {
      setMessage('Password reset successful. You can now login with your new password.');
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Reset Password</h2>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        
        {step === 'request' ? (
          <>
            <form onSubmit={handleRequestReset}>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            
            <div className="form-group">
              <button onClick={() => setStep('reset')}>
                I have a reset token
              </button>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label htmlFor="token">Reset Token:</label>
                <input
                  type="text"
                  id="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password:</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password:</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
            
            <div className="form-group">
              <button onClick={() => setStep('request')}>
                Request new reset token
              </button>
            </div>
          </>
        )}
        
        <div className="auth-links">
          <p>
            <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
