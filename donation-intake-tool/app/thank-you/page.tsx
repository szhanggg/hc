"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Need } from '@/data/seed';

const RED = '#DA291C';

function impactStatement(need: Need, qty: number): string {
  const house = need.house;
  const n = need.name.toLowerCase();

  if (n.includes('diaper')) {
    const days = qty * (n.includes('newborn') ? 4 : 3);
    return `Your diapers will cover approximately ${days} days for a family at the ${house} house.`;
  }
  if (n.includes('sock')) {
    const families = Math.max(1, Math.round(qty / 2));
    return `Your socks will warm ${families} famil${families === 1 ? 'y' : 'ies'} through their stay at the ${house} house.`;
  }
  if (n.includes('wipe')) {
    return `Your wipes will keep babies clean and comfortable for roughly ${qty * 5} days at the ${house} house.`;
  }
  if (n.includes('snack') || n.includes('oatmeal') || n.includes('food')) {
    const meals = qty * 4;
    return `Your food donation will provide roughly ${meals} meals for families rushing between hospital and home at the ${house} house.`;
  }
  if (n.includes('art') || n.includes('crayon') || n.includes('coloring')) {
    return `Your art supplies will give ${qty * 2} children hours of creative escape at the ${house} house.`;
  }
  if (n.includes('backpack') || n.includes('school')) {
    return `Your donation means ${qty} child${qty > 1 ? 'ren' : ''} can attend school with confidence during their long stay at the ${house} house.`;
  }
  if (n.includes('game') || n.includes('toy') || n.includes('stuffed') || n.includes('puzzle')) {
    return `Your toy donation will bring joy and distraction to children at the ${house} house — sometimes play is the best medicine.`;
  }
  const total = (need.unitCost * qty).toLocaleString();
  return `Your $${total} donation goes directly to families at the ${house} house when they need it most.`;
}

export default function ThankYou() {
  const { lastDonation } = useApp();
  const [copied, setCopied] = useState(false);

  const impact = lastDonation
    ? impactStatement(lastDonation.need, lastDonation.quantity)
    : 'Your donation will support families at a Ronald McDonald House in the Bay Area.';

  const shareText = `I just donated to Ronald McDonald House Charities Bay Area — ${impact} You can help too: https://www.rmhcbayarea.org/donate`;

  const copyShare = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div style={{ background: '#F8F5F0', minHeight: '100vh', padding: '28px 20px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        <div className="fade-in" style={{ background: RED, borderRadius: 18, padding: '48px 36px', textAlign: 'center', color: '#fff', marginBottom: 18 }}>
          <div style={{ fontSize: 52, marginBottom: 14, lineHeight: 1 }}>♥</div>
          <h1 style={{ margin: '0 0 12px', fontSize: 26, fontWeight: 900 }}>Thank you.</h1>
          <p style={{ margin: 0, fontSize: 16, opacity: 0.93, lineHeight: 1.75, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
            You just made it a little easier for a family to stay close to their child when they need it most.
          </p>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #E8E3DE', marginBottom: 14 }} className="fade-in">
          <div style={{ fontSize: 10, fontWeight: 800, color: '#AAA', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>
            Your Impact
          </div>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.55 }}>
            {impact}
          </p>
          {lastDonation && (
            <div style={{ marginTop: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 38, height: 38, background: '#F0FDF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>✓</div>
              <div style={{ fontSize: 13, color: '#666' }}>
                Donated to <strong style={{ color: '#1A1A1A' }}>{lastDonation.need.name}</strong> &nbsp;·&nbsp; {lastDonation.need.house} House
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
          {[
            { val: '365', label: 'nights of care/year', note: 'per house' },
            { val: '$5',  label: 'per family per night', note: 'RMHC cost' },
            { val: '3',   label: 'Bay Area houses', note: 'SFO · UCSF · OAK' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 12px', textAlign: 'center', border: '1px solid #E8E3DE' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: RED, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 12, color: '#1A1A1A', fontWeight: 600, marginTop: 4, lineHeight: 1.3 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: '#BBB', marginTop: 2 }}>{s.note}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: 22, border: '1px solid #E8E3DE', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Share the love</div>
          <div style={{ background: '#F9F6F2', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#555', lineHeight: 1.65, marginBottom: 14 }}>
            {shareText}
          </div>
          <button onClick={copyShare} style={{
            width: '100%', background: copied ? '#16A34A' : '#1A1A1A', color: '#fff', border: 'none',
            borderRadius: 10, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            transition: 'background 0.2s',
          }}>
            {copied ? '✓ Copied to clipboard!' : '📋 Copy Share Message'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/wishlist" style={{
            flex: 1, display: 'block', textAlign: 'center', background: RED, color: '#fff',
            padding: '14px 0', borderRadius: 10, fontWeight: 800, fontSize: 15,
          }}>
            Donate Again →
          </Link>
          <Link href="/" style={{
            flex: 1, display: 'block', textAlign: 'center', background: '#fff', color: '#444',
            padding: '14px 0', borderRadius: 10, fontWeight: 600, fontSize: 15,
            border: '1.5px solid #E0DBD5',
          }}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
