import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHelpCircle, FiShoppingCart, FiTruck, FiCreditCard, FiUser, FiRotateCcw, FiChevronDown } from 'react-icons/fi';

const CATEGORIES = [
    {
        id: 'orders', icon: FiShoppingCart, label: 'Orders', color: '#6366f1',
        faqs: [
            { q: 'How do I place an order?', a: 'Browse our shop, add items to your cart, then go to checkout. You\'ll need to create an account or sign in to complete your purchase.' },
            { q: 'Can I change or cancel my order?', a: 'Orders can be modified or cancelled within 1 hour of placing them. After that, contact us immediately and we\'ll do our best to help.' },
            { q: 'How will I know my order was confirmed?', a: 'You\'ll receive an order confirmation email with your order number immediately after placing your order.' },
            { q: 'Can I add items to an existing order?', a: 'Unfortunately we cannot add items after an order is placed. However, you can place a new order and we\'ll always try to merge same-day orders when possible.' },
            { q: 'What if an item is out of stock?', a: 'We may substitute with a similar item of equal or greater value. You can opt out of substitutions in your account settings.' },
        ]
    },
    {
        id: 'delivery', icon: FiTruck, label: 'Delivery', color: '#ef4444',
        faqs: [
            { q: 'What are your delivery options?', a: 'We offer Standard (£3.99, 2–3 days), Express (£6.99, next day), and Same-Day (£9.99, order by 2pm) delivery.' },
            { q: 'Is there free delivery?', a: 'Yes! Standard delivery is FREE on orders over £30. Express delivery is FREE over £60, and Same-Day over £80.' },
            { q: 'What areas do you deliver to?', a: 'We deliver within 15 miles of our Kelty store. Check our Delivery Information page for a full list of covered areas.' },
            { q: 'What time will my order arrive?', a: 'You\'ll receive a 2-hour delivery window by SMS on the morning of your delivery. Our driver will also notify you when they\'re 30 minutes away.' },
            { q: 'What if I\'m not home?', a: 'You can specify a safe place or leave with a neighbour in your order notes. We\'ll leave a card if we can\'t complete the delivery.' },
        ]
    },
    {
        id: 'payment', icon: FiCreditCard, label: 'Payment', color: '#f59e0b',
        faqs: [
            { q: 'What payment methods do you accept?', a: 'We accept Visa, Mastercard, PayPal, Apple Pay, and Google Pay. All payments are securely processed.' },
            { q: 'Is it safe to pay online?', a: 'Yes. We use industry-standard SSL encryption and are PCI DSS compliant. We never store your full card details.' },
            { q: 'When am I charged?', a: 'Your card is charged when your order is confirmed. If items are unavailable, you\'ll be refunded the difference within 3–5 days.' },
            { q: 'Do you offer instalment payments?', a: 'We currently offer Klarna Pay Later for orders over £50. This option appears at checkout.' },
        ]
    },
    {
        id: 'account', icon: FiUser, label: 'My Account', color: '#22c55e',
        faqs: [
            { q: 'How do I create an account?', a: 'Click "Register" in the top navigation bar. You can sign up with your email or use Google Sign-In for one-click access.' },
            { q: 'I\'ve forgotten my password — what do I do?', a: 'Click "Sign In" then "Forgot password?". Enter your email and we\'ll send a reset link within a few minutes.' },
            { q: 'How do I update my profile details?', a: 'Go to My Profile from the user menu in the top right. You can update your display name there.' },
            { q: 'Can I have multiple delivery addresses?', a: 'You can enter a delivery address at checkout each time. We\'re working on saving multiple addresses — coming soon!' },
            { q: 'How do I delete my account?', a: 'Contact us at support@keltysmarket.com and we\'ll process your request within 5 business days in line with GDPR.' },
        ]
    },
    {
        id: 'returns', icon: FiRotateCcw, label: 'Returns', color: '#3b82f6',
        faqs: [
            { q: 'What is your returns policy?', a: 'We accept returns within 14 days for eligible items. See our full Returns Policy page for details.' },
            { q: 'How long does a refund take?', a: 'Refunds are processed within 3–5 business days of receiving your return, and may take up to 10 days to appear in your account.' },
            { q: 'Is return postage free?', a: 'Yes, for eligible returns we provide a pre-paid return label. Contact us first to get this sent to you.' },
            { q: 'What do I do if my order arrived damaged?', a: 'Take a photo and contact us within 48 hours. We\'ll arrange a replacement or refund immediately.' },
        ]
    },
];

const FAQ = ({ q, a }) => {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ borderBottom: '1px solid #f1f5f9' }}>
            <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '1rem' }}>
                <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{q}</span>
                <FiChevronDown size={18} color="#94a3b8" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .25s', flexShrink: 0 }} />
            </button>
            {open && (
                <div style={{ paddingBottom: '1rem', color: '#64748b', fontSize: '0.875rem', lineHeight: 1.7 }}>{a}</div>
            )}
        </div>
    );
};

export default function FAQsPage() {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('orders');

    const activeCat = CATEGORIES.find(c => c.id === activeCategory);
    const filteredFaqs = search.trim()
        ? CATEGORIES.flatMap(c => c.faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())))
        : activeCat?.faqs || [];

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter',sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap')`}</style>

            {/* Hero */}
            <div style={{ background: 'linear-gradient(135deg,#1e293b 0%,#334155 100%)', padding: '3.5rem 1.5rem', textAlign: 'center', color: 'white' }}>
                <div style={{ width: 60, height: 60, background: 'rgba(255,255,255,0.1)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <FiHelpCircle size={28} />
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Frequently Asked Questions</h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 1.75rem' }}>Find quick answers to common questions</p>
                {/* Search */}
                <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative' }}>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search FAQs..."
                        style={{ width: '100%', boxSizing: 'border-box', padding: '0.875rem 1rem 0.875rem 3rem', borderRadius: 14, border: 'none', fontSize: '0.9rem', outline: 'none', background: 'white', color: '#1e293b' }} />
                    <FiHelpCircle size={18} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                </div>
            </div>

            <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 1.5rem', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem', alignItems: 'start' }}>

                {/* Category sidebar */}
                {!search && (
                    <div style={{ background: 'white', borderRadius: 18, border: '1px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '1rem', position: 'sticky', top: '1rem' }}>
                        {CATEGORIES.map(cat => {
                            const Icon = cat.icon;
                            const active = activeCategory === cat.id;
                            return (
                                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'left', marginBottom: '0.25rem', background: active ? `${cat.color}12` : 'transparent', color: active ? cat.color : '#64748b', fontWeight: active ? 700 : 500, fontSize: '0.875rem', transition: 'all .15s' }}>
                                    <Icon size={16} /> {cat.label}
                                    <span style={{ marginLeft: 'auto', background: active ? cat.color : '#e2e8f0', color: active ? 'white' : '#94a3b8', borderRadius: 99, padding: '1px 7px', fontSize: '0.7rem', fontWeight: 700 }}>
                                        {cat.faqs.length}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* FAQ list */}
                <div style={{ background: 'white', borderRadius: 18, border: '1px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '1.5rem', gridColumn: search ? '1 / -1' : 'auto' }}>
                    {search && (
                        <div style={{ marginBottom: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                            {filteredFaqs.length > 0 ? `${filteredFaqs.length} result${filteredFaqs.length !== 1 ? 's' : ''} for "${search}"` : `No results found for "${search}"`}
                        </div>
                    )}
                    {!search && activeCat && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
                            <span style={{ width: 36, height: 36, borderRadius: 10, background: `${activeCat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <activeCat.icon size={16} color={activeCat.color} />
                            </span>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{activeCat.label} FAQs</h2>
                        </div>
                    )}
                    {filteredFaqs.length === 0 && search && (
                        <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8' }}>
                            <FiHelpCircle size={36} style={{ marginBottom: '0.75rem' }} />
                            <p>No answers found. <Link to="/contact" style={{ color: '#ef4444' }}>Contact us</Link> directly and we'll help.</p>
                        </div>
                    )}
                    {filteredFaqs.map((faq, i) => <FAQ key={i} q={faq.q} a={faq.a} />)}
                </div>
            </div>

            {/* Still need help */}
            <div style={{ maxWidth: 900, margin: '0 auto 3rem', padding: '0 1.5rem' }}>
                <div style={{ background: 'linear-gradient(135deg,rgba(239,68,68,0.06),rgba(220,38,38,0.02))', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 18, padding: '2rem', textAlign: 'center' }}>
                    <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Still need help?</h3>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.25rem' }}>Our support team replies within 2 business hours.</p>
                    <Link to="/contact" style={{ padding: '0.75rem 2rem', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', borderRadius: 12, textDecoration: 'none', fontWeight: 700, boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}>
                        Contact Us
                    </Link>
                </div>
            </div>
        </div>
    );
}
