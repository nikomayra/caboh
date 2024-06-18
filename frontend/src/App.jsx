import Game from './components/Game'
import MainMenu from './components/MainMenu'
import { Routes, Route } from 'react-router-dom';

const App = () => {

  return (
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route path="/games/:gameId" element={<Game />} />
    </Routes>
  )
};

export default App
