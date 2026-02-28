import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTruck, FiClock, FiMapPin, FiCheckCircle, FiAlertCircle, FiPackage, FiStar } from 'react-icons/fi';

const Section = ({ icon: Icon, title, color, children }) => (
    <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f1f5f9', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', padding: '1.75rem', marginBottom: '1.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.25rem' }}>
            <span style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={color} />
            </span>
            {title}
        </h2>
        {children}
    </div>
);

const Row = ({ label, value, highlight }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f8fafc' }}>
        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>{label}</span>
        <span style={{ fontWeight: 600, color: highlight ? '#ef4444' : '#1e293b', fontSize: '0.9rem' }}>{value}</span>
    </div>
);

export default function DeliveryInfoPage() {
    const [postcode, setPostcode] = useState('');
    const [checked, setChecked] = useState(false);

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter',sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap')`}</style>

            {/* Hero */}
            <div style={{ background: 'linear-gradient(135deg,#ef4444 0%,#dc2626 100%)', padding: '3.5rem 1.5rem', textAlign: 'center', color: 'white' }}>
                <div style={{ width: 60, height: 60, background: 'rgba(255,255,255,0.2)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <FiTruck size={28} />
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Delivery Information</h1>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', margin: 0 }}>Everything you need to know about getting your groceries delivered</p>
            </div>

            <div style={{ maxWidth: 820, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

                {/* Postcode checker */}
                <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f1f5f9', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', padding: '1.75rem', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.5rem' }}>📍 Check Your Delivery Area</h2>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 1rem' }}>Enter your postcode to confirm we deliver to your area.</p>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <input value={postcode} onChange={e => setPostcode(e.target.value.toUpperCase())} placeholder="e.g. KY4 0AW"
                            style={{ flex: 1, minWidth: 160, padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: '0.9rem', outline: 'none' }}
                            onFocus={e => e.target.style.borderColor = '#ef4444'}
                            onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                        <button onClick={() => postcode && setChecked(true)}
                            style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                            Check
                        </button>
                    </div>
                    {checked && postcode && (
                        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d', fontWeight: 600, fontSize: '0.875rem' }}>
                            <FiCheckCircle size={16} /> Great news! We deliver to <strong>{postcode}</strong>. Order by 2pm for same-day delivery.
                        </div>
                    )}
                </div>

                {/* Delivery options */}
                <Section icon={FiTruck} title="Delivery Options & Pricing" color="#ef4444">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
                        {[
                            { name: 'Standard', emoji: '📦', time: '2–3 business days', price: '£3.99', free: 'FREE over £30', color: '#6366f1' },
                            { name: 'Express', emoji: '⚡', time: 'Next business day', price: '£6.99', free: 'FREE over £60', color: '#f59e0b' },
                            { name: 'Same-Day', emoji: '🚀', time: 'Today (order by 2pm)', price: '£9.99', free: 'FREE over £80', color: '#22c55e' },
                        ].map(opt => (
                            <div key={opt.name} style={{ border: `2px solid ${opt.color}30`, borderRadius: 14, padding: '1.25rem', background: `${opt.color}06` }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{opt.emoji}</div>
                                <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>{opt.name} Delivery</div>
                                <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{opt.time}</div>
                                <div style={{ fontWeight: 800, color: opt.color, fontSize: '1.1rem' }}>{opt.price}</div>
                                <div style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.25rem' }}>{opt.free}</div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Delivery hours */}
                <Section icon={FiClock} title="Delivery Hours" color="#6366f1">
                    <Row label="Monday – Friday" value="7:00am – 9:00pm" />
                    <Row label="Saturday" value="8:00am – 8:00pm" />
                    <Row label="Sunday" value="9:00am – 6:00pm" />
                    <Row label="Bank Holidays" value="10:00am – 4:00pm" highlight />
                    <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.75rem' }}>Orders placed after cut-off times will be delivered on the next available slot.</p>
                </Section>

                {/* Delivery area */}
                <Section icon={FiMapPin} title="Delivery Area" color="#22c55e">
                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>We currently deliver within <strong>15 miles</strong> of our Kelty store. Areas served include:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {['Kelty', 'Cowdenbeath', 'Dunfermline', 'Kirkcaldy', 'Glenrothes', 'Lochgelly', 'Cardenden', 'Ballingry', 'Crossgates', 'Inverkeithing'].map(area => (
                            <span key={area} style={{ background: 'rgba(34,197,94,0.1)', color: '#15803d', padding: '4px 12px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <FiCheckCircle size={12} /> {area}
                            </span>
                        ))}
                    </div>
                </Section>

                {/* Important notes */}
                <Section icon={FiAlertCircle} title="Important Notes" color="#f59e0b">
                    {[
                        'Someone must be available to receive the delivery.',
                        'Please ensure access is clear for our delivery drivers.',
                        'Perishable items are delivered in insulated bags.',
                        'Alcohol deliveries require age verification (18+).',
                        'We reserve the right to substitute out-of-stock items with similar products.',
                    ].map((note, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', marginBottom: '0.75rem', fontSize: '0.875rem', color: '#64748b' }}>
                            <span style={{ color: '#f59e0b', fontWeight: 700, flexShrink: 0 }}>•</span> {note}
                        </div>
                    ))}
                </Section>

                {/* CTA */}
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>Still have questions? Check our <Link to="/faqs" style={{ color: '#ef4444', fontWeight: 600 }}>FAQs</Link> or <Link to="/contact" style={{ color: '#ef4444', fontWeight: 600 }}>contact us</Link>.</p>
                    <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 2rem', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', borderRadius: 12, textDecoration: 'none', fontWeight: 700, boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}>
                        <FiStar size={16} /> Start Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
