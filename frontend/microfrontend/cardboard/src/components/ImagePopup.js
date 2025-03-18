import React, { useState } from 'react';

function ImagePopup({ onClose }) {
  const [selectedCard, setSelectedCard] = React.useState(null);

  return (
    <div className={`popup popup_type_image ${selectedCard ? 'popup_is-opened' : ''}`}>
      <div className="popup__content popup__content_content_image">
        <button type="button" className="popup__close" onClick={onClose}></button>
        <img alt={selectedCard ? selectedCard.name : ''} src={selectedCard ? selectedCard.link : ''} className="popup__image" />
        <p className="popup__caption">{selectedCard ? selectedCard.name : ''}</p>
      </div>
    </div>
  );
}

export default ImagePopup;
