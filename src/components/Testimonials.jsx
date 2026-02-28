import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiX, FiStar, FiMessageSquare } from 'react-icons/fi';

const Stars = ({ n, setRating = null }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <span
        key={i}
        onClick={() => setRating && setRating(i)}
        style={{
          color: i <= n ? '#f6ad55' : '#e2e8f0',
          fontSize: '1.25rem',
          cursor: setRating ? 'pointer' : 'default',
          transition: 'transform 0.1s'
        }}
        onMouseEnter={(e) => setRating && (e.target.style.transform = 'scale(1.2)')}
        onMouseLeave={(e) => setRating && (e.target.style.transform = 'scale(1)')}
      >
        ★
      </span>
    ))}
  </div>
);

const Testimonials = () => {
  const { testimonials, addTestimonial } = useAdmin();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [role, setRole] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Only show approved testimonials
  const approvedTestimonials = testimonials.filter(t => t.isApproved);

  const handleWriteReviewClick = () => {
    if (!user) {
      alert("Please Sign In to leave a review.");
      navigate('/login');
      return;
    }
    setIsModalOpen(true);
    setIsSubmitted(false);
    setRating(5);
    setRole('Customer');
    setReviewText('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    addTestimonial({
      name: user.displayName || user.email.split('@')[0],
      role: role.trim() || 'Customer',
      rating,
      image: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=ef4444&color=fff`,
      text: reviewText.trim(),
      isApproved: false, // Must be approved by admin
      date: new Date().toISOString().split('T')[0]
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsModalOpen(false);
    }, 2500);
  };

  return (
    <section className="testimonials-section">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', marginBottom: '3rem' }}>
          <div>
            <div className="section-tag">Customer Love</div>
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-sub">Real experiences from our growing community of happy shoppers</p>
          </div>
          <button
            onClick={handleWriteReviewClick}
            style={{
              padding: '0.6rem 1.25rem', borderRadius: 99, border: 'none',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
            }}>
            <FiMessageSquare /> Write a Review
          </button>
        </div>

        {/* Cards */}
        <div className="grid-testi">
          {approvedTestimonials.length > 0 ? (
            approvedTestimonials.map(t => (
              <div key={t.id} className="testimonial-card">
                <Stars n={t.rating} />
                <p className="testimonial-text">"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <img className="testimonial-avatar" src={t.image} alt={t.name} loading="lazy" />
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#64748b', textAlign: 'center', width: '100%', gridColumn: '1 / -1' }}>No testimonials yet. Be the first to leave a review!</p>
          )}
        </div>

        {/* Bottom trust bar */}
        <div style={{ marginTop: '3.5rem', paddingTop: '2.5rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 500 }}>
            As featured in
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            {['Foodie Blog', 'Chef Magazine', 'Organic Life', 'Health Digest', 'Home Cooking'].map(name => (
              <div key={name} style={{
                padding: '0.5rem 1.25rem', borderRadius: 99, background: 'white',
                border: '1px solid #e2e8f0', color: '#718096', fontSize: '0.82rem',
                fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}>{name}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 450, padding: '2rem', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <FiX size={24} />
            </button>

            {isSubmitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: 64, height: 64, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <FiStar size={32} color="#22c55e" fill="#22c55e" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>Thank You!</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>Your review has been submitted and is pending approval.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '1.5rem' }}>Write a Review</h3>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Rating</label>
                  <Stars n={rating} setRating={setRating} />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Your Role / Title (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Regular Customer, Home Cook..."
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Review Message</label>
                  <textarea
                    required
                    rows="4"
                    placeholder="Tell us what you loved about Kelty's..."
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem', resize: 'none' }}
                  ></textarea>
                </div>

                <button type="submit" style={{ width: '100%', padding: '0.875rem', borderRadius: 8, background: '#ef4444', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
                  Submit Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Testimonials;