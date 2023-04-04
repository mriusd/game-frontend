import React from 'react';
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import DraggableImage from './DraggableImage';
import Grid from "./Grid";

const ShopModal = ({ isOpen, onClose }) => {
  const [modalContainer, setModalContainer] = useState(null);

    useEffect(() => {
      const container = document.createElement('div');
      const modalRoot = document.getElementById('modal-root');
      modalRoot.appendChild(container);
      setModalContainer(container);

      return () => {
        modalRoot.removeChild(container);
      };
    }, []);

    if (!isOpen || !modalContainer) {
      return null;
    }

    function handleClick(itemId) {
      console.log("click", itemId);
    }

    return ReactDOM.createPortal(
      <div className="custom-modal" >
        <div className="modal-content">
          <div className="modal-header">
            <h2>Ingame Shop</h2>
            <button onClick={onClose}>&times;</button>
          </div>
          <div className="modal-body">
            <Grid isDraggable={false} onClick={handleClick} />
          </div>
        </div>
      </div>,
      modalContainer
    );
};

export default ShopModal;
