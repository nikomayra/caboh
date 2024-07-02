import Game from './components/Game'
import MainMenu from './components/MainMenu'
import ScoreScreen from './components/ScoreScreen'
import { Routes, Route } from 'react-router-dom';

const App = () => {

  return (
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route path="/games/:gameId" element={<Game />} />
      <Route path="/games/score-screen/:gameId" element={<ScoreScreen />} />
    </Routes>
  )
};

export default App
