import GiftItem from './GiftItem';
import './GiftList.css';
import './GiftItem.css';

const GiftList = ({ gifts, onRemoveGift, onUpdateGift }) => {
  if (gifts.length === 0) {
    return (
      <div className="empty-state">
        <p>La tua lista è ancora vuota! 😢</p>
        <p className="empty-subtitle">Inizia ad aggiungere qualche regalo qui sopra.</p>
      </div>
    );
  }

  return (
    <ul className="gift-list">
      {gifts.map((gift) => (
        <GiftItem 
          key={gift.id} 
          gift={gift} 
          onRemove={onRemoveGift}
          onUpdate={onUpdateGift}
        />
      ))}
    </ul>
  );
};

export default GiftList;
