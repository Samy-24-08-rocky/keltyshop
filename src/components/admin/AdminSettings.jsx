import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { FiSave, FiCheck, FiTruck, FiZap, FiClock, FiLock, FiMail, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';

// ── Helpers to read/write custom admin creds in localStorage ─────────────────
const getAdminEmail = () =>
    localStorage.getItem('admin_custom_email') ||
    import.meta.env.VITE_ADMIN_EMAIL ||
    'admin@kelty.com';

const getAdminPassword = () =>
    localStorage.getItem('admin_custom_password') ||
    import.meta.env.VITE_ADMIN_PASSWORD ||
    'admin123';

export { getAdminEmail, getAdminPassword };

const inp = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '0.65rem 1rem',
    color: '#f1f5f9', fontSize: '0.875rem', outline: 'none',
};

const Field = ({ label, hint, children }) => (
    <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 500, marginBottom: '0.375rem' }}>{label}</label>
        {hint && <p style={{ margin: '0 0 0.4rem', fontSize: '0.73rem', color: '#475569' }}>{hint}</p>}
        {children}
    </div>
);

const TextInput = (props) => <input {...props} style={inp} />;

const Toggle = ({ checked, onChange, label, sublabel }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', cursor: 'pointer', padding: '0.875rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
        <div onClick={onChange} style={{ position: 'relative', width: 44, height: 24, background: checked ? '#ef4444' : 'rgba(255,255,255,0.12)', borderRadius: 99, transition: 'background .25s', flexShrink: 0, cursor: 'pointer' }}>
            <div style={{ position: 'absolute', top: 3, left: checked ? 23 : 3, width: 18, height: 18, background: 'white', borderRadius: '50%', transition: 'left .25s', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
        </div>
        <div>
            <div style={{ color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 500 }}>{label}</div>
            {sublabel && <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '0.15rem' }}>{sublabel}</div>}
        </div>
    </label>
);

const Section = ({ title, children }) => (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem' }}>
        <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>{title}</h3>
        {children}
    </div>
);

const ICONS = { standard: FiTruck, express: FiZap, sameday: FiClock };

export default function AdminSettings() {
    const { settings, updateSettings, products } = useAdmin();
    const [local, setLocal] = useState({ ...settings });
    const [saved, setSaved] = useState(false);

    // ── Credential change state ───────────────────────────────────────────────
    const [emailForm, setEmailForm] = useState({ currentPw: '', newEmail: '' });
    const [pwForm, setPwForm] = useState({ currentPw: '', newPw: '', confirmPw: '' });
    const [emailMsg, setEmailMsg] = useState(null); // { type:'success'|'error', text }
    const [pwMsg, setPwMsg] = useState(null);
    const [showCurPw, setShowCurPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);

    const flashMsg = (set, type, text) => {
        set({ type, text });
        setTimeout(() => set(null), 3500);
    };

    const handleEmailChange = () => {
        if (!emailForm.newEmail.includes('@')) return flashMsg(setEmailMsg, 'error', 'Enter a valid email address.');
        if (emailForm.currentPw !== getAdminPassword()) return flashMsg(setEmailMsg, 'error', 'Current password is incorrect.');
        localStorage.setItem('admin_custom_email', emailForm.newEmail.trim().toLowerCase());
        // Also update the stored admin_user so the sidebar shows the new email
        try {
            const u = JSON.parse(localStorage.getItem('admin_user_v3'));
            if (u) localStorage.setItem('admin_user_v3', JSON.stringify({ ...u, email: emailForm.newEmail.trim().toLowerCase() }));
        } catch { }
        setEmailForm({ currentPw: '', newEmail: '' });
        flashMsg(setEmailMsg, 'success', 'Login email updated! Use it next time you sign in.');
    };

    const handlePasswordChange = () => {
        if (pwForm.currentPw !== getAdminPassword()) return flashMsg(setPwMsg, 'error', 'Current password is incorrect.');
        if (pwForm.newPw.length < 6) return flashMsg(setPwMsg, 'error', 'New password must be at least 6 characters.');
        if (pwForm.newPw !== pwForm.confirmPw) return flashMsg(setPwMsg, 'error', 'Passwords do not match.');
        localStorage.setItem('admin_custom_password', pwForm.newPw);
        setPwForm({ currentPw: '', newPw: '', confirmPw: '' });
        flashMsg(setPwMsg, 'success', 'Password updated successfully!');
    };

    const set = (k, v) => setLocal(s => ({ ...s, [k]: v }));

    const setDeliveryOption = (id, field, value) => {
        setLocal(s => ({
            ...s,
            deliveryOptions: (s.deliveryOptions || []).map(opt =>
                opt.id === id ? { ...opt, [field]: value } : opt
            ),
        }));
    };

    const handleSave = () => {
        updateSettings(local);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const deliveryOptions = local.deliveryOptions || [];

    return (
        <div style={{ maxWidth: 760 }}>

            {/* ── Store Identity ── */}
            <Section title="🏪 Store Identity">
                <Field label="Store Name"><TextInput value={local.storeName} onChange={e => set('storeName', e.target.value)} /></Field>
                <Field label="Tagline"><TextInput value={local.tagline} onChange={e => set('tagline', e.target.value)} /></Field>
            </Section>

            {/* ── Hero Product Spotlight ── */}
            <Section title="🌟 Homepage Hero — Featured Product Card">
                <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 0, marginBottom: '1rem' }}>
                    Choose which product appears in the floating card on the homepage hero image.
                    Customers can click it to go directly to that product page.
                </p>
                <Field label="Select Product to Spotlight">
                    <select
                        value={local.heroProductId || ''}
                        onChange={e => set('heroProductId', Number(e.target.value))}
                        style={{ ...inp, cursor: 'pointer' }}
                    >
                        <option value="">— Choose a product —</option>
                        {[...products]
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} — £{Number(p.price).toFixed(2)}{p.stock === 0 ? ' (OUT OF STOCK)' : ''}
                                </option>
                            ))
                        }
                    </select>
                </Field>
                {/* Live preview of selected product */}
                {local.heroProductId && (() => {
                    const sel = products.find(p => p.id === local.heroProductId);
                    if (!sel) return null;
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12, padding: '0.875rem 1rem' }}>
                            <img src={sel.image} alt={sel.name} style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
                            <div style={{ flex: 1 }}>
                                <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.88rem' }}>{sel.name}</div>
                                <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '0.15rem' }}>⭐ {sel.rating} · {sel.category} · Stock: {sel.stock}</div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ color: '#10b981', fontWeight: 800, fontSize: '1rem' }}>£{Number(sel.price).toFixed(2)}</div>
                                {sel.oldPrice && <div style={{ color: '#475569', fontSize: '0.7rem', textDecoration: 'line-through' }}>£{Number(sel.oldPrice).toFixed(2)}</div>}
                            </div>
                        </div>
                    );
                })()}
            </Section>

            {/* ── Delivery Options ── */}
            <Section title="🚚 Delivery Options & Times">
                <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '1.25rem', marginTop: 0 }}>
                    Configure each delivery tier — name, description, estimated time, price, and whether it's available to customers.
                </p>

                {deliveryOptions.map(opt => {
                    const Icon = ICONS[opt.id] || FiTruck;
                    return (
                        <div key={opt.id} style={{
                            background: opt.enabled ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${opt.enabled ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}`,
                            borderRadius: 14, padding: '1.25rem', marginBottom: '1rem',
                        }}>
                            {/* Header row */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Icon size={17} color="#f87171" />
                                    </div>
                                    <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.9rem' }}>{opt.label}</span>
                                </div>
                                {/* Enable/disable toggle */}
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <div
                                        onClick={() => setDeliveryOption(opt.id, 'enabled', !opt.enabled)}
                                        style={{ position: 'relative', width: 40, height: 22, background: opt.enabled ? '#22c55e' : 'rgba(255,255,255,0.12)', borderRadius: 99, transition: 'background .2s', cursor: 'pointer' }}
                                    >
                                        <div style={{ position: 'absolute', top: 2, left: opt.enabled ? 20 : 2, width: 18, height: 18, background: 'white', borderRadius: '50%', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: opt.enabled ? '#22c55e' : '#64748b', fontWeight: 600 }}>
                                        {opt.enabled ? 'Active' : 'Disabled'}
                                    </span>
                                </label>
                            </div>

                            {/* Fields */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <Field label="Option Name">
                                    <TextInput
                                        value={opt.label}
                                        onChange={e => setDeliveryOption(opt.id, 'label', e.target.value)}
                                        placeholder="e.g. Standard Delivery"
                                    />
                                </Field>
                                <Field label="Estimated Time Shown to Customer">
                                    <TextInput
                                        value={opt.time}
                                        onChange={e => setDeliveryOption(opt.id, 'time', e.target.value)}
                                        placeholder="e.g. 2–3 business days"
                                    />
                                </Field>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                                <Field label="Description / Cutoff Instructions">
                                    <TextInput
                                        value={opt.description}
                                        onChange={e => setDeliveryOption(opt.id, 'description', e.target.value)}
                                        placeholder="e.g. Order before 3 pm for next-day delivery"
                                    />
                                </Field>
                                <Field label="Price (£)">
                                    <TextInput
                                        type="number" step="0.01" min="0"
                                        value={opt.price}
                                        onChange={e => setDeliveryOption(opt.id, 'price', parseFloat(e.target.value) || 0)}
                                    />
                                </Field>
                            </div>
                        </div>
                    );
                })}

                <Field label="Free Delivery Threshold (£)" hint="Orders above this amount get free standard delivery">
                    <TextInput
                        type="number" step="0.01"
                        value={local.freeDeliveryThreshold}
                        onChange={e => set('freeDeliveryThreshold', parseFloat(e.target.value) || 0)}
                    />
                </Field>
            </Section>

            {/* ── Order Confirmation ── */}
            <Section title="✅ Order Confirmation">
                <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 0, marginBottom: '1rem' }}>
                    Choose whether orders are confirmed automatically when placed, or must be manually approved by admin.
                </p>
                <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
                    {[
                        { val: 'auto', icon: '⚡', title: 'Auto Confirm', desc: 'Orders are confirmed instantly when placed' },
                        { val: 'manual', icon: '🔍', title: 'Manual Approval', desc: 'Admin must review and confirm each order' },
                    ].map(opt => (
                        <div
                            key={opt.val}
                            onClick={() => set('orderConfirmation', opt.val)}
                            style={{
                                flex: 1, minWidth: 220, cursor: 'pointer', borderRadius: 14,
                                padding: '1.1rem 1.25rem',
                                background: local.orderConfirmation === opt.val ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.03)',
                                border: `2px solid ${local.orderConfirmation === opt.val ? '#ef4444' : 'rgba(255,255,255,0.07)'}`,
                                transition: 'all .2s',
                            }}
                        >
                            <div style={{ fontSize: '1.4rem', marginBottom: '0.375rem' }}>{opt.icon}</div>
                            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.9rem' }}>{opt.title}</div>
                            <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>{opt.desc}</div>
                            {local.orderConfirmation === opt.val && (
                                <div style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(239,68,68,0.2)', color: '#f87171', borderRadius: 6, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700 }}>
                                    ✓ Selected
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Section>

            {/* ── Tax & Finance ── */}
            <Section title="💰 Tax & Finance">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Field label="VAT / Tax Rate (%)" hint="Set to 0 to disable tax completely">
                        <div style={{ position: 'relative' }}>
                            <TextInput
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={local.taxRate}
                                onChange={e => set('taxRate', parseFloat(e.target.value) || 0)}
                                style={{ ...inp, paddingRight: '3.5rem' }}
                            />
                            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: 700, fontSize: '0.85rem', pointerEvents: 'none' }}>%</span>
                        </div>
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {[0, 5, 10, 15, 20].map(r => (
                                <button
                                    key={r}
                                    onClick={() => set('taxRate', r)}
                                    style={{
                                        padding: '0.25rem 0.65rem', borderRadius: 6, border: '1px solid',
                                        borderColor: local.taxRate === r ? '#10b981' : 'rgba(255,255,255,0.12)',
                                        background: local.taxRate === r ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                                        color: local.taxRate === r ? '#10b981' : '#64748b',
                                        fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                                    }}
                                >
                                    {r === 0 ? 'No Tax' : `${r}%`}
                                </button>
                            ))}
                        </div>
                    </Field>
                    <Field label="Featured Products Count" hint="Products shown in homepage featured section">
                        <TextInput type="number" min="1" max="20" value={local.featuredProductsCount} onChange={e => set('featuredProductsCount', parseInt(e.target.value) || 8)} />
                    </Field>
                </div>
                <div style={{ marginTop: '0.5rem', background: local.taxRate === 0 ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${local.taxRate === 0 ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`, borderRadius: 10, padding: '0.65rem 1rem', fontSize: '0.78rem', color: local.taxRate === 0 ? '#10b981' : '#f59e0b' }}>
                    {local.taxRate === 0
                        ? '✅ Tax is disabled — no VAT will be charged on any order'
                        : `📋 Currently charging ${local.taxRate}% VAT on all orders. On a £10.00 order that's £${(10 * local.taxRate / 100).toFixed(2)} tax → £${(10 + 10 * local.taxRate / 100).toFixed(2)} total.`
                    }
                </div>
            </Section>

            {/* ── Operational ── */}
            <Section title="⚙️ Operational Controls">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <Toggle
                        checked={local.maintenanceMode}
                        onChange={() => set('maintenanceMode', !local.maintenanceMode)}
                        label="Maintenance Mode"
                        sublabel="Temporarily close the store to all visitors"
                    />
                    <Toggle
                        checked={local.allowNewRegistrations}
                        onChange={() => set('allowNewRegistrations', !local.allowNewRegistrations)}
                        label="Allow New Customer Registrations"
                        sublabel="Disable to prevent new accounts being created"
                    />
                </div>
            </Section>

            {/* ── Admin Account ── */}
            <Section title="🔐 Admin Account">
                <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 0, marginBottom: '1.5rem' }}>
                    Update the email address or password used to access this admin panel.
                    Changes take effect on your next login.
                </p>

                {/* Msg helper */}
                {[{ msg: emailMsg, label: 'email' }, { msg: pwMsg, label: 'pw' }].map(({ msg, label }) =>
                    msg ? (
                        <div key={label} style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: msg.type === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                            border: `1px solid ${msg.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            borderRadius: 10, padding: '0.7rem 1rem', marginBottom: '1rem',
                            color: msg.type === 'success' ? '#86efac' : '#fca5a5', fontSize: '0.85rem',
                        }}>
                            {msg.type === 'success' ? <FiCheck size={15} /> : <FiAlertCircle size={15} />}
                            {msg.text}
                        </div>
                    ) : null
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.25rem' }}>

                    {/* Change Email */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FiMail size={15} color="#818cf8" />
                            </div>
                            <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>Change Login Email</span>
                        </div>
                        <div style={{ marginBottom: '0.75rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 500 }}>Current Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showCurPw ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={emailForm.currentPw}
                                    onChange={e => setEmailForm(f => ({ ...f, currentPw: e.target.value }))}
                                    style={{ ...inp, paddingRight: '2.5rem' }}
                                />
                                <button type="button" onClick={() => setShowCurPw(v => !v)}
                                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}>
                                    {showCurPw ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                                </button>
                            </div>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 500 }}>New Email Address</label>
                            <input
                                type="email"
                                placeholder="e.g. you@example.com"
                                value={emailForm.newEmail}
                                onChange={e => setEmailForm(f => ({ ...f, newEmail: e.target.value }))}
                                style={inp}
                            />
                        </div>
                        <button onClick={handleEmailChange} style={{ width: '100%', padding: '0.65rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: 'white', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', WebkitTapHighlightColor: 'transparent' }}>
                            <FiMail size={14} /> Update Email
                        </button>
                    </div>

                    {/* Change Password */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FiLock size={15} color="#f87171" />
                            </div>
                            <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>Change Password</span>
                        </div>
                        <div style={{ marginBottom: '0.75rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 500 }}>Current Password</label>
                            <input type="password" placeholder="••••••••" value={pwForm.currentPw}
                                onChange={e => setPwForm(f => ({ ...f, currentPw: e.target.value }))} style={inp} />
                        </div>
                        <div style={{ marginBottom: '0.75rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 500 }}>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showNewPw ? 'text' : 'password'}
                                    placeholder="Min. 6 characters"
                                    value={pwForm.newPw}
                                    onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))}
                                    style={{ ...inp, paddingRight: '2.5rem' }}
                                />
                                <button type="button" onClick={() => setShowNewPw(v => !v)}
                                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}>
                                    {showNewPw ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                                </button>
                            </div>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 500 }}>Confirm New Password</label>
                            <input type="password" placeholder="Repeat new password" value={pwForm.confirmPw}
                                onChange={e => setPwForm(f => ({ ...f, confirmPw: e.target.value }))} style={inp} />
                        </div>
                        <button onClick={handlePasswordChange} style={{ width: '100%', padding: '0.65rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', WebkitTapHighlightColor: 'transparent' }}>
                            <FiLock size={14} /> Update Password
                        </button>
                    </div>

                </div>
            </Section>

            {/* Save */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem 2rem', borderRadius: 12, border: 'none', background: saved ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', boxShadow: saved ? '0 4px 16px rgba(34,197,94,0.4)' : '0 4px 16px rgba(239,68,68,0.35)', transition: 'all .25s' }}>
                    {saved ? <><FiCheck size={18} /> Saved!</> : <><FiSave size={18} /> Save Settings</>}
                </button>
            </div>
        </div>
    );
}
