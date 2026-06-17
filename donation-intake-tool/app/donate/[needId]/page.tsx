"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useApp } from '@/context/AppContext';
import { isUrgent, houseAddresses } from '@/data/seed';

const STRIPE_PK = 'pk_test_51TgoyxA1yYro9afbmX1w7MzHvK4CfpRDnnSTP2zOyJg7rGzNPySC6RFMdsF5rgyR5YNVEcPYx3UMv1Ha5upbA0uz00tZtrlDwQ';

const stripePromise = STRIPE_PK.startsWith('pk_test_') && STRIPE_PK.length >= 80
  ? loadStripe(STRIPE_PK).catch(() => null)
  : Promise.resolve(null);

const RED = '#DA291C';
type Step = 'choose' | 'form' | 'processing' | 'receipt';
type FulfillType = 'stripe' | 'amazon' | 'dropoff';

const INPUT: React.CSSProperties = {
  width: '100%', padding: '10px 13px', border: '1.5px solid #DDD8D2',
  borderRadius: 9, fontSize: 14, outline: 'none', boxSizing: 'border-box',
};
const LABEL: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 5 };
const CARD: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: 22, border: '1px solid #E8E3DE', marginBottom: 16 };

function DonateContent() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const params = useParams() as { needId: string };
  const { needId } = params;
  const { needs, patients, addCommitment, fulfillNeed } = useApp();

  const need = needs.find(n => n.id === needId);
  const patient = need?.linkedPatientId ? patients.find(p => p.id === need.linkedPatientId) : undefined;

  const [fulfillType, setFulfillType] = useState<FulfillType>('stripe');
  const [step, setStep] = useState<Step>('choose');
  const [qty, setQty] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<ReturnType<typeof addCommitment> | null>(null);

  if (!need) return (
    <div style={{ padding: 60, textAlign: 'center' }}>
      <div style={{ fontSize: 16, color: '#666', marginBottom: 16 }}>Item not found.</div>
      <Link href="/wishlist" style={{ color: RED, fontWeight: 700 }}>← Back to wishlist</Link>
    </div>
  );

  const remaining = need.quantityNeeded - need.quantityFulfilled;
  const amount = need.unitCost * qty;
  const urgent = isUrgent(need);
  const addr = houseAddresses[need.house];
  const stripeReady = !!stripe && !!elements;

  const handleStripe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { setError('Please enter your name and email.'); return; }
    setError('');
    setStep('processing');

    if (stripeReady) {
      const cardEl = elements.getElement(CardElement);
      if (!cardEl) { setStep('form'); setError('Card element not found.'); return; }

      const { error: stripeErr, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardEl,
        billing_details: { name, email },
      });

      if (stripeErr) {
        setStep('form');
        setError(stripeErr.message || 'Payment failed. Check your card details.');
        return;
      }

      console.log('Stripe PaymentMethod created:', paymentMethod?.id);
    } else {
      await new Promise(r => setTimeout(r, 1600));
    }

    const commitment = addCommitment({
      needId: need.id, donorName: name, donorEmail: email,
      amount, date: new Date().toISOString(), fulfillmentType: 'stripe',
    }, qty);
    fulfillNeed(need.id, qty);
    setReceipt(commitment);
    setStep('receipt');
  };

  const handleDropoff = () => {
    addCommitment({ needId: need.id, donorName: name || 'Anonymous', donorEmail: email,
      amount: need.unitCost * qty, date: new Date().toISOString(), fulfillmentType: 'dropoff' }, qty);
    fulfillNeed(need.id, qty);
    router.push('/thank-you');
  };

  if (step === 'processing') return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ width: 46, height: 46, border: `4px solid #EDE8E2`,
        borderTop: `4px solid ${RED}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ fontWeight: 700, fontSize: 16, color: '#444' }}>Processing your donation…</div>
      <div style={{ fontSize: 13, color: '#999' }}>
        {stripeReady ? 'Verifying with Stripe…' : 'Recording your commitment…'}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (step === 'receipt' && receipt) return (
    <Receipt receipt={receipt} need={need} qty={qty} onImpact={() => router.push('/thank-you')} />
  );

  return (
    <div style={{ background: '#F8F5F0', minHeight: '100vh', padding: '28px 20px' }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <Link href="/wishlist" style={{ fontSize: 13, color: '#888', display: 'inline-block', marginBottom: 20 }}>← Back to wishlist</Link>

        {/* Item summary */}
        <div style={{ ...CARD, border: `1.5px solid ${urgent ? '#FECACA' : '#E8E3DE'}` }}>
          {urgent && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: RED,
              color: '#fff', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 900,
              textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>
              Urgent Need
            </div>
          )}
          <h2 style={{ margin: '0 0 5px', fontSize: 20, fontWeight: 800 }}>{need.name}</h2>
          <div style={{ color: '#777', fontSize: 13, marginBottom: 10 }}>
            {need.house} House · ${need.unitCost}/unit · {remaining} still needed
          </div>
          <p style={{ margin: 0, fontSize: 14, color: '#555', lineHeight: 1.6 }}>{need.description}</p>
          {patient && (
            <div style={{ marginTop: 14, padding: '10px 13px', background: '#FEF9F5',
              borderRadius: 9, border: '1px solid #FECBBB' }}>
              <p style={{ margin: 0, fontSize: 13, color: '#555', lineHeight: 1.55 }}>
                A child at the {need.house} house has been here for weeks and is waiting for this item.
              </p>
            </div>
          )}
        </div>

        {/* How to help */}
        {step === 'choose' && (
          <>
            <h3 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 700 }}>How would you like to help?</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              {([
                { type: 'stripe', icon: '💳', title: 'Fund it with a card', desc: `We'll purchase it for the ${need.house} house — safe, tracked, and tax-deductible.` },
                { type: 'amazon', icon: '📦', title: 'Ship from Amazon Wish List', desc: `Order directly from the ${need.house} house's Amazon list — ships straight to them.` },
                { type: 'dropoff', icon: '🏠', title: 'Drop off in person', desc: `Bring it to ${addr} during drop-off hours.` },
              ] as { type: FulfillType; icon: string; title: string; desc: string }[]).map(opt => (
                <button key={opt.type} onClick={() => setFulfillType(opt.type)} style={{
                  background: '#fff', border: `2px solid ${fulfillType === opt.type ? RED : '#E0DBD5'}`,
                  borderRadius: 12, padding: '15px 18px', cursor: 'pointer',
                  display: 'flex', alignItems: 'flex-start', gap: 13, textAlign: 'left',
                  transition: 'border-color 0.12s',
                }}>
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{opt.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A', marginBottom: 3 }}>{opt.title}</div>
                    <div style={{ fontSize: 13, color: '#666' }}>{opt.desc}</div>
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: '50%',
                    border: `2px solid ${fulfillType === opt.type ? RED : '#DDD'}`,
                    background: fulfillType === opt.type ? RED : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {fulfillType === opt.type && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
                  </div>
                </button>
              ))}
            </div>

            {fulfillType === 'amazon' && (
              <div style={CARD}>
                <p style={{ margin: '0 0 14px', fontSize: 14, color: '#555', lineHeight: 1.6 }}>
                  Click below to open the {need.house} house&apos;s verified Amazon Wish List and ship the item directly.
                </p>
                <a href="https://www.amazon.com/hz/wishlist/ls/RMHCBAYAREA" target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', textAlign: 'center', background: '#FF9900', color: '#fff',
                    padding: '12px 0', borderRadius: 9, fontWeight: 800, fontSize: 15, textDecoration: 'none' }}>
                  Open Amazon Wish List →
                </a>
              </div>
            )}

            {fulfillType === 'dropoff' && (
              <div style={CARD}>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>Drop-off details</div>
                <div style={{ fontSize: 14, color: '#444', lineHeight: 2 }}>
                  <div>Address: <strong>{addr}</strong></div>
                </div>
                <div style={{ marginTop: 12, padding: '10px 13px', background: '#F0FDF4',
                  borderRadius: 8, fontSize: 13, color: '#166534' }}>
                  Ring the bell at the front entrance and let staff know you&apos;re dropping off a donation.
                </div>
                <div style={{ marginTop: 12 }}>
                  <label style={LABEL}>Your name (optional)</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Anonymous" style={INPUT} className="form-input" />
                </div>
                <button onClick={handleDropoff} style={{ marginTop: 12, width: '100%', background: RED,
                  color: '#fff', border: 'none', borderRadius: 10, padding: '13px 0',
                  fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
                  I&apos;ll Drop It Off
                </button>
              </div>
            )}

            {fulfillType === 'stripe' && (
              <button onClick={() => setStep('form')} style={{ width: '100%', background: RED,
                color: '#fff', border: 'none', borderRadius: 10, padding: '14px 0',
                fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
                Continue to Payment →
              </button>
            )}
          </>
        )}

        {/* Payment form */}
        {step === 'form' && (
          <form onSubmit={handleStripe}>
            <div style={CARD}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Donation Amount</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>Quantity</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
                      style={{ width: 32, height: 32, border: '1.5px solid #DDD8D2', borderRadius: 8,
                        background: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}>−</button>
                    <span style={{ fontWeight: 800, fontSize: 18, minWidth: 28, textAlign: 'center' }}>{qty}</span>
                    <button type="button" onClick={() => setQty(q => Math.min(remaining, q + 1))}
                      style={{ width: 32, height: 32, border: '1.5px solid #DDD8D2', borderRadius: 8,
                        background: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}>+</button>
                    <span style={{ fontSize: 12, color: '#AAA' }}>of {remaining} left</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: '#999' }}>Total</div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: RED }}>${amount.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div style={CARD}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Your Information</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={LABEL}>Full Name</label>
                  <input value={name} onChange={e => setName(e.target.value)}
                    placeholder="Jane Doe" style={INPUT} className="form-input" required />
                </div>
                <div>
                  <label style={LABEL}>Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="jane@example.com" style={INPUT} className="form-input" required />
                </div>
              </div>
            </div>

            <div style={CARD}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Payment Details</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {stripeReady
                    ? <span style={{ fontSize: 11, color: '#059669', fontWeight: 700,
                        background: '#D1FAE5', padding: '2px 8px', borderRadius: 5 }}>
                        Secured by Stripe
                      </span>
                    : ['VISA', 'MC', 'AMEX'].map(c => (
                        <span key={c} style={{ fontSize: 10, padding: '2px 7px', border: '1px solid #DDD',
                          borderRadius: 4, color: '#666', fontWeight: 700 }}>{c}</span>
                      ))
                  }
                </div>
              </div>

              {stripeReady ? (
                <div>
                  <label style={LABEL}>Card Details</label>
                  <div style={{ padding: '11px 13px', border: '1.5px solid #DDD8D2',
                    borderRadius: 9, background: '#fff' }}>
                    <CardElement options={{
                      style: {
                        base: {
                          fontSize: '14px',
                          color: '#1A1A1A',
                          fontFamily: "'sohne-var', system-ui, sans-serif",
                          '::placeholder': { color: '#AAAAAA' },
                          letterSpacing: '0.025em',
                        },
                        invalid: { color: RED, iconColor: RED },
                      },
                      hidePostalCode: true,
                    }} />
                  </div>
                  <div style={{ marginTop: 7, fontSize: 11, color: '#9CA3AF' }}>
                    Test card: <code style={{ background: '#F3F4F6', padding: '1px 5px', borderRadius: 4 }}>4242 4242 4242 4242</code> · any future date · any CVC
                  </div>
                </div>
              ) : (
                <div style={{ padding: '14px 16px', background: '#FFFBEB', borderRadius: 9,
                  border: '1px solid #FDE68A', fontSize: 13, color: '#78350F', lineHeight: 1.6 }}>
                  <strong>Stripe not configured.</strong> Add your test publishable key to enable real card payments. The donation will still be recorded as a demo.
                </div>
              )}

              {error && (
                <div style={{ marginTop: 10, fontSize: 13, color: RED, fontWeight: 600,
                  padding: '8px 12px', background: '#FEF2F2', borderRadius: 7 }}>
                  {error}
                </div>
              )}
            </div>

            <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '12px 16px',
              marginBottom: 16, fontSize: 13, color: '#166534', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span>🔒</span>
              <span>RMHC Bay Area EIN: 94-1254709. 100% of your donation goes directly to the house.</span>
            </div>

            <button type="submit"
              disabled={!!stripeReady && !stripe}
              style={{ width: '100%', background: RED, color: '#fff', border: 'none',
                borderRadius: 10, padding: '14px 0', fontWeight: 800, fontSize: 16,
                cursor: 'pointer', marginBottom: 10, opacity: (!!stripeReady && !stripe) ? 0.6 : 1 }}>
              Donate ${amount.toLocaleString()} to {need.house} House →
            </button>
            <button type="button" onClick={() => setStep('choose')}
              style={{ width: '100%', background: 'none', border: 'none',
                color: '#888', fontSize: 13, cursor: 'pointer', padding: '8px 0' }}>
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Receipt({ receipt, need, qty, onImpact }: {
  receipt: ReturnType<typeof Object.assign>;
  need: ReturnType<typeof Object.assign>;
  qty: number;
  onImpact: () => void;
}) {
  const date = new Date(receipt.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <div style={{ background: '#F8F5F0', minHeight: '100vh', padding: '28px 20px' }}>
      <div style={{ maxWidth: 580, margin: '0 auto' }}>
        <div style={{ background: '#fff', borderRadius: 18, padding: '40px 36px', boxShadow: '0 4px 28px rgba(0,0,0,0.09)' }}>
          <div style={{ textAlign: 'center', marginBottom: 28, paddingBottom: 24, borderBottom: '2px dashed #EDE8E2' }}>
            <div style={{ width: 54, height: 54, background: '#16A34A', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px', color: '#fff', fontSize: 26, fontWeight: 900 }}>✓</div>
            <h1 style={{ margin: '0 0 5px', fontSize: 22, fontWeight: 900 }}>Thank you, {receipt.donorName}!</h1>
            <p style={{ margin: 0, color: '#777', fontSize: 14 }}>Receipt sent to {receipt.donorEmail}</p>
          </div>

          <div style={{ fontSize: 11, color: '#AAA', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 14 }}>Official Tax Receipt</div>
          {[
            ['Organization', 'Ronald McDonald House Charities Bay Area'],
            ['EIN', '94-1254709'],
            ['Donor Name', receipt.donorName],
            ['Donation Date', date],
            ['Item', `${need.name} × ${qty} — ${need.house} House`],
            ['Amount', `$${receipt.amount.toLocaleString()}.00 USD`],
          ].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between',
              padding: '9px 0', borderBottom: '1px solid #F5F0EB', fontSize: 14 }}>
              <span style={{ color: '#777' }}>{l}</span>
              <span style={{ fontWeight: 600, color: '#1A1A1A', textAlign: 'right', maxWidth: '58%' }}>{v}</span>
            </div>
          ))}

          <div style={{ marginTop: 18, padding: '13px 15px', background: '#F9F6F2',
            borderRadius: 9, fontSize: 12, color: '#666', lineHeight: 1.7 }}>
            No goods or services were provided in exchange for this contribution.
            This letter serves as your official receipt for tax purposes.
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
            <button onClick={() => window.print()}
              style={{ flex: 1, padding: '12px 0', background: '#1A1A1A', color: '#fff',
                border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Print Receipt
            </button>
            <button onClick={onImpact}
              style={{ flex: 1, padding: '12px 0', background: RED, color: '#fff',
                border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              See Your Impact →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Donate() {
  return (
    <Elements stripe={stripePromise}>
      <DonateContent />
    </Elements>
  );
}
