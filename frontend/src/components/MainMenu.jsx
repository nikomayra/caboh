import CreateGame from "./CreateGame";
import gameApi from '../api/gameApi';

const MainMenu = () => {

    const handleReset = async () =>{
        const message = await gameApi.reset();
        window.alert(message);
    }

    return (
        <div>
            <h1>Its Cabo Time!</h1>
            <br/>
            <CreateGame />
            <button onClick = {handleReset}>Reset Database</button>
        </div>
    )
}

export default MainMenu;