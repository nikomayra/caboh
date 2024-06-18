import gameApi from '../api/gameApi';
import { useNavigate  } from 'react-router-dom';

const CreateGame = () => {
  const navigate  = useNavigate ();
    const handleCreateGame  = async () => {
      try{
        const {gameId} = await gameApi.createGame();
        navigate(`/games/${gameId}`); // Navigate to the new game lobby
      }catch(error){
        console.error('Error creating game:', error);
      }
    }
  return <button onClick={handleCreateGame }>Create Game</button>;
};

export default CreateGame;
