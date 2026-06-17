"use client";

import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { isUrgent } from '@/data/seed';

const RED = '#DA291C';

export default function Home() {
  const { needs } = useApp();
  const open = needs.filter(n => n.quantityFulfilled < n.quantityNeeded);
  const totalUnits = open.reduce((s, n) => s + (n.quantityNeeded - n.quantityFulfilled), 0);
  const urgentCount = open.filter(isUrgent).length;
  const featured = needs.filter(isUrgent).filter(n => n.quantityFulfilled < n.quantityNeeded).slice(0, 3);

  return (
    <div style={{ background: '#F8F5F0' }}>
      {/* Hero */}
      <div style={{ background: RED, padding: '64px 24px 56px' }}>
        <div style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center', color: '#fff' }}>
          <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.8 }}>
            Ronald McDonald House Charities Bay Area
          </p>
          <h1 style={{ margin: '0 0 18px', fontSize: 38, fontWeight: 900, lineHeight: 1.18 }}>
            A home away from home<br />needs your help.
          </h1>
          <p style={{ margin: '0 0 32px', fontSize: 17, opacity: 0.92, lineHeight: 1.75, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
            Families with critically ill children travel to Bay Area hospitals and leave everything behind.
            These are the simple things they need to get through each day.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/wishlist" style={{
              background: '#fff', color: RED, padding: '14px 28px',
              borderRadius: 10, fontWeight: 800, fontSize: 16,
            }}>
              Browse the Wishlist
            </Link>
            <Link href="/check-donation" style={{
              background: 'rgba(255,255,255,0.18)', color: '#fff', padding: '14px 28px',
              borderRadius: 10, fontWeight: 700, fontSize: 16,
              border: '2px solid rgba(255,255,255,0.45)',
            }}>
              Check a Donation
            </Link>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: '#1A1A1A', padding: '18px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 12 }}>
          {[
            { val: open.length, label: 'active needs', hi: false },
            { val: totalUnits, label: 'units requested', hi: false },
            { val: urgentCount, label: 'urgent right now', hi: true },
            { val: '3', label: 'Bay Area houses', hi: false },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.hi ? '#FCA5A5' : '#fff', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Urgent needs */}
      <div style={{ padding: '44px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}>
            <div>
              <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800 }}>Urgent Needs</h2>
              <p style={{ margin: 0, fontSize: 14, color: '#777' }}>These families cannot wait.</p>
            </div>
            <Link href="/wishlist" style={{ color: RED, fontWeight: 700, fontSize: 14 }}>View all →</Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {featured.map(n => {
              const rem = n.quantityNeeded - n.quantityFulfilled;
              return (
                <div key={n.id} style={{
                  background: '#fff', borderRadius: 14, overflow: 'hidden',
                  border: '1.5px solid #FECACA', boxShadow: `0 0 0 2px ${RED}14`,
                }}>
                  <div style={{ background: RED, padding: '8px 14px', fontSize: 11, fontWeight: 900, color: '#fff', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                    ⚡ Urgent
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, lineHeight: 1.3 }}>{n.name}</div>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>{n.house} House · ${n.unitCost}/unit</div>
                    <div style={{ fontSize: 13, color: '#444', marginBottom: 14 }}>
                      <strong style={{ color: RED }}>{rem}</strong> units still needed &nbsp;·&nbsp; {n.daysOpen} days waiting
                    </div>
                    <Link href={`/donate/${n.id}`} style={{
                      display: 'block', textAlign: 'center', background: RED, color: '#fff',
                      padding: '10px 0', borderRadius: 8, fontWeight: 700, fontSize: 13,
                    }}>
                      Donate Now
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Houses */}
      <div style={{ padding: '0 24px 56px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Our Bay Area Houses</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {[
              { name: 'Stanford House', loc: 'Palo Alto', emoji: '🏠', color: '#0369A1', bg: '#E8F4F8', hospital: 'Lucile Packard Children\'s Hospital Stanford' },
              { name: 'UCSF House',     loc: 'San Francisco', emoji: '🏡', color: '#15803D', bg: '#F0FDF4', hospital: 'UCSF Benioff Children\'s Hospital' },
              { name: 'Oakland House', loc: 'Oakland',     emoji: '🏘️', color: '#C2410C', bg: '#FFF7ED', hospital: 'UCSF Benioff Children\'s Hospital Oakland' },
            ].map(h => (
              <div key={h.name} style={{ background: '#fff', borderRadius: 14, padding: 22, border: '1px solid #E8E3DE' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{h.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: h.color, marginBottom: 3 }}>{h.name}</div>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 10 }}>{h.loc}</div>
                <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>Serving families at<br />{h.hospital}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ background: '#fff', borderTop: '1px solid #EDE8E2', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>♥</div>
          <h3 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 800 }}>Every donation goes directly to a family.</h3>
          <p style={{ margin: '0 0 22px', color: '#666', fontSize: 15, lineHeight: 1.7 }}>
            RMHC Bay Area provides a home—and hope—to families when they need it most. Donated items
            go directly to the house within days.
          </p>
          <Link href="/wishlist" style={{
            display: 'inline-block', background: RED, color: '#fff',
            padding: '14px 32px', borderRadius: 10, fontWeight: 800, fontSize: 16,
          }}>
            See What&apos;s Needed →
          </Link>
        </div>
      </div>
    </div>
  );
}
