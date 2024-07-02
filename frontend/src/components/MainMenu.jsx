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
            <div className ="header">Caboh: The Game</div>
            <div className ="content">
                <img className ="logo" src={logo} ></img>
                <h2>{'It\'s Caboh Time!'}</h2>
                <CreateGame />
                <br/>
            </div>
            <div className="footer" style={{fontStyle: 'italic'}}>Project developed by Nikomayra <button className='reset' onClick = {handleReset}>Reset Database</button></div>
        </div>
    )
}

export default MainMenu;