"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const RED = '#DA291C';

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/wishlist', label: 'Wishlist' },
    { to: '/check-donation', label: 'Check a Donation' },
    { to: '/sponsors', label: 'Corporate Sponsors' },
    { to: '/about', label: 'About' },
  ];

  const isActive = (to: string) => pathname === to || (to !== '/' && (pathname ?? '').startsWith(to));

  return (
    <nav style={{ background: '#fff', borderBottom: `3px solid ${RED}`, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 34, height: 34, background: RED, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 17, fontWeight: 900, flexShrink: 0 }}>
            ♥
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#1A1A1A', lineHeight: 1.15 }}>RMHC Bay Area</div>
            <div style={{ fontSize: 10, color: '#999', letterSpacing: 1, textTransform: 'uppercase' }}>Donation Wishlist</div>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="mobile-hidden" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {links.map(l => (
            <Link key={l.to} href={l.to} className="nav-link" style={{
              padding: '7px 14px', borderRadius: 8, fontSize: 14,
              fontWeight: isActive(l.to) ? 700 : 500,
              color: isActive(l.to) ? RED : '#444',
              background: isActive(l.to) ? '#FDE8E6' : 'transparent',
              transition: 'all 0.12s',
            }}>{l.label}</Link>
          ))}
          <Link href="/wishlist" style={{
            marginLeft: 8, padding: '8px 18px', background: RED, color: '#fff',
            borderRadius: 8, fontSize: 14, fontWeight: 700,
          }}>
            Donate Now
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 6, fontSize: 22 }}
          className="mobile-menu-btn"
          aria-label="Menu"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background: '#fff', borderTop: '1px solid #F0EFED', padding: '12px 20px 16px' }}>
          {links.map(l => (
            <Link key={l.to} href={l.to} onClick={() => setOpen(false)} style={{
              display: 'block', padding: '11px 0',
              fontSize: 15, fontWeight: isActive(l.to) ? 700 : 500,
              color: isActive(l.to) ? RED : '#333',
              borderBottom: '1px solid #F5F0EC',
            }}>{l.label}</Link>
          ))}
          <Link href="/wishlist" onClick={() => setOpen(false)} style={{
            display: 'block', marginTop: 12, textAlign: 'center',
            background: RED, color: '#fff', padding: '12px 0',
            borderRadius: 8, fontWeight: 700, fontSize: 15,
          }}>
            Donate Now
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .mobile-hidden { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
