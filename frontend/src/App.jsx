import React from 'react'
import './App.css'
import GameTable from './components/GameTable'
import CardDeck from './components/CardDeck'

function App() {

  return (
    <div className="container">
      <div className="game-area">
        <GameTable/>
        <CardDeck/>
      </div>
    </div>
  )
}

export default App
