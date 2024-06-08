import React, { useState } from 'react'
import './Opponent.css'

const Opponent = (props) => {
    //const [visible, setVisible] = useState(false)

    return (
        <div>
            <img src={default_face} className="player-face" />
            <div className="player-body" ></div>
        </div>
    );

}


export default Opponent