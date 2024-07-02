import './ScoreScreen.css'
import logo from '../assets/Logo-temp.png';
import { useParams, useNavigate  } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import gameApi from '../api/gameApi';

const ScoreScreen = () => {
    const { gameId } = useParams(); // Extract gameId from the URL
    const navigate  = useNavigate ();

    const [playersData, setPlayersData] = useState([]);

    const fetchGame = useCallback (async () =>{
        try {
            const { players, finalScores } = await gameApi.fetchGame(gameId);
            // Combine players and finalScores into a single array of objects
            const combinedData = players.map((player, i) => ({
              name: player.username,
              score: finalScores[i],
            }));
            // Sort players by their scores in descending order
            combinedData.sort((a, b) => b.score - a.score);
            setPlayersData(combinedData);
            //console.log('combinedData' + combinedData)
            //Send POST request to delete this game and its associated players from the database after 1 minute delay...
            await gameApi.endGame(gameId);
        }catch(error){
          console.error('Error fetching final scores:', error);
        }
      },[gameId])

    useEffect(() => {
        // Fetch game data on load
        fetchGame();
    },[fetchGame]);

    const returnToMenu = () =>{
        navigate(`/`); // Navigate to the new game lobby
    }

    return (
        <div className="menu-advanced-grid-container">
            <div className ="header">Caboh: The Game</div>
            <div className ="content">
                <img className ="logo" src={logo} ></img>
                <h1>Final Scores:</h1>
                <ol>
                    {playersData.map((playerData, index) => (
                        <li key={index} style={{ fontWeight: index === 0 ? 'bold' : 'normal' }}>
                        {playerData.name} - {playerData.score} points {index === 0 && ' - Winner!!!'}
                        </li>
                    ))}
                </ol>
                <button onClick={returnToMenu}>Return to Main Menu</button>
            </div>
            <div className="footer" style={{fontStyle: 'italic'}}>Project developed by Nikomayra</div>
        </div>
    )
}

export default ScoreScreen;