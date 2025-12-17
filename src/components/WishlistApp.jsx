import { useState, useEffect } from 'react';
import GiftForm from './GiftForm';
import GiftList from './GiftList';
import ConfirmModal from './ConfirmModal';
import './WishlistApp.css';

const WishlistApp = () => {
  const [wishlistTitle, setWishlistTitle] = useState(() => {
    return localStorage.getItem('secret-santa-title') || "La mia Lista Desideri";
  });

  const [ownerName, setOwnerName] = useState(() => {
    return localStorage.getItem('secret-santa-owner') || "";
  });
  
  const [gifts, setGifts] = useState(() => {
    const saved = localStorage.getItem('secret-santa-gifts');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      { id: crypto.randomUUID(), name: "Cuffie Bluetooth", price: 59.99, priority: 5, link: "" },
      { id: crypto.randomUUID(), name: "Libro: Clean Code", price: 30.00, priority: 3, link: "" }
    ];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedLink, setPublishedLink] = useState(null);

  // Liste pubblicate salvate in localStorage (bonus)
  const [savedLists, setSavedLists] = useState(() => {
    const saved = localStorage.getItem('secret-santa-published-lists');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('secret-santa-title', wishlistTitle);
  }, [wishlistTitle]);

  useEffect(() => {
    localStorage.setItem('secret-santa-owner', ownerName);
  }, [ownerName]);

  useEffect(() => {
    localStorage.setItem('secret-santa-gifts', JSON.stringify(gifts));
  }, [gifts]);

  const addGift = (newGift) => {
    setGifts([...gifts, { ...newGift, id: crypto.randomUUID() }]);
  };

  const removeGift = (id) => {
    setGifts(gifts.filter(gift => gift.id !== id));
  };

  const updateGift = (updatedGift) => {
    setGifts(gifts.map(gift => gift.id === updatedGift.id ? updatedGift : gift));
  };

  const handleResetRequest = () => {
    setIsModalOpen(true);
  };

  const confirmReset = () => {
    setGifts([]);
    setWishlistTitle("La mia Lista Desideri");
    localStorage.removeItem('secret-santa-gifts');
    localStorage.removeItem('secret-santa-title');
    setIsModalOpen(false);
  };

  const handlePublish = async () => {
    if (!ownerName.trim()) {
      alert("Inserisci il tuo nome prima di pubblicare!");
      return;
    }
    
    setIsPublishing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/wishlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: wishlistTitle,
          owner_name: ownerName,
          gifts: gifts
        }),
      });

      if (!response.ok) {
        // Try to get detailed error message from backend
        const contentType = response.headers.get("content-type");
        let errorMessage = 'Errore durante la pubblicazione';
        
        if (contentType && contentType.includes("application/json")) {
            const errData = await response.json();
            console.error("Backend Error JSON:", errData);
            errorMessage = errData.message || errorMessage;
        } else {
            const errText = await response.text();
            console.error("Backend Error Text:", errText);
            errorMessage = `Errore Server ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Risposta Backend:", data); // Debugging

      // Handle potential 'data' wrapper from Laravel Resources
      const uuid = data.token;

      if (!uuid) {
        alert("Errore: Il backend non ha restituito un UUID valido. Controlla la console.");
        return;
      }

      const shareUrl = `${window.location.origin}/wishlist/${uuid}`;
      
      setPublishedLink(shareUrl);

      // Salva la lista pubblicata tra le "liste salvate"
      setSavedLists(prev => {
        const updated = [
          {
            uuid,
            title: wishlistTitle || "La mia Lista Desideri",
            url: shareUrl,
            createdAt: new Date().toISOString(),
          },
          // Evita duplicati per lo stesso uuid
          ...prev.filter(list => list.uuid !== uuid),
        ];
        localStorage.setItem('secret-santa-published-lists', JSON.stringify(updated));
        return updated;
      });
      
      // Cleanup draft after successful publish
      setGifts([]);
      setWishlistTitle("La mia Lista Desideri");
      // Note: useEffects will automatically update localStorage with these empty/default values
      
    } catch (error) {
      console.error(error);
      alert("C'è stato un problema durante la pubblicazione. Controlla che il backend sia attivo.");
    } finally {
      setIsPublishing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publishedLink);
    alert("Link copiato!");
  };

  const handleWebShare = () => {
    if (!publishedLink) return;

    if (navigator.share) {
      navigator.share({
        title: 'La mia lista Secret Santa',
        text: 'Guarda la mia lista dei desideri 🎄',
        url: publishedLink,
      }).catch(() => {
        // Ignora errori dell'utente che chiude la share sheet
      });
    } else {
      // Fallback: copia negli appunti
      navigator.clipboard?.writeText(publishedLink);
      alert("Link copiato!");
    }
  };

  if (publishedLink) {
    return (
      <div className="wishlist-app success-view">
        <div className="card success-card">
          <h1>🎉 Lista Pubblicata! 🎉</h1>
          <p>La tua lista dei desideri è pronta per essere condivisa.</p>
          
          <div className="share-link-box">
            <input type="text" readOnly value={publishedLink} />
            <button className="btn btn-primary" onClick={copyToClipboard}>Copia Link</button>
          </div>

          <button 
            className="btn btn-secondary" 
            onClick={handleWebShare}
            style={{ marginTop: '0.75rem' }}
          >
            Condividi 🔗
          </button>
          
          <button 
            className="btn-text" 
            onClick={() => setPublishedLink(null)} 
            style={{marginTop: '1rem'}}
          >
            Torna alla modifica
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-app">
      <header className="app-header">
        <div className="header-inputs">
            <input 
            type="text" 
            className="title-input"
            value={wishlistTitle} 
            onChange={(e) => setWishlistTitle(e.target.value)}
            placeholder="Nome della Lista..."
            />
            <input 
            type="text" 
            className="owner-input"
            value={ownerName} 
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="Il tuo nome"
            />
        </div>
        <p className="subtitle">Aggiungi i regali che vorresti ricevere!</p>
      </header>
      
      <main className="app-main">
        <section className="form-section">
          <h2>Aggiungi Regalo</h2>
          <GiftForm onAddGift={addGift} />
        </section>

        <section className="list-section">
          <div className="list-header">
            <h2>I tuoi Desideri ({gifts.length})</h2>
            {gifts.length > 0 && (
              <button className="btn-text danger" onClick={handleResetRequest}>
                Svuota Lista
              </button>
            )}
          </div>
          <GiftList 
            gifts={gifts} 
            onRemoveGift={removeGift} 
            onUpdateGift={updateGift}
          />
        </section>

        {savedLists.length > 0 && (
          <section className="saved-lists-section">
            <h2>Le tue liste pubblicate</h2>
            <ul className="saved-lists">
              {savedLists.map(list => (
                <li key={list.uuid} className="saved-list-item">
                  <div className="saved-list-info">
                    <div className="saved-list-title">{list.title}</div>
                    {list.createdAt && (
                      <div className="saved-list-meta">
                        Creata il {new Date(list.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="saved-list-actions">
                    <a 
                      href={list.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-secondary"
                    >
                      Apri
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="publish-section">
            <button 
                className="btn btn-primary publish-btn" 
                onClick={handlePublish}
                disabled={gifts.length === 0 || !ownerName.trim() || isPublishing}
            >
                {isPublishing ? 'Pubblicazione in corso...' : '🚀 Pubblica Lista'}
            </button>
        </div>
      </main>

      <ConfirmModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmReset}
        title="Svuotare la lista?"
        message="Sei sicuro di voler cancellare tutti i regali? Questa azione non può essere annullata."
      />
    </div>
  );
};

export default WishlistApp;
