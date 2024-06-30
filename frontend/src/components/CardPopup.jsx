import PropTypes from 'prop-types';
import cardService from '../services/cardService';

const CardPopup = ({ revealedCards, onClose }) => {

  return (
    <>
      <div style={styles.modal}>
        <div style={styles.modalContent}>
          <span style={styles.close} onClick={onClose}>&times;</span>
            <div style={styles.cardContainer}>
                {revealedCards.map((card, index) => (
                    <div key={index} style={styles.cards}>
                        <h3 style={{color: 'black'}}>Card Position: {card.index}</h3>
                        <img src={cardService.getCardImageSrc(card)}  style={styles.card}/>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </>
  );
};

const styles = {
    cardContainer: {
        display: 'grid',
        gridAutoFlow: 'column',
    },
    cards: {
        alignSelf: 'center',
    },
    card: {
        maxWidth: '50%',
        height: 'auto',
    },
    modal: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'fixed',
      zIndex: 10,
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      overflow: 'auto',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fefefe',
        margin: 'auto',
        padding: '25px',
        border: '1px solid #888',
        width: '80%',
        maxWidth: '500px',
        maxHeight: '500px',
        borderRadius: '10px',
        position: 'relative',
        overflow: 'hidden',
    },
    close: {
      color: '#aaa',
      float: 'right',
      fontSize: '28px',
      fontWeight: 'bold',
      position: 'absolute',
      top: '10px',
      right: '10px',
      cursor: 'pointer',
    },
};

CardPopup.propTypes = {
    revealedCards: PropTypes.array.isRequired,
    onClose: PropTypes.func.isRequired,
}

export default CardPopup;
