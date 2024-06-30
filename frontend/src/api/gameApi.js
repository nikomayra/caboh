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
  const response = await axios.get(`${baseUrl}/fetch-cards/${gameId}`, config);
  return response.data;
};

//7 & 8 or 9 & 10 or BK ability
const revealSelectedCard = async (gameId, targetPlayerName, cardIndex) => {
  let handPositions = [0, 0, 0, 0];
  handPositions[cardIndex] = 1;

  const config = {
    headers: {
      Authorization: token,
      cardIndexes: handPositions,
      targetPlayerName: targetPlayerName,
    },
  };
  const response = await axios.get(`${baseUrl}/fetch-cards/${gameId}`, config);
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

//default or J & Q ability
const swapCards = async (gameId, cardIndex, playerNames, cardIndexes) => {
  const config = {
    headers: {
      Authorization: token,
      cardIndex: cardIndex,
      cardIndexes: cardIndexes, //array of up to 2 indexes to be swapped.
      playerNames: playerNames, //array of up to 2 player names to know which hands to use
    },
  };
  const response = await axios.post(
    `${baseUrl}/swap-cards/${gameId}`,
    null,
    config
  );
  return response.data;
};

const fetchNumberOfGames = async () => {
  const response = await axios.get(`${baseUrl}/number-of-games/`);
  return response.data;
};

const fetchNumberOfPlayers = async () => {
  const response = await axios.get(`${baseUrl}/number-of-players/`);
  return response.data;
};

const fetchDeckCount = async (gameId) => {
  const response = await axios.get(`${baseUrl}/fetch-deck-count/${gameId}`);
  return response.data;
};

//Black - K ability
//Call revealSelectedCardOtherPlayer ...
//Then call swapAnyHandCards if you like it...

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
  swapCards,
  revealSelectedCard,
  endTurn,
  fetchNumberOfGames,
  fetchNumberOfPlayers,
  fetchDeckCount,
};
