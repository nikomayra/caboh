import axios from 'axios';
const baseUrl = '/api/games';

let token = null;

const setToken = (newToken) => {
  token = `Bearer ${newToken}`;
  console.log('setToken: ' + token);
};

const createGame = async () => {
  const response = await axios.post(`${baseUrl}/create-game`);
  return response.data;
};

const joinGame = async (userName, gameId) => {
  const response = await axios.post(`${baseUrl}/join-game/${gameId}`, {
    userName,
  });

  return response.data;
};

const startGame = async (gameId) => {
  const config = {
    headers: { Authorization: token },
  };
  console.log('POST config: ' + config.headers['Authorization']);
  await axios.post(`${baseUrl}/start-game/${gameId}`, null, config);
};

const fetchGame = async (gameId) => {
  const response = await axios.get(`${baseUrl}/${gameId}`);
  return response.data;
};

// delete for production...
const reset = async () => {
  const response = await axios.get(`${baseUrl}/reset`);
  return response.data.message;
};

export default { setToken, createGame, joinGame, fetchGame, startGame, reset };
