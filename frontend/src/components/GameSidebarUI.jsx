import {useState} from 'react';
import PropTypes from 'prop-types';
import HelpWindow from './HelpWindow';

const GameSidebarUI = ({gameId, gameStartedState, whoseTurnState, roundState, endTurn, startGame, joinGame, isPlayerInGame}) =>{

    const [userName, setUserName] = useState('');

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
      <form style={{ display: isPlayerInGame ? 'none' : '' }} onSubmit={handleJoinGame}>
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

    const gameInfo = () =>{
      return(
        <div>
            <h3>Game Info:</h3>
            <ul style={gameInfoStyle}>
                <li>Game ID: {gameId}</li>
                <li>Current Turn: {whoseTurnState}</li>
                <li>Round: {roundState}</li>
                <li>Other Stuff: TBD</li>
            </ul>
        </div>
      )
    }

    const gameInfoLobby = () =>{
      return(
        <div>
            <h3>Game Lobby Info:</h3>
            <ul style={gameInfoStyle}>
                <li>Game ID: {gameId}</li>
                <li>Players Online: TBD</li>
                <li>Active Games: TBD</li>
                <li>Other Stuff: TBD</li>
            </ul>
        </div>
      )
    }

    const gameUI = () =>{
      return(
        <div>
          {gameInfo()}
          <br/>
          <HelpWindow />
          <button onClick={handleEndTurn}>End Turn</button>
        </div>
      )
    }

    const lobbyUI = () =>{
      return(
        <div>
          {gameInfoLobby()}
          {joinGameForm()}
          <br/>
          <HelpWindow />
          <button onClick={handleStartGame}>Start Game!</button>
          <br/>
          <button onClick={handleDeleteLobby}>Delete Lobby</button>
        </div>
      )
    }

    return(
        <div style={sideBarStyle}>
          {gameStartedState ? gameUI() : lobbyUI()}
        </div>
    )
}

const gameInfoStyle = {
  listStyleType: 'none',
  margin: '0px',
  padding: '0px',
}

const sideBarStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '10px'
}

GameSidebarUI.propTypes = {
    gameId: PropTypes.string.isRequired,
    gameStartedState: PropTypes.bool.isRequired,
    whoseTurnState: PropTypes.string.isRequired,
    roundState: PropTypes.number.isRequired,
    endTurn: PropTypes.func.isRequired,
    startGame: PropTypes.func.isRequired,
    joinGame: PropTypes.func.isRequired,
    isPlayerInGame: PropTypes.bool.isRequired,
}

export default GameSidebarUI;


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