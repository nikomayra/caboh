import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import './Game.css'
import gameApi from '../api/gameApi';
import storage from '../services/storage';
import Notification from './Notification'
import GameContentUI from './GameContentUI';
import GameSidebarUI from './GameSidebarUI';

const Game = () => {
  const { gameId } = useParams(); // Extract gameId from the URL
  // Game state data from server
  const [playersState, setPlayersState] = useState([]);
  const [discardCardState, setdiscardCardState] = useState(null); //Only top card
  const [gameStartedState, setGameStartedState] = useState(false);
  const [whoseTurnState, setWhoseTurnState] = useState('') // Based on player id
  const [roundState, setRoundState] = useState(0);

  // Client side states
  //const [userNameState, setUserNameState] = useState('');
  const [player, setPlayer] = useState(null);
  const [initialCardsRevealed, setInitialCardsRevealed] = useState(false);
  //const [drawnCardState, setDrawnCardState] = useState(null);
  const [notification, setNotification] = useState(null)

  const fetchGameState = useCallback (async () =>{
    try {
    const {players, curPlayerTurn, hasStarted, topDisCard, round} = await gameApi.fetchGame(gameId);
    setPlayersState(players);
    setGameStartedState(hasStarted);
    setWhoseTurnState(curPlayerTurn);
    setRoundState(round);
    if (topDisCard) setdiscardCardState(topDisCard);
    }catch(error){
      console.error('Error fetching game state:', error);
    }
  },[gameId, setGameStartedState])

  useEffect(() =>{
    const initialRevealedCards = async () =>{
      const initialRevealedCards = await gameApi.initialRevealSelectedCardsSelf(gameId);
      const cards = initialRevealedCards;
      window.confirm('Initial card reveal: \r\n ' + JSON.stringify(cards));
      setInitialCardsRevealed(true);
    }

    if (gameStartedState && !initialCardsRevealed) {
      initialRevealedCards();
    }
  },[gameId, gameStartedState, initialCardsRevealed])

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
    setPlayer(newPlayer)
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
      notify('Error ending turn...', 'error');
    } 
  }

 /*  const handleDrawCard = async()=>{
    const drawnCard = await gameApi.drawCard(gameId);
    setDrawnCardState(drawnCard);
    fetchGameState();
  }

  const handleDisCard = async()=>{
    //if(drawnCardState.value === '7' || drawnCardState.value === '8'){
      //revealSelectedCardSelf
      await gameApi.discardCard(gameId);
      setDrawnCardState(null);
      fetchGameState();
    //}
  }

  const handleCardSwap = async(cardIndex)=>{
    const cardToSwap = await gameApi.swapCard(gameId, cardIndex);
    setDrawnCardState(cardToSwap);
    fetchGameState();
  } */

 /*  const handButtons = () =>{
    return(
      <div>
        <button onClick={()=> handleCardSwap(0)}>0</button>
        <button onClick={()=>handleCardSwap(1)}>1</button>
        <button onClick={()=>handleCardSwap(2)}>2</button>
        <button onClick={()=>handleCardSwap(3)}>3</button>
      </div>
    )
  } */


  return (
    <div className="game-advanced-grid-container">
            <div className="header">
              Cabo: The Game
              {notification && (<Notification message={notification.message} type={notification.type} key={notification.timestamp || new Date().getTime()}/>)}
            </div>
            <div className="sidebar">
              <GameSidebarUI 
                gameId={gameId} 
                gameStartedState={gameStartedState}
                whoseTurnState={whoseTurnState}
                roundState={roundState}
                endTurn={handleEndTurn} 
                startGame={handleStartGame} 
                joinGame={handleJoinGame} 
                isPlayerInGame={isPlayerInGame()} 
              />
            </div>
            <div className="content">
              <GameContentUI 
              gameId={gameId}
              fetchGameState={fetchGameState}
              playersState={playersState}
              gameStartedState={gameStartedState}
              discardCardState={discardCardState}
              notify={notify}
              />
            </div>
            <div className="footer">Project developed by Nikomayra</div>
    </div>
  );
};

export default Game;

/* 

<GameInfo gameId={gameId}/>
<br/>
<JoinGameForm style={{ display: isPlayerInGame() ? 'none' : '' }} joinGame ={handleJoinGame} />
<br/>

<div>
      <h1>Game</h1>
      <p>Game ID: {gameId}</p>
      <div style={{ display: isPlayerInGame() ? 'none' : '' }}>
        <input
          type="text"
          value={userNameState}
          onChange={(e) => setUserNameState(e.target.value)}
          placeholder="Enter your username"
        />
        <button onClick={joinGame} disabled={gameStartedState}>
          Join Game
        </button>
      </div>

      <div>
        <h2>Players:</h2>
        {playersState.length > 0 ? (
        <ul>
          {playersState.map((player, index) => (
            <li key={index}>{player.username} -- {player.username === whoseTurnState ? handButtons() : ''}</li>
          ))}
        </ul>
      ) : (
        <p>No players have joined yet.</p>
      )}
      </div>


      {!gameStartedState && (
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
      </div>
      }
    </div> */