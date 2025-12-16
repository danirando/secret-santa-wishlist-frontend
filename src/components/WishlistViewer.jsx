import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './WishlistViewer.css';

const WishlistViewer = () => {
    const { uuid } = useParams();
    const [wishlist, setWishlist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch wishlist data using uuid
    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/wishlists/${uuid}`);
                if (!response.ok) {
                    if (response.status === 404) throw new Error("Lista non trovata");
                    throw new Error("Errore nel caricamento della lista");
                }
                const data = await response.json();
                setWishlist(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (uuid) {
            fetchWishlist();
        }
    }, [uuid]);

    const handleBookGift = async (giftId) => {
        const message = prompt("Vuoi lasciare un messaggio per il proprietario? (Opzionale)");
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/gifts/${giftId}/book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ booked_message: message || "" }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Impossibile prenotare il regalo");
            }
            
            // Optimistic update or refetch
            setWishlist(prev => ({
                ...prev,
                gifts: prev.gifts.map(g => 
                    g.id === giftId ? { ...g, is_booked: true } : g
                )
            }));
            
            alert("Regalo prenotato con successo! 🎅");

        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="loading-state">Caricamento lista in corso... ⏳</div>;
    
    if (error) return (
        <div className="error-state">
            <h2>Oh no! 😕</h2>
            <p>{error}</p>
            <Link to="/" className="btn btn-primary">Torna alla Home</Link>
        </div>
    );

    if (!wishlist) return null;

    return (
        <div className="wishlist-viewer container">
            <header className="viewer-header">
                <span className="santa-icon">🎅</span>
                <h1>{wishlist.title || "Lista dei Desideri"}</h1>
                <p className="viewer-subtitle">
                    Lista di <strong>{wishlist.owner_name}</strong>
                </p>
            </header>

            <main className="viewer-main">
                <ul className="viewer-gift-list">
                    {wishlist.gifts && wishlist.gifts.map(gift => (
                        <li key={gift.id} className={`viewer-gift-item ${gift.is_booked ? 'booked' : ''}`}>
                            <div className="viewer-gift-details">
                                <div className="viewer-gift-top">
                                    <span className="viewer-gift-name">{gift.name}</span>
                                    <span className="priority-stars">
                                        {Array(gift.priority).fill('★').join('')}
                                    </span>
                                </div>
                                <div className="viewer-gift-meta">
                                    <span className="viewer-gift-price">
                                        {gift.price ? `€ ${parseFloat(gift.price).toFixed(2)}` : 'Prezzo N/A'}
                                    </span>
                                    {gift.link && (
                                        <a href={gift.link} target="_blank" rel="noopener noreferrer" className="viewer-link">
                                            Vedi Link ↗
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="viewer-gift-action">
                                {gift.is_booked ? (
                                    <span className="booked-badge">❌ Già preso</span>
                                ) : (
                                    <button 
                                        className="btn btn-primary"
                                        onClick={() => handleBookGift(gift.id)}
                                    >
                                        Prenota 🎁
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </main>
            
            <footer className="viewer-footer">
                <Link to="/">Crea la tua lista!</Link>
            </footer>
        </div>
    );
};

export default WishlistViewer;
