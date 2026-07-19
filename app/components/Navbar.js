'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(data => setUser(data.user));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/session', { method: 'DELETE' });
    setUser(null);
    window.location.href = '/';
  };

  const isActive = (path) => pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="container">
        <Link href="/" className="navbar-logo">
          <img src="/logo.png" alt="Jaex Photography" style={{ height: '40px', width: 'auto' }} />
        </Link>
        <ul className="navbar-links">
          <li><Link href="/" className={isActive('/')}>Home</Link></li>
          <li><Link href="/gallery" className={isActive('/gallery')}>Gallery</Link></li>
          <li><Link href="/pricing" className={isActive('/pricing')}>Pricing</Link></li>
          <li><Link href="/booking" className={isActive('/booking')}>Booking</Link></li>
          <li><Link href="/portal" className={isActive('/portal')}>My Photos</Link></li>
          <li><Link href="/contact" className={isActive('/contact')}>Contact</Link></li>
          {user ? (
            <>
              {user.role === 'admin' && (
                <li><Link href="/admin" className={isActive('/admin')}>Admin</Link></li>
              )}
              <li><button onClick={handleLogout} className="btn btn-sm btn-secondary" style={{ padding: '6px 14px' }}>Logout</button></li>
            </>
          ) : (
            <>
              <li><Link href="/login" className={isActive('/login')}>Login</Link></li>
              <li><Link href="/register" className="btn btn-sm btn-primary" style={{ padding: '6px 14px' }}>Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
