import {useState} from 'react';
import PropTypes from 'prop-types';
import cardService from '../services/cardService';
import './Player.css'

const Player = ({playerName, handCardAction}) => {



    return(
        <div className='player-hand'>
        <span>{playerName}</span>
            <button className='card' onClick={()=>handCardAction(playerName, 0)}>
                <span>0</span>
                <img src={cardService.getCardBackImageSrc()}/>
            </button>
            <button className='card' onClick={()=>handCardAction(playerName,1)}>
                <span>1</span>
                <img src={cardService.getCardBackImageSrc()}/>
            </button>
            <button className='card' onClick={()=>handCardAction(playerName,2)}>
                <span>2</span>
                <img src={cardService.getCardBackImageSrc()}/>
            </button>
            <button className='card' onClick={()=>handCardAction(playerName,3)}>
                <span>3</span>
                <img src={cardService.getCardBackImageSrc()}/>
            </button>
        </div>
    )
}

Player.propTypes = {
    playerName: PropTypes.string.isRequired,
    handCardAction: PropTypes.func.isRequired,
}

export default Player;