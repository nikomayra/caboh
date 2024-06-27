import { useState } from 'react';

const HelpWindow = () => {
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  const toggleHelp = () => {
    setIsHelpVisible(!isHelpVisible);
  };

  return (
    <div>
      <button onClick={toggleHelp}>Help</button>

      {isHelpVisible && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <span style={styles.close} onClick={toggleHelp}>&times;</span>
            <h3>Gameplay...</h3>
            <ul>
                <li>Each player is dealt 4 cards. These cards remain hidden to the player except for 2 initially.</li>
                <li>Draw a card when its your turn. This card is only revealed to you.</li>
                <li>You may swap this card with a card in your hand or, if available, use its ability.</li>
                    <ul>
                        <li>This remaining drawn card is then discarded.</li>
                    </ul>
                <li>Once 2 or more rounds have been played any player may then say press {'"'}Cabo!{'"'}, ending their turn.</li>
                <li>A final round is played back to the player who pressed Cabo! and a winner is declared.</li>
            </ul>
            <h3>Goals:</h3>
            <ul>
                <li>The goal is to have the lowest total value hand at the end of the game.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  modal: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'fixed',
    zIndex: 1,
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
    padding: '20px',
    border: '1px solid #888',
    width: '80%',
    maxWidth: '600px',
    borderRadius: '10px',
    position: 'relative',
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

export default HelpWindow;
