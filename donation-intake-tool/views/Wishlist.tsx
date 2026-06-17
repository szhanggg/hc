"use client";

import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { isUrgent, House, Category } from '../data/seed';
import NeedCard from '../components/NeedCArd';

const RED = '#DA291C';
type SortKey = 'urgent' | 'wait' | 'quantity';

const SEL: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 8, border: '1.5px solid #E0DBD5',
  background: '#fff', fontSize: 13, color: '#333', cursor: 'pointer', outline: 'none',
};

export default function Wishlist() {
  const { needs, patients } = useApp();
  const [house, setHouse]   = useState<House | 'All'>('All');
  const [cat, setCat]       = useState<Category | 'All'>('All');
  const [urgOnly, setUrgOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sort, setSort]     = useState<SortKey>('urgent');

  const filtered = useMemo(() => {
    let r = needs.filter(n => n.quantityFulfilled < n.quantityNeeded);
    if (house !== 'All')  r = r.filter(n => n.house === house);
    if (cat !== 'All')    r = r.filter(n => n.category === cat);
    if (urgOnly)          r = r.filter(n => isUrgent(n));
    r = r.filter(n => n.unitCost <= maxPrice);

    r.sort((a, b) => {
      if (sort === 'urgent') {
        const d = (isUrgent(b) ? 1 : 0) - (isUrgent(a) ? 1 : 0);
        return d !== 0 ? d : b.daysOpen - a.daysOpen;
      }
      if (sort === 'wait') return b.daysOpen - a.daysOpen;
      return (a.quantityNeeded - a.quantityFulfilled) - (b.quantityNeeded - b.quantityFulfilled);
    });
    return r;
  }, [needs, house, cat, urgOnly, maxPrice, sort]);

  const getPatient = (id?: string) => id ? patients.find(p => p.id === id) : undefined;

  const urgentCount = filtered.filter(isUrgent).length;

  return (
    <div style={{ background: '#F8F5F0', minHeight: '100vh', padding: '28px 20px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 800 }}>Donation Wishlist</h1>
          <p style={{ margin: 0, color: '#666', fontSize: 15 }}>
            <strong style={{ color: '#1A1A1A' }}>{filtered.length} items</strong> needed across 3 Bay Area houses
            {urgentCount > 0 && <> — <span style={{ color: RED, fontWeight: 700 }}>⚡ {urgentCount} urgent</span></>}
          </p>
        </div>

        {/* Filter bar */}
        <div style={{
          background: '#fff', border: '1px solid #E8E3DE', borderRadius: 14,
          padding: '14px 18px', marginBottom: 26,
          display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center',
        }}>
          <select value={house} onChange={e => setHouse(e.target.value as House | 'All')} style={SEL} className="filter-select">
            <option value="All">All Houses</option>
            <option value="Stanford">Stanford</option>
            <option value="UCSF">UCSF</option>
            <option value="Oakland">Oakland</option>
          </select>

          <select value={cat} onChange={e => setCat(e.target.value as Category | 'All')} style={SEL} className="filter-select">
            <option value="All">All Categories</option>
            <option value="hygiene">🧼 Hygiene</option>
            <option value="food">🍎 Food</option>
            <option value="school">📚 School</option>
            <option value="toy">🧸 Toy</option>
            <option value="other">✨ Other</option>
          </select>

          <select value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} style={SEL} className="filter-select">
            <option value={1000}>Any price</option>
            <option value={25}>Under $25</option>
            <option value={50}>Under $50</option>
            <option value={100}>Under $100</option>
            <option value={250}>Under $250</option>
          </select>

          <button onClick={() => setUrgOnly(v => !v)} style={{
            padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            border: `2px solid ${urgOnly ? RED : '#E0DBD5'}`,
            background: urgOnly ? RED : '#fff', color: urgOnly ? '#fff' : '#555',
            transition: 'all 0.12s',
          }}>
            ⚡ Urgent Only
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>Sort:</span>
            {(['urgent', 'wait', 'quantity'] as SortKey[]).map(k => (
              <button key={k} onClick={() => setSort(k)} style={{
                padding: '6px 11px', borderRadius: 7, border: '1px solid #E0DBD5',
                background: sort === k ? '#1A1A1A' : '#fff',
                color: sort === k ? '#fff' : '#555',
                fontWeight: sort === k ? 700 : 400,
                fontSize: 12, cursor: 'pointer', transition: 'all 0.12s',
              }}>
                {k === 'urgent' ? 'Most Urgent' : k === 'wait' ? 'Longest Wait' : 'Lowest Qty'}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {filtered.map(n => (
              <NeedCard key={n.id} need={n} patient={getPatient(n.linkedPatientId)} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#999' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#555', marginBottom: 8 }}>No items match your filters</div>
            <div style={{ fontSize: 14 }}>Try adjusting the filters above.</div>
          </div>
        )}
      </div>
    </div>
  );
}
