'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(data => {
      if (!data.user || data.user.role !== 'admin') {
        router.push('/login');
      } else {
        setUser(data.user);
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) return <div className="spinner" />;
  if (!user) return null;

  const navItems = [
    { href: '/admin', label: '📊 Dashboard', exact: true },
    { href: '/admin/gallery', label: '🖼️ Gallery' },
    { href: '/admin/albums', label: '📁 Client Albums' },
    { href: '/admin/bookings', label: '📅 Bookings' },
    { href: '/admin/comments', label: '💬 Comments' },
    { href: '/admin/pricing', label: '💰 Pricing' },
    { href: '/admin/settings', label: '⚙️ Settings' },
  ];

  const isActive = (href, exact) => exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Admin Panel</h2>
          <p>Welcome, {user.name}</p>
        </div>
        <ul className="admin-nav">
          {navItems.map(item => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={isActive(item.href, item.exact) ? 'active' : ''}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
            <Link href="/">🏠 Back to Site</Link>
          </li>
        </ul>
      </aside>
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}
