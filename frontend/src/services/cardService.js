import cardImageLookUp from '../assets/cardImageLookUp.json';
const cardImages = import.meta.glob('../assets/cardImages/*', { eager: true });
import cardBack from '../assets/cardImages/card-back.png';

const createCardDictionary = (cardArray) => {
  const cardDict = {};
  cardArray.forEach((card) => {
    const key = `${card.suit}-${card.value}`;
    cardDict[key] = card.imgSrc;
  });
  return cardDict;
};

const cardDictionary = createCardDictionary(cardImageLookUp);

const getCardImageSrc = (card) => {
  if (!card)
    return cardImages['../assets/cardImages/default-blank-card.png'].default;
  const key = `${card.suit}-${card.value}`;
  return cardImages[cardDictionary[key]].default;
};

const getCardBackImageSrc = () => cardBack;

const checkIfCardHasAbility = (card) => {
  if (!card) return false;
  if (['7', '8', '9', '10', 'J', 'Q'].includes(card.value)) {
    return true;
  } else if (
    card.value === 'K' &&
    (card.suit === 'Spades' || card.suit === 'Clubs')
  ) {
    return true;
  }
  return false;
};

export default { getCardImageSrc, getCardBackImageSrc, checkIfCardHasAbility };

/* const defaultCard = {
    suit: 'none',
    value: 0,
    imgSrc: '../assets/cardImages/default-blank-card.png',
  };
  const cardBack = '../assets/cardImages/card-back.png'; */
