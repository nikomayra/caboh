import { useEffect, useState, useCallback } from 'react';
import gameApi from '../api/gameApi';
import { useParams } from 'react-router-dom';

const Game = () => {
  const { gameId } = useParams(); // Extract gameId from the URL
  // Game state data from server
  const [playersState, setPlayersState] = useState([{}]);
  const [deckState, setDeckState] = useState([]);
  const [gameStartedState, setGameStartedState] = useState(false);
  const [whoseTurnState, setWhoseTurnState] = useState('') // Based on username;

  // Client side states
  const [userNameState, setUserNameState] = useState('');
  //const [userTokenState, setUserTokenState] = useState(null);
  const [joinedState, setJoinedState] = useState(false);

  const fetchGameState = useCallback (async () =>{
    try {
    const {deck, players, whoseTurn, hasStarted} = await gameApi.fetchGame(gameId);
    setPlayersState(players);
    setGameStartedState(hasStarted);
    setWhoseTurnState(whoseTurn);
    setDeckState(deck);
    }catch(error){
      console.error('Error fetching game state:', error);
    }
  },[gameId])

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
    await gameApi.startGame(gameId);
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
            <li key={index}>{player.username}</li>
          ))}
        </ul>
      ) : (
        <p>No players have joined yet.</p>
      )}
      </div>
      {!gameStartedState && (
        <button onClick={startGame}>Start Game</button>
      )}
      {gameStartedState && <h2>Game already started!</h2>}
    </div>
  );
};

export default Game;
