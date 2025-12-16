import { useState } from 'react';

const GiftItem = ({ gift, onRemove, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedGift, setEditedGift] = useState({ ...gift });

  const handleSave = () => {
    if (!editedGift.name || !editedGift.price) return;
    onUpdate(editedGift);
    setIsEditing(false);
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    setEditedGift({ ...gift });
    setIsEditing(false);
  };

  const handleEditClick = () => {
    if (!isEditing) setIsEditing(true);
  };

  const handleChange = (field, value) => {
    setEditedGift(prev => ({ ...prev, [field]: value }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  const stopProp = (e) => e.stopPropagation();

  if (isEditing) {
    return (
      <li className="gift-item editing">
        <div className="gift-edit-form">
          <div className="edit-row">
            <div className="edit-group name-group">
              <label className="edit-label">Nome</label>
              <input 
                type="text" 
                className="edit-input" 
                value={editedGift.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nome regalo"
              />
            </div>
            <div className="edit-group priority-group">
              <label className="edit-label">Priorità</label>
              <select 
                value={editedGift.priority}
                onChange={(e) => handleChange('priority', parseInt(e.target.value))}
                className="edit-select"
                onKeyDown={handleKeyDown}
              >
                <option value="1">1 - Bassa</option>
                <option value="2">2 - Media-Bassa</option>
                <option value="3">3 - Media</option>
                <option value="4">4 - Alta</option>
                <option value="5">5 - Massima</option>
              </select>
            </div>
          </div>
          
          <div className="edit-row">
            <div className="edit-group price-group">
              <label className="edit-label">Prezzo (€)</label>
              <input 
                type="number" 
                min="0" 
                step="0.01" 
                className="edit-input" 
                value={editedGift.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="edit-group link-group">
              <label className="edit-label">Link</label>
              <input 
                type="url" 
                className="edit-input" 
                value={editedGift.link}
                onChange={(e) => handleChange('link', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="edit-actions">
            <button className="btn-small cancel" onClick={handleCancel}>Annulla</button>
            <button className="btn-small save" onClick={handleSave}>Salva</button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="gift-item view-mode">
      <div className="gift-details">
        <div className="gift-header">
          <span className="gift-name">{gift.name}</span>
          <span className={`priority-badge p-${gift.priority}`}>
                {Array(gift.priority).fill('★').join('')}
          </span>
        </div>
        <div className="gift-meta">
          <span className="gift-price">€ {gift.price.toFixed(2)}</span>
          {gift.link && (
            <a 
              href={gift.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="gift-link"
              onClick={stopProp} 
            >
              Link ↗
            </a>
          )}
        </div>
      </div>
      <div className="item-actions">
        <button 
          className="icon-btn edit-btn"
          onClick={handleEditClick}
          aria-label="Modifica regalo"
          title="Modifica"
        >
          ✏️
        </button>
        <button 
          className="icon-btn delete-btn"
          onClick={(e) => { stopProp(e); onRemove(gift.id); }}
          aria-label="Rimuovi regalo"
          title="Elimina"
        >
          ✕
        </button>
      </div>
    </li>
  );
};

export default GiftItem;
