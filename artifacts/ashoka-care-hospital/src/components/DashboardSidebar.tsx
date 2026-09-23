import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    ],
  },
  {
    label: 'Care Operations',
    items: [
      { name: 'Patients', path: '/dashboard/patients', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
      { name: 'Appointments', path: '/dashboard/appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { name: 'Doctors', path: '/dashboard/doctors', icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z' },
      { name: 'OPD', path: '/dashboard/opd', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
      { name: 'IPD', path: '/dashboard/ipd', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4' },
      { name: 'Emergency', path: '/dashboard/emergency', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    ],
  },
  {
    label: 'Clinical Records',
    items: [
      { name: 'Medical Records', path: '/dashboard/emr', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      { name: 'Laboratory', path: '/dashboard/laboratory', icon: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18' },
      { name: 'Radiology', path: '/dashboard/radiology', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { name: 'Pharmacy', path: '/dashboard/pharmacy', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
      { name: 'OT & Surgery', path: '/dashboard/ot', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
      { name: 'Nursing', path: '/dashboard/nursing', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    ],
  },
  {
    label: 'Support',
    items: [
      { name: 'Blood Bank', path: '/dashboard/blood-bank', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
      { name: 'Inventory', path: '/dashboard/inventory', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
      { name: 'Billing', path: '/dashboard/billing', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z' },
      { name: 'Insurance', path: '/dashboard/insurance', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
      { name: 'Notifications', path: '/dashboard/notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
      { name: 'Reports', path: '/dashboard/reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      { name: 'Admin & Settings', path: '/dashboard/admin', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
      { name: 'Permissions', path: '/dashboard/permissions', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
    ],
  },
];

export default function DashboardSidebar() {
  const [location, navigate] = useLocation();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('ashoka_sidebar_collapsed') === 'true'; } catch { return false; }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ashoka_staff_user');
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const toggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('ashoka_sidebar_collapsed', String(next)); } catch {}
      return next;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('ashoka_staff_token');
    localStorage.removeItem('ashoka_staff_user');
    navigate('/dashboard/login');
  };

  return (
    <aside style={{
      width: collapsed ? '64px' : '240px',
      background: 'linear-gradient(180deg, #0A1F44 0%, #0d2552 100%)',
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      flexShrink: 0, zIndex: 60, position: 'relative', overflow: 'visible',
      transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
        backgroundImage: 'radial-gradient(circle, rgba(47,93,170,0.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}/>

      {/* Logo */}
      <div style={{
        padding: '0 12px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', minHeight: '64px', gap: '8px', overflow: 'hidden',
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', flex: 1 }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg style={{ width: '18px', height: '18px', color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>ASHOKA</div>
              <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Care Hospital</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '18px', height: '18px', color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
          </div>
        )}
        {!collapsed && (
          <button onClick={toggleCollapse} style={{
            width: '26px', height: '26px', borderRadius: '7px', flexShrink: 0,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <svg style={{ width: '12px', height: '12px', color: 'rgba(255,255,255,0.6)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{
        flex: 1, padding: collapsed ? '10px 8px' : '12px 10px',
        display: 'flex', flexDirection: 'column', gap: '1px',
        overflowY: 'auto', position: 'relative', zIndex: 1,
        transition: 'padding 0.25s ease',
      }}>
        {navGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: '4px' }}>
            {!collapsed && (
              <p style={{ fontSize: '0.44rem', fontWeight: 800, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', padding: '8px 10px 4px', marginTop: '4px' }}>
                {group.label}
              </p>
            )}
            {group.items.map(item => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path} title={collapsed ? item.name : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: collapsed ? '0' : '9px',
                    padding: collapsed ? '9px 0' : '9px 10px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: '9px', transition: 'all 0.15s', position: 'relative',
                    textDecoration: 'none',
                    background: isActive ? 'rgba(47,93,170,0.28)' : 'transparent',
                    color: isActive ? '#ffffff' : 'rgba(255,255,255,0.42)',
                    border: isActive ? '1px solid rgba(47,93,170,0.45)' : '1px solid transparent',
                  }}
                >
                  {isActive && !collapsed && (
                    <div style={{
                      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      width: '3px', height: '16px',
                      background: 'linear-gradient(180deg, #4A7FD4, #2F5DAA)',
                      borderRadius: '0 2px 2px 0',
                    }}/>
                  )}
                  <svg style={{ width: '15px', height: '15px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={item.icon}/>
                  </svg>
                  {!collapsed && (
                    <span style={{ fontSize: '0.73rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: collapsed ? '10px 8px' : '10px', borderTop: '1px solid rgba(255,255,255,0.07)', position: 'relative', zIndex: 1 }}>
        {user && !collapsed && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px', marginBottom: '4px',
            background: 'rgba(255,255,255,0.04)', borderRadius: '9px',
          }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #2F5DAA, #4A7FD4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '0.7rem', fontWeight: 800,
            }}>
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
              <p style={{ fontSize: '0.5rem', color: '#4A7FD4', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>{user.role}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout} title={collapsed ? 'Sign Out' : undefined} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: collapsed ? '0' : '9px',
          padding: collapsed ? '9px 0' : '9px 10px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: '9px', color: 'rgba(255,255,255,0.4)',
          background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <svg style={{ width: '15px', height: '15px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          {!collapsed && <span style={{ fontSize: '0.73rem', fontWeight: 600 }}>Sign Out</span>}
        </button>
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button onClick={toggleCollapse} style={{
          position: 'fixed', top: '50%', left: '64px', transform: 'translateY(-50%)',
          width: '18px', height: '48px',
          background: 'linear-gradient(180deg, #1e3f75 0%, #0d2552 100%)',
          border: '1px solid rgba(74,127,212,0.4)', borderLeft: 'none',
          borderRadius: '0 8px 8px 0', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, boxShadow: '4px 0 14px rgba(0,0,0,0.3)',
        }}>
          <svg style={{ width: '10px', height: '10px', color: 'rgba(255,255,255,0.85)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      )}
    </aside>
  );
}
