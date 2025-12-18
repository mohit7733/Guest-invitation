import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchEvents, createEvent } from '../api/eventApi';
import { useAuth } from '../auth/AuthContext';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    name: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, upcoming, past
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


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
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
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
    .animate-bounce {
      animation: bounce 1s ease-in-out infinite;
    }
  `;

  // SVG Icons
  const icons = {
    calendar: (color = '#4F46E5') => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    location: (color = '#6B7280') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    users: (color = '#6B7280') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    search: (color = '#6B7280') => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    filter: (color = '#6B7280') => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    plus: (color = '#FFFFFF') => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 5V19M5 12H19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    edit: (color = '#6B7280') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    stats: (color = '#6B7280') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M18 20V10M12 20V4M6 20V14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    scan: (color = '#6B7280') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M8 3H7C5.89543 3 5 3.89543 5 5V8M21 8V7C21 5.89543 20.1046 5 19 5H16M16 21H19C20.1046 21 21 20.1046 21 19V16M5 16V19C5 20.1046 5.89543 21 7 21H8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 9H15V15H9V9Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    clock: (color = '#6B7280') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    chevronDown: (color = '#6B7280') => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M6 9L12 15L18 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    spinner: (color = '#4F46E5') => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="4" strokeOpacity="0.3" />
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
      const data = await fetchEvents();
      setEvents(data);
      setError('');
    } catch (err) {
      setError('Failed to load events. Please try again.');
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: form.name,
        location: form.location,
        startDate: form.startDate,
        endDate: form.endDate,
        description: form.description,
      };

      await createEvent(payload);
      setSuccess('Event created successfully!');
      setForm({ name: '', location: '', startDate: '', endDate: '', description: '' });
      setShowCreateForm(false);
      load();

      // Auto-hide success message
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  // Helper function to get event status
  const getEventStatus = (event) => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'active';
    return 'past';
  };

  // Filter and search events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;

    const status = getEventStatus(event);
    return matchesSearch && status === filterStatus;
  });

  // Calculate stats
  const stats = {
    total: events.length,
    active: events.filter(e => getEventStatus(e) === 'active').length,
    upcoming: events.filter(e => getEventStatus(e) === 'upcoming').length,
    past: events.filter(e => getEventStatus(e) === 'past').length,
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Inject CSS animations */}
      <style>{animationCSS}</style>

      <div className="animate-fade-in" style={{
        padding: '10px'
      }}>
        {/* Header Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{
              fontSize: '1.2rem',
              fontWeight: '700',
              color: '#1F2937',
              margin: '0 0 8px 0'
            }}>
              Events Management
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#6B7280',
              margin: 0
            }}>
              Create, manage, and monitor all your events in one place
            </p>
          </div>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 20px rgba(79, 70, 229, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 25px rgba(79, 70, 229, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 20px rgba(79, 70, 229, 0.3)';
            }}
          >
            {icons.plus()}
            <span>{showCreateForm ? 'Cancel' : 'Create Event'}</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {[
            { label: 'Total Events', value: stats.total, color: '#4F46E5', icon: icons.calendar },
            { label: 'Active Now', value: stats.active, color: '#10B981', icon: icons.clock },
            { label: 'Upcoming', value: stats.upcoming, color: '#F59E0B', icon: icons.calendar },
            { label: 'Completed', value: stats.past, color: '#6B7280', icon: icons.calendar },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="animate-slide-up"
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <div>
                  <p style={{
                    fontSize: '14px',
                    color: '#6B7280',
                    fontWeight: '500',
                    margin: '0 0 8px 0'
                  }}>
                    {stat.label}
                  </p>
                  <p style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: stat.color,
                    margin: 0
                  }}>
                    {stat.value}
                  </p>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: `${stat.color}15`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {stat.icon(stat.color)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Event Form */}
        {showCreateForm && (
          <div className="animate-slide-up" style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '12px',
            marginBottom: '32px',
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
                background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {icons.plus()}
              </div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#1F2937',
                margin: 0
              }}>
                Create New Event
              </h2>
            </div>

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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9V12M12 15H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ color: '#DC2626', fontWeight: '500' }}>{error}</span>
              </div>
            )}

            {success && (
              <div className="animate-fade-in" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '12px',
                marginBottom: '24px'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ color: '#059669', fontWeight: '500' }}>{success}</span>
              </div>
            )}

            <form onSubmit={handleCreate}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
              }}>
                {/* Event Name */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Event Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    disabled={creating}
                    placeholder="Annual Conference 2024"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      fontSize: '16px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '10px',
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
                  />
                </div>

                {/* Location */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    disabled={creating}
                    placeholder="Main Conference Hall"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      fontSize: '16px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '10px',
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
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                    disabled={creating}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      fontSize: '16px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '10px',
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
                  />
                </div>

                {/* End Date */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    required
                    disabled={creating}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      fontSize: '16px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '10px',
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
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '16px'
              }}>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  disabled={creating}
                  style={{
                    padding: '14px 28px',
                    background: '#F3F4F6',
                    color: '#374151',
                    border: '2px solid #E5E7EB',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: creating ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    if (!creating) {
                      e.target.style.background = '#E5E7EB';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!creating) {
                      e.target.style.background = '#F3F4F6';
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    padding: '14px 28px',
                    background: creating ? '#D1D5DB' : 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: creating ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  {creating ? (
                    <>
                      {icons.spinner()}
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      {icons.plus()}
                      <span>Create Event</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events List Section */}
        <div className="animate-slide-up" style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '12px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
        }}>
          {/* Controls */}
          <div style={{
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '20px'
          }}>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}>
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6B7280'
                }}>
                  {icons.search()}
                </div>
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: '12px 16px 12px 44px',
                    fontSize: '14px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '10px',
                    background: '#FFFFFF',
                    color: '#1F2937',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    width: '240px',
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
                />
              </div>

              {/* Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '10px',
                  background: '#FFFFFF',
                  color: '#1F2937',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  paddingRight: '40px',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9L12 15L18 9'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '16px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4F46E5';
                  e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="all">All Events</option>
                <option value="active">Active Now</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past Events</option>
              </select>

              <button
                onClick={load}
                style={{
                  padding: '12px 16px',
                  background: '#F3F4F6',
                  color: '#374151',
                  border: '2px solid #E5E7EB',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#E5E7EB';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#F3F4F6';
                }}
              >
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Events List */}
          {loading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 0',
              color: '#6B7280'
            }}>
              {icons.spinner('#4F46E5')}
              <p style={{ marginTop: '16px', fontWeight: '500' }}>Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 0',
              color: '#6B7280'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: '#F3F4F6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto'
              }}>
                {icons.calendar('#9CA3AF')}
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                margin: '0 0 8px 0'
              }}>
                No events found
              </h3>
              <p style={{ margin: 0, opacity: 0.8 }}>
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter'
                  : 'Create your first event to get started'}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              '@media (max-width: 768px)': {
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              },
              gap: '24px'
            }}>
              {filteredEvents.map((event, index) => {
                const status = getEventStatus(event);
                const statusColors = {
                  active: { bg: '#D1FAE5', text: '#065F46', border: '#10B981' },
                  upcoming: { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
                  past: { bg: '#F3F4F6', text: '#374151', border: '#9CA3AF' }
                };
                const colors = statusColors[status];

                return (
                  <div
                    key={event._id}
                    className="animate-slide-up"
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '16px',
                      border: `1px solid ${colors.border}20`,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      animationDelay: `${index * 0.05}s`
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.08)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.04)';
                    }}
                  >
                    {/* Event Header */}
                    <div style={{
                      padding: '24px 12px 20px 12px',
                      borderBottom: '1px solid #F3F4F6'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '12px'
                      }}>
                        <div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '8px'
                          }}>
                            <span style={{
                              padding: '4px 12px',
                              background: colors.bg,
                              color: colors.text,
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '600',
                              textTransform: 'capitalize'
                            }}>
                              {status}
                            </span>
                            {status === 'active' && (
                              <span style={{
                                width: '8px',
                                height: '8px',
                                background: '#10B981',
                                borderRadius: '50%',
                                animation: 'pulse 2s ease-in-out infinite'
                              }}></span>
                            )}
                          </div>
                          <h3 style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#1F2937',
                            margin: '0 0 8px 0',
                            lineHeight: '1.4'
                          }}>
                            {event.name}
                          </h3>
                        </div>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          background: '#F3F4F6',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {icons.calendar('#4F46E5')}
                        </div>
                      </div>

                      {/* Event Info */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}>
                        {event.location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {icons.location()}
                            <span style={{ fontSize: '14px', color: '#6B7280' }}>
                              {event.location}
                            </span>
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {icons.clock()}
                          <span style={{ fontSize: '14px', color: '#6B7280' }}>
                            {formatDate(event.startDate)} <br /> {formatDate(event.endDate)}
                          </span>
                        </div>
                        {event.description && (
                          <p style={{
                            fontSize: '14px',
                            color: '#6B7280',
                            margin: '8px 0 0 0',
                            lineHeight: '1.5'
                          }}>
                            {event.description.length > 100
                              ? `${event.description.substring(0, 100)}...`
                              : event.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{
                      padding: '20px 24px',
                      background: '#F9FAFB',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid #E5E7EB'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                      }}>
                        <Link
                          to={`/events/${event._id}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            textDecoration: 'none',
                            color: '#4F46E5',
                            fontWeight: '500',
                            fontSize: '14px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.color = '#7C3AED';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.color = '#4F46E5';
                          }}
                        >
                          {icons.edit('#4F46E5')}
                          <span>Manage</span>
                        </Link>
                        <Link
                          to={`/events/${event._id}/scan`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            textDecoration: 'none',
                            color: '#059669',
                            fontWeight: '500',
                            fontSize: '14px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.color = '#10B981';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.color = '#059669';
                          }}
                        >
                          {icons.scan('#059669')}
                          <span>Scan</span>
                        </Link>
                        <Link
                          to={`/events/${event._id}/dashboard`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            textDecoration: 'none',
                            color: '#7C3AED',
                            fontWeight: '500',
                            fontSize: '14px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.color = '#8B5CF6';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.color = '#7C3AED';
                          }}
                        >
                          {icons.stats('#7C3AED')}
                          <span>Dashboard</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}