import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { PrivateRoute } from './auth/PrivateRoute';
import LoginPage from './pages/LoginPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import ScanPage from './pages/ScanPage';
import DashboardPage from './pages/DashboardPage';
import { useState, useEffect } from 'react';

// Animation CSS
const animationCSS = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
  .animate-slide-in {
    animation: slideIn 0.4s ease-out;
  }
  .animate-slide-up {
    animation: slideUp 0.4s ease-out;
  }
  .animate-pulse {
    animation: pulse 2s ease-in-out infinite;
  }
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
`;

// SVG Icons
const icons = {
  menu: (color = '#6B7280') => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 12H21M3 6H21M3 18H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  close: (color = '#6B7280') => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  calendar: (color = '#FFFFFF') => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  scan: (color = '#FFFFFF') => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M8 3H7C5.89543 3 5 3.89543 5 5V8M21 8V7C21 5.89543 20.1046 5 19 5H16M16 21H19C20.1046 21 21 20.1046 21 19V16M5 16V19C5 20.1046 5.89543 21 7 21H8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 9H15V15H9V9Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  dashboard: (color = '#FFFFFF') => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  logout: (color = '#FFFFFF') => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 17L21 12L16 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  user: (color = '#FFFFFF') => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  home: (color = '#FFFFFF') => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  chevronRight: (color = '#6B7280') => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 18L15 12L9 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  bell: (color = '#FFFFFF') => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  settings: (color = '#FFFFFF') => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.4 15C19.2662 15.3044 19.2027 15.6363 19.2145 15.9701C19.2263 16.3039 19.3131 16.6303 19.4679 16.9235C19.6228 17.2167 19.8416 17.4687 20.1072 17.6601C20.3728 17.8515 20.6777 17.9773 21 18.0275C21.3223 18.0778 21.6529 18.0511 21.9632 17.9494C22.2735 17.8477 22.5549 17.6737 22.784 17.4412C23.0131 17.2087 23.1834 16.9241 23.2809 16.6111C23.3783 16.2981 23.4003 15.9659 23.345 15.6425C23.2897 15.3191 23.1587 15.0136 22.9629 14.7512C22.767 14.4888 22.5121 14.2772 22.22 14.134L21 13.5L22.2 12.3C22.4426 12.0574 22.6195 11.757 22.7143 11.4274C22.8091 11.0977 22.8188 10.7497 22.7424 10.4152C22.6661 10.0808 22.5063 9.77081 22.2783 9.51466C22.0503 9.25851 21.7617 9.06476 21.44 8.95252C21.1183 8.84027 20.7742 8.81311 20.4397 8.87338C20.1051 8.93364 19.7912 9.07938 19.5277 9.2965C19.2642 9.51362 19.0598 9.79474 18.9345 10.113C18.8092 10.4313 18.7671 10.7761 18.8122 11.115C18.8573 11.4539 18.9881 11.7755 19.1917 12.05L18.1917 13.05C17.9477 13.294 17.7771 13.602 17.6993 13.9382C17.6215 14.2745 17.6394 14.6255 17.7511 14.9516C17.8628 15.2777 18.0638 15.566 18.3318 15.7845C18.5999 16.003 18.924 16.1431 19.2667 16.1892C19.6093 16.2354 19.9568 16.1859 20.2717 16.0463C20.5866 15.9067 20.8562 15.6825 21.05 15.4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
};

function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(3); // Mock notification count
  const [activePath, setActivePath] = useState(location.pathname);

  // Update active path on location change
  useEffect(() => {
    setActivePath(location.pathname);
    setSidebarOpen(false); // Close sidebar on mobile when navigating
  }, [location]);

  // Get page title based on route
  const getPageTitle = () => {
    if (location.pathname === '/') return 'Events';
    if (location.pathname.includes('/dashboard')) return 'Dashboard';
    if (location.pathname.includes('/scan')) return 'Scan Guests';
    if (location.pathname.includes('/events/') && !location.pathname.includes('/scan') && !location.pathname.includes('/dashboard')) {
      return 'Event Details';
    }
    return 'Event Manager';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Events', icon: icons.home },
    { path: '/events/:eventId/scan', label: 'Scan', icon: icons.scan },
    { path: '/events/:eventId/dashboard', label: 'Dashboard', icon: icons.dashboard },
  ];

  const isActive = (path) => {
    if (path === '/') return activePath === '/';
    if (path.includes('/scan')) return activePath.includes('/scan');
    if (path.includes('/dashboard')) return activePath.includes('/dashboard');
    return false;
  };

  // Breadcrumb navigation
  const breadcrumbs = location.pathname.split('/').filter(crumb => crumb);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Inject CSS animations */}
      <style>{animationCSS}</style>

      {/* Header/Navbar */}
      <header style={{
        background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
        color: '#FFFFFF',
        boxShadow: '0 4px 20px rgba(79, 70, 229, 0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        animation: 'slideIn 0.4s ease-out'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Left Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px'
          }}>
            {/* Logo/Brand */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  padding: "0"
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                {sidebarOpen ? icons.close('#FFFFFF') : icons.menu('#FFFFFF')}
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(4px)'
                }}>
                  {icons.calendar()}
                </div>
                <h1 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  margin: 0,
                  background: 'linear-gradient(90deg, #FFFFFF 0%, #E0E7FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Event Manager Pro
                </h1>
              </div>
            </div>

            {/* Breadcrumbs (Desktop) */}
            {user && (
              <div style={{
                display: 'none',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                '@media (min-width: 768px)': {
                  display: 'flex'
                }
              }}>
                <Link
                  to="/"
                  style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    textDecoration: 'none',
                    fontWeight: '500',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.color = '#FFFFFF';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                  }}
                >
                  Home
                </Link>
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {icons.chevronRight('rgba(255, 255, 255, 0.6)')}
                    <span style={{
                      color: index === breadcrumbs.length - 1 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)',
                      fontWeight: index === breadcrumbs.length - 1 ? '600' : '500',
                      textTransform: 'capitalize'
                    }}>
                      {crumb.replace(/-/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            {user ? (
              <>
                {/* Notifications */}
                {/* <div style={{ position: 'relative' }}>
                  <button
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      borderRadius: '8px',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      padding: "0"
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    }}
                  >
                    {icons.bell()}
                    {notifications > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        background: '#EF4444',
                        color: '#FFFFFF',
                        fontSize: '10px',
                        fontWeight: '700',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'pulse 2s ease-in-out infinite'
                      }}>
                        {notifications}
                      </span>
                    )}
                  </button>
                </div> */}

                {/* User Menu */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    fontSize: '16px',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                  }}>
                    {user.name?.charAt(0).toUpperCase() || icons.user()}
                  </div>
                  <div style={{ display: 'none', '@media (min-width: 640px)': { display: 'block' } }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      {user.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      opacity: 0.8,
                      fontWeight: '400'
                    }}>
                      {user.role || 'Admin'}
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(4px)',
                    padding: "4px 10px"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                    e.target.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                >
                  {icons.logout()}
                  <span style={{ display: 'none', '@media (min-width: 640px)': { display: 'inline' } }}>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(4px)',
                  padding: "4px 10px"
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                {icons.user()}
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{
        display: 'flex',
        maxWidth: '1400px',
        margin: '0 auto',
        minHeight: 'calc(100vh - 64px)'
      }}>
        {/* Sidebar */}
        {user && (
          <aside style={{
            width: sidebarOpen ? '280px' : '0',
            background: '#FFFFFF',
            borderRight: '1px solid #E5E7EB',
            overflow: 'hidden',
            transition: 'width 0.3s ease',
            position: 'fixed',
            top: '64px',
            left: 0,
            bottom: 0,
            zIndex: 90,
            boxShadow: '4px 0 20px rgba(0, 0, 0, 0.05)',
            '@media (min-width: 768px)': {
              position: 'relative',
              top: 0,
              width: '280px'
            }
          }}>
            <div style={{
              padding: '24px',
              display: sidebarOpen ? 'block' : 'none',
              '@media (min-width: 768px)': {
                display: 'block'
              }
            }}>
              {/* Sidebar Header */}
              <div style={{
                marginBottom: '32px',
                paddingBottom: '16px',
                borderBottom: '1px solid #E5E7EB'
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  margin: 0
                }}>
                  Navigation
                </h3>
              </div>

              {/* Navigation Items */}
              <nav style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <Link
                  to="/"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: isActive('/') ? '#4F46E5' : '#374151',
                    background: isActive('/') ? '#EEF2FF' : 'transparent',
                    fontWeight: isActive('/') ? '600' : '500',
                    transition: 'all 0.2s ease',
                    animation: isActive('/') ? 'fadeIn 0.3s ease-out' : 'none',
                    padding: "0"
                  }}
                  onMouseOver={(e) => {
                    if (!isActive('/')) {
                      e.target.style.background = '#F3F4F6';
                      e.target.style.color = '#1F2937';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive('/')) {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#374151';
                    }
                  }}
                >
                  {icons.home(isActive('/') ? '#4F46E5' : '#6B7280')}
                  <span>Events</span>
                </Link>

                {/* Dynamic navigation based on current event */}
                {location.pathname.includes('/events/') && (
                  <>
                    <Link
                      to={location.pathname.replace(/\/[^/]*$/, '/scan')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: isActive('/scan') ? '#4F46E5' : '#374151',
                        background: isActive('/scan') ? '#EEF2FF' : 'transparent',
                        fontWeight: isActive('/scan') ? '600' : '500',
                        transition: 'all 0.2s ease',
                        padding: "0",
                        animation: isActive('/scan') ? 'fadeIn 0.3s ease-out' : 'none'
                      }}
                      onMouseOver={(e) => {
                        if (!isActive('/scan')) {
                          e.target.style.background = '#F3F4F6';
                          e.target.style.color = '#1F2937';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isActive('/scan')) {
                          e.target.style.background = 'transparent';
                          e.target.style.color = '#374151';
                        }
                      }}
                    >
                      {icons.scan(isActive('/scan') ? '#4F46E5' : '#6B7280')}
                      <span>Scan Guests</span>
                    </Link>

                    <Link
                      to={location.pathname.replace(/\/[^/]*$/, '/dashboard')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: isActive('/dashboard') ? '#4F46E5' : '#374151',
                        background: isActive('/dashboard') ? '#EEF2FF' : 'transparent',
                        fontWeight: isActive('/dashboard') ? '600' : '500',
                        transition: 'all 0.2s ease',
                        padding: "0",
                        animation: isActive('/dashboard') ? 'fadeIn 0.3s ease-out' : 'none'
                      }}
                      onMouseOver={(e) => {
                        if (!isActive('/dashboard')) {
                          e.target.style.background = '#F3F4F6';
                          e.target.style.color = '#1F2937';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isActive('/dashboard')) {
                          e.target.style.background = 'transparent';
                          e.target.style.color = '#374151';
                        }
                      }}
                    >
                      {icons.dashboard(isActive('/dashboard') ? '#4F46E5' : '#6B7280')}
                      <span>Dashboard</span>
                    </Link>
                  </>
                )}

                {/* Settings */}
                <div style={{
                  marginTop: '32px',
                  paddingTop: '16px',
                  borderTop: '1px solid #E5E7EB'
                }}>
                  <Link
                    to="/settings"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: '#374151',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      padding: "0"
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = '#F3F4F6';
                      e.target.style.color = '#1F2937';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#374151';
                    }}
                  >
                    {icons.settings('#6B7280')}
                    <span>Settings</span>
                  </Link>
                </div>
              </nav>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main style={{
          flex: 1,
          padding: '24px',
          animation: 'fadeIn 0.5s ease-out',
          marginLeft: user ? (sidebarOpen ? '280px' : '0') : '0',
          transition: 'margin-left 0.3s ease',
          '@media (min-width: 768px)': {
            marginLeft: user ? '280px' : '0'
          }
        }}>
          {/* Page Content */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            animation: 'slideUp 0.5s ease-out'
          }}>
            {children}
          </div>

          {/* Footer */}
          <footer style={{
            marginTop: '48px',
            padding: '24px 0',
            borderTop: '1px solid #E5E7EB',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#6B7280',
              margin: '0 0 8px 0'
            }}>
              Event Manager Pro v2.1.0
            </p>
            <p style={{
              fontSize: '12px',
              color: '#9CA3AF',
              margin: 0
            }}>
              © {new Date().getFullYear()} All rights reserved. Secure Event Management System
            </p>
          </footer>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: '64px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 80,
            '@media (min-width: 768px)': {
              display: 'none'
            }
          }}
        />
      )}
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <Routes location={location}>
      <Route
        path="/"
        element={
          <PrivateRoute>
            <EventsPage />
          </PrivateRoute>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/events/:eventId"
        element={
          <PrivateRoute>
            <EventDetailPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/events/:eventId/scan"
        element={
          <PrivateRoute>
            <ScanPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/events/:eventId/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <AppRoutes />
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}