import {useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import HelpWindow from './HelpWindow';
import './GameSidebarUI.css'
import gameApi from '../api/gameApi';
import storage from '../services/storage';

const GameSidebarUI = ({cardsLeftInDeck, playersState=[], gameStartedState, checkIfMyTurn, whoseTurnState, roundState, endTurn, startGame, joinGame, isPlayerInGame, lastRound}) =>{
  
    const { gameId } = useParams(); // Extract gameId from the URL
    const [userName, setUserName] = useState('');
    const [totalPlayersOnline, setTotalPlayersOnline] = useState(null);
    const [totalGamesOnline, setTotalGamesOnline] = useState(null);
    const navigate  = useNavigate ();

    useEffect(() => { //on load
      if(storage.myName()) setUserName(storage.myName());
    }, []);

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

 /*    const handleEndTurn = () =>{
      endTurn();
    } */

    const handleJoinGame = (event) => {
        event.preventDefault();
        joinGame({userName});
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
            <input className='join-button' type="submit" value="Join Game" />
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
                {whoseTurnState === storage.myName() && <li style={{fontWeight: 'bold'}}>Your Turn!</li>}
            </ul>
        </div>
      )
    }

    const gameInfoLobby = () =>{
      return(
        <div className='gameInfo'>
            <h3>Game Info:</h3>
            <ul>
                <li>Players playing: {totalPlayersOnline}</li>
                <li>Active Games: {totalGamesOnline}</li>
            </ul>
        </div>
      )
    }

    const handleCallCaboh = async () => {
        await gameApi.finalRound(gameId);
        //handleEndTurn();
        endTurn();
    }

    const gameUI = () =>{
      return(
        <>
          {gameInfo()}
          <HelpWindow />
          {roundState > 2 && !lastRound && checkIfMyTurn() && <button className='caboh-button' onClick={handleCallCaboh}>Caboh!</button>}
          {/* <button className='end-turn-button' onClick={handleEndTurn}>End Turn</button> */}
          {lastRound && <h3 style={{position: 'relative', bottom: '5px', margin: 'auto'}}>Final Round!</h3>}
        </>
      )
    }

    const playerOneCheck = () => {
      const myName = storage.myName();
      if(playersState.length > 0 && myName){
        if (myName === playersState[0].username){
          return true;
        }
      }
      return false;
    }

    const returnToMenu = () =>{
      navigate(`/`);
    }

    const lobbyUI = () =>{
      return(
        <>
          {gameInfoLobby()}
          {joinGameForm()}
          <HelpWindow />
          {playerOneCheck() &&  <button className='start-button' onClick={handleStartGame}>Start Game!</button>}
          <br/>
          {playerOneCheck() &&  <button className='menu-button' onClick={returnToMenu}>Main Menu</button>}
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
    checkIfMyTurn: PropTypes.func.isRequired,
    whoseTurnState: PropTypes.string.isRequired,
    roundState: PropTypes.number.isRequired,
    endTurn: PropTypes.func.isRequired,
    startGame: PropTypes.func.isRequired,
    joinGame: PropTypes.func.isRequired,
    isPlayerInGame: PropTypes.func.isRequired,
    lastRound: PropTypes.bool.isRequired,
}

export default GameSidebarUI;