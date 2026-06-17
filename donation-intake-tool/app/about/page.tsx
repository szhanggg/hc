"use client";

import Link from 'next/link';

const RED = '#DA291C';

export default function About() {
  return (
    <div style={{ background: '#F8F5F0', minHeight: '100vh', padding: '28px 20px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ background: RED, borderRadius: 18, padding: '44px 36px', color: '#fff', marginBottom: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>♥</div>
          <h1 style={{ margin: '0 0 12px', fontSize: 26, fontWeight: 900 }}>Ronald McDonald House Charities Bay Area</h1>
          <p style={{ margin: 0, fontSize: 16, opacity: 0.9, lineHeight: 1.75 }}>
            Keeping families together when a child needs medical care most.
          </p>
        </div>

        {[
          { title: 'Our Mission', body: 'RMHC Bay Area provides temporary housing and support services to families with seriously ill children receiving treatment at Bay Area hospitals. Our houses are more than shelters — they are communities where families find strength, connection, and hope.' },
          { title: 'Our Houses', body: "We operate three houses across the Bay Area, each steps away from a major children's hospital: the Stanford House in Palo Alto (near Lucile Packard Children's Hospital), the UCSF House in San Francisco, and the Oakland House near UCSF Benioff Children's Hospital Oakland." },
          { title: 'How Donations Help', body: 'Every item on our wishlist was requested by a real family or house staff member. When you donate diapers, art supplies, or a speaker for music nights, it goes directly into the hands of a family within days. There is no overhead, no warehouse — just care.' },
          { title: 'Tax Information', body: 'Ronald McDonald House Charities Bay Area is a registered 501(c)(3) nonprofit organization. EIN: 94-1254709. All donations are tax-deductible to the extent allowed by law. No goods or services are provided in exchange for donations.' },
        ].map(s => (
          <div key={s.title} style={{ background: '#fff', borderRadius: 14, padding: '22px 24px', border: '1px solid #E8E3DE', marginBottom: 14 }}>
            <h2 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 800, color: RED }}>{s.title}</h2>
            <p style={{ margin: 0, fontSize: 14, color: '#555', lineHeight: 1.75 }}>{s.body}</p>
          </div>
        ))}

        <div style={{ background: '#1A1A1A', borderRadius: 14, padding: '22px 24px', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 12 }}>Contact</div>
          {[
            ['Stanford House', '520 Sand Hill Road, Palo Alto, CA 94304', '(650) 470-6000'],
            ['UCSF House', '45 Judah Street, San Francisco, CA 94122', '(415) 476-4520'],
            ['Oakland House', '500 Hegenberger Road, Oakland, CA 94621', '(510) 563-6380'],
          ].map(([name, addr, phone]) => (
            <div key={name} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #333' }}>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>{name}</div>
              <div style={{ fontSize: 13, color: '#AAA', marginTop: 2 }}>{addr}</div>
              <div style={{ fontSize: 13, color: '#AAA' }}>{phone}</div>
            </div>
          ))}
          <a href="https://www.rmhcbayarea.org" target="_blank" rel="noopener noreferrer" style={{ color: RED, fontWeight: 700, fontSize: 13 }}>
            www.rmhcbayarea.org →
          </a>
        </div>

        <Link href="/wishlist" style={{ display: 'block', textAlign: 'center', background: RED, color: '#fff', padding: '15px 0', borderRadius: 10, fontWeight: 800, fontSize: 16 }}>
          Browse the Wishlist →
        </Link>
      </div>
    </div>
  );
}
