import { useEffect, useState, useCallback } from 'react';
import gameApi from '../api/gameApi';
import { useParams } from 'react-router-dom';

const Game = () => {
  const { gameId } = useParams(); // Extract gameId from the URL
  // Game state data from server
  const [playersState, setPlayersState] = useState([{}]);
  const [disCardState, setdisCardState] = useState(null); //Only top card
  const [gameStartedState, setGameStartedState] = useState(false);
  const [whoseTurnState, setWhoseTurnState] = useState('') // Based on player id

  // Client side states
  const [userNameState, setUserNameState] = useState('');
  const [initialCardsRevealed, setInitialCardsRevealed] = useState(false);
  const [joinedState, setJoinedState] = useState(false);
  const [drawnCardState, setDrawnCardState] = useState(null);

  const fetchGameState = useCallback (async () =>{
    try {
    const {players, curPlayerTurn, hasStarted, topDisCard} = await gameApi.fetchGame(gameId);
    setPlayersState(players);
    setGameStartedState(hasStarted);
    setWhoseTurnState(curPlayerTurn);
    if (topDisCard) setdisCardState(topDisCard);
    }catch(error){
      console.error('Error fetching game state:', error);
    }
  },[gameId, setGameStartedState])

  useEffect(() =>{
    const initialRevealedCards = async () =>{
      const initialRevealedCards = await gameApi.initialRevealSelectedCardsSelf(gameId);
      const cards = initialRevealedCards;
      window.confirm('Initial card reveal: \r\n 0: ' + JSON.stringify(cards[0]) + '\r\n 1: ' + JSON.stringify(cards[1]) + '\r\n 2: ' + JSON.stringify(cards[2]) + '\r\n 3: ' + JSON.stringify(cards[3]));
      setInitialCardsRevealed(true);
    }

    if (gameStartedState && !initialCardsRevealed) {
      initialRevealedCards();
    }
  },[gameId, gameStartedState, initialCardsRevealed])

  useEffect(() => {
    // Fetch game data on load
    fetchGameState();
    const player = JSON.parse(window.localStorage.getItem('player'))
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

  const stateLogger = () => {
    console.log('gameId: ' + gameId);
    console.log('playersState: ' + playersState);
    //console.log('deckState: ' + deckState);
    console.log('gameStartedState: ' + gameStartedState);
    //console.log('whoseTurnState: ' + whoseTurnState);
    console.log('userNameState: ' + userNameState);
    //console.log('userTokenState: ' + userTokenState);
    console.log('joinedState: ' + joinedState);
  }

  const joinGame = async () => {
    const newPlayer = await gameApi.joinGame(userNameState, gameId);
    window.localStorage.setItem('player', JSON.stringify(newPlayer));
    gameApi.setToken(newPlayer.token);
    setPlayersState(playersState.concat(newPlayer.Player));
    setJoinedState(true);
    //stateLogger();
  };

  const startGame = async () => {
    try{
    await gameApi.startGame(gameId); // also deals cards
    fetchGameState();
  }catch(error){
    console.error('Error starting game:', error);
  }
  };

  const isPlayerInGame = () => {
    const playerNames = playersState.map((player) => player.username);
    const player = JSON.parse(window.localStorage.getItem('player'));
    if(!joinedState && player){
      if(playerNames.includes(player.Player.username)){
        setJoinedState(true);
      }
    }
    return joinedState
  };

  const handleEndTurn = async() => {
    await gameApi.endTurn(gameId);
    fetchGameState();
  }

  const handleDrawCard = async()=>{
    const drawnCard = await gameApi.drawCard(gameId);
    setDrawnCardState(drawnCard);
    fetchGameState();
  }

  const handleDisCard = async()=>{
    await gameApi.discardCard(gameId);
    setDrawnCardState(null);
    fetchGameState();
  }

  const handleCardSwap = async(cardIndex)=>{
    const cardToSwap = await gameApi.swapCard(gameId, cardIndex);
    setDrawnCardState(cardToSwap);
    fetchGameState();
  }

  const handButtons = () =>{
    return(
      <div>
        <button onClick={()=> handleCardSwap(0)}>0</button>
        <button onClick={()=>handleCardSwap(1)}>1</button>
        <button onClick={()=>handleCardSwap(2)}>2</button>
        <button onClick={()=>handleCardSwap(3)}>3</button>
      </div>
    )
  }

  return (
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
    </div>
  );
};

export default Game;
