import CreateGame from "./CreateGame";
import gameApi from '../api/gameApi';
import './MainMenu.css'
import logo from '../assets/Logo-temp.png';

const MainMenu = () => {

    const handleReset = async () =>{
        const message = await gameApi.reset();
        window.alert(message);
    }

    return (
        <div className="menu-advanced-grid-container">
            <div className ="header">Cabo: The Game</div>
            <div className ="content">
                <img className ="logo" src={logo} ></img>
                <h2>{'It\'s Cabo Time!'}</h2>
                <CreateGame />
                <br/>
                <button onClick = {handleReset}>Reset Database</button>
            </div>
            <div className ="footer">Project developed by Nikomayra</div>
        </div>
    )
}

export default MainMenu;