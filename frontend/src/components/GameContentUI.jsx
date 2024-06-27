import {useState} from 'react';
import gameApi from '../api/gameApi';
import PropTypes from 'prop-types';
import cardService from '../services/cardService';
import './GameContentUI.css'
import tabletop from '../assets/tabletop.jpg'
import Player from './Player';

const GameContentUI = ({gameId, fetchGameState, playersState = [], gameStartedState, discardCardState, notify}) =>{

    const [drawnCardState, setDrawnCardState] = useState(null);
    const [hasAbility, setHasAbility] = useState(false);

    const handleDrawCard = async()=>{
        try{
            const drawnCard = await gameApi.drawCard(gameId);
            setDrawnCardState(drawnCard);
            hasAbilityCheck(drawnCard);
            fetchGameState();
        }catch(error){
            notify('Error drawing card...', 'error');
        }
    }
    
    const handleDiscardCard = async()=>{
        await gameApi.discardCard(gameId);
        setDrawnCardState(null);
        fetchGameState();
    }
    
    /*
    NEED TO UPDATE: 
    THIS PLAYER HAND BUTTONS SHOULD PROBABLY just set useState variables for 'targetCard1' and 'targetCard2'
    There are 5 different player turn options which would require a target card...
    2. Draw card > swap with hand card > end turn
    3. Draw card > view one of own cards (7/8) > discard > end turn
    4. Draw card > view one of other player cards (9/10) > discard > end turn
    5. Draw card > swap any two cards between hands including your own (J/Q) > discard > end turn
    6. Draw card > view one of other player cards & swap with hand card [optional] (BK) > discard > end turn

    Only 3 are swap actions...
    #2, 5, 6
    Maybe we have a single handleCardSwap function, if its a J/Q/BK
    
    Lets have a function that just checks if its a card with an ability when drawn, and unhides a
    use ability button (and maybe a useState to disable the discard button?).
    Then either they can do a view card function or a swap function.
    We can have two handlers for that
    handleCardSwap -> takes in 
    */
    const handleCardSwap = async(cardIndex)=>{ 
        const swappedCard = await gameApi.swapCard(gameId, cardIndex);
        setDrawnCardState(swappedCard);
        fetchGameState();
    }

    const handleUseAbility = () => {
        setHasAbility(false);
    }

    const handleHandCardAction = () => {
        //TBD
    }

    const hasAbilityCheck = (card) => {
        setHasAbility(cardService.checkIfCardHasAbility(card));
    }

    const gameUI = () =>{
        return(
            <div className="game-content-grid-container">
                <div className="left-side-UI">
                    <button className="discard-card" onClick={handleDiscardCard}>
                        <span>Discard Pile</span>
                        <img src={cardService.getCardImageSrc(discardCardState)} alt='Discard Pile'/>
                    </button>
                    <button 
                        className={`drawn-card ${hasAbility ? 'glow' : ''}`} 
                        onClick={handleUseAbility}
                        disabled={!hasAbility}
                    >
                        <span>Drawn Card</span>
                        <img src={cardService.getCardImageSrc(drawnCardState)} alt='Drawn Card'/>
                    </button>
                    <button className="draw-pile" onClick={handleDrawCard}>
                        <span>Draw Pile</span>
                        <img src={cardService.getCardBackImageSrc()} alt='Draw Pile'/>
                    </button>
                </div>
                <div className="right-side-UI">
                    <div className="players">
                        {/* {playersState.length > 0 && playersState.map((player, index) => (
                            <Player key={index} playerName={player.username} cardHandAction={handleHandCardAction} />
                        ))} */}
                        <Player key={1} playerName={'111'} cardHandAction={handleHandCardAction} />
                        <Player key={2} playerName={'222'} cardHandAction={handleHandCardAction} />
                        <Player key={3} playerName={'333'} cardHandAction={handleHandCardAction} />
                        <Player key={4} playerName={'444'} cardHandAction={handleHandCardAction} />
                        <Player key={5} playerName={'5555555555'} cardHandAction={handleHandCardAction} />
                        <Player key={6} playerName={'666'} cardHandAction={handleHandCardAction} />
                    </div>
                    <div className="previous-actions">
                        <span>DISPLAYS ACTIONS OF PREVIOUS TURN FOR ALL PLAYERS TO SEE WHAT HAPPENED...</span>
                    </div>
                </div>
            </div>
        )
      }

      const lobbyUI = () =>{
        return(
          <div>
            {playerList()}
          </div>
        )
      }

      const playerList = () =>{
        return(
            <div>
                <h2>Players:</h2>
                {playersState.length > 0 ? (
                <ol>
                    {playersState.map((player, index) => (
                    <li key={index}><h3>{player.username}</h3></li>))}
                </ol>) : (<p>No players have joined yet.</p>)}
            </div>
        )
      }
    
    return(
        <>
          {gameStartedState ? gameUI() : lobbyUI()}
        </>
    )
}

GameContentUI.propTypes = {
    gameId: PropTypes.string.isRequired,
    fetchGameState: PropTypes.func.isRequired,
    gameStartedState: PropTypes.bool.isRequired,
    playersState: PropTypes.array.isRequired,
    discardCardState: PropTypes.object,
    notify: PropTypes.func.isRequired,
}

export default GameContentUI;


/* {!gameStartedState && (
    <button onClick={startGame}>Start Game</button>
  )}
  {gameStartedState &&
  <div>
    <h3>Game started!</h3>
    {userNameState === whoseTurnState && <button onClick={handleEndTurn}>End Turn</button>}
    {userNameState === whoseTurnState && <button onClick={handleDrawCard}>Draw Card</button>}
    {userNameState === whoseTurnState && <button onClick={handleDisCard}>Discard Card</button>}
    {<p>Drawn Card: {JSON.stringify(drawnCardState)}</p>}
    {<p>Discard Pile: {JSON.stringify(disCardState)}</p>}
  </div> */