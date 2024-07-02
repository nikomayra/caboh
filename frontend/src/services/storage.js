const KEY = 'player';

const savePlayer = (player) => {
  localStorage.setItem(KEY, JSON.stringify(player));
};

const loadPlayer = () => {
  const player = localStorage.getItem(KEY);
  return player ? JSON.parse(player) : null;
};

const myName = () => {
  const player = loadPlayer();
  return player ? player.Player.username : null;
};

const removePlayer = () => {
  localStorage.removeItem(KEY);
};

export default { savePlayer, loadPlayer, removePlayer, myName };
