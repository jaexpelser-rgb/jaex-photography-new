import Link from 'next/link';

export default function Footer({ settings = {} }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div>
            <h3>{settings.siteName || 'Jaex Photography'}</h3>
            <p>{settings.siteDescription || 'Professional Photography Services'}</p>
          </div>
          <div>
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><Link href="/gallery">Gallery</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/booking">Book a Session</Link></li>
              <li><Link href="/portal">Client Portal</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h3>Contact</h3>
            <p>📧 {settings.contactEmail || 'contact@example.com'}</p>
            <p>📱 {settings.contactPhone || '+1 (555) 123-4567'}</p>
            <p>📍 {settings.contactAddress || '123 Photography Lane'}</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} {settings.siteName || 'Jaex Photography'}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
