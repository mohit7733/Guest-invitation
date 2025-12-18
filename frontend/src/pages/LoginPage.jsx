import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginApi } from '../api/authApi';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formAnimating, setFormAnimating] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Check for saved credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Animation styles
  const animationCSS = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-30px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }
    .animate-fade-in {
      animation: fadeIn 0.6s ease-out;
    }
    .animate-slide-in {
      animation: slideIn 0.6s ease-out;
    }
    .animate-pulse {
      animation: pulse 2s ease-in-out infinite;
    }
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
    .animate-shake {
      animation: shake 0.5s ease-in-out;
    }
  `;

  // SVG Icons
  const icons = {
    lock: (color = '#FFFFFF') => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    eye: (color = '#6B7280') => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    eyeOff: (color = '#6B7280') => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9.88 9.88C9.2346 10.5254 8.8948 11.4146 8.9461 12.3255C8.99741 13.2364 9.43484 14.0828 10.1575 14.6603C10.8801 15.2378 11.8223 15.4954 12.7539 15.3717C13.6855 15.248 14.524 14.7535 15.08 14H15.12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.73 5.08C11.1513 5.02751 11.5755 5.00079 12 5C19 5 23 12 23 12C22.5529 12.9571 21.8296 13.7712 20.92 14.36" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6.61 6.61C4.62125 7.96462 3.02987 9.82526 2 12C2 12 6 20 12 20C13.9159 20.005 15.7908 19.4451 17.39 18.39" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M1 1L23 23" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    mail: (color = '#6B7280') => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 6L12 13L2 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    user: (color = '#FFFFFF') => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    check: (color = '#4F46E5') => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17L4 12" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    spinner: (color = '#FFFFFF') => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="4" strokeOpacity="0.3"/>
        <path d="M12 2C15.0423 2 17.7821 3.36964 19.6154 5.53846" stroke={color} strokeWidth="4" strokeLinecap="round">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 12 12"
            to="360 12 12"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    ),
    key: (color = '#FFFFFF') => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M21 2L19 4M11.39 11.61C12.3665 12.5865 13.1335 13.7468 13.6449 15.0233C14.1562 16.2998 14.4013 17.6664 14.365 19.0401C14.3287 20.4138 14.0119 21.7656 13.4338 23.007C12.8557 24.2484 12.0283 25.3523 11 26.25C9.97175 27.1477 8.76482 27.8196 7.45886 28.2237C6.1529 28.6278 4.77687 28.7555 3.42229 28.5988C2.06771 28.4421 0.764401 28.0049 -0.404975 27.3172C-1.57435 26.6295 -2.60028 25.7067 -3.415 24.609C-4.22972 23.5114 -4.81501 22.263 -5.13338 20.9399C-5.45175 19.6169 -5.49659 18.2474 -5.265 17.907C-5.03341 17.5666 -5.265 17.907 -5.265 17.907C-5.265 17.907 -5.03341 17.5666 -5.265 17.907C-5.49659 17.2474 -5.45175 16.6169 -5.13338 15.9399C-4.81501 15.263 -4.22972 14.5114 -3.415 13.609C-2.60028 12.7067 -1.57435 11.6295 -0.404975 10.8172C0.764401 10.0049 2.06771 9.44214 3.42229 9.2988C4.77687 9.15545 6.1529 9.3778 7.45886 10.2237C8.76482 11.0696 9.97175 12.1477 11 13.25C11.39 13.61 11.39 13.61 11.39 13.61L15 10L21 4L23 2L21 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFormAnimating(false);

    // Form validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setFormAnimating(true);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      setFormAnimating(true);
      return;
    }

    setLoading(true);

    try {
      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      const data = await loginApi(email, password);
      login(data.token, data.user);
      
      // Show success animation before navigating
      setTimeout(() => {
        navigate(location.state?.from || '/');
      }, 500);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      setFormAnimating(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Inject CSS animations */}
      <style>{animationCSS}</style>

      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        right: '-50%',
        bottom: '-50%',
        background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)',
        animation: 'float 6s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '-30%',
        right: '-30%',
        width: '60%',
        height: '60%',
        background: 'radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
        animation: 'float 8s ease-in-out infinite'
      }}></div>

      {/* Login Card */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        position: 'relative',
        zIndex: 1,
        animation: 'fadeIn 0.8s ease-out'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            borderRadius: '50%',
            marginBottom: '1px',
            boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            {icons.lock()}
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1F2937',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px'
          }}>
            Welcome Back
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6B7280',
            margin: '0',
            fontWeight: '400'
          }}>
            Sign in to your admin dashboard
          </p>
        </div>

        {/* Form */}
        <form 
          onSubmit={handleSubmit} 
          className={formAnimating ? 'animate-shake' : ''}
          style={{
            animation: formAnimating ? 'shake 0.5s ease-in-out' : 'none'
          }}
        >
          {/* Error Message */}
          {error && (
            <div className="animate-fade-in" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <div style={{ flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9V12M12 15H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={{
                color: '#DC2626',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                {error}
              </span>
            </div>
          )}

          {/* Email Field */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF'
              }}>
                {icons.mail()}
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px',
                  fontSize: '16px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  background: '#FFFFFF',
                  color: '#1F2937',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4F46E5';
                  e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF'
              }}>
                {icons.key('#9CA3AF')}
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px 48px 16px 48px',
                  fontSize: '16px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  background: '#FFFFFF',
                  color: '#1F2937',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4F46E5';
                  e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#6B7280',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                onMouseOver={(e) => {
                  e.target.style.color = '#4F46E5';
                }}
                onMouseOut={(e) => {
                  e.target.style.color = '#6B7280';
                }}
              >
                {showPassword ? icons.eyeOff() : icons.eye()}
              </button>
            </div>
          </div>


          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '18px 24px',
              background: loading ? '#D1D5DB' : 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(79, 70, 229, 0.3)',
              marginBottom: '20px'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 25px rgba(79, 70, 229, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 20px rgba(79, 70, 229, 0.3)';
              }
            }}
          >
            {loading ? (
              <>
                {icons.spinner()}
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>

          

          {/* Additional Info */}
          {/* <div style={{
            textAlign: 'center',
            fontSize: '13px',
            color: '#6B7280',
            lineHeight: '1.6'
          }}>
            <p style={{ margin: '0 0 8px 0' }}>
              For security reasons, please ensure you're on a secure network.
            </p>
            <p style={{ margin: '0' }}>
              Need help? Contact your system administrator.
            </p>
          </div> */}
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '32px',
          textAlign: 'center',
          paddingTop: '24px',
          borderTop: '1px solid #E5E7EB'
        }}>
          <p style={{
            margin: '0',
            fontSize: '12px',
            color: '#9CA3AF'
          }}>
            © {new Date().getFullYear()} Event Management System
          </p>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '11px',
            color: '#D1D5DB'
          }}>
            Version 2.1.0 • Secure Admin Portal
          </p>
        </div>
      </div>

      {/* Security Badge */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        animation: 'fadeIn 1s ease-out 0.5s both'
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 12L11 14L15 10" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{
          fontSize: '12px',
          color: '#FFFFFF',
          fontWeight: '500'
        }}>
          🔒 Secure SSL Connection
        </span>
      </div>
    </div>
  );
}