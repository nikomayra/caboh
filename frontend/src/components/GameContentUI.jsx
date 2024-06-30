import {useState, useEffect, useCallback} from 'react';
import gameApi from '../api/gameApi';
import PropTypes from 'prop-types';
import cardService from '../services/cardService';
import './GameContentUI.css'
import Player from './Player';
import CardPopup from './CardPopup';
import storage from '../services/storage';

const GameContentUI = ({gameId, isPlayerInGame,  fetchGameState, playersState = [], checkIfMyTurn, gameStartedState, discardCardState, notify}) =>{

    const [drawnCardState, setDrawnCardState] = useState(null);
    const [hasAbility, setHasAbility] = useState(false);
    const [Ability, setAbility] = useState('');
    const [revealedCards, setRevealedCards] = useState([])

    const [JQSelection, setJQSelection] = useState({ count: 0, targetNames: [], targetIndexes: [] });

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
    
    const handleDiscardCard = useCallback(async () => {
        await gameApi.discardCard(gameId);
        setDrawnCardState(null);
        if (hasAbility) setHasAbility(false);
        fetchGameState();
    }, [gameId, hasAbility, fetchGameState]);

    const handleUseAbility = async() => {
        if (drawnCardState.value === '7' || drawnCardState.value === '8'){
            notify('Ability: Press one of your own cards to view it.', 'success', 5000);
            setAbility('78');
        }
        if (drawnCardState.value === '9' || drawnCardState.value === '10'){
            notify('Ability: Press another player\'s card to view it.', 'success', 5000);
            setAbility('910');
        }
        if (drawnCardState.value === 'J' || drawnCardState.value === 'Q'){
            notify('Ability: Press any TWO cards on the table to swap them.', 'success', 5000);
            setAbility('JQ');
        }
        if ((drawnCardState.suit === 'Spades' || drawnCardState.suit === 'Clubs') && (drawnCardState.value === 'K')){ // Black King
            notify('Ability: Press another player\'s card to view it.\nAND optionally swap with one of your cards.', 'success', 5000);
            setAbility('BK');
        }
        setHasAbility(false);
    }

    const handleHandCardAction = (playerName, cardIndex) => {
        switch (Ability) {
            case '78':
                if(storage.loadPlayer().Player.username !== playerName){
                    notify('You can only view your own card with this ability...', 'error', 5000);
                }else{
                    handleViewCard(null, cardIndex); //null for target - defaults to self in backend.
                    setAbility('');
                }
                break;
            case '910':
                if(storage.loadPlayer().Player.username === playerName){
                    notify('You can only view another player\'s card with this ability...', 'error', 5000);
                }else{
                    handleViewCard(playerName, cardIndex);
                    setAbility('');
                }
                break;
            case 'JQ':
                if (JQSelection.count === 1 && JQSelection.targetNames[0] === playerName && JQSelection.targetIndexes[0] === cardIndex) {
                    notify('You must select a different card...', 'error', 5000);
                } else {
                    setJQSelection(prev => ({
                        count: prev.count + 1,
                        targetNames: [...prev.targetNames, playerName],
                        targetIndexes: [...prev.targetIndexes, cardIndex]
                    }));
                    notify(`${JQSelection.count + 1}/2 -> ${playerName}'s ${cardIndex} card selected...`, 'success', 3500);
                }
                break;
            case 'BK':
                //Stuff
                break;
            default:
                if(storage.loadPlayer().Player.username !== playerName){
                    notify('You can only swap with your own hand...', 'error', 5000);
                }else{
                    handleDefaultCardSwap(cardIndex);
                }
                break;
        }
    }

    const hasAbilityCheck = (card) => {
        setHasAbility(cardService.checkIfCardHasAbility(card));
    }

    const handleDefaultCardSwap = async(cardIndex)=>{
        await gameApi.swapCards(gameId, cardIndex); //default hand swap
        handleDiscardCard();
        fetchGameState();
    }

    const handleJQCardSwap = useCallback(async (targetPlayerNames, cardIndexes) => {
        await gameApi.swapCards(gameId, null, targetPlayerNames, cardIndexes); // J & Q swap
        handleDiscardCard();
        fetchGameState();
    }, [gameId, handleDiscardCard, fetchGameState]);

    useEffect(() => {
        if (JQSelection.count === 2) {
            handleJQCardSwap(JQSelection.targetNames, JQSelection.targetIndexes);
            setJQSelection({ count: 0, targetNames: [], targetIndexes: [] });
            setAbility('');
        }
    }, [JQSelection, handleJQCardSwap]);

    const handleViewCard = async(targetPlayerName, cardIndex)=>{
        const revealedCard = await gameApi.revealSelectedCard(gameId, targetPlayerName, cardIndex);
        setRevealedCards(revealedCard);
        handleDiscardCard();
        fetchGameState();
    }

    const handleCloseRevealedCards = () => {
        setRevealedCards([]);
    }

    const gameUI = () =>{
        return(
            <div className="game-content-grid-container">
                {revealedCards.length > 0 && (<CardPopup revealedCards={revealedCards} onClose={handleCloseRevealedCards}/>)}
                <div className="left-side-UI">
                    <button className="discard-card" onClick={handleDiscardCard} disabled={checkIfMyTurn()}>
                        <span>Discard Pile</span>
                        <img src={cardService.getCardImageSrc(discardCardState)} alt='Discard Pile'/>
                    </button>
                    <button 
                        className={`drawn-card ${hasAbility ? 'glow' : ''}`} 
                        onClick={handleUseAbility}
                        disabled={!hasAbility || checkIfMyTurn()}
                    >
                        <span>Drawn Card</span>
                        <img src={cardService.getCardImageSrc(drawnCardState)} alt='Drawn Card'/>
                    </button>
                    <button className="draw-pile" onClick={handleDrawCard} disabled={checkIfMyTurn()}>
                        <span>Draw Pile</span>
                        <img src={cardService.getCardBackImageSrc()} alt='Draw Pile'/>
                    </button>
                </div>
                <div className="right-side-UI">
                    <div className="players">
                        {playersState.length > 0 && playersState.map((player, index) => (
                            <Player key={index} playerName={player.username} handCardAction={handleHandCardAction} />
                        ))}
                    </div>
                    <div className="previous-actions">
                        <span>{}</span>
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
          {gameStartedState && isPlayerInGame() ? gameUI() : lobbyUI()}
          {(gameStartedState && !isPlayerInGame()) && <h1>Game Started without you...</h1>}
        </>
    )
}

GameContentUI.propTypes = {
    gameId: PropTypes.string.isRequired,
    fetchGameState: PropTypes.func.isRequired,
    isPlayerInGame: PropTypes.func.isRequired,
    gameStartedState: PropTypes.bool.isRequired,
    playersState: PropTypes.array.isRequired,
    discardCardState: PropTypes.object,
    notify: PropTypes.func.isRequired,
    checkIfMyTurn: PropTypes.func.isRequired,
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