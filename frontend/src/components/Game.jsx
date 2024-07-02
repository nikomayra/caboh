import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Game.css'
import gameApi from '../api/gameApi';
import storage from '../services/storage';
import Notification from './Notification'
import GameContentUI from './GameContentUI';
import GameSidebarUI from './GameSidebarUI';
import CardPopup from './CardPopup';

const Game = () => {
  const { gameId } = useParams(); // Extract gameId from the URL
  // Game state data from server
  const [playersState, setPlayersState] = useState([]);
  const [discardCardState, setdiscardCardState] = useState(null); //Only top card
  const [gameStartedState, setGameStartedState] = useState(false);
  const [whoseTurnState, setWhoseTurnState] = useState('');
  const [roundState, setRoundState] = useState(0);
  const [lastTurnSummaryState, setLastTurnSummaryState] = useState([]);
  const [lastRound, setLastRound] = useState(false);
  const [scoreScreenState, setScoreScreenState] = useState(false);

  // Client side states
  const [initialCardsRevealed, setInitialCardsRevealed] = useState(false);
  const [notification, setNotification] = useState(null)
  const [revealedCards, setRevealedCards] = useState([])
  const [cardsLeftInDeck, setCardsLeftInDeck] = useState(52);
  const navigate  = useNavigate ();

  const fetchGameState = useCallback (async () =>{
    try {
    const {players, curPlayerTurn, hasStarted, topDisCard, round, lastTurnSummary, finalRound, scoreScreen} = await gameApi.fetchGame(gameId);
    setPlayersState(players);
    setGameStartedState(hasStarted);
    setWhoseTurnState(curPlayerTurn);
    setRoundState(round);
    setLastRound(finalRound);
    setScoreScreenState(scoreScreen);
    const last5TurnSummary = lastTurnSummary.slice(-5).reverse();
    setLastTurnSummaryState(last5TurnSummary);
    const cards = await gameApi.fetchDeckCount(gameId);
    setCardsLeftInDeck(cards);
    if (topDisCard) setdiscardCardState(topDisCard);
    }catch(error){
      console.error('Error fetching game state:', error);
    }
  },[gameId])

  useEffect(() =>{
    const initialRevealedCards = async () =>{
      const initialRevealedCards = await gameApi.initialRevealSelectedCardsSelf(gameId);
      setRevealedCards(initialRevealedCards)
      setInitialCardsRevealed(true);
    }

    if (gameStartedState && !initialCardsRevealed) {
      initialRevealedCards();
    }
  },[gameId, gameStartedState, initialCardsRevealed])

  useEffect(() => {
    const endGame = () =>{
      navigate(`/games/score-screen/${gameId}`);
    }
    if (scoreScreenState) endGame();
  },[gameId, navigate, scoreScreenState]);

  useEffect(() => {
    // Fetch game data on load
    fetchGameState();
    const player = storage.loadPlayer();
    if(player){
      gameApi.setToken(player.token);
    }
  }, [fetchGameState]);


  useEffect(() => {
    // Fetch game data every 5 seconds
    const interval = setInterval(() => {
      fetchGameState();
    }, 5000); //5 seconds
    return () => {
      clearInterval(interval);
    }
  }, [fetchGameState]);

  const notify = (message, type) =>{
    setNotification({message, type, timestamp: new Date().getTime()});
  }

  const handleJoinGame = async ({userName}) => {
    try{
    const newPlayer = await gameApi.joinGame(userName, gameId);
    storage.savePlayer(newPlayer)
    gameApi.setToken(newPlayer.token);
    setPlayersState(playersState.concat(newPlayer.Player));
    }catch(error){
      notify('Failed to join game...', 'error');
    }
  };

  const handleStartGame = async () => {
    try{
      await gameApi.startGame(gameId); // also deals cards
      fetchGameState();
    }catch(error){
      notify('Error starting game...', 'error');
    } 
  };

 const isPlayerInGame = () => {
    const playerNames = playersState.map((player) => player.username);
    const player = storage.loadPlayer();
    return player && playerNames.includes(player.Player.username)
  };

  const handleEndTurn = async() => {
    try{
      await gameApi.endTurn(gameId);
      fetchGameState();
    }catch(error){
      notify('You must draw a card and use it, swap it or discard it before ending your turn...', 'error');
    } 
  }

  const checkIfMyTurn = () => {
    const me = storage.loadPlayer();
    if(me.Player.username === whoseTurnState){
        return true;
    }
    return false;
  }

  const handleRevealedCards = () => {
    setRevealedCards([]);
  }

  return (
    <div className="game-advanced-grid-container">
            <div className="header">
              Caboh: The Game
              {notification && (<Notification message={notification.message} type={notification.type} key={notification.timestamp || new Date().getTime()}/>)}
              {revealedCards.length > 0 && (<CardPopup revealedCards={revealedCards} onClose={handleRevealedCards}/>)}
            </div>
            <div className="sidebar">
              <GameSidebarUI
                cardsLeftInDeck={cardsLeftInDeck}
                playersState={playersState}
                gameStartedState={gameStartedState}
                whoseTurnState={whoseTurnState}
                checkIfMyTurn={checkIfMyTurn}
                roundState={roundState}
                endTurn={handleEndTurn} 
                startGame={handleStartGame} 
                joinGame={handleJoinGame} 
                isPlayerInGame={isPlayerInGame}
                lastRound={lastRound}
              />
            </div>
            <div className="content">
              <GameContentUI 
              gameId={gameId}
              isPlayerInGame={isPlayerInGame} 
              fetchGameState={fetchGameState}
              playersState={playersState}
              checkIfMyTurn={checkIfMyTurn}
              gameStartedState={gameStartedState}
              discardCardState={discardCardState}
              lastTurnSummary={lastTurnSummaryState}
              notify={notify}
              />
            </div>
            <div className="footer" style={{fontStyle: 'italic'}}>Project developed by Nikomayra</div>
    </div>
  );
};

export default Game;