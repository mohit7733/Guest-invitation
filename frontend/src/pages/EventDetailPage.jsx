import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchEvent } from '../api/eventApi';
import { fetchGuests, createGuest, getGuestQr, updateAllowedMembers } from '../api/guestApi';

export default function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [guestForm, setGuestForm] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    allowedMembers: 1,
    guestType: 'REGULAR',
  });
  const [qrGuest, setQrGuest] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [allowedEdit, setAllowedEdit] = useState({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
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
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    @keyframes modalOpen {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
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
    .animate-modal {
      animation: modalOpen 0.3s ease-out;
    }
  `;

  // SVG Icons
  const icons = {
    calendar: (color = '#6B7280') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    location: (color = '#6B7280') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    user: (color = '#6B7280') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    company: (color = '#6B7280') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M19 21V5C19 4.46957 18.7893 3.96086 18.4142 3.58579C18.0391 3.21071 17.5304 3 17 3H7C6.46957 3 5.96086 3.21071 5.58579 3.58579C5.21071 3.96086 5 4.46957 5 5V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 21H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 8H10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12H10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 16H10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 8H15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 12H15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 16H15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    mail: (color = '#6B7280') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 6L12 13L2 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    phone: (color = '#6B7280') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M22 16.92V19.92C22.0012 20.1985 21.9441 20.4743 21.8328 20.7294C21.7214 20.9845 21.5584 21.2133 21.3548 21.4009C21.1512 21.5885 20.9117 21.7309 20.6514 21.8192C20.3912 21.9075 20.116 21.9398 19.843 21.9139C16.443 21.5759 13.206 20.3389 10.48 18.3499C7.94 16.5199 5.872 14.1499 4.438 11.4399C3.014 8.74992 2.264 5.79992 2.246 2.79992C2.24188 2.52843 2.29542 2.25882 2.403 2.00992C2.51057 1.76103 2.6697 1.53869 2.87 1.35792C3.07031 1.17715 3.30708 1.04217 3.56401 0.96217C3.82094 0.882176 4.09185 0.85906 4.358 0.894921C5.13981 0.995919 5.89378 1.28294 6.56 1.73492C7.395 2.30492 7.947 3.23992 8.55 4.10492C8.858 4.58992 8.983 5.17792 8.9 5.75492C8.817 6.33192 8.532 6.86192 8.094 7.25192L6.866 8.37992C8.24427 10.7977 10.2023 12.7557 12.62 14.1349L13.748 12.9069C14.138 12.4689 14.668 12.1839 15.245 12.1009C15.822 12.0179 16.41 12.1429 16.895 12.4509C17.76 13.0539 18.695 13.6059 19.265 14.4409C19.717 15.1062 20.004 15.8602 20.105 16.642C20.1418 16.9111 20.118 17.185 20.0351 17.4448C19.9522 17.7045 19.8123 17.9437 19.6263 18.1449C19.4402 18.3461 19.2128 18.5047 18.9603 18.6097C18.7077 18.7147 18.4364 18.7636 18.164 18.7529H15.164C14.4271 18.7559 13.7161 19.0378 13.1731 19.5421C12.63 20.0465 12.2948 20.7364 12.233 21.4779" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    qr: (color = '#6B7280') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M8 3H7C5.89543 3 5 3.89543 5 5V8M21 8V7C21 5.89543 20.1046 5 19 5H16M16 21H19C20.1046 21 21 20.1046 21 19V16M5 16V19C5 20.1046 5.89543 21 7 21H8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 9H15V15H9V9Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
    plus: (color = '#FFFFFF') => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 5V19M5 12H19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
    download: (color = '#6B7280') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 10L12 15L17 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 15V3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    edit: (color = '#6B7280') => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    
    close: (color = '#6B7280') => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
    ),
    export: (color = '#6B7280') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 10L12 15L17 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 15V3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  };

  const load = async () => {
    try {
      setLoading(true);
      const [e, g] = await Promise.all([fetchEvent(eventId), fetchGuests(eventId)]);
      setEvent(e);
      setGuests(g);
      setError('');
    } catch (err) {
      setError('Failed to load event data. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [eventId]);

  const handleCreateGuest = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');

    try {
      await createGuest(eventId, guestForm);
      setSuccess('Guest added successfully!');
      setGuestForm({
        name: '',
        companyName: '',
        email: '',
        phone: '',
        allowedMembers: 1,
        guestType: 'REGULAR',
      });
      setShowGuestForm(false);
      load();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add guest. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const openQr = async (guest) => {
    try {
      const data = await getGuestQr(guest._id);
      setQrDataUrl(data.dataUrl);
      setQrGuest(guest);
    } catch (err) {
      setError('Failed to load QR code. Please try again.');
    }
  };

  const handleAllowedChange = (guestId, value) => {
    setAllowedEdit((prev) => ({ ...prev, [guestId]: value }));
  };

  const saveAllowedChange = async (guestId) => {
    const value = Number(allowedEdit[guestId]);
    if (!value || value <= 0) {
      setError('Please enter a valid number greater than 0');
      return;
    }

    try {
      await updateAllowedMembers(guestId, value);
      setAllowedEdit((prev) => ({ ...prev, [guestId]: undefined }));
      load();
      setSuccess('Allowed members updated successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to update allowed members. Please try again.');
    }
  };

  const exportGuests = () => {
    const csvData = guests.map(g => ({
      Name: g.name,
      Company: g.companyName,
      Email: g.email,
      Phone: g.phone,
      'Guest Type': g.guestType,
      'Allowed Members': g.allowedMembers,
      'Total Entered': g.totalEntered
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event?.name.replace(/\s+/g, '_')}_guests.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getTypeColor = (type) => {
    const colors = {
      'VIP': { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
      'REGULAR': { bg: '#E0E7FF', text: '#3730A3', border: '#4F46E5' },
      'STAFF': { bg: '#D1FAE5', text: '#065F46', border: '#10B981' },
      'OTHER': { bg: '#F3F4F6', text: '#374151', border: '#6B7280' }
    };
    return colors[type] || colors.OTHER;
  };

  // Filter guests
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'all') return matchesSearch;
    return matchesSearch && guest.guestType === filterType;
  });

  // Calculate stats
  const stats = {
    total: guests.length,
    vip: guests.filter(g => g.guestType === 'VIP').length,
    entered: guests.reduce((sum, g) => sum + g.totalEntered, 0),
    capacity: guests.reduce((sum, g) => sum + g.allowedMembers, 0)
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
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
            Loading event details...
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

      <div className="animate-fade-in" style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px'
      }}>
        {/* Header */}
        <div style={{
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
                onClick={() => navigate('/')}
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
                ← Back to Events
              </button>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#1F2937',
                margin: '0 0 8px 0'
              }}>
                {event.name}
              </h1>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {icons.location()}
                  <span style={{ fontSize: '16px', color: '#6B7280' }}>
                    {event.location}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {icons.calendar()}
                  <span style={{ fontSize: '16px', color: '#6B7280' }}>
                    {formatDate(event.startDate)} - {formatDate(event.endDate)}
                  </span>
                </div>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <button
                onClick={() => navigate(`/events/${eventId}/scan`)}
                style={{
                  padding: '12px 24px',
                  background: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#059669';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#10B981';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Scan Guests
              </button>
              <button
                onClick={() => navigate(`/events/${eventId}/dashboard`)}
                style={{
                  padding: '12px 24px',
                  background: '#4F46E5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#4338CA';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#4F46E5';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                View Dashboard
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            {[
              { label: 'Total Guests', value: stats.total, color: '#4F46E5', icon: icons.user },
              { label: 'VIP Guests', value: stats.vip, color: '#F59E0B', icon: icons.user },
              { label: 'Total Entered', value: stats.entered, color: '#10B981', icon: icons.users },
              { label: 'Total Capacity', value: stats.capacity, color: '#8B5CF6', icon: icons.users },
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
                  alignItems: 'center'
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
        </div>

        {/* Messages */}
        <div style={{ marginBottom: '24px' }}>
          {error && (
            <div className="animate-fade-in" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '12px',
              marginBottom: '12px'
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
              marginBottom: '12px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ color: '#059669', fontWeight: '500' }}>{success}</span>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div >
          {/* Add Guest Form Section */}
          <div className="animate-slide-in" style={{ animationDelay: '0.2s' }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              position: 'sticky',
              top: '24px'
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
                  background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
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
                  Add New Guest
                </h2>
              </div>

              <form onSubmit={handleCreateGuest}>
                <div style={{
                  display: 'flex',
                  gap: '5px',
                  alignItems:"end"
                }}>
                  {/* Name */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={guestForm.name}
                      onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
                      required
                      disabled={creating}
                      placeholder="John Doe"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '14px',
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

                  {/* Company */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Company
                    </label>
                    <input
                      type="text"
                      value={guestForm.companyName}
                      onChange={(e) => setGuestForm({ ...guestForm, companyName: e.target.value })}
                      disabled={creating}
                      placeholder="Acme Inc"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '14px',
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

                  {/* Email */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={guestForm.email}
                      onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                      disabled={creating}
                      placeholder="john@example.com"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '14px',
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

                  {/* Phone */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={guestForm.phone}
                      onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                      disabled={creating}
                      placeholder="+1 (555) 123-4567"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '14px',
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

                  {/* Allowed Members & Guest Type */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '5px'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        Allowed Members
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={guestForm.allowedMembers}
                        onChange={(e) =>
                          setGuestForm({ ...guestForm, allowedMembers: Number(e.target.value) })
                        }
                        disabled={creating}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          fontSize: '14px',
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

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        Guest Type
                      </label>
                      <select
                        value={guestForm.guestType}
                        onChange={(e) =>
                          setGuestForm({ ...guestForm, guestType: e.target.value })
                        }
                        disabled={creating}
                        style={{
                          width: '100%',
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
                          backgroundSize: '16px',
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
                      >
                        <option value="REGULAR">Regular</option>
                        <option value="VIP">VIP</option>
                        <option value="STAFF">Staff</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={creating}
                    style={{
                      background: creating ? '#D1D5DB' : 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: creating ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      marginTop: '8px',
                      whiteSpace:"nowrap",
                      padding:"12px 15px"
                    }}
                    onMouseOver={(e) => {
                      if (!creating) {
                        e.target.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!creating) {
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {creating ? (
                      <>
                        {icons.spinner('#FFFFFF')}
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        {icons.plus()}
                        <span>Add Guest</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>


          {/* Guests List Section */}
          <div className="animate-slide-up">
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
            }}>
              {/* Guests Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px',
                flexWrap: 'wrap',
                gap: '20px'
              }}>
                <div>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#1F2937',
                    margin: '0 0 8px 0'
                  }}>
                    Guest List
                  </h2>
                  <p style={{
                    fontSize: '14px',
                    color: '#6B7280',
                    margin: 0
                  }}>
                    {filteredGuests.length} guest{filteredGuests.length !== 1 ? 's' : ''} found
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
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
                      placeholder="Search guests..."
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
                        width: '200px',
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
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
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
                    <option value="all">All Types</option>
                    <option value="REGULAR">Regular</option>
                    <option value="VIP">VIP</option>
                    <option value="STAFF">Staff</option>
                    <option value="OTHER">Other</option>
                  </select>

                  <button
                    onClick={exportGuests}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      background: '#F3F4F6',
                      color: '#374151',
                      border: '2px solid #E5E7EB',
                      borderRadius: '10px',
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
                    {icons.export()}
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* Guests Table */}
              {filteredGuests.length === 0 ? (
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
                    {icons.user('#9CA3AF')}
                  </div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    margin: '0 0 8px 0'
                  }}>
                    No guests found
                  </h3>
                  <p style={{ margin: 0, opacity: 0.8 }}>
                    {searchTerm || filterType !== 'all'
                      ? 'Try adjusting your search or filter'
                      : 'Add your first guest to get started'}
                  </p>
                </div>
              ) : (
                <div style={{
                  overflowX: 'auto',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '14px'
                  }}>
                    <thead>
                      <tr style={{
                        background: '#F9FAFB',
                        borderBottom: '1px solid #E5E7EB'
                      }}>
                        <th style={{
                          padding: '16px',
                          textAlign: 'left',
                          fontWeight: '600',
                          color: '#374151',
                          borderRight: '1px solid #E5E7EB'
                        }}>Guest</th>
                        <th style={{
                          padding: '16px',
                          textAlign: 'left',
                          fontWeight: '600',
                          color: '#374151',
                          borderRight: '1px solid #E5E7EB'
                        }}>Contact</th>
                        <th style={{
                          padding: '16px',
                          textAlign: 'left',
                          fontWeight: '600',
                          color: '#374151',
                          borderRight: '1px solid #E5E7EB'
                        }}>Type</th>
                        <th style={{
                          padding: '16px',
                          textAlign: 'left',
                          fontWeight: '600',
                          color: '#374151',
                          borderRight: '1px solid #E5E7EB'
                        }}>Capacity</th>
                        <th style={{
                          padding: '16px',
                          textAlign: 'left',
                          fontWeight: '600',
                          color: '#374151',
                          borderRight: '1px solid #E5E7EB'
                        }}>Entered</th>
                        <th style={{
                          padding: '16px',
                          textAlign: 'left',
                          fontWeight: '600',
                          color: '#374151'
                        }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGuests.map((guest, index) => {
                        const typeColor = getTypeColor(guest.guestType);

                        return (
                          <tr
                            key={guest._id}
                            style={{
                              borderBottom: '1px solid #E5E7EB',
                              background: index % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = '#F3F4F6';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = index % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
                            }}
                          >
                            {/* Guest Info */}
                            <td style={{ padding: '16px', borderRight: '1px solid #E5E7EB' }}>
                              <div style={{ fontWeight: '600', color: '#1F2937' }}>
                                {guest.name}
                              </div>
                              {guest.companyName && (
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '13px',
                                  color: '#6B7280',
                                  marginTop: '4px'
                                }}>
                                  {icons.company('#6B7280')}
                                  <span>{guest.companyName}</span>
                                </div>
                              )}
                            </td>

                            {/* Contact Info */}
                            <td style={{ padding: '16px', borderRight: '1px solid #E5E7EB' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {guest.email && (
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '13px'
                                  }}>
                                    {icons.mail('#6B7280')}
                                    <span style={{ color: '#6B7280' }}>{guest.email}</span>
                                  </div>
                                )}
                                {guest.phone && (
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '13px'
                                  }}>
                                    {icons.phone('#6B7280')}
                                    <span style={{ color: '#6B7280' }}>{guest.phone}</span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Guest Type */}
                            <td style={{ padding: '16px', borderRight: '1px solid #E5E7EB' }}>
                              <span style={{
                                padding: '4px 12px',
                                background: typeColor.bg,
                                color: typeColor.text,
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600',
                                border: `1px solid ${typeColor.border}`
                              }}>
                                {guest.guestType}
                              </span>
                            </td>

                            {/* Allowed Members */}
                            <td style={{ padding: '16px', borderRight: '1px solid #E5E7EB' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                  type="number"
                                  min={1}
                                  value={allowedEdit[guest._id] ?? guest.allowedMembers}
                                  onChange={(e) => handleAllowedChange(guest._id, e.target.value)}
                                  style={{
                                    width: '70px',
                                    padding: '8px',
                                    fontSize: '14px',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '6px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onFocus={(e) => {
                                    e.target.style.borderColor = '#4F46E5';
                                  }}
                                  onBlur={(e) => {
                                    e.target.style.borderColor = '#E5E7EB';
                                  }}
                                />
                                <button
                                  onClick={() => saveAllowedChange(guest._id)}
                                  style={{
                                    padding: '6px 12px',
                                    background: '#10B981',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseOver={(e) => {
                                    e.target.style.background = '#059669';
                                  }}
                                  onMouseOut={(e) => {
                                    e.target.style.background = '#10B981';
                                  }}
                                >
                                  Save
                                </button>
                              </div>
                            </td>

                            {/* Entered Count */}
                            <td style={{ padding: '16px', borderRight: '1px solid #E5E7EB' }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontWeight: '600',
                                color: guest.totalEntered > 0 ? '#059669' : '#6B7280'
                              }}>
                                {icons.users('#059669')}
                                <span>{guest.totalEntered}</span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td style={{ padding: '16px' }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                              }}>
                                <button
                                  onClick={() => openQr(guest)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: 'none',
                                    border: 'none',
                                    color: '#4F46E5',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseOver={(e) => {
                                    e.target.style.color = '#7C3AED';
                                  }}
                                  onMouseOut={(e) => {
                                    e.target.style.color = '#4F46E5';
                                  }}
                                >
                                  {icons.qr('#4F46E5')}
                                  <span>QR</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>


        </div>
      </div>

      {/* QR Modal */}
      {qrGuest && (
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
          <div className="animate-modal" style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1F2937',
                  margin: '0 0 4px 0'
                }}>
                  {qrGuest.name}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  margin: 0
                }}>
                  Guest QR Code
                </p>
              </div>
              <button
                onClick={() => setQrGuest(null)}
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

            <div style={{
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Guest QR"
                  style={{
                    width: '200px',
                    height: '200px',
                    margin: '0 auto',
                    border: '8px solid #FFFFFF',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
              ) : (
                <div style={{
                  width: '200px',
                  height: '200px',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#F3F4F6',
                  borderRadius: '12px'
                }}>
                  {icons.spinner()}
                </div>
              )}
              <p style={{
                fontSize: '14px',
                color: '#6B7280',
                margin: '16px 0 0 0'
              }}>
                Scan this QR code for guest check-in
              </p>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <button
                onClick={() => {
                  if (qrDataUrl) {
                    const link = document.createElement('a');
                    link.href = qrDataUrl;
                    link.download = `${qrGuest.name.replace(/\s+/g, '_')}_QR.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }}
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
                Download QR
              </button>
              <button
                onClick={() => setQrGuest(null)}
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}