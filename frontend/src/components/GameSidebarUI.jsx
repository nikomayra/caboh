import {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import HelpWindow from './HelpWindow';
import './GameSidebarUI.css'
import gameApi from '../api/gameApi';
import storage from '../services/storage';

const GameSidebarUI = ({cardsLeftInDeck, playersState=[], gameStartedState, whoseTurnState, roundState, endTurn, startGame, joinGame, isPlayerInGame}) =>{

    const [userName, setUserName] = useState('');
    
    const [totalPlayersOnline, setTotalPlayersOnline] = useState(null);
    const [totalGamesOnline, setTotalGamesOnline] = useState(null);

    useEffect(() => {
      setUserName(storage.loadPlayer().Player.username);
    }, [userName]);

    useEffect(() => {
      const fetchInitialData = async () => {
        try {
          const players = await gameApi.fetchNumberOfPlayers();
          const games = await gameApi.fetchNumberOfGames();

          setTotalPlayersOnline(players);
          setTotalGamesOnline(games);
        } catch (error) {
          console.error('Failed to fetch initial data:', error);
        }
      };
      fetchInitialData();
    }, []);
    
    const handleStartGame = () =>{
      startGame();
    }

    const handleEndTurn = () =>{
      endTurn();
    }

    const handleDeleteLobby = () =>{
      //TBD
    }

    const handleJoinGame = (event) => {
        event.preventDefault();
        joinGame({userName});
        //setUserName('');
    }

    const joinGameForm = () =>{
      return(
      <form style={{ display: isPlayerInGame() ? 'none' : '' }} onSubmit={handleJoinGame}>
            <label>
                <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your username"
                />
            </label>
            <input type="submit" value="Join Game" />
        </form>
      )
    }

    const lastPlayersTurn = () => {
      if (playersState > 0){
          const playerNames = playersState.map((player)=>player.username);
          const index = playerNames.indexOf(whoseTurnState);
          return index > 0 ? playerNames[index - 1] : null;
      }
      return null;
    }

    const gameInfo = () =>{
      return(
        <div className='gameInfo'>
            <h3>Game Info:</h3>
            <ul>
                <li>Username: {userName}</li>
                <li>Round: {roundState}</li>
                <li>Current Turn: {whoseTurnState}</li>
                <li>Last Turn: {lastPlayersTurn()}</li>
                <li>Draw Pile: {cardsLeftInDeck}/{52 - (playersState.length * 4)}</li>
            </ul>
        </div>
      )
    }

    const gameInfoLobby = () =>{
      return(
        <div className='gameInfo'>
            <h3>Game Lobby Info:</h3>
            <ul>
                <li>Players playing: {totalPlayersOnline}</li>
                <li>Active Games: {totalGamesOnline}</li>
            </ul>
        </div>
      )
    }

    const gameUI = () =>{
      return(
        <>
          {gameInfo()}
          <HelpWindow />
          <button onClick={handleEndTurn}>End Turn</button>
        </>
      )
    }

    const lobbyUI = () =>{
      return(
        <>
          {gameInfoLobby()}
          {joinGameForm()}
          <HelpWindow />
          <button onClick={handleStartGame}>Start Game!</button>
          <button onClick={handleDeleteLobby}>Delete Lobby</button>
        </>
      )
    }

    return(
        <div className='sideBarContent'>
          {gameStartedState && isPlayerInGame() ? gameUI() : lobbyUI()}
        </div>
    )
}

GameSidebarUI.propTypes = {
  cardsLeftInDeck: PropTypes.number.isRequired,
    playersState: PropTypes.array.isRequired,
    gameStartedState: PropTypes.bool.isRequired,
    whoseTurnState: PropTypes.string.isRequired,
    roundState: PropTypes.number.isRequired,
    endTurn: PropTypes.func.isRequired,
    startGame: PropTypes.func.isRequired,
    joinGame: PropTypes.func.isRequired,
    isPlayerInGame: PropTypes.func.isRequired,
}

export default GameSidebarUI;