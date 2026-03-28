'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

const subscriberLinks = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/dashboard/scores', icon: '⛳', label: 'My Scores' },
  { href: '/dashboard/draws', icon: '🎰', label: 'Draw Results' },
  { href: '/dashboard/charity', icon: '💝', label: 'Charities' },
];

const adminLinks = [
  { href: '/admin', icon: '🛡️', label: 'Admin Home' },
  { href: '/admin/users', icon: '👥', label: 'Users' },
  { href: '/admin/draws', icon: '🎲', label: 'Manage Draws' },
  { href: '/admin/charities', icon: '🏛️', label: 'Charities' },
  { href: '/admin/analytics', icon: '📈', label: 'Analytics' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isAdmin = user?.profile?.role === 'admin';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link href="/dashboard" className="sidebar-logo">
          <div className="logo-icon">⛳</div>
          GolfDraw
        </Link>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">Main</div>
        {subscriberLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`sidebar-link ${pathname === link.href ? 'active' : ''}`}
          >
            <span className="link-icon">{link.icon}</span>
            {link.label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="sidebar-section">Admin</div>
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link ${pathname === link.href ? 'active' : ''}`}
              >
                <span className="link-icon">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-emerald-500), var(--color-emerald-400))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.85rem'
          }}>
            {user?.profile?.full_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{user?.profile?.full_name || 'User'}</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={logout} className="btn btn-ghost btn-sm" style={{ width: '100%' }}>
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
