import {useState} from 'react'
import './CardDeck.css'
import cards from '../assets/cards.json'
const cardImages = import.meta.glob('../assets/cardImages/*', { eager: true });
const defaultCard = ({
    suit: 'none',
    value: 0,
    imgSrc: '../assets/cardImages/default-blank-card.png'
});
const cardBack = '../assets/cardImages/card-back.png'

const CardDeck = () => {
    const [drawnCard, setDrawnCard] = useState(defaultCard)
    const [discardedCard, setDiscardedCard] = useState(defaultCard)
    const [drawPile, setDrawPile] = useState(cards)
    const [checkDrawn, setcheckDrawn] = useState(false)
    
    const drawCard = () => {
        if (!checkDrawn && drawPile.length > 0){
            const randomIndex = Math.floor(Math.random() * drawPile.length);
            //console.log(randomIndex)
            const randomCard = drawPile[randomIndex];
            const newDrawPile = drawPile.filter((_, index) => index !== randomIndex);
            setDrawPile(newDrawPile);
            setDrawnCard(randomCard);
            setcheckDrawn(true);
        }else{
            setDrawPile(cards);
        }
    }

    const discardCard = () => {
        setDiscardedCard(drawnCard);
        setDrawnCard(defaultCard);
        setcheckDrawn(false);
    }

    const useCard = () => {
        //Implement card ability stuff
    }

    const GetCardImage  = (path) => {
        //console.log(path, cardImages[path]);
        return cardImages[path].default 
    }

    return (
        <div>
            <button className="draw-pile" onClick={drawCard}>
                <figure>
                    <figcaption>Draw Pile</figcaption>
                        <img src={GetCardImage(cardBack)} alt='Draw Pile'/>
                </figure>
            </button>
            <button className="discard-card" onClick={discardCard}>
                <figure>
                    <figcaption>Discard Pile</figcaption>
                        <img src={GetCardImage(discardedCard.imgSrc)} alt='Discard Pile'/>
                </figure>
            </button>
            <button className="drawn-card" onClick={useCard}>
                <figure>
                    <figcaption>Drawn Card</figcaption>
                        <img src={GetCardImage(drawnCard.imgSrc)}  alt='Drawn Card'/>
                </figure>
            </button>
        </div>

    );

}


export default CardDeck