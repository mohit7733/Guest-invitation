import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getActivityLogs,
  getAttendanceLogs,
  getEventSummary,
} from '../api/dashboardApi';

export default function DashboardPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('today');
  const [refreshCount, setRefreshCount] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState('summary');
  const prevSummaryRef = useRef(null);

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
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes countUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
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
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    .animate-count-up {
      animation: countUp 0.6s ease-out;
    }
    .animate-shimmer {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
  `;

  // SVG Icons
  const icons = {
    users: (color = '#FFFFFF') => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    checkIn: (color = '#FFFFFF') => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 10L12 13L22 3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    capacity: (color = '#FFFFFF') => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    remaining: (color = '#FFFFFF') => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 6V12L16 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    activity: (color = '#6B7280') => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M22 12H18L15 21L9 3L6 12H2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    attendance: (color = '#6B7280') => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    export: (color = '#6B7280') => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 10L12 15L17 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 15V3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    refresh: (color = '#6B7280') => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M23 4V10H17M1 20V14H7M3.51 9C4.01717 7.56678 4.87913 6.2854 6.01547 5.27542C7.1518 4.26543 8.52547 3.55976 10.0083 3.22426C11.4911 2.88875 13.0348 2.93434 14.4952 3.35677C15.9556 3.7792 17.2853 4.56471 18.36 5.64L23 10M1 14L5.64 18.36C6.71475 19.4353 8.04437 20.2208 9.50481 20.6432C10.9652 21.0657 12.5089 21.1113 13.9917 20.7757C15.4745 20.4402 16.8482 19.7346 17.9845 18.7246C19.1209 17.7146 19.9828 16.4332 20.49 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    calendar: (color = '#6B7280') => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    chart: (color = '#6B7280') => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M18 20V10M12 20V4M6 20V14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    trendingUp: (color = '#10B981') => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 6H23V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    trendingDown: (color = '#EF4444') => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M23 18L13.5 8.5L8.5 13.5L1 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 18H23V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    user: (color = '#6B7280') => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    admin: (color = '#6B7280') => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    close: (color = '#6B7280') => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    spinner: (color = '#4F46E5') => (
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
    )
  };

  const load = async () => {
    try {
      setLoading(true);
      const [s, a, act] = await Promise.all([
        getEventSummary(eventId),
        getAttendanceLogs(eventId),
        getActivityLogs(eventId),
      ]);
      
      // Store previous summary for comparison
      prevSummaryRef.current = summary;
      setSummary(s);
      setAttendance(a.slice(0, 10)); // Show only recent 10
      setActivity(act.slice(0, 10)); // Show only recent 10
      setRefreshCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!eventId) return;
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [eventId]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDetailedTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate occupancy percentage
  const occupancyRate = summary ? Math.round((summary.totalEnteredMembers / summary.totalAllowedMembers) * 100) : 0;
  const remainingRate = summary ? Math.round((summary.remainingMembers / summary.totalAllowedMembers) * 100) : 0;

  // Calculate trend indicators
  const getTrend = () => {
    if (!prevSummaryRef.current || !summary) return null;
    
    const previous = prevSummaryRef.current.totalEnteredMembers;
    const current = summary.totalEnteredMembers;
    
    if (current > previous) return { type: 'up', value: current - previous };
    if (current < previous) return { type: 'down', value: previous - current };
    return { type: 'same', value: 0 };
  };

  const trend = getTrend();

  const exportData = () => {
    let data, filename, contentType;
    
    switch (exportType) {
      case 'summary':
        data = JSON.stringify(summary, null, 2);
        filename = `event-summary-${eventId}.json`;
        contentType = 'application/json';
        break;
      case 'attendance':
        data = JSON.stringify(attendance, null, 2);
        filename = `attendance-logs-${eventId}.json`;
        contentType = 'application/json';
        break;
      case 'activity':
        data = JSON.stringify(activity, null, 2);
        filename = `activity-logs-${eventId}.json`;
        contentType = 'application/json';
        break;
      case 'csv':
        const csvData = [
          ['Metric', 'Value'],
          ['Total Guests', summary.guestCount],
          ['Total Allowed', summary.totalAllowedMembers],
          ['Total Entered', summary.totalEnteredMembers],
          ['Remaining', summary.remainingMembers],
          ['Occupancy Rate', `${occupancyRate}%`],
          ['Last Updated', new Date().toLocaleString()]
        ];
        data = csvData.map(row => row.join(',')).join('\n');
        filename = `event-dashboard-${eventId}.csv`;
        contentType = 'text/csv';
        break;
    }

    const blob = new Blob([data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    setShowExportModal(false);
  };

  if (!summary && loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <style>{animationCSS}</style>
        <div style={{ textAlign: 'center' }}>
          {icons.spinner()}
          <p style={{ marginTop: '16px', color: '#6B7280', fontWeight: '500' }}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Inject CSS animations */}
      <style>{animationCSS}</style>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px'
      }}>
        {/* Header */}
        <div className="animate-fade-in" style={{
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <button
                onClick={() => navigate(`/events/${eventId}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#4F46E5',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  marginBottom: '12px',
                  padding: 0
                }}
              >
                ← Back to Event
              </button>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#1F2937',
                margin: '0 0 8px 0'
              }}>
                Event Dashboard
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#6B7280',
                margin: 0
              }}>
                Real-time analytics and monitoring
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#6B7280'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#10B981',
                  borderRadius: '50%',
                  animation: 'pulse 2s ease-in-out infinite'
                }}></div>
                <span>Auto-refresh: 15s</span>
              </div>
              <button
                onClick={load}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: '#FFFFFF',
                  color: '#4F46E5',
                  border: '2px solid #E5E7EB',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#F3F4F6';
                  e.target.style.borderColor = '#4F46E5';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#FFFFFF';
                  e.target.style.borderColor = '#E5E7EB';
                }}
              >
                {loading ? icons.spinner('#4F46E5') : icons.refresh('#4F46E5')}
                <span>Refresh Now</span>
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: '#4F46E5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#4338CA';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#4F46E5';
                }}
              >
                {icons.export('#FFFFFF')}
                <span>Export Data</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {/* Guests Card */}
            <div className="animate-slide-up" style={{
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              borderRadius: '16px',
              padding: '28px',
              color: '#FFFFFF',
              boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)',
              animationDelay: '0s'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '20px'
              }}>
                <div>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    opacity: 0.9,
                    margin: '0 0 8px 0'
                  }}>
                    Total Guests
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '8px'
                  }}>
                    <div className="animate-count-up" style={{
                      fontSize: '36px',
                      fontWeight: '700',
                      lineHeight: 1
                    }}>
                      {summary.guestCount}
                    </div>
                    {trend && trend.type === 'up' && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '14px',
                        fontWeight: '500',
                        background: 'rgba(255, 255, 255, 0.2)',
                        padding: '4px 8px',
                        borderRadius: '12px'
                      }}>
                        {icons.trendingUp()}
                        <span>+{trend.value}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(4px)'
                }}>
                  {icons.users()}
                </div>
              </div>
              <div style={{
                fontSize: '13px',
                opacity: 0.9,
                fontWeight: '400'
              }}>
                Registered guests for this event
              </div>
            </div>

            {/* Total Allowed Card */}
            <div className="animate-slide-up" style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              borderRadius: '16px',
              padding: '28px',
              color: '#FFFFFF',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
              animationDelay: '0.1s'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '20px'
              }}>
                <div>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    opacity: 0.9,
                    margin: '0 0 8px 0'
                  }}>
                    Total Capacity
                  </p>
                  <div className="animate-count-up" style={{
                    fontSize: '36px',
                    fontWeight: '700',
                    lineHeight: 1
                  }}>
                    {summary.totalAllowedMembers}
                  </div>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(4px)'
                }}>
                  {icons.capacity()}
                </div>
              </div>
              <div style={{
                fontSize: '13px',
                opacity: 0.9,
                fontWeight: '400'
              }}>
                Maximum allowed attendees
              </div>
            </div>

            {/* Entered Card */}
            <div className="animate-slide-up" style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              borderRadius: '16px',
              padding: '28px',
              color: '#FFFFFF',
              boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)',
              animationDelay: '0.2s'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '20px'
              }}>
                <div>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    opacity: 0.9,
                    margin: '0 0 8px 0'
                  }}>
                    Checked In
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '8px'
                  }}>
                    <div className="animate-count-up" style={{
                      fontSize: '36px',
                      fontWeight: '700',
                      lineHeight: 1
                    }}>
                      {summary.totalEnteredMembers}
                    </div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      opacity: 0.9
                    }}>
                      ({occupancyRate}%)
                    </div>
                  </div>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(4px)'
                }}>
                  {icons.checkIn()}
                </div>
              </div>
              <div style={{
                fontSize: '13px',
                opacity: 0.9,
                fontWeight: '400'
              }}>
                Current event occupancy
              </div>
            </div>

            {/* Remaining Card */}
            <div className="animate-slide-up" style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
              borderRadius: '16px',
              padding: '28px',
              color: '#FFFFFF',
              boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)',
              animationDelay: '0.3s'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '20px'
              }}>
                <div>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    opacity: 0.9,
                    margin: '0 0 8px 0'
                  }}>
                    Available Seats
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '8px'
                  }}>
                    <div className="animate-count-up" style={{
                      fontSize: '36px',
                      fontWeight: '700',
                      lineHeight: 1
                    }}>
                      {summary.remainingMembers}
                    </div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      opacity: 0.9
                    }}>
                      ({remainingRate}%)
                    </div>
                  </div>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(4px)'
                }}>
                  {icons.remaining()}
                </div>
              </div>
              <div style={{
                fontSize: '13px',
                opacity: 0.9,
                fontWeight: '400'
              }}>
                Remaining capacity
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          marginBottom: '24px',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #E5E7EB'
          }}>
            {['overview', 'attendance', 'activity'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: 'none',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: activeTab === tab ? '#4F46E5' : '#6B7280',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (activeTab !== tab) {
                    e.target.style.color = '#4F46E5';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeTab !== tab) {
                    e.target.style.color = '#6B7280';
                  }
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: '#4F46E5',
                    borderRadius: '3px 3px 0 0'
                  }}></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === 'overview' && (
            <div style={{
              display: 'grid',
              // gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '24px'
            }}>
              {/* Attendance Logs */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '28px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: '#F0F9FF',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {icons.attendance('#0EA5E9')}
                  </div>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#1F2937',
                    margin: 0
                  }}>
                    Recent Check-ins
                  </h2>
                  <div style={{
                    marginLeft: 'auto',
                    padding: '4px 12px',
                    background: '#F3F4F6',
                    color: '#6B7280',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    Last 10
                  </div>
                </div>

                {attendance.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 0',
                    color: '#6B7280'
                  }}>
                    <p style={{ margin: 0 }}>No check-ins recorded yet</p>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    {attendance.map((log, index) => (
                      <div 
                        key={log._id}
                        className="animate-slide-up"
                        style={{
                          padding: '16px',
                          background: index % 2 === 0 ? '#F9FAFB' : '#FFFFFF',
                          borderRadius: '12px',
                          border: '1px solid #E5E7EB',
                          animationDelay: `${index * 0.05}s`
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '8px'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            {icons.user('#6B7280')}
                            <span style={{
                              fontWeight: '600',
                              color: '#1F2937'
                            }}>
                              {log.guestId?.name || 'Guest'}
                            </span>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span style={{
                              fontSize: '12px',
                              color: '#6B7280',
                              fontWeight: '500'
                            }}>
                              {formatTime(log.createdAt)}
                            </span>
                            <div style={{
                              padding: '4px 8px',
                              background: '#10B981',
                              color: '#FFFFFF',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              +{log.membersEntered}
                            </div>
                          </div>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '13px',
                          color: '#6B7280'
                        }}>
                          {icons.admin('#6B7280')}
                          <span>Checked in by {log.adminId?.name || 'Admin'}</span>
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#9CA3AF',
                          marginTop: '4px'
                        }}>
                          {formatDetailedTime(log.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity Logs */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '28px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: '#FEF2F2',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {icons.activity('#EF4444')}
                  </div>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#1F2937',
                    margin: 0
                  }}>
                    Admin Activity
                  </h2>
                  <div style={{
                    marginLeft: 'auto',
                    padding: '4px 12px',
                    background: '#F3F4F6',
                    color: '#6B7280',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    Last 10
                  </div>
                </div>

                {activity.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 0',
                    color: '#6B7280'
                  }}>
                    <p style={{ margin: 0 }}>No admin activity yet</p>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    {activity.map((log, index) => (
                      <div 
                        key={log._id}
                        className="animate-slide-up"
                        style={{
                          padding: '16px',
                          background: index % 2 === 0 ? '#F9FAFB' : '#FFFFFF',
                          borderRadius: '12px',
                          border: '1px solid #E5E7EB',
                          animationDelay: `${index * 0.05}s`
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '8px'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span style={{
                              fontWeight: '600',
                              color: '#1F2937',
                              fontSize: '14px'
                            }}>
                              {log.action}
                            </span>
                          </div>
                          <span style={{
                            fontSize: '12px',
                            color: '#6B7280',
                            fontWeight: '500'
                          }}>
                            {formatTime(log.createdAt)}
                          </span>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '13px',
                          color: '#6B7280'
                        }}>
                          {icons.admin('#6B7280')}
                          <span>By {log.adminId?.name || 'Admin'}</span>
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#9CA3AF',
                          marginTop: '4px'
                        }}>
                          {formatDetailedTime(log.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Detailed Views for other tabs would go here */}
        </div>

        {/* Footer Stats */}
        <div className="animate-fade-in" style={{
          marginTop: '32px',
          padding: '20px',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: '#10B981',
              borderRadius: '50%',
              animation: 'pulse 2s ease-in-out infinite'
            }}></div>
            <span style={{ fontSize: '14px', color: '#6B7280' }}>
              Live updates every 15 seconds
            </span>
          </div>
          <div style={{ fontSize: '14px', color: '#6B7280' }}>
            Last refresh: {formatTime(new Date().toISOString())}
          </div>
          <div style={{ fontSize: '14px', color: '#6B7280' }}>
            Auto-refresh count: <strong>{refreshCount}</strong>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1F2937',
                margin: 0
              }}>
                Export Dashboard Data
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6B7280',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#F3F4F6';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'none';
                }}
              >
                {icons.close()}
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{
                fontSize: '14px',
                color: '#6B7280',
                margin: '0 0 16px 0'
              }}>
                Select data type to export:
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { value: 'summary', label: 'Event Summary (JSON)', icon: icons.calendar },
                  { value: 'attendance', label: 'Attendance Logs (JSON)', icon: icons.attendance },
                  { value: 'activity', label: 'Activity Logs (JSON)', icon: icons.activity },
                  { value: 'csv', label: 'Dashboard Summary (CSV)', icon: icons.export }
                ].map((option) => (
                  <label
                    key={option.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: exportType === option.value ? '#EEF2FF' : '#F9FAFB',
                      border: `2px solid ${exportType === option.value ? '#4F46E5' : '#E5E7EB'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input
                      type="radio"
                      name="exportType"
                      value={option.value}
                      checked={exportType === option.value}
                      onChange={(e) => setExportType(e.target.value)}
                      style={{ display: 'none' }}
                    />
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid #D1D5DB',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: exportType === option.value ? '#4F46E5' : 'transparent'
                    }}>
                      {exportType === option.value && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          background: '#FFFFFF',
                          borderRadius: '50%'
                        }}></div>
                      )}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{ color: '#6B7280' }}>
                        {option.icon('#6B7280')}
                      </div>
                      <span style={{
                        fontWeight: '500',
                        color: '#1F2937'
                      }}>
                        {option.label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowExportModal(false)}
                style={{
                  padding: '10px 20px',
                  background: '#F3F4F6',
                  color: '#374151',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#E5E7EB';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#F3F4F6';
                }}
              >
                Cancel
              </button>
              <button
                onClick={exportData}
                style={{
                  padding: '10px 20px',
                  background: '#4F46E5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#4338CA';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#4F46E5';
                }}
              >
                Export Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}