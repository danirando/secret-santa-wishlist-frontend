import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './WishlistViewer.css';

const WishlistViewer = () => {
    const { uuid } = useParams();
    const [wishlist, setWishlist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Stato per la modale di prenotazione
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedGift, setSelectedGift] = useState(null);
    const [bookingMessage, setBookingMessage] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);

    // Modale semplice per messaggi (successo/errore)
    const [infoModal, setInfoModal] = useState({
        isOpen: false,
        title: '',
        message: '',
    });

    // Fetch wishlist data using uuid
    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/wishlist/${uuid}`);
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

    const openBookingModal = (gift) => {
        setSelectedGift(gift);
        setBookingMessage('');
        setIsBookingModalOpen(true);
    };

    const closeBookingModal = () => {
        if (bookingLoading) return;
        setIsBookingModalOpen(false);
        setSelectedGift(null);
        setBookingMessage('');
    };

    const handleConfirmBooking = async () => {
        if (!selectedGift) return;

        setBookingLoading(true);
        const id = selectedGift.id;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/gifts/${id}/book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ booked_message: bookingMessage || "" }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Impossibile prenotare il regalo");
            }
            
            // Optimistic update o refetch
            setWishlist(prev => ({
                ...prev,
                gifts: prev.gifts.map(g => 
                    g.id === id ? { ...g, is_booked: true } : g
                )
            }));

            setInfoModal({
                isOpen: true,
                title: "Regalo prenotato! 🎅",
                message: "Hai prenotato con successo questo regalo. Grazie per la tua gentilezza!",
            });
            closeBookingModal();
        } catch (err) {
            setInfoModal({
                isOpen: true,
                title: "Errore nella prenotazione",
                message: err.message || "Si è verificato un errore durante la prenotazione del regalo.",
            });
        } finally {
            setBookingLoading(false);
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
                                    <button
                                        type="button"
                                        className="btn btn-secondary booked-button"
                                        disabled
                                    >
                                        Già prenotato
                                    </button>
                                ) : (
                                    <button 
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => openBookingModal(gift)}
                                    >
                                        Prenota 🎁
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </main>
            
            {/* Modale di prenotazione regalo */}
            {isBookingModalOpen && selectedGift && (
                <div className="modal-overlay" onClick={closeBookingModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>🎁 Prenota questo regalo</h3>
                        <p>
                            Stai prenotando: <strong>{selectedGift.name}</strong>
                        </p>
                        <label className="booking-message-label">
                            Aggiungi un messaggio di auguri (opzionale)
                            <textarea
                                className="booking-message-textarea"
                                placeholder="Scrivi un messaggio carino per il proprietario della lista..."
                                value={bookingMessage}
                                onChange={e => setBookingMessage(e.target.value)}
                                rows={4}
                            />
                        </label>
                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                type="button"
                                onClick={closeBookingModal}
                                disabled={bookingLoading}
                            >
                                Annulla
                            </button>
                            <button
                                className="btn btn-primary"
                                type="button"
                                onClick={handleConfirmBooking}
                                disabled={bookingLoading}
                            >
                                {bookingLoading ? "Prenotazione..." : "Conferma prenotazione"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modale semplice informativa (successo/errore) */}
            {infoModal.isOpen && (
                <div
                    className="modal-overlay"
                    onClick={() => setInfoModal(prev => ({ ...prev, isOpen: false }))}
                >
                    <div
                        className="modal-content"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3>{infoModal.title}</h3>
                        <p>{infoModal.message}</p>
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => setInfoModal(prev => ({ ...prev, isOpen: false }))}
                            >
                                Ok
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <footer className="viewer-footer">
                <Link to="/">Crea la tua lista!</Link>
            </footer>
        </div>
    );
};

export default WishlistViewer;
