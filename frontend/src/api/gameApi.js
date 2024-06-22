import axios from 'axios';
const baseUrl = '/api/games';

let token = null;

const setToken = (newToken) => {
  token = `Bearer ${newToken}`;
  //console.log('setToken: ' + token);
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
  //console.log('POST config: ' + config.headers['Authorization']);
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

const initialRevealSelectedCardsSelf = async (gameId) => {
  const handPositions = [1, 1, 0, 0];
  for (let i = handPositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [handPositions[i], handPositions[j]] = [handPositions[j], handPositions[i]];
  }
  const randomCardIndexArray = handPositions;
  //console.log('randomCardIndexArray: ' + randomCardIndexArray);
  const config = {
    headers: {
      Authorization: token,
      cardIndexes: randomCardIndexArray,
    },
  };
  const response = await axios.get(
    `${baseUrl}/fetch-init-cards/${gameId}`,
    config
  );
  return response.data;
};

const endTurn = async (gameId) => {
  //Parameters - token
  //Server Actions - increment current player turn making sure to loop at player.length to 0
  //Return - current player turn as index
  const config = {
    headers: { Authorization: token },
  };
  await axios.post(`${baseUrl}/end-turn/${gameId}`, null, config);
};

const drawCard = async (gameId) => {
  const config = {
    headers: { Authorization: token },
  };
  const response = await axios.post(
    `${baseUrl}/draw-card/${gameId}`,
    null,
    config
  );
  return response.data;
};

const discardCard = async (gameId) => {
  const config = {
    headers: { Authorization: token },
  };
  await axios.post(`${baseUrl}/dis-card/${gameId}`, null, config);
};

const swapCard = async (gameId, cardIndex) => {
  const config = {
    headers: {
      Authorization: token,
      cardIndex: cardIndex,
    },
  };
  const response = await axios.post(
    `${baseUrl}/swap-cards/${gameId}`,
    null,
    config
  );
  return response.data;
};

//7 & 8 ability
const revealSelectedCardSelf = async () => {
  //Parameters - 1 card positions (1, 2, 3, 4) & token
  //Server Actions - lookup card in player.hand database
  //Return - card object (suit/value)
};

//9 & 10 ability
const revealSelectedCardOtherPlayer = async () => {
  //Parameters - 1 card positions (1, 2, 3, 4) & other player id or username? & token
  //Server Actions - lookup card in player.hand database
  //Return - card object (suit/value)
};

export default {
  setToken,
  createGame,
  joinGame,
  fetchGame,
  startGame,
  reset,
  initialRevealSelectedCardsSelf,
  drawCard,
  discardCard,
  swapCard,
  endTurn,
};
