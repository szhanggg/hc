"use client";

import { useState } from 'react';

const RED = '#DA291C';

type ClassifyResult = {
  likelyDecision: 'ACCEPT' | 'SOMETIMES' | 'DECLINE';
  confidence: number;
  reason: string;
  matchedRules: string[];
  needsReview: boolean;
  questions: string[];
};

const DECISION_STYLE = {
  ACCEPT:    { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D', icon: '✓', label: 'Accepted' },
  SOMETIMES: { bg: '#FFFBEB', border: '#FCD34D', text: '#B45309', icon: '?', label: 'Check with Staff' },
  DECLINE:   { bg: '#FEF2F2', border: '#FCA5A5', text: '#DC2626', icon: '✕', label: 'Cannot Accept' },
};

export default function CheckDonation() {
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClassifyResult | null>(null);
  const [error, setError] = useState('');

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setPhoto(file);
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoPreview(null);
    }
  }

  async function handleCheck(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);
    setResult(null);
    setError('');

    try {
      let photoBase64: string | null = null;
      let photoType: string | null = null;

      if (photo) {
        photoType = photo.type;
        photoBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(photo);
        });
      }

      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemDescription: description, photoBase64, photoType }),
      });

      if (!res.ok) throw new Error('Classification failed');
      setResult(await res.json());
    } catch {
      setError('Unable to check your donation right now — please call your nearest house.');
    } finally {
      setLoading(false);
    }
  }

  const ds = result ? DECISION_STYLE[result.likelyDecision] : null;

  return (
    <div style={{ background: '#F8F5F0', minHeight: '100vh', padding: '36px 20px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 900 }}>Check a Donation</h1>
          <p style={{ margin: 0, fontSize: 15, color: '#666', lineHeight: 1.65 }}>
            Describe the item you want to donate and we will check it against RMHC Bay Area policy.
            A photo helps us give you a more accurate answer.
          </p>
        </div>

        <form onSubmit={handleCheck} style={{ background: '#fff', borderRadius: 16, padding: '24px 22px', border: '1px solid #E8E3DE', marginBottom: 20 }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: 14, color: '#333', marginBottom: 8 }}>
              What are you donating? <span style={{ color: RED }}>*</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. a box of new diapers (size 2), still in sealed packaging"
              rows={4}
              required
              style={{
                width: '100%', padding: '10px 13px', border: '1.5px solid #DDD8D2',
                borderRadius: 9, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                resize: 'vertical', fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: 14, color: '#333', marginBottom: 8 }}>
              Photo <span style={{ fontWeight: 400, color: '#888' }}>(optional — helps with accuracy)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'block', fontSize: 14, width: '100%' }}
            />
            {photoPreview && (
              <div style={{ marginTop: 12 }}>
                <img
                  src={photoPreview}
                  alt="Donation preview"
                  style={{ maxHeight: 200, borderRadius: 10, border: '1px solid #E8E3DE', objectFit: 'contain' }}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!description.trim() || loading}
            style={{
              width: '100%',
              background: description.trim() && !loading ? RED : '#CCC',
              color: '#fff', border: 'none', borderRadius: 10,
              padding: '13px 0', fontWeight: 800, fontSize: 15,
              cursor: description.trim() && !loading ? 'pointer' : 'not-allowed',
            }}
          >
            {loading ? 'Checking against policy…' : 'Check My Donation →'}
          </button>
        </form>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, padding: '14px 18px', color: '#DC2626', fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {result && ds && (
          <div style={{ background: ds.bg, border: `2px solid ${ds.border}`, borderRadius: 16, padding: '22px 22px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: ds.text,
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 900, flexShrink: 0,
              }}>
                {ds.icon}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: ds.text, marginBottom: 2 }}>
                  Decision
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: ds.text }}>
                  {ds.label}
                </div>
              </div>
              {typeof result.confidence === 'number' && result.confidence > 0 && (
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 1 }}>Confidence</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: ds.text }}>
                    {Math.round(result.confidence * 100)}%
                  </div>
                </div>
              )}
            </div>

            <p style={{ margin: '0 0 14px', fontSize: 14, color: '#333', lineHeight: 1.7 }}>
              {result.reason}
            </p>

            {result.matchedRules?.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Policy Reference
                </div>
                {result.matchedRules.map((r, i) => (
                  <div key={i} style={{ fontSize: 13, color: '#555', padding: '4px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    · {r}
                  </div>
                ))}
              </div>
            )}

            {result.questions?.length > 0 && (
              <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(0,0,0,0.04)', borderRadius: 9, fontSize: 13, color: '#555' }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Questions for staff:</div>
                {result.questions.map((q, i) => (
                  <div key={i} style={{ paddingBottom: 4 }}>· {q}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* House contact */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #E8E3DE' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Still unsure? Call your nearest house.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              ['Stanford House (Palo Alto)', '(650) 470-6000'],
              ['UCSF House (San Francisco)', '(415) 476-4520'],
              ['Oakland House', '(510) 563-6380'],
            ].map(([name, phone]) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#555', padding: '8px 0', borderBottom: '1px solid #F5F0EB' }}>
                <span>{name}</span>
                <a href={`tel:${phone.replace(/\D/g, '')}`} style={{ color: RED, fontWeight: 700 }}>{phone}</a>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
