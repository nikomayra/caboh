import {useState} from 'react';
import PropTypes from 'prop-types';
import cardService from '../services/cardService';
import './Player.css'

const Player = ({playerName, cardHandAction}) => {


    const handleCardHandAction = (cardIndex) => {
        cardHandAction(playerName, cardIndex)
    }

    return(
        <div className='player'>
            <div className='player-seat'>
                <span>{playerName}</span>
            </div>
            <div className='player-hand'>
                <button className='card' onClick={handleCardHandAction(0)}>
                    <span>0</span>
                    <img src={cardService.getCardBackImageSrc()}/>
                </button>
                <button className='card' onClick={handleCardHandAction(1)}>
                    <span>1</span>
                    <img src={cardService.getCardBackImageSrc()}/>
                </button>
                <button className='card' onClick={handleCardHandAction(2)}>
                    <span>2</span>
                    <img src={cardService.getCardBackImageSrc()}/>
                </button>
                <button className='card' onClick={handleCardHandAction(3)}>
                    <span>3</span>
                    <img src={cardService.getCardBackImageSrc()}/>
                </button>
            </div>
        </div>
    )
}

Player.propTypes = {
    playerName: PropTypes.string.isRequired,
    cardHandAction: PropTypes.func.isRequired,
}

export default Player;