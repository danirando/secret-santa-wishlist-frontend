import { useState } from 'react';
import './GiftForm.css';

const GiftForm = ({ onAddGift }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    link: '',
    priority: 3
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;
    
    onAddGift({
      ...formData,
      price: parseFloat(formData.price)
    });

    // Reset form
    setFormData({
      name: '',
      price: '',
      link: '',
      priority: 3
    });
  };

  return (
    <form className="gift-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Nome Regalo *</label>
        <input
          type="text"
          id="name"
          placeholder="Es. Cuffie Sony..."
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="price">Prezzo (€) *</label>
          <input
            type="number"
            id="price"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priorità (1-5)</label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
          >
            <option value="1">1 - Bassa</option>
            <option value="2">2 - Media-Bassa</option>
            <option value="3">3 - Media</option>
            <option value="4">4 - Alta</option>
            <option value="5">5 - Must Have!</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="link">Link (Opzionale)</label>
        <input
          type="url"
          id="link"
          placeholder="https://amazon.it/..."
          value={formData.link}
          onChange={(e) => setFormData({...formData, link: e.target.value})}
        />
      </div>

      <button type="submit" className="btn btn-primary submit-btn">
        Aggiungi alla Lista 🎁
      </button>
    </form>
  );
};

export default GiftForm;
