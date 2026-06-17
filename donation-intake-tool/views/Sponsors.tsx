"use client";

import { useState } from 'react';
import Link from 'next/link';

const RED = '#DA291C';

const LEADERBOARD = [
  { rank: 1, label: '1st', company: 'Northwind Foods',  kits: 350, kit_type: 'Snack Kits',     since: 'Q1 2026', color: '#B45309', accent: '#FEF3C7', border: '#FDE68A' },
  { rank: 2, label: '2nd', company: 'Lumen Labs',       kits: 300, kit_type: 'Self Care Kits', since: 'Q2 2026', color: '#4B5563', accent: '#F3F4F6', border: '#D1D5DB' },
  { rank: 3, label: '3rd', company: 'Cascade Tech',     kits: 200, kit_type: 'Hygiene Kits',   since: 'Q1 2026', color: '#92400E', accent: '#FFF7ED', border: '#FDBA74' },
];

const OPEN_NEEDS = [
  {
    id: 'fathers-day',
    title: "Father's Day Kits",
    deadline: 'June 21',
    daysLeft: 4,
    totalNeeded: 400,
    stillNeeded: 400,
    houses: ['Stanford', 'San Francisco', 'Oakland'],
    description: "Dads spending Father's Day at the hospital deserve to be celebrated. Each kit includes a card, snacks, and a small personal care item assembled by your team.",
    kitCost: 8,
    urgent: true,
  },
  {
    id: 'new-mom',
    title: 'New Mom Kits',
    deadline: 'June 30',
    daysLeft: 13,
    totalNeeded: 50,
    stillNeeded: 50,
    houses: ['Oakland'],
    description: "New mothers navigating a medical crisis alongside a new baby need basic support. Each kit contains postpartum essentials to help them focus on their family.",
    kitCost: 20,
    urgent: true,
  },
  {
    id: 'snack-oak',
    title: 'Snack Kits',
    deadline: 'June 30',
    daysLeft: 13,
    totalNeeded: 150,
    stillNeeded: 70,
    houses: ['Oakland'],
    description: "Families at Oakland House often skip meals to stay close to their child. A snack kit keeps them nourished without leaving the floor. 80 of 150 are already covered.",
    kitCost: 6,
    urgent: false,
  },
  {
    id: 'bts',
    title: 'Back-to-School Kits',
    deadline: 'Aug 10',
    daysLeft: 54,
    totalNeeded: 300,
    stillNeeded: 299,
    houses: ['Stanford', 'Oakland'],
    description: "Children at our houses have missed weeks or months of school. A backpack filled with supplies helps them feel like a student again, not just a patient.",
    kitCost: 25,
    urgent: false,
  },
];

function LeaderCard({ entry, pos }: { entry: typeof LEADERBOARD[0]; pos: number }) {
  const isFirst = pos === 0;
  return (
    <div style={{
      background: entry.accent, border: `2px solid ${entry.border}`,
      borderRadius: 16, padding: isFirst ? '28px 24px' : '22px 20px',
      flex: 1, minWidth: 200,
      transform: isFirst ? 'translateY(-6px)' : 'none',
      boxShadow: isFirst ? '0 8px 32px rgba(0,0,0,0.10)' : '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      <div style={{ fontSize: isFirst ? 40 : 32, marginBottom: 8, lineHeight: 1 }}>
        {pos === 0 ? '🥇' : pos === 1 ? '🥈' : '🥉'}
      </div>
      <div style={{ fontSize: 11, fontWeight: 800, color: entry.color,
        textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
        {entry.label} place · {entry.since}
      </div>
      <div style={{ fontWeight: 800, fontSize: isFirst ? 20 : 17, color: '#111827', marginBottom: 4 }}>
        {entry.company}
      </div>
      <div style={{ fontSize: isFirst ? 32 : 26, fontWeight: 900, color: entry.color, lineHeight: 1, marginBottom: 3 }}>
        {entry.kits.toLocaleString()}
      </div>
      <div style={{ fontSize: 12, color: '#6B7280' }}>{entry.kit_type} sponsored</div>
    </div>
  );
}

function NeedCard({ need }: { need: typeof OPEN_NEEDS[0] }) {
  const pct = Math.round(((need.totalNeeded - need.stillNeeded) / need.totalNeeded) * 100);
  const isUrgent = need.daysLeft <= 7;

  return (
    <div style={{
      background: '#fff', borderRadius: 16,
      border: `1.5px solid ${isUrgent ? '#FECACA' : '#E5E7EB'}`,
      boxShadow: isUrgent ? '0 0 0 3px #FEE2E2' : '0 2px 8px rgba(0,0,0,0.05)',
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      {isUrgent && (
        <div style={{ background: RED, padding: '7px 16px', fontSize: 11,
          fontWeight: 800, color: '#fff', letterSpacing: 0.8, textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff',
            display: 'inline-block', animation: 'pulse 1.4s infinite' }} />
          Urgent — {need.daysLeft} days left
        </div>
      )}
      <div style={{ padding: '20px 20px 16px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#111827' }}>{need.title}</h3>
          <span style={{ fontSize: 11, color: '#6B7280', background: '#F3F4F6',
            borderRadius: 6, padding: '3px 8px', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 8 }}>
            Due {need.deadline}
          </span>
        </div>
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 10 }}>
          {need.houses.join(' · ')} {need.houses.length > 1 ? 'Houses' : 'House'}
        </div>
        <p style={{ margin: '0 0 14px', fontSize: 13, color: '#4B5563', lineHeight: 1.65 }}>
          {need.description}
        </p>
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12,
            color: '#6B7280', marginBottom: 5 }}>
            <span><strong style={{ color: '#111827' }}>{need.totalNeeded - need.stillNeeded}</strong> of {need.totalNeeded} kits covered</span>
            <span style={{ fontWeight: 700, color: isUrgent ? RED : '#374151' }}>
              {need.stillNeeded} remaining
            </span>
          </div>
          <div style={{ height: 7, borderRadius: 4, background: '#E5E7EB', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, borderRadius: 4,
              background: isUrgent ? RED : '#10B981', transition: 'width .3s' }} />
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#9CA3AF' }}>
          ~${need.kitCost}/kit to sponsor · tax-deductible
        </div>
      </div>
      <div style={{ padding: '0 20px 18px', display: 'flex', gap: 8 }}>
        <Link href="/wishlist" style={{
          flex: 1, textAlign: 'center', padding: '10px 0',
          background: isUrgent ? RED : '#111827', color: '#fff',
          borderRadius: 9, fontWeight: 700, fontSize: 13,
        }}>
          Sponsor Kits Online
        </Link>
        <a href="mailto:volunteer@rmhcbayarea.org?subject=Kit Build Inquiry" style={{
          flex: 1, textAlign: 'center', padding: '10px 0',
          background: 'transparent', color: '#374151',
          border: '1.5px solid #E5E7EB', borderRadius: 9,
          fontWeight: 600, fontSize: 13,
        }}>
          Organize a Build
        </a>
      </div>
    </div>
  );
}

export default function Sponsors() {
  const [emailSent, setEmailSent] = useState(false);

  return (
    <div style={{ background: '#F9FAFB', fontFamily: "'sohne-var', system-ui, sans-serif" }}>

      {/* Hero */}
      <div style={{ background: RED, padding: '60px 24px 52px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2,
            textTransform: 'uppercase', opacity: 0.75, marginBottom: 12 }}>
            Ronald McDonald House Charities Bay Area — Corporate Giving
          </div>
          <h1 style={{ margin: '0 0 18px', fontSize: 40, fontWeight: 900, lineHeight: 1.15 }}>
            Power a family's stay<br />near the hospital.
          </h1>
          <p style={{ margin: '0 0 32px', fontSize: 17, opacity: 0.9, lineHeight: 1.75, maxWidth: 540, marginLeft: 'auto', marginRight: 'auto' }}>
            Your company can sponsor kit builds that go directly to families at Stanford,
            UCSF, and Oakland children's hospitals — at no cost to the families.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 0,
            background: 'rgba(0,0,0,0.18)', borderRadius: 14, padding: '16px 0', marginBottom: 32 }}>
            {[
              { val: '40,000+', label: 'nights provided yearly' },
              { val: '145,000+', label: 'free meals served' },
              { val: '$0',       label: 'cost to families' },
              { val: '33 days',  label: 'average stay length' },
            ].map((s, i) => (
              <div key={s.label} style={{
                padding: '4px 28px', textAlign: 'center',
                borderRight: i < 3 ? '1px solid rgba(255,255,255,0.2)' : 'none',
              }}>
                <div style={{ fontSize: 22, fontWeight: 900 }}>{s.val}</div>
                <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/wishlist" style={{
              padding: '13px 28px', background: '#fff', color: RED,
              borderRadius: 10, fontWeight: 800, fontSize: 15,
            }}>
              Browse Open Needs
            </Link>
            <a href="mailto:volunteer@rmhcbayarea.org?subject=Corporate Sponsorship Inquiry"
              style={{ padding: '13px 28px', background: 'rgba(255,255,255,0.15)', color: '#fff',
                border: '2px solid rgba(255,255,255,0.4)', borderRadius: 10,
                fontWeight: 700, fontSize: 15 }}>
              Get in Touch
            </a>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '48px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#9CA3AF',
              textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
              Top Sponsors This Quarter
            </div>
            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: '#111827' }}>
              Companies making a difference
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', marginBottom: 28 }}>
            {LEADERBOARD.map((entry, i) => (
              <LeaderCard key={entry.company} entry={entry} pos={i} />
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link href="/wishlist" style={{ fontSize: 14, color: RED, fontWeight: 700 }}>
              See your company here — sponsor kits today →
            </Link>
          </div>
        </div>
      </div>

      {/* What's Needed Now */}
      <div style={{ padding: '52px 24px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#9CA3AF',
              textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
              Current Needs
            </div>
            <h2 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 900, color: '#111827' }}>
              What families need right now
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
            {OPEN_NEEDS.map(n => <NeedCard key={n.id} need={n} />)}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div style={{ background: '#fff', borderTop: '1px solid #E5E7EB',
        borderBottom: '1px solid #E5E7EB', padding: '52px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 900, color: '#111827' }}>
              How corporate giving works
            </h2>
            <p style={{ margin: 0, fontSize: 15, color: '#6B7280' }}>Two ways to give — choose what works for your team.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              {
                icon: '💳', title: 'Fund Kits Online',
                steps: ['Browse the open needs wishlist', 'Choose a kit type and quantity', 'Pay securely — receipt sent instantly', 'RMHC purchases and delivers directly'],
                cta: 'Browse Wishlist', href: '/wishlist', internal: true,
              },
              {
                icon: '🏗️', title: 'Organize a Kit Build',
                steps: ['Contact us to pick a need', 'We ship supplies to your office', 'Your team assembles kits together', 'RMHC picks up and delivers to families'],
                cta: 'Email Us to Start', href: 'mailto:volunteer@rmhcbayarea.org?subject=Kit Build Inquiry', internal: false,
              },
            ].map(opt => (
              <div key={opt.title} style={{ background: '#F9FAFB', borderRadius: 14, padding: '24px 22px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{opt.icon}</div>
                <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800, color: '#111827' }}>{opt.title}</h3>
                <ol style={{ margin: '0 0 20px', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {opt.steps.map(s => (
                    <li key={s} style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.5 }}>{s}</li>
                  ))}
                </ol>
                {opt.internal
                  ? <Link href={opt.href} style={{ display: 'block', textAlign: 'center', padding: '11px 0', background: RED, color: '#fff', borderRadius: 9, fontWeight: 700, fontSize: 14 }}>
                      {opt.cta}
                    </Link>
                  : <a href={opt.href} style={{ display: 'block', textAlign: 'center', padding: '11px 0', background: '#111827', color: '#fff', borderRadius: 9, fontWeight: 700, fontSize: 14 }}>
                      {opt.cta}
                    </a>
                }
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ padding: '52px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ width: 48, height: 48, background: RED, borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 22, fontWeight: 900, margin: '0 auto 16px' }}>♥</div>
          <h3 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 900, color: '#111827' }}>
            Ready to make an impact?
          </h3>
          <p style={{ margin: '0 0 24px', color: '#6B7280', fontSize: 15, lineHeight: 1.7 }}>
            Corporate donations are tax-deductible. RMHC Bay Area EIN: 94-1254709.
            Every kit goes to a family the same week it's assembled.
          </p>
          {emailSent ? (
            <div style={{ padding: '14px 28px', background: '#D1FAE5', color: '#065F46',
              borderRadius: 10, fontWeight: 700, fontSize: 15 }}>
              Message sent — we'll be in touch within one business day.
            </div>
          ) : (
            <button onClick={() => setEmailSent(true)} style={{
              padding: '14px 32px', background: RED, color: '#fff',
              border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 16, cursor: 'pointer',
            }}>
              Contact Our Corporate Giving Team →
            </button>
          )}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>
    </div>
  );
}
