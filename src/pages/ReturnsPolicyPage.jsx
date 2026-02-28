import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiRotateCcw, FiCheckCircle, FiXCircle, FiClock, FiMail, FiAlertCircle, FiPackage } from 'react-icons/fi';

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

const STEPS = [
    { num: '01', title: 'Contact Us', desc: 'Email or call us within 14 days of delivery. Include your order number and reason for return.', color: '#6366f1' },
    { num: '02', title: 'Get Approval', desc: "We'll confirm your return is eligible and email you a pre-paid return label within 24 hours.", color: '#f59e0b' },
    { num: '03', title: 'Pack & Send', desc: 'Pack items securely in original packaging where possible and drop off at any post office.', color: '#3b82f6' },
    { num: '04', title: 'Refund Issued', desc: "Refund processed to your original payment method within 3–5 business days of receiving your return.", color: '#22c55e' },
];

export default function ReturnsPolicyPage() {
    const [activeTab, setActiveTab] = useState('eligible');

    const eligible = [
        'Faulty or damaged items',
        'Wrong item delivered',
        'Item past its use-by date on delivery',
        'Sealed non-perishable items (unopened, within 14 days)',
        'Incorrect quantity delivered',
    ];
    const notEligible = [
        'Fresh produce once opened or used',
        'Perishable items returned after 48 hours',
        'Items with tampered seals',
        'Digital/downloadable products',
        'Items purchased on final sale',
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter',sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap')`}</style>

            {/* Hero */}
            <div style={{ background: 'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)', padding: '3.5rem 1.5rem', textAlign: 'center', color: 'white' }}>
                <div style={{ width: 60, height: 60, background: 'rgba(255,255,255,0.2)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <FiRotateCcw size={28} />
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Returns Policy</h1>
                <p style={{ color: 'rgba(255,255,255,0.85)', margin: 0 }}>Easy, hassle-free returns within 14 days</p>
            </div>

            <div style={{ maxWidth: 820, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

                {/* Quick summary banner */}
                <div style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(79,70,229,0.04))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {[
                        { emoji: '📅', text: '14-day returns window' },
                        { emoji: '🚚', text: 'Free return postage' },
                        { emoji: '💳', text: 'Full refund guaranteed' },
                        { emoji: '⚡', text: '3–5 day processing' },
                    ].map(({ emoji, text }) => (
                        <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4f46e5', fontWeight: 600, fontSize: '0.875rem' }}>
                            <span>{emoji}</span> {text}
                        </div>
                    ))}
                </div>

                {/* What can / can't be returned */}
                <Section icon={FiPackage} title="What Can Be Returned?" color="#6366f1">
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        {['eligible', 'not_eligible'].map(t => (
                            <button key={t} onClick={() => setActiveTab(t)}
                                style={{ padding: '0.5rem 1.25rem', borderRadius: 99, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', background: activeTab === t ? 'linear-gradient(135deg,#6366f1,#4f46e5)' : '#f1f5f9', color: activeTab === t ? 'white' : '#64748b' }}>
                                {t === 'eligible' ? '✅ Eligible for Return' : '❌ Not Eligible'}
                            </button>
                        ))}
                    </div>
                    {(activeTab === 'eligible' ? eligible : notEligible).map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0', borderBottom: '1px solid #f8fafc', fontSize: '0.875rem', color: '#475569' }}>
                            {activeTab === 'eligible'
                                ? <FiCheckCircle size={16} color="#22c55e" />
                                : <FiXCircle size={16} color="#ef4444" />}
                            {item}
                        </div>
                    ))}
                </Section>

                {/* How to return — step by step */}
                <Section icon={FiRotateCcw} title="How to Return an Item" color="#f59e0b">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '1rem' }}>
                        {STEPS.map(step => (
                            <div key={step.num} style={{ border: `1px solid ${step.color}30`, borderRadius: 14, padding: '1.25rem', background: `${step.color}06`, position: 'relative' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: step.color, marginBottom: '0.5rem' }}>{step.num}</div>
                                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem', marginBottom: '0.375rem' }}>{step.title}</div>
                                <div style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.5 }}>{step.desc}</div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Timeframes */}
                <Section icon={FiClock} title="Return Timeframes" color="#3b82f6">
                    {[
                        { label: 'Return window', value: '14 days from delivery date' },
                        { label: 'Faulty items', value: '30 days (extended window)' },
                        { label: 'Refund processing', value: '3–5 business days' },
                        { label: 'Bank transfer time', value: 'Up to 10 days depending on your bank' },
                    ].map(({ label, value }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #f8fafc', fontSize: '0.875rem' }}>
                            <span style={{ color: '#64748b' }}>{label}</span>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>{value}</span>
                        </div>
                    ))}
                </Section>

                {/* Contact */}
                <Section icon={FiMail} title="Need Help With a Return?" color="#22c55e">
                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>Our customer service team is ready to help with any return queries.</p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <a href="mailto:returns@keltysmarket.com" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'white', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
                            <FiMail size={15} /> returns@keltysmarket.com
                        </a>
                        <Link to="/contact" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: '#f1f5f9', color: '#475569', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
                            Contact Us
                        </Link>
                    </div>
                </Section>

                <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 14, padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <FiAlertCircle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                    <p style={{ color: '#92400e', fontSize: '0.8rem', margin: 0, lineHeight: 1.6 }}>
                        This returns policy does not affect your statutory rights. For perishable goods complaints, please contact us within 48 hours of delivery with photos where possible.
                    </p>
                </div>
            </div>
        </div>
    );
}
