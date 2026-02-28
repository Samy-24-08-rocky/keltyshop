import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { FiX, FiCamera, FiLoader, FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

// Map Open Food Facts categories → our store categories
const mapCategory = (tags = []) => {
    const t = tags.join(' ').toLowerCase();
    if (t.includes('meat') || t.includes('beef') || t.includes('chicken') || t.includes('pork') || t.includes('lamb')) return 'Meat';
    if (t.includes('seafood') || t.includes('fish') || t.includes('salmon') || t.includes('tuna') || t.includes('prawn')) return 'Seafood';
    if (t.includes('dairy') || t.includes('milk') || t.includes('cheese') || t.includes('yogurt') || t.includes('butter') || t.includes('cream')) return 'Dairy';
    if (t.includes('bakery') || t.includes('bread') || t.includes('biscuit') || t.includes('cake') || t.includes('pastry')) return 'Bakery';
    if (t.includes('beverage') || t.includes('drink') || t.includes('juice') || t.includes('water') || t.includes('soda') || t.includes('coffee') || t.includes('tea')) return 'Drinks';
    if (t.includes('snack') || t.includes('crisp') || t.includes('chip') || t.includes('chocolate') || t.includes('candy') || t.includes('sweet')) return 'Snacks';
    if (t.includes('condiment') || t.includes('sauce') || t.includes('ketchup') || t.includes('mayo') || t.includes('vinegar') || t.includes('mustard')) return 'Condiments';
    if (t.includes('breakfast') || t.includes('cereal') || t.includes('oat') || t.includes('granola')) return 'Breakfast';
    if (t.includes('frozen')) return 'Frozen';
    return 'Pantry';
};

export default function BarcodeScanner({ onProductScanned, onClose }) {
    const [phase, setPhase] = useState('scanning'); // scanning | fetching | success | error | manual
    const [statusMsg, setStatusMsg] = useState('Point your camera at a product barcode');
    const [scannedBarcode, setScannedBarcode] = useState('');
    const [manualBarcode, setManualBarcode] = useState('');
    const [product, setProduct] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const scannerRef = useRef(null);
    const html5QrRef = useRef(null);
    const hasScanned = useRef(false);

    // Start camera scanner
    useEffect(() => {
        if (phase !== 'scanning') return;
        hasScanned.current = false;

        const qr = new Html5Qrcode('qr-reader');
        html5QrRef.current = qr;

        qr.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 260, height: 140 } },
            (decodedText) => {
                if (hasScanned.current) return;
                hasScanned.current = true;
                stopCamera();
                fetchProduct(decodedText);
            },
            () => { /* ignore scan errors */ }
        ).catch(err => {
            setPhase('manual');
            setErrorMsg('Camera not accessible. Enter barcode manually.');
        });

        return () => stopCamera();
    }, [phase === 'scanning']);

    const stopCamera = () => {
        if (html5QrRef.current) {
            html5QrRef.current.stop().catch(() => { });
            html5QrRef.current = null;
        }
    };

    const fetchProduct = async (barcode) => {
        setScannedBarcode(barcode);
        setPhase('fetching');
        setStatusMsg(`Found barcode: ${barcode} — Looking up product…`);
        try {
            const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
            const data = await res.json();

            if (data.status !== 1 || !data.product) {
                throw new Error('Product not found in database');
            }

            const p = data.product;
            const name = p.product_name_en || p.product_name || p.abbreviated_product_name || '';
            const brand = p.brands || '';
            const imageUrl = p.image_front_url || p.image_url || '';
            const categoryTags = [
                ...(p.categories_tags || []),
                ...(p.food_groups_tags || []),
                ...(p.pnns_groups_2_tags || []),
            ];

            if (!name) throw new Error('Product name not available in database');

            const productData = {
                name: brand ? `${brand} ${name}` : name,
                image: imageUrl,
                category: mapCategory(categoryTags),
                barcode,
                price: '',
                oldPrice: '',
                stock: '',
                rating: '4.5',
                featured: false,
            };

            setProduct(productData);
            setPhase('success');
        } catch (err) {
            setPhase('error');
            setErrorMsg(err.message || 'Failed to fetch product data');
        }
    };

    const handleUseProduct = () => {
        onProductScanned(product);
        onClose();
    };

    const handleManualLookup = (e) => {
        e.preventDefault();
        if (manualBarcode.trim()) {
            stopCamera();
            fetchProduct(manualBarcode.trim());
        }
    };

    const resetScanner = () => {
        setPhase('scanning');
        setProduct(null);
        setErrorMsg('');
        setScannedBarcode('');
        setManualBarcode('');
    };

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, padding: '1rem',
        }}>
            <div style={{
                background: 'linear-gradient(180deg, #1a2537 0%, #0f172a 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 24,
                width: '100%', maxWidth: 500,
                maxHeight: '92vh', overflowY: 'auto',
                boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <FiCamera size={18} color="white" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem' }}>Barcode Scanner</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Scan to auto-fill product details</div>
                        </div>
                    </div>
                    <button onClick={() => { stopCamera(); onClose(); }} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '0.5rem', color: '#94a3b8', cursor: 'pointer' }}>
                        <FiX size={18} />
                    </button>
                </div>

                <div style={{ padding: '1.5rem' }}>

                    {/* ── SCANNING phase ── */}
                    {phase === 'scanning' && (
                        <>
                            <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: '1rem', background: '#000' }}>
                                <div id="qr-reader" style={{ width: '100%' }} />
                                {/* Corner brackets overlay */}
                                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                                    {[
                                        { top: 16, left: 16, borderTop: '3px solid #6366f1', borderLeft: '3px solid #6366f1' },
                                        { top: 16, right: 16, borderTop: '3px solid #6366f1', borderRight: '3px solid #6366f1' },
                                        { bottom: 16, left: 16, borderBottom: '3px solid #6366f1', borderLeft: '3px solid #6366f1' },
                                        { bottom: 16, right: 16, borderBottom: '3px solid #6366f1', borderRight: '3px solid #6366f1' },
                                    ].map((s, i) => (
                                        <div key={i} style={{ position: 'absolute', width: 24, height: 24, borderRadius: 3, ...s }} />
                                    ))}
                                </div>
                            </div>
                            <div style={{
                                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                                borderRadius: 12, padding: '0.875rem', textAlign: 'center',
                                color: '#a5b4fc', fontSize: '0.82rem', marginBottom: '1.25rem',
                            }}>
                                📷 {statusMsg}
                            </div>
                            <div style={{ textAlign: 'center', color: '#475569', fontSize: '0.8rem', marginBottom: '0.75rem' }}>— or enter barcode manually —</div>
                            <form onSubmit={handleManualLookup} style={{ display: 'flex', gap: '0.625rem' }}>
                                <input
                                    type="text"
                                    placeholder="e.g. 5000112637922"
                                    value={manualBarcode}
                                    onChange={e => setManualBarcode(e.target.value)}
                                    style={{
                                        flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 10, padding: '0.65rem 0.875rem', color: '#f1f5f9', fontSize: '0.875rem', outline: 'none',
                                    }}
                                />
                                <button type="submit" style={{
                                    background: 'linear-gradient(135deg,#6366f1,#4f46e5)', border: 'none',
                                    borderRadius: 10, padding: '0.65rem 1rem', color: 'white',
                                    fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap',
                                }}>Look Up</button>
                            </form>
                        </>
                    )}

                    {/* ── FETCHING phase ── */}
                    {phase === 'fetching' && (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: '50%',
                                background: 'rgba(99,102,241,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1.25rem',
                                animation: 'spin 1s linear infinite',
                            }}>
                                <FiLoader size={28} color="#6366f1" />
                            </div>
                            <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: '0.5rem' }}>Looking up product…</div>
                            <div style={{ color: '#64748b', fontSize: '0.82rem' }}>Barcode: <code style={{ color: '#a5b4fc' }}>{scannedBarcode}</code></div>
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    )}

                    {/* ── SUCCESS phase ── */}
                    {phase === 'success' && product && (
                        <>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
                                borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1.25rem',
                                color: '#86efac', fontSize: '0.82rem',
                            }}>
                                <FiCheckCircle size={16} /> Product found! Review details below.
                            </div>

                            {product.image && (
                                <img src={product.image} alt={product.name}
                                    style={{ width: '100%', height: 180, objectFit: 'contain', borderRadius: 12, background: '#fff', marginBottom: '1rem' }}
                                    onError={e => e.target.style.display = 'none'}
                                />
                            )}

                            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '1rem', marginBottom: '1.25rem' }}>
                                {[
                                    { label: 'Product Name', value: product.name },
                                    { label: 'Category', value: product.category },
                                    { label: 'Barcode', value: product.barcode },
                                ].map(({ label, value }) => (
                                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{label}</span>
                                        <span style={{ color: '#e2e8f0', fontSize: '0.8rem', fontWeight: 600, maxWidth: '60%', textAlign: 'right' }}>{value}</span>
                                    </div>
                                ))}
                                <div style={{ padding: '0.625rem 0 0', color: '#94a3b8', fontSize: '0.75rem' }}>
                                    💡 Price and stock will need to be filled manually after import.
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button onClick={resetScanner} style={{
                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    padding: '0.75rem', borderRadius: 12,
                                    border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                                    color: '#94a3b8', cursor: 'pointer', fontWeight: 500,
                                }}>
                                    <FiRefreshCw size={15} /> Scan Again
                                </button>
                                <button onClick={handleUseProduct} style={{
                                    flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    padding: '0.75rem', borderRadius: 12, border: 'none',
                                    background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                                    color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                                    boxShadow: '0 4px 16px rgba(34,197,94,0.3)',
                                }}>
                                    <FiCheckCircle size={16} /> Use This Product
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── ERROR phase ── */}
                    {phase === 'error' && (
                        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: '50%',
                                background: 'rgba(239,68,68,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1.25rem',
                            }}>
                                <FiAlertCircle size={28} color="#ef4444" />
                            </div>
                            <div style={{ color: '#f87171', fontWeight: 600, marginBottom: '0.5rem' }}>Product Not Found</div>
                            <div style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '1.5rem' }}>{errorMsg}</div>
                            <div style={{ color: '#475569', fontSize: '0.78rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '0.75rem' }}>
                                Barcode <code style={{ color: '#a5b4fc' }}>{scannedBarcode}</code> was not found in Open Food Facts.<br />
                                You can add the product manually after closing the scanner.
                            </div>
                            <button onClick={resetScanner} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                margin: '0 auto', padding: '0.75rem 1.5rem', borderRadius: 12, border: 'none',
                                background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                                color: 'white', cursor: 'pointer', fontWeight: 600,
                            }}>
                                <FiRefreshCw size={15} /> Try Again
                            </button>
                        </div>
                    )}

                    {/* ── MANUAL FALLBACK phase ── */}
                    {phase === 'manual' && (
                        <div style={{ padding: '0.5rem 0' }}>
                            <div style={{
                                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
                                borderRadius: 12, padding: '0.875rem', marginBottom: '1.25rem',
                                color: '#fcd34d', fontSize: '0.82rem',
                            }}>
                                ⚠️ {errorMsg}
                            </div>
                            <form onSubmit={handleManualLookup} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>Enter Barcode Number</label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="e.g. 5000112637922"
                                    value={manualBarcode}
                                    onChange={e => setManualBarcode(e.target.value)}
                                    style={{
                                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                                        borderRadius: 12, padding: '0.875rem 1rem', color: '#f1f5f9',
                                        fontSize: '0.95rem', outline: 'none', letterSpacing: '0.05em',
                                    }}
                                />
                                <button type="submit" style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    padding: '0.8rem', borderRadius: 12, border: 'none',
                                    background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                                    color: 'white', cursor: 'pointer', fontWeight: 600,
                                }}>
                                    Look Up Product
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
