'use client';

import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Jaex Photography</title>
        <meta name="description" content="Professional Photography Services - Capturing Life's Precious Moments" />
      </head>
      <body>{children}</body>
    </html>
  );
}
