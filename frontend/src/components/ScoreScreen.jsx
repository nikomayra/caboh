import './ScoreScreen.css'
import logo from '../assets/Logo-temp.png';
import { useParams, useNavigate  } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import gameApi from '../api/gameApi';
import cardService from '../services/cardService';

const ScoreScreen = () => {
    const { gameId } = useParams(); // Extract gameId from the URL
    const navigate  = useNavigate ();

    const [playersData, setPlayersData] = useState([]);
    //const [playerHands, setPlayerHands] = useState([]);

    const fetchGame = useCallback (async () =>{
        try {
            const { players, finalScores } = await gameApi.fetchGame(gameId);
            const revealedCards = await gameApi.revealFinalCards(gameId);
            // Combine players and finalScores into a single array of objects
            const combinedData = players.map((player, i) => ({
              name: player.username,
              score: finalScores[i],
              hand: revealedCards[i]
            }));

            // Sort players by their scores in descending order
            combinedData.sort((a, b) => a.score - b.score);

            // Determine ranks, ensuring players with the same score get the same rank
            let rank = 1;
            combinedData.forEach((player, index) => {
                if (index > 0 && player.score > combinedData[index - 1].score) {
                rank = index + 1;
                }
                player.rank = rank;
            });

            setPlayersData(combinedData);
            //setPlayerHands(revealedCards);

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

    const playerHandImages = (playerData) => {
        return(
            <div className = "score-hands">
                <img className="score-cards" src={cardService.getCardImageSrc(playerData.hand[0])}/>
                <img className="score-cards" src={cardService.getCardImageSrc(playerData.hand[1])}/>
                <img className="score-cards" src={cardService.getCardImageSrc(playerData.hand[2])}/>
                <img className="score-cards" src={cardService.getCardImageSrc(playerData.hand[3])}/>
            </div>
        )
    }

    return (
        <div className="menu-advanced-grid-container">
            <div className ="header">Caboh: The Game</div>
            <div className ="content">
                <img className ="score-logo" src={logo} ></img>
                <h1>Final Scores:</h1>
                <ul className="score-list">
                    {playersData.map((playerData, index) => (
                        <li key={index} className="score-list-item">
                            <span className={`player-info ${index === 0 ? 'bold' : ''}`}>
                                {playerData.rank}. {playerData.name} - {playerData.score} points
                            </span>
                            {playerHandImages(playerData)}
                        </li>
                    ))}
                </ul>
                <button onClick={returnToMenu}>Return to Main Menu</button>
            </div>
            <div className="footer" style={{fontStyle: 'italic'}}>Project developed by Nikomayra</div>
        </div>
    )
}

export default ScoreScreen;