import PropTypes from 'prop-types';

const PlayerList = ({playersState}) =>{


    return(
        <div>
            <h2>Players:</h2>
            {playersState.length > 0 ? (
            <ol>
                {playersState.map((player, index) => (
                <li key={index}><h3>{player.username}</h3></li>))}
            </ol>) : (<p>No players have joined yet.</p>)}
        </div>
    )
}

PlayerList.propTypes = {
    playersState: PropTypes.array,
}

export default PlayerList;