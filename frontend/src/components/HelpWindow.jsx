import { useState } from 'react';
import './HelpWindow.css'

const HelpWindow = () => {
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  const toggleHelp = () => {
    setIsHelpVisible(!isHelpVisible);
  };

  return (
    <>
      <button className='button' onClick={toggleHelp}>Help</button>

      {isHelpVisible && (
        <div className='modal'>
          <div className='modal-content'>
            <span className='close' onClick={toggleHelp}>&times;</span>
            <h3>Gameplay...</h3>
            <ul>
                <li>Create game, join game and start game. Minimum 2 players to start game. Only player 1 can start game. Game periodically updates, take your time.</li>
                <li>Each player is dealt 4 cards. These cards remain hidden to the player except for 2 initially.</li>
                <li>Draw a card when its your turn (highlights green - bottom). This card is only revealed to you.</li>
                <li>You may perform one of three actions:</li>
                  <ul>
                    <li>1. Discard this card.</li>
                    <li>2. Swap this card with one from your hand.</li>
                    <li>3. Use this cards ability.</li>
                  </ul>
                <li>Ability cards glow blue, press it to activate and use.</li>
                <li>Once 2 or more rounds have been played any player may then press {'"'}Caboh!{'"'} before drawing a card, ending their turn.</li>
                <li>A final round is played back to the player who pressed {'"'}Caboh!{'"'} and a winner is declared.</li>
            </ul>
            <h3>Goals:</h3>
            <ul>
                <li>The goal is to have the lowest total value hand at the end of the game.</li>
                <ul>
                    <li>Aces are 1 point.</li>
                    <li>Red Kings are 0 points.</li>
                    <li>The rest are standard values.</li>
                </ul>
            </ul>
            <br/>
            <div  style={{fontStyle: 'italic'}}>
              <p>Caboh game rules loosely based on golf card game</p>
              <p>Card graphics by Freepik</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpWindow;
