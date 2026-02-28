import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const CATEGORIES = [
  { id: 1, name: 'Condiments', icon: '🍯', count: 120, color: '#fff7ed', accent: '#f6ad55' },
  { id: 2, name: 'Dairy & Eggs', icon: '🥚', count: 85, color: '#eff6ff', accent: '#3b82f6' },
  { id: 3, name: 'Meat', icon: '🍗', count: 65, color: '#fef2f2', accent: '#ef4444' },
  { id: 4, name: 'Bakery', icon: '🍞', count: 42, color: '#fefce8', accent: '#eab308' },
  { id: 5, name: 'Beverages', icon: '🥤', count: 96, color: '#f0fdf4', accent: '#22c55e' },
  { id: 6, name: 'Snacks', icon: '🍪', count: 112, color: '#fdf4ff', accent: '#a855f7' },
];

const Categories = () => (
  <section className="categories-section">
    <div className="container">
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <div className="section-tag">Browse</div>
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-sub">Find everything in our carefully curated sections</p>
        </div>
        <Link to="/categories" className="view-all-link">
          All categories <FiArrowRight />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid-cats">
        {CATEGORIES.map(cat => (
          <Link
            key={cat.id}
            to={`/category/${cat.id}`}
            className="category-card"
            style={{ textDecoration: 'none' }}
          >
            <div
              className="cat-icon-wrap"
              style={{ background: cat.color, boxShadow: `0 8px 24px ${cat.accent}25` }}
            >
              {cat.icon}
            </div>
            <div className="cat-name">{cat.name}</div>
            <div className="cat-count">{cat.count} products</div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default Categories;