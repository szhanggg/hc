"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Need, Patient, isUrgent } from '../data/seed';

function ShareButton({ need }: { need: Need }) {
  const [copied, setCopied] = useState(false);

  const donateUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/donate/${need.id}`
    : `/donate/${need.id}`;

  const shareText = `Help families at RMHC Bay Area — ${need.quantityNeeded - need.quantityFulfilled} "${need.name}" still needed at the ${need.house} house. Every donation goes directly to a family. ❤️`;

  function handleNativeShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: need.name, text: shareText, url: donateUrl }).catch(() => {});
      return;
    }
    setShowMenu(prev => !prev);
  }

  const [showMenu, setShowMenu] = useState(false);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(donateUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(donateUrl)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(`Help families at RMHC Bay Area`)}&body=${encodeURIComponent(`${shareText}\n\n${donateUrl}`)}`;

  function copyLink() {
    navigator.clipboard.writeText(donateUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowMenu(false);
    });
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleNativeShare}
        title="Share this need"
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: '#F2EFEB', border: 'none', borderRadius: 8,
          padding: '7px 12px', fontSize: 12, fontWeight: 600,
          color: '#555', cursor: 'pointer', transition: 'background 0.12s',
          width: '100%', justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 13 }}>↗</span> Share
      </button>

      {showMenu && (
        <div style={{
          position: 'absolute', bottom: '110%', left: 0, right: 0,
          background: '#fff', border: '1px solid #E8E3DE', borderRadius: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 20,
        }}>
          {[
            { label: '𝕏 / Twitter', href: twitterUrl },
            { label: '📘 Facebook', href: facebookUrl },
            { label: '✉️ Email', href: emailUrl },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowMenu(false)}
              style={{
                display: 'block', padding: '9px 14px', fontSize: 13,
                color: '#333', textDecoration: 'none',
                borderBottom: '1px solid #F2EFEB',
              }}
            >
              {label}
            </a>
          ))}
          <button
            onClick={copyLink}
            style={{
              display: 'block', width: '100%', padding: '9px 14px',
              fontSize: 13, color: '#333', background: 'none',
              border: 'none', textAlign: 'left', cursor: 'pointer',
            }}
          >
            {copied ? '✅ Copied!' : '🔗 Copy link'}
          </button>
        </div>
      )}
    </div>
  );
}

const RED = '#DA291C';

const CAT_LABEL: Record<string, string> = {
  hygiene: '🧼 Hygiene', food: '🍎 Food',
  school: '📚 School', toy: '🧸 Toy', other: '✨ Other',
};

const DONATION_BLURB: Record<string, string> = {
  n01: "Infants in Palo Alto stay clean and comfortable while their families focus on healing.",
  n02: "Families in Palo Alto get to start each day feeling fresh and cared for.",
  n03: "Caregivers in Palo Alto can stay by their child's side without going hungry.",
  n04: "A child in Palo Alto gets a backpack — and a reason to look forward to school again.",
  n05: "Something soft and comforting ends up in the arms of a child in Palo Alto.",
  n06: "Families in Palo Alto get the freedom to choose exactly what they need most.",
  n07: "Families in San Francisco feel a little more at home, even far from it.",
  n08: "Everyone in San Francisco wakes up to a warm, nourishing start to the day.",
  n09: "Children in San Francisco get a calm, creative break from a really hard week.",
  n10: "Families in San Francisco find a moment to laugh together, no matter how long the stay.",
  n11: "Clean clothes are one less thing families in San Francisco have to worry about.",
  n12: "Infants in Oakland stay clean, safe, and comfortable around the clock.",
  n13: "No family in Oakland has to go hungry between appointments.",
  n14: "Children in Oakland get to create, imagine, and feel like kids again.",
  n15: "Every child in Oakland stays warm and comfortable from head to toe.",
  n16: "Children in Oakland have something to look forward to every single day.",
  n17: "Families in Oakland can put a real meal on the table, no matter what.",
};

const HOUSE_STYLE: Record<string, { bg: string; text: string }> = {
  Stanford: { bg: '#E8F4F8', text: '#0369A1' },
  UCSF:     { bg: '#F0FDF4', text: '#15803D' },
  Oakland:  { bg: '#FFF7ED', text: '#C2410C' },
};

export default function NeedCard({ need, patient }: { need: Need; patient?: Patient }) {
  const urgent = isUrgent(need);
  const remaining = need.quantityNeeded - need.quantityFulfilled;
  const pct = need.quantityFulfilled / need.quantityNeeded;
  const hs = HOUSE_STYLE[need.house];
  const showBlurb = !!need.volunteerBlurb && need.unitCost >= 200;

  return (
    <div className="need-card" style={{
      background: '#fff', borderRadius: 16, overflow: 'hidden',
      border: `1.5px solid ${urgent ? '#FECACA' : '#E8E3DE'}`,
      boxShadow: urgent ? `0 0 0 2px ${RED}18, 0 2px 10px rgba(0,0,0,0.06)` : '0 2px 8px rgba(0,0,0,0.05)',
      display: 'flex', flexDirection: 'column', transition: 'transform 0.15s, box-shadow 0.15s',
    }}>
      {urgent && (
        <div style={{
          background: RED, color: '#fff', padding: '7px 14px',
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 11, fontWeight: 900, letterSpacing: 0.8, textTransform: 'uppercase',
        }}>
          <span style={{ fontSize: 13 }}>⚡</span>
          <span>Urgent Need</span>
          <span style={{ marginLeft: 'auto', fontWeight: 500, opacity: 0.85, fontSize: 11 }}>
            Families need this now
          </span>
        </div>
      )}

      {showBlurb && (
        <div style={{ background: '#F9F6F2', borderBottom: '1px solid #EDE8E2', padding: 16 }}>
          <div style={{
            background: '#E8E3DC', borderRadius: 10, height: 116,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 11, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ textAlign: 'center', color: '#888' }}>
              <div style={{ fontSize: 28, marginBottom: 3 }}>📷</div>
              <div style={{ fontSize: 12 }}>Photo from the {need.house} house</div>
            </div>
            <div style={{
              position: 'absolute', bottom: 8, left: 8,
              background: 'rgba(0,0,0,0.45)', borderRadius: 6, padding: '3px 8px',
              fontSize: 11, color: '#fff', fontWeight: 600,
            }}>
              {need.house} House · ${need.unitCost}
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#555', lineHeight: 1.65, fontStyle: 'italic' }}>
            "{need.volunteerBlurb!.slice(0, 170)}{need.volunteerBlurb!.length > 170 ? '…' : ''}"
          </p>
          <div style={{ fontSize: 11, color: '#AAA', marginTop: 5 }}>— Written by a house volunteer</div>
        </div>
      )}

      <div style={{ padding: '15px 16px', flex: 1 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1A1A1A', flex: 1, lineHeight: 1.35 }}>
            {need.name}
          </h3>
          <span style={{
            background: hs.bg, color: hs.text, borderRadius: 20, padding: '3px 10px',
            fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {need.house}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 11, flexWrap: 'wrap' }}>
          <span style={{ background: '#F2EFEB', color: '#555', borderRadius: 20, padding: '2px 9px', fontSize: 12 }}>
            {CAT_LABEL[need.category]}
          </span>
          <span style={{ background: '#F2EFEB', color: '#555', borderRadius: 20, padding: '2px 9px', fontSize: 12, fontWeight: 600 }}>
            ${need.unitCost}/unit
          </span>
        </div>

        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#666', lineHeight: 1.55 }}>
          {need.description}
        </p>

        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginBottom: 5 }}>
            <span>
              <strong style={{ color: urgent ? RED : '#1A1A1A', fontSize: 13 }}>{remaining}</strong>
              {' '}of {need.quantityNeeded} still needed
            </span>
            <span style={{ color: '#AAA' }}>waiting {need.daysOpen} days</span>
          </div>
          <div style={{ height: 5, background: '#EDE8E2', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3,
              width: `${pct * 100}%`,
              background: urgent ? RED : '#16A34A',
              transition: 'width 0.4s',
            }} />
          </div>
        </div>

        {DONATION_BLURB[need.id] && (
          <div style={{
            background: '#FEF9F5', border: '1px solid #FECBBB',
            borderRadius: 10, padding: '9px 12px', marginBottom: 2,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>
              Your impact
            </div>
            <p style={{ margin: 0, fontSize: 12.5, color: '#444', lineHeight: 1.55 }}>
              {DONATION_BLURB[need.id]}
            </p>
          </div>
        )}
      </div>

      <div style={{ padding: '12px 16px', borderTop: '1px solid #F2EFEB' }}>
        <Link href={`/donate/${need.id}`} className="btn-primary" style={{
          display: 'block', textAlign: 'center',
          background: urgent ? RED : '#1A1A1A',
          color: '#fff', padding: '10px 0', borderRadius: 10,
          fontWeight: 700, fontSize: 14, transition: 'opacity 0.12s',
          marginBottom: 8,
        }}>
          Donate This Item →
        </Link>
        <ShareButton need={need} />
        <div style={{ textAlign: 'center', marginTop: 6, fontSize: 11, color: '#BBB' }}>
          Total still needed: ${(need.unitCost * remaining).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
