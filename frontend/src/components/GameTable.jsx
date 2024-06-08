
import React from 'react'
import tabletop from '../assets/tabletop.jpg'
import './GameTable.css'

const GameTable = () => {

    return (
      <div className="game-table">
          <img src={tabletop} alt="Table" />
      </div>
    );

}


export default GameTable