import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { registerEntry, validateScan } from '../api/scanApi';

export default function ScanPage() {
  const { eventId } = useParams();
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [members, setMembers] = useState(1);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const scannerRef = useRef(null);

  // Animation keyframes
  const animationCSS = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    @keyframes scanLine {
      0% { top: 0%; }
      50% { top: 90%; }
      100% { top: 0%; }
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
    .animate-slide-up {
      animation: slideUp 0.4s ease-out;
    }
    .animate-pulse {
      animation: pulse 2s ease-in-out infinite;
    }
    .animate-shake {
      animation: shake 0.5s ease-in-out;
    }
  `;

  // SVG Icons
  const icons = {
    camera: (color = '#4F46E5') => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    check: (color = '#10B981') => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17L4 12" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="100" strokeDashoffset="100" style={{animation: 'checkmark 0.6s ease-in-out forwards'}}/>
      </svg>
    ),
    user: (color = '#6B7280') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    building: (color = '#6B7280') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M19 21V5C19 4.46957 18.7893 3.96086 18.4142 3.58579C18.0391 3.21071 17.5304 3 17 3H7C6.46957 3 5.96086 3.21071 5.58579 3.58579C5.21071 3.96086 5 4.46957 5 5V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 21H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 8H10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12H10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 16H10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 8H15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 12H15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 16H15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    users: (color = '#6B7280') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    alert: (color = '#EF4444') => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 9V12M12 15H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    arrowRight: (color = '#FFFFFF') => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    refresh: (color = '#6B7280') => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M23 4V10H17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M1 20V14H7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.51 9C4.01717 7.56678 4.87913 6.2854 6.01547 5.27542C7.1518 4.26543 8.52547 3.55976 10.0083 3.22426C11.4911 2.88875 13.0348 2.93434 14.4952 3.35677C15.9556 3.7792 17.2853 4.56471 18.36 5.64L23 10M1 14L5.64 18.36C6.71475 19.4353 8.04437 20.2208 9.50481 20.6432C10.9652 21.0657 12.5089 21.1113 13.9917 20.7757C15.4745 20.4402 16.8482 19.7346 17.9845 18.7246C19.1209 17.7146 19.9828 16.4332 20.49 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
    )
  };

  const startScanner = () => {
    if (!eventId || scannerRef.current) return;
    
    setIsScanning(true);
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 250, height: 250 },
      fps: 30,
      aspectRatio: 1.0,
      disableFlip: false,
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: true,
      defaultZoomValueIfSupported: 2,
    });

    scanner.render(
      async (decodedText) => {
        try {
          setError('');
          setSuccess('');
          setLoading(true);
          
          const data = await validateScan({ token: decodedText, eventId });
          setScanResult({ ...data.guest, token: decodedText });
          setMembers(1);
          setIsScanning(false);

          setTimeout(() => {
            if (scannerRef.current) {
              scannerRef.current.clear().catch(() => { });
              scannerRef.current = null;
            }
          }, 300);
        } catch (err) {
          setError(err.response?.data?.message || 'Invalid QR code');
          setScanResult(null);
          setTimeout(() => {
            if (!scannerRef.current) startScanner();
          }, 2000);
        } finally {
          setLoading(false);
        }
      },
      (scanError) => {
        console.debug('Scan error:', scanError);
      }
    );
    scannerRef.current = scanner;
  };

  useEffect(() => {
    if (isScanning && !scanResult) {
      startScanner();
    }
    
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => { });
        scannerRef.current = null;
      }
    };
  }, [eventId, scanResult, isScanning]);

  const handleConfirm = async () => {
    if (!scanResult || members <= 0) return;
    
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      const response = await registerEntry({
        token: scanResult.token,
        eventId,
        membersToEnter: members,
      });
      
      setScanResult((prev) => ({
        ...prev,
        totalEntered: response.totalEntered,
        remaining: response.remaining,
      }));
      
      setSuccess(`Entry confirmed for ${members} ${members === 1 ? 'person' : 'people'}!`);
      
      setTimeout(() => {
        setScanResult(null);
        setMembers(1);
        setSuccess('');
        setIsScanning(true);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm entry');
    } finally {
      setLoading(false);
    }
  };

  const handleRescan = () => {
    setScanResult(null);
    setMembers(1);
    setError('');
    setSuccess('');
    setIsScanning(true);
  };

  const handleMembersChange = (value) => {
    // const numValue = Math.max(1, Math.min(
    //   scanResult?.remaining || 1,
    //   Number(value) || 1
    // ));
    setMembers(Number(value));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px 16px 40px 16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Inject CSS animations */}
      <style>{animationCSS}</style>

      {/* Main Container */}
      <div style={{
        maxWidth: '440px',
        margin: '0 auto',
        background: '#FFFFFF',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        animation: 'slideUp 0.6s ease-out'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
          padding: '28px 24px',
          textAlign: 'center',
          color: '#FFFFFF',
          position: 'relative'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            marginBottom: '16px',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            {icons.camera('#FFFFFF')}
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px'
          }}>
            Guest Check-in
          </h1>
          <p style={{
            fontSize: '14px',
            opacity: '0.9',
            margin: '0 0 20px 0',
            fontWeight: '400'
          }}>
            Scan QR code to register entry
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500',
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: '#10B981',
              borderRadius: '50%',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}></div>
            <span>{isScanning ? 'Scanning...' : 'Ready to scan'}</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Scanner Area */}
          {!scanResult && (
            <div style={{ marginBottom: '24px', position: 'relative' }}>
              <div
                id="reader"
                style={{
                  width: '100%',
                  height: '320px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '4px solid #FFFFFF',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  background: '#1F2937',
                  position: 'relative'
                }}
              />
              
              {/* Scanning overlay */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '250px',
                height: '250px',
                border: '2px dashed rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                pointerEvents: 'none'
              }}></div>
              
              {/* Scan line animation */}
              <div style={{
                position: 'absolute',
                top: '0',
                left: '10%',
                right: '10%',
                height: '3px',
                background: 'linear-gradient(90deg, transparent, #10B981, transparent)',
                animation: 'scanLine 2s linear infinite',
                borderRadius: '2px',
                pointerEvents: 'none'
              }}></div>

              {/* Instructions */}
              <div style={{
                textAlign: 'center',
                marginTop: '20px',
                color: '#6B7280'
              }}>
                <p style={{
                  margin: '0 0 12px 0',
                  fontSize: '15px',
                  fontWeight: '500'
                }}>
                  📱 Position QR code within the frame
                </p>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: '#F3F4F6',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '400'
                }}>
                  {icons.alert('#6B7280')}
                  <span>Ensure good lighting for better scanning</span>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div style={{ marginBottom: '20px' }}>
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
                <div style={{ flexShrink: '0' }}>
                  {icons.alert()}
                </div>
                <span style={{
                  color: '#DC2626',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>{error}</span>
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
                <div style={{ flexShrink: '0' }}>
                  {icons.check()}
                </div>
                <span style={{
                  color: '#059669',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>{success}</span>
              </div>
            )}
          </div>

          {/* Guest Details Card */}
          {scanResult && (
            <div className="animate-slide-up" style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '24px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}>
              {/* Guest Header */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '24px'
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    {icons.user()}
                    <span style={{
                      fontSize: '14px',
                      color: '#6B7280',
                      fontWeight: '500'
                    }}>Guest Details</span>
                  </div>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#111827',
                    margin: '0',
                    lineHeight: '1.3'
                  }}>
                    {scanResult.name}
                  </h2>
                </div>
                <div style={{
                  padding: '6px 14px',
                  background: '#ECFDF5',
                  color: '#059669',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  border: '1px solid #A7F3D0'
                }}>
                  Verified
                </div>
              </div>

              {/* Guest Info Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '24px'
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    {icons.building()}
                    <span style={{
                      fontSize: '13px',
                      color: '#6B7280',
                      fontWeight: '500'
                    }}>Company</span>
                  </div>
                  <p style={{
                    fontSize: '16px',
                    color: '#111827',
                    fontWeight: '600',
                    margin: '0'
                  }}>
                    {scanResult.companyName || 'Not specified'}
                  </p>
                </div>

                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    {icons.users()}
                    <span style={{
                      fontSize: '13px',
                      color: '#6B7280',
                      fontWeight: '500'
                    }}>Group Size</span>
                  </div>
                  <p style={{
                    fontSize: '16px',
                    color: '#111827',
                    fontWeight: '600',
                    margin: '0'
                  }}>
                    {scanResult.allowedMembers} {scanResult.allowedMembers === 1 ? 'person' : 'people'}
                  </p>
                </div>
              </div>

              {/* Entry Stats */}
              <div style={{
                background: '#F9FAFB',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px',
                border: '1px solid #E5E7EB'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '16px',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6B7280',
                      fontWeight: '500',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Allowed
                    </div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#111827'
                    }}>
                      {scanResult.allowedMembers}
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6B7280',
                      fontWeight: '500',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Entered
                    </div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#10B981'
                    }}>
                      {scanResult.totalEntered}
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6B7280',
                      fontWeight: '500',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Remaining
                    </div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: scanResult.remaining > 0 ? '#3B82F6' : '#EF4444'
                    }}>
                      {scanResult.remaining}
                    </div>
                  </div>
                </div>
              </div>

              {/* Members Input */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '16px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    <span>👥 Number of people entering now</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      min="1"
                      // max={scanResult.remaining}
                      value={members}
                      onChange={(e) => handleMembersChange(e.target.value)}
                      // disabled={scanResult.remaining <= 0}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        fontSize: '18px',
                        fontWeight: '600',
                        border: `2px solid ${scanResult.remaining <= 0 ? '#F3F4F6' : '#E5E7EB'}`,
                        borderRadius: '12px',
                        backgroundColor: scanResult.remaining <= 0 ? '#F9FAFB' : '#FFFFFF',
                        color: scanResult.remaining <= 0 ? '#9CA3AF' : '#111827',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        MozAppearance: 'textfield',
                        WebkitAppearance: 'none'
                      }}
                      onFocus={(e) => {
                        if (scanResult.remaining > 0) {
                          e.target.style.borderColor = '#4F46E5';
                          e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
                        }
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E5E7EB';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    {scanResult.remaining > 0 && (
                      <div style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '14px',
                        color: '#6B7280',
                        fontWeight: '500'
                      }}>
                        Max: {scanResult.remaining}
                      </div>
                    )}
                  </div>
                  {scanResult.remaining <= 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '12px',
                      padding: '12px',
                      background: '#FEF2F2',
                      borderRadius: '8px'
                    }}>
                      {icons.alert()}
                      <span style={{
                        fontSize: '14px',
                        color: '#DC2626',
                        fontWeight: '500'
                      }}>
                        No remaining entries available
                      </span>
                    </div>
                  )}
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={handleConfirm}
                  // disabled={loading || members <= 0}
                  style={{
                    width: '100%',
                    padding: '18px 24px',
                    background: loading || members <= 0
                      ? '#D1D5DB'
                      : 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: loading || members <= 0 
                      ? 'not-allowed'
                      : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    boxShadow: loading || members <= 0
                      ? 'none'
                      : '0 4px 20px rgba(79, 70, 229, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    if (!(loading || members <= 0)) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 25px rgba(79, 70, 229, 0.4)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!(loading || members <= 0)) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 20px rgba(79, 70, 229, 0.3)';
                    }
                  }}
                  onMouseDown={(e) => {
                    if (!(loading || members <= 0)) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 10px rgba(79, 70, 229, 0.3)';
                    }
                  }}
                >
                  {loading ? (
                    <>
                      {icons.spinner()}
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Entry for {members} {members === 1 ? 'person' : 'people'}</span>
                      {icons.arrowRight()}
                    </>
                  )}
                </button>

                <button
                  onClick={handleRescan}
                  style={{
                    width: '100%',
                    padding: '16px 24px',
                    background: '#FFFFFF',
                    color: '#374151',
                    border: '2px solid #E5E7EB',
                    borderRadius: '14px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.backgroundColor = '#F9FAFB';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.backgroundColor = '#FFFFFF';
                  }}
                >
                  {icons.refresh()}
                  <span>Scan Another QR Code</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 24px',
          background: '#F9FAFB',
          borderTop: '1px solid #E5E7EB',
          textAlign: 'center'
        }}>
          <p style={{
            margin: '0',
            fontSize: '13px',
            color: '#6B7280',
            fontWeight: '400'
          }}>
            Event ID: <span style={{ fontWeight: '600', color: '#4F46E5' }}>{eventId}</span>
          </p>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '12px',
            color: '#9CA3AF'
          }}>
            © {new Date().getFullYear()} Event Management System
          </p>
        </div>
      </div>
    </div>
  );
}