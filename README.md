# caboh
Caboh card game

# Game Mechanics
The gameplay is similar to the real life card games Golf or Cabo.

## Gameplay:
* Create game, join game and start game. Minimum 2 players to start game. Only player 1 can start game. Game periodically updates, take your time.
* Each player is dealt 4 cards. These cards remain hidden to the player except for 2 initially.
* Draw a card when its your turn (highlights green - bottom). This card is only revealed to you.
* You may perform one of three actions:
  1. Discard this card.
  2. Swap this card with one from your hand.
  3. Use this cards ability.
* Ability cards glow blue, press it to activate and use.
* Once 2 or more rounds have been played any player may then press "Caboh!" before drawing a card, ending their turn.
* A final round is played back to the player who pressed "Caboh!" and a winner is declared.

## Goals:
* The goal is to have the lowest total value hand at the end of the game.
* Aces are 1 point.
* Red Kings are 0 points.
* The rest are standard values.

# Tech Stack

Built using the MERN stack:
### MongoDB, Express, React (using Vite), Node.js)

Frontend Dependencies:
* "axios": "^1.7.2",
* "prop-types": "^15.8.1",
* "react": "^18.2.0",
* "react-dom": "^18.2.0",
* "react-router-dom": "^6.23.1"

Backend Dependencies:
* "bcryptjs": "^2.4.3",
* "cors": "^2.8.5",
* "dotenv": "^16.4.5",
* "express": "^4.19.2",
* "jsonwebtoken": "^9.0.2",
* "mongoose": "^8.4.1"



